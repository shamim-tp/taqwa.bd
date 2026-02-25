import { getDatabase } from '../database/db.js'; // Local DB module
import { getCurrentUser } from '../auth/auth.js'; // Current logged-in user info
import { setPageTitle, logActivity, buildSidebar } from '../auth/session.js'; // Page title, logging, sidebar update
import { showToast, formatMoney, generateId, numberToWords, fileToBase64 } from '../utils/common.js'; // Helpers
import { openModal, closeModal } from '../modals/modals.js'; // Modal open/close
import { openViewerModal } from '../modals/viewer.js'; // Viewer modal
import { openMRReceiptModal } from '../modals/mr-receipt.js'; // MR receipt modal
import { BANGLADESH_BANKS } from '../utils/common.js';

// ------------------------------------------------------------
// Main Admin Deposit Page Renderer
// ------------------------------------------------------------
export async function renderAdminDeposits() {
  setPageTitle('Deposit Management', 'Approve/Reject deposits, generate MR ID, check slip and transaction.');

  const db = getDatabase();
  const deposits = await db.getAll('deposits') || []; // Fetch all deposits
  const pending = deposits.filter(d => d.status == 'PENDING'); // Pending deposits
  const approved = deposits.filter(d => d.status == 'APPROVED'); // Approved deposits

  // HTML layout for pending and approved deposits
  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Pending Deposits</h3>
          <p>Verify slip, approve deposit, generate MR ID and signature.</p>
        </div>
        <div class="panelTools">
          <button class="btn" id="refreshDeposits">Refresh</button>
          <button class="btn primary" id="addCashMRBtn">Add Cash MR</button>
        </div>
      </div>
      <div id="pendingDepositTable">${await renderDepositTable(pending, true)}</div>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Approved Deposits</h3>
          <p>All confirmed deposits with MR ID.</p>
        </div>
      </div>
      <div id="approvedDepositTable">${await renderDepositTable(approved, false)}</div>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;

  // Event listeners
  document.getElementById('refreshDeposits').addEventListener('click', renderAdminDeposits);
  document.getElementById('addCashMRBtn').addEventListener('click', addCashMR);
}

// ------------------------------------------------------------
// Render Deposit Table (Pending/Approved)
// ------------------------------------------------------------
async function renderDepositTable(list, isPending) {
  const db = getDatabase();
  const members = await db.getAll('members') || [];

  // Build table rows
  const rows = list.map(d => {
    const member = members.find(m => m.id == d.memberId);
    return `
      <tr>
        <td>${d.id}</td>
        <td><b>${member?.name || 'Unknown'}</b><div class="small">${d.memberId}</div></td>
        <td>${d.month} ${d.year || ''}</td>
        <td>${formatMoney(d.amount)}</td>
        <td>${d.paymentMethod} ${d.fromBank ? `(${d.fromBank}→${d.toBank})` : ''}</td>
        <td><span class="status ${d.status == 'PENDING' ? 'st-pending' : d.status == 'APPROVED' ? 'st-approved' : 'st-rejected'}">${d.status}</span></td>
        <td>${d.mrId || '-'}</td>
        ${isPending ? `
          <td>
            <button class="btn success approve-deposit" data-id="${d.id}">Approve</button>
            <button class="btn danger reject-deposit" data-id="${d.id}">Reject</button>
            <button class="btn view-slip" data-id="${d.id}">View Slip</button>
          </td>` : `
          <td>
            <button class="btn view-mr" data-id="${d.id}">View MR</button>
            <button class="btn print-mr" data-id="${d.id}">Print</button>
          </td>`}
      </tr>
    `;
  }).join('');

  const colspan = isPending ? 8 : 7;
  const tbody = rows || `<tr><td colspan="${colspan}" class="small">No records found.</td></tr>`;

  // Attach row actions
  setTimeout(() => {
    if (isPending) {
      document.querySelectorAll('.approve-deposit').forEach(btn =>
        btn.addEventListener('click', () => approveDeposit(btn.dataset.id))
      );
      document.querySelectorAll('.reject-deposit').forEach(btn =>
        btn.addEventListener('click', () => rejectDeposit(btn.dataset.id))
      );
      document.querySelectorAll('.view-slip').forEach(btn =>
        btn.addEventListener('click', () => viewSlip(btn.dataset.id))
      );
    } else {
      document.querySelectorAll('.view-mr').forEach(btn =>
        btn.addEventListener('click', () => viewMRReceipt(btn.dataset.id))
      );
      document.querySelectorAll('.print-mr').forEach(btn =>
        btn.addEventListener('click', () => printMR(btn.dataset.id))
      );
    }
  }, 100);

  return `
    <table>
      <thead>
        <tr>
          <th>Deposit ID</th>
          <th>Member</th>
          <th>Month</th>
          <th>Amount</th>
          <th>Payment Method</th>
          <th>Status</th>
          <th>MR ID</th>
          ${isPending ? '<th>Action</th>' : '<th>Tools</th>'}
        </tr>
      </thead>
      <tbody>${tbody}</tbody>
    </table>
  `;
}

