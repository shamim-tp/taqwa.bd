import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import { showToast, formatMoney, formatDate } from '../utils/common.js';
import { openViewerModal } from '../modals/viewer.js';

export async function renderAdminResign() {
  setPageTitle('Resignation & Settlement', 'Manage member resignations and settlements');
  
  const db = await getDatabase();
  const members = await db.getAll('members') || [];
  const resignations = await db.getAll('resignations') || [];
  
  // Filter active members for dropdown
  const activeMembers = members.filter(m => m.approved && m.status === 'ACTIVE');

  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Member Resignation</h3>
          <p>Process member resignation and calculate settlement</p>
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Select Member *</label>
          <select id="resign_member">
            <option value="">Select Member</option>
            ${activeMembers.map(m => `
              <option value="${m.id}">${m.name} (${m.id})</option>
            `).join('')}
          </select>
        </div>
        <div>
          <label>Resignation Date</label>
          <input id="resign_date" type="date" value="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div>
          <label>Reason</label>
          <select id="resign_reason">
            <option value="PERSONAL">Personal Reason</option>
            <option value="FINANCIAL">Financial Reason</option>
            <option value="RELOCATION">Relocation</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div>
          <label>Details</label>
          <textarea id="resign_details" placeholder="Resignation details..."></textarea>
        </div>
      </div>

      <div class="hr"></div>
      <button class="btn success" id="calculateSettlementBtn">Calculate Settlement</button>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Resignation History</h3>
          <p>Previous member resignations</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Member</th>
            <th>Resignation Date</th>
            <th>Reason</th>
            <th>Settlement Amount</th>
            <th>Status</th>
            <th>Tools</th>
          </tr>
        </thead>
        <tbody>
          ${resignations.length > 0 ? resignations.map(r => {
            const member = members.find(m => m.id === r.memberId);
            return `
              <tr>
                <td>${member ? member.name : r.memberId}</td>
                <td>${r.date}</td>
                <td>${r.reason}</td>
                <td>${formatMoney(r.settlementAmount || 0)}</td>
                <td><span class="status ${r.status === 'COMPLETED' ? 'st-approved' : 'st-pending'}">${r.status}</span></td>
                <td>
                  <button class="btn view-resignation" data-id="${r.id}">View</button>
                </td>
              </tr>
            `;
          }).join('') : `<tr><td colspan="6" class="small">No resignation records</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;
  
  document.getElementById('calculateSettlementBtn').addEventListener('click', calculateSettlement);
  
  document.querySelectorAll('.view-resignation').forEach(btn => {
    btn.addEventListener('click', () => viewResignation(btn.getAttribute('data-id')));
  });
}

async function calculateSettlement() {
  const memberId = document.getElementById('resign_member').value;
  if (!memberId) { showToast('Validation Error', 'Please select a member'); return; }
  
  const db = await getDatabase();
  const member = await db.get('members', memberId);
  if (!member) return;

  const deposits = await db.query('deposits', [
    { field: 'memberId', operator: '===', value: memberId },
    { field: 'status', operator: '===', value: 'APPROVED' }
  ]);
  
  const totalDeposits = deposits.reduce((a,b) => a + Number(b.amount||0), 0);
  const settlementAmount = totalDeposits * 0.8; // 80% policy
  
  const resignationDate = document.getElementById('resign_date').value;
  const reason = document.getElementById('resign_reason').value;
  const details = document.getElementById('resign_details').value.trim();
  
  const html = `
    <div class="panel">
      <div class="panelHeader"><h3>Settlement: ${member.name}</h3></div>
      <div class="row row-2">
        <div><label>Total Deposits</label><input value="${formatMoney(totalDeposits)}" disabled /></div>
        <div><label>Settlement (80%)</label><input value="${formatMoney(settlementAmount)}" disabled /></div>
      </div>
      <div class="hr"></div>
      <button class="btn success" id="confirmResignationBtn">Confirm Resignation</button>
    </div>
  `;
  
  openViewerModal('Settlement Calculation', 'Review settlement details', html);
  
  // Use timeout to ensure modal is in DOM
  setTimeout(() => {
    document.getElementById('confirmResignationBtn')?.addEventListener('click', () => 
        confirmResignation(memberId, { totalDeposits, settlementAmount, resignationDate, reason, details })
    );
  }, 100);
}

async function confirmResignation(memberId, data) {
  const db = await getDatabase();
  const member = await db.get('members', memberId);
  
  member.status = 'RESIGNED';
  member.updatedAt = new Date().toISOString();
  await db.update('members', memberId, member);
  
  const resignation = {
    id: 'RESIGN-' + Date.now(),
    memberId, memberName: member.name,
    date: data.resignationDate, reason: data.reason, details: data.details,
    totalDeposits: data.totalDeposits, settlementAmount: data.settlementAmount,
    status: 'COMPLETED',
    processedBy: getCurrentUser()?.id || 'ADMIN',
    processedAt: new Date().toISOString()
  };
  
  await db.save('resignations', resignation);
  await logActivity('MEMBER_RESIGNATION', `Member resigned: ${memberId}`);
  
  showToast('Resignation Processed', `${member.name} resigned successfully.`);
  
  // Close modal and refresh
  document.querySelector('.modalWrap').style.display = 'none';
  await renderAdminResign();
}

async function viewResignation(id) {
  const db = await getDatabase();
  const resign = await db.get('resignations', id);
  if (!resign) return;
  
  const html = `
     <div class="panel">
        <div class="row row-2">
            <div><label>Date</label><input value="${resign.date}" disabled/></div>
            <div><label>Amount</label><input value="${formatMoney(resign.settlementAmount)}" disabled/></div>
        </div>
        <div class="row"><label>Reason</label><input value="${resign.reason}" disabled/></div>
     </div>
  `;
  openViewerModal('Resignation Details', 'View Record', html);
}