// ------------------------------------------------------------
// Generate new MR ID in format MR-YYYY-000001
// ------------------------------------------------------------
function generateMRId(deposits, year) {
  // Filter existing MR IDs for the same year
  const yearMRs = deposits
    .map(d => d.mrId)
    .filter(mr => mr && mr.startsWith(`MR-${year}-`));

  // Find max number used
  let max = 0;
  yearMRs.forEach(mr => {
    const parts = mr.split('-');
    const num = parseInt(parts[2], 10);
    if (!isNaN(num) && num > max) max = num;
  });

  // Increment by 1 and pad with zeros
  const nextNum = String(max + 1).padStart(6, '0');
  return `MR-${year}-${nextNum}`;
}

// ------------------------------------------------------------
// Add Cash MR Modal with Year, Month & Slip Upload
// ------------------------------------------------------------
async function addCashMR() {
  const db = getDatabase();
  const members = await db.query('members', [
    { field: 'approved', operator: '==', value: true },
    { field: 'status', operator: '==', value: 'ACTIVE' }
  ]);

  // Build member options dropdown
  const memberOptions = members.map(m => `<option value="${m.id}">${m.name} (${m.id})</option>`).join('');

  // Build year & month dropdowns
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => `<option value="${currentYear-i}">${currentYear-i}</option>`).join('');
  const months = [
    'January','February','March','April','May','June','July','August','September','October','November','December'
  ].map(m => `<option value="${m}" ${m == new Date().toLocaleString('default', { month: 'long' }) ? 'selected' : ''}>${m}</option>`).join('');

  // ============================================================
// 💵 CASH MR MODAL HTML
// ============================================================
const html = `
  <div class="panel">
    <h3>Add Cash Money Receipt</h3>

    <!-- Row 1: Member + Year -->
    <div class="row row-3">
      <div>
        <label>Member *</label>
        <select id="cash_member">${memberOptions}</select> <!-- Member dropdown -->
      </div>
      <div>
        <label>Year *</label>
        <select id="cash_year">${years}</select> <!-- Year dropdown -->
      </div>
    </div>

    <!-- Row 2: Month + Amount + Payment Method -->
    <div class="row row-3">
      <div>
        <label>Month *</label>
        <select id="cash_month">${months}</select> <!-- Month dropdown -->
      </div>

      <div>
        <label>Amount *</label>
        <input id="cash_amount" value="10000" type="number" /> <!-- Default amount -->
      </div>
      
      <!-- Payment Method Dropdown -->
      <div>
        <label>Payment Method *</label>
        <select id="d_method" onchange="toggleBankFields()">
        <option value="Select Method">Select Method</option>
          <option value="Bank Transfer">Bank Transfer</option>
          <option value="Cash">Cash</option>
          <option value="Cash Deposit">Cash Deposit</option>
          <option value="Bkash">Bkash</option>
          <option value="Rocket">Rocket</option>
        </select>
      </div>
    </div>

    <!-- Bank Transfer Section (Toggleable) -->
    <div id="bankFields" style="display:none;">
      <div class="row row-2">
        <div>
          <label>From Bank</label>
          <select id="d_from_bank">
            ${BANGLADESH_BANKS.map(b => `<option>${b}</option>`).join('')} <!-- Bank options -->
          </select>
        </div>
        <div>
          <label>To Bank</label>
          <select id="d_to_bank">
            ${BANGLADESH_BANKS.map(b => `<option>${b}</option>`).join('')} <!-- Bank options -->
          </select>
        </div>
      </div>
    </div>

    <!-- Row 3: Transaction ID + Date + Deposit Slip + Notes -->
    <div class="row row-2">
      <div>
        <label>Transaction ID *</label>
        <input id="d_trx" placeholder="Enter TRX ID" /> <!-- TRX field for bank transfer -->
      </div>

      <div>
        <label>Date</label>
        <input id="cash_date" type="date" value="${new Date().toISOString().split('T')[0]}" /> <!-- Default today -->
      </div>

      <div class="row row-1">
        <div>
          <label>Deposit Slip</label>
          <input type="file" id="cash_slip" accept="image/*" /> <!-- Optional slip upload -->
        </div>
      </div>

      <div>
        <label>Notes</label>
        <input id="cash_note" placeholder="Optional" /> <!-- Optional note -->
      </div>
    </div>

    <div class="hr"></div>

    <!-- Action Buttons -->
    <button class="btn success" id="saveCashMRBtn">Save & Generate MR</button>
    <button class="btn" onclick="closeModal('modalViewer')">Cancel</button>
  </div>
`;

// ============================================================
// 🏦 TOGGLE BANK FIELDS FUNCTION
// ============================================================
function toggleBankFields() {
  const method = document.getElementById('d_method').value; // Get selected payment method
  const bankFields = document.getElementById('bankFields'); // Bank section div

  // Show only if method is Bank Transfer
  bankFields.style.display = method == 'Bank Transfer' ? 'block' : 'none';
}



  openViewerModal('Add Cash MR', 'Create money receipt', html);
  document.getElementById('saveCashMRBtn').addEventListener('click', saveCashMRWithSlip);
}

// ------------------------------------------------------------
// Save Cash MR including uploaded slip
// ------------------------------------------------------------
async function saveCashMRWithSlip() {
  const db = getDatabase();
  const memberId = document.getElementById('cash_member').value;
  const amount = Number(document.getElementById('cash_amount').value || 0);
  const year = document.getElementById('cash_year').value;
  const month = document.getElementById('cash_month').value;
  const date = document.getElementById('cash_date').value;
  const note = document.getElementById('cash_note').value.trim();
  const slipFile = document.getElementById('cash_slip').files[0];

  if (!memberId || !amount || !year || !month || !date) {
    showToast('Validation Error', 'Fill all required fields (*)');
    return;
  }

  const slipData = slipFile ? await fileToBase64(slipFile) : '';
  const deposits = await db.getAll('deposits') || [];

  // Generate unique MR ID automatically
  const mrId = generateMRId(deposits, year);

  const depositData = {
    id: generateId('DP', deposits),
    memberId, year, month, amount,
    paymentMethod: 'Cash', fromBank:'', toBank:'', trxId: 'CASH-' + Date.now(),
    slip: slipData, note, status: 'APPROVED',
    mrId, depositDate: date,
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: getCurrentUser().id
  };

  await db.save('deposits', depositData, depositData.id);
  await logActivity('ADD_CASH_MR', `Cash MR added: ${mrId} for ${memberId}`);

  const member = await db.get('members', memberId);
  if (member) console.log(`WhatsApp to ${member.phone}: Cash deposit approved. MR ID: ${mrId}`);

  showToast('Cash MR Created', `MR ${mrId} generated successfully.`);
  closeModal('modalViewer');
  renderAdminDeposits();
}

// ------------------------------------------------------------
// Approve Deposit with auto MR ID
// ------------------------------------------------------------
async function approveDeposit(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);
  if (!deposit) return;

  const deposits = await db.getAll('deposits') || [];

  // Auto-generate MR ID for approved deposit
  deposit.mrId = generateMRId(deposits, deposit.year);
  deposit.status = 'APPROVED';
  deposit.approvedAt = new Date().toISOString();
  deposit.approvedBy = getCurrentUser().id;

  await db.update('deposits', depositId, deposit);
  await logActivity('APPROVE_DEPOSIT', `Deposit approved: ${depositId} MR: ${deposit.mrId}`);

  const member = await db.get('members', deposit.memberId);
  if (member) console.log(`WhatsApp to ${member.phone}: Deposit approved. MR ID: ${deposit.mrId}`);

  showToast('Deposit Approved', `MR ID generated: ${deposit.mrId}`);
  buildSidebar();
  renderAdminDeposits();
}


// ------------------------------------------------------------
// View Deposit Slip (Preview uploaded slip)
// ------------------------------------------------------------
async function viewSlip(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId); // Get deposit by ID
  if (!deposit) return;

  // HTML for slip preview
  const html = `
    <div class="panel">
      <h3>Deposit Slip Preview</h3>
      <p class="small">Deposit ID: ${deposit.id} | Member: ${deposit.memberId}</p>
      <div class="hr"></div>
      ${deposit.slip 
        ? `<img src="${deposit.slip}" style="width:100%;max-width:700px;border-radius:18px;border:1px solid var(--line);"/>` 
        : '<p>No slip uploaded</p>'}
    </div>
  `;

  openViewerModal('Deposit Slip', 'Slip preview', html); // Open modal with preview
}

// ------------------------------------------------------------
// Reject Deposit with note and send notification
// ------------------------------------------------------------
async function rejectDeposit(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);
  if (!deposit) return;

  const note = prompt('Rejection note?'); // Ask admin for rejection reason
  if (note == null) return; // Cancelled

  deposit.status = 'REJECTED';
  deposit.note = (deposit.note ? deposit.note + '\n' : '') + 'Rejected: ' + note;
  deposit.approvedAt = new Date().toISOString();
  deposit.approvedBy = getCurrentUser().id;

  await db.update('deposits', depositId, deposit);
  await logActivity('REJECT_DEPOSIT', `Deposit rejected: ${depositId}`); // Log action

  // Send notification to member
  const member = await db.get('members', deposit.memberId);
  if (member) {
    console.log(`WhatsApp to ${member.phone}: Deposit rejected. Reason: ${note}`);
    console.log(`Email to ${member.email}: Deposit rejected. Reason: ${note}`);
  }

  showToast('Deposit Rejected', `Deposit ${depositId} rejected.`);
  buildSidebar();
  renderAdminDeposits();
}

// ------------------------------------------------------------
// View MR Receipt in modal
// ------------------------------------------------------------
async function viewMRReceipt(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);
  if (!deposit || !deposit.mrId) {
    showToast('Error', 'No MR ID found'); 
    return;
  }

  const member = await db.get('members', deposit.memberId);
  const meta = await db.get('meta', 'system') || {};

  openMRReceiptModal(deposit, member, meta); // Open MR modal
}

// ------------------------------------------------------------
// Print MR Receipt (new window)
// ------------------------------------------------------------
async function printMR(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);
  const member = await db.get('members', deposit.memberId);
  const meta = await db.get('meta', 'system') || {};

  if (!deposit || !deposit.mrId) {
    showToast('Error', 'No MR ID found'); 
    return;
  }

  const receiptHTML = generateMRReceipt(deposit, member, meta); // Generate HTML
  const w = window.open('', '_blank'); // Open new window
  w.document.write(`
    <html>
      <head><title>Money Receipt</title></head>
      <body>
        ${receiptHTML}
        <script>
          window.onload=()=>{
            window.print();
            setTimeout(()=>window.close(),500);
          }
        </script>
      </body>
    </html>
  `);
  w.document.close();

  // Send auto WhatsApp/Email after print
  if (member) {
    console.log(`WhatsApp to ${member.phone}: Money Receipt printed. MR ID: ${deposit.mrId}`);
    console.log(`Email to ${member.email}: Money Receipt printed. MR ID: ${deposit.mrId}`);
  }
}



// ============================================================
// 🏦 TOGGLE BANK FIELDS
// ============================================================

function toggleBankFields() {

  const method = document.getElementById('d_method').value;
  const bankFields = document.getElementById('bankFields');

  bankFields.style.display =
    method == 'Bank Transfer' ? 'block' : 'none';
}


// ------------------------------------------------------------
// Generate MR Receipt HTML (with all details)
// ------------------------------------------------------------
function generateMRReceipt(deposit, member, meta) {
  const date = new Date(deposit.approvedAt || deposit.submittedAt);
  const formattedDate = date.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });

  return `
    <div class="receipt">
      <div class="header">
        <h2>${meta.companyName || 'IMS Investment Ltd.'}</h2>
        <p>${meta.companyAddress || 'Dhaka, Bangladesh'}</p>
        <p>Phone: ${meta.companyPhone || '+8801234567890'} | Email: ${meta.companyEmail || 'info@imsinvestment.com'}</p>
      </div>

      <h2 style="text-align:center;margin-bottom:30px;">MONEY RECEIPT</h2>

      <div class="details">
        <div class="row"><div><strong>MR No:</strong> ${deposit.mrId}</div><div><strong>Date:</strong> ${formattedDate}</div></div>
        <div class="row"><div><strong>Received from:</strong> ${member?.name || 'N/A'}</div><div><strong>Member ID:</strong> ${deposit.memberId}</div></div>
        <div class="row"><div><strong>Father's Name:</strong> ${member?.fatherName || 'N/A'}</div><div><strong>Mother's Name:</strong> ${member?.motherName || 'N/A'}</div></div>
        <div class="row"><div><strong>Address:</strong> ${member?.address || 'N/A'}</div><div><strong>Phone:</strong> ${member?.phone || 'N/A'}</div></div>
        <div class="row"><div><strong>For the month of:</strong> ${deposit.month} ${deposit.year || ''}</div><div><strong>Payment Method:</strong> ${deposit.paymentMethod}</div></div>
        ${deposit.fromBank ? 
          `<div class="row"><div><strong>Bank Transfer:</strong> ${deposit.fromBank}→${deposit.toBank}</div><div><strong>Transaction ID:</strong> ${deposit.trxId}</div></div>` : 
          `<div class="row"><div><strong>Transaction ID:</strong> ${deposit.trxId}</div><div></div></div>`}

        <div style="margin-top:30px;text-align:center;">
          <h3>Amount in Words:</h3>
          <p>${numberToWords(deposit.amount)} Taka Only</p>
        </div>
        <div style="text-align:center;margin:40px 0;">
          <h1>${formatMoney(deposit.amount)}</h1>
          <p>(Paid in full)</p>
        </div>
      </div>

      <div class="signature">
        <div><p>________________</p><p>Receiver</p><p>${new Date().toLocaleDateString()}</p></div>
        <div><p>________________</p><p>Authorized</p><p>${meta.companyName || 'IMS Investment Ltd.'}</p></div>
      </div>

      <div style="text-align:center;font-size:12px;color:#666;margin-top:40px;">
        <p>*** Computer generated receipt ***</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}
