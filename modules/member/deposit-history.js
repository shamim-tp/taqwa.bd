// ============================================================
// 📜 MEMBER DEPOSIT HISTORY MODULE
// IMS ERP V5
// Shows all deposits of logged-in member with enhanced UI
// ============================================================


// ============================================================
// 📦 IMPORTS
// ============================================================

import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle } from '../auth/session.js';
import { showToast, formatMoney, formatDate } from '../utils/common.js';
import { openMRReceiptModal } from '../modals/mr-receipt.js';
import { openViewerModal } from '../modals/viewer.js';



// ============================================================
// 🎯 MAIN RENDER FUNCTION
// ============================================================

/**
 * Render Deposit History Page
 * - Fetch deposits from DB
 * - Sort by latest first
 * - Calculate summary statistics
 * - Render table with enhanced UI
 * - Attach dynamic event listeners
 */
export async function renderMemberDepositHistory() {

  const user = getCurrentUser();
  if (!user) return;

  const db = getDatabase();

  // Fetch deposits of current member
  const deposits = await db.query('deposits', [
    { field: 'memberId', operator: '==', value: user.id }
  ]) || [];

  // Sort by submitted date (latest first)
  deposits.sort((a, b) =>
    new Date(b.submittedAt || b.depositDate) -
    new Date(a.submittedAt || a.depositDate)
  );

  // Calculate summary statistics
  const totalDeposits = deposits.length;
  const totalAmount = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const approvedCount = deposits.filter(d => d.status == 'APPROVED').length;
  const pendingCount = deposits.filter(d => d.status == 'PENDING').length;
  const rejectedCount = deposits.filter(d => d.status == 'REJECTED').length;

  setPageTitle(
    'Deposit History',
    'Your full deposit history with status and MR ID.'
  );



  // ============================================================
  // 📊 SUMMARY CARDS
  // ============================================================

  const summaryHTML = `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
      
      <!-- Total Deposits Card -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 16px; color: white;">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Total Deposits</div>
        <div style="font-size: 32px; font-weight: 700;">${totalDeposits}</div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">All time</div>
      </div>
      
      <!-- Total Amount Card -->
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; border-radius: 16px; color: white;">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Total Amount</div>
        <div style="font-size: 32px; font-weight: 700;">${formatMoney(totalAmount)}</div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">Sum of all deposits</div>
      </div>
      
      <!-- Approved Card -->
      <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; border-radius: 16px; color: white;">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Approved</div>
        <div style="font-size: 32px; font-weight: 700;">${approvedCount}</div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">With MR ID</div>
      </div>
      
      <!-- Pending Card -->
      <div style="background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%); padding: 20px; border-radius: 16px; color: white;">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Pending</div>
        <div style="font-size: 32px; font-weight: 700;">${pendingCount}</div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">Awaiting approval</div>
      </div>
      
    </div>
  `;



  // ============================================================
  // 📊 FILTER BUTTONS
  // ============================================================

  const filterHTML = `
    <div style="display: flex; gap: 10px; margin-bottom: 20px; flex-wrap: wrap;">
      <button class="btn filter-btn active" data-filter="all">All</button>
      <button class="btn filter-btn" data-filter="APPROVED">Approved</button>
      <button class="btn filter-btn" data-filter="PENDING">Pending</button>
      <button class="btn filter-btn" data-filter="REJECTED">Rejected</button>
    </div>
  `;



  // ============================================================
  // 🧾 TABLE UI TEMPLATE with enhanced design
  // ============================================================

  const tableHTML = `
    <div class="panel">

      <div class="panelHeader">
        <div>
          <h3>My Deposits</h3>
          <p>Pending / Approved / Rejected history.</p>
        </div>
        <div class="panelTools">
          <input type="text" id="searchDeposit" placeholder="Search by ID, month, MR ID..." style="padding: 8px 12px; border: 1px solid var(--line); border-radius: 8px;" />
        </div>
      </div>

      <div style="overflow-x: auto;">
        <table class="deposit-table" style="width:100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #f8f9fa;">
              <th style="padding: 15px 10px; text-align: left;">Deposit ID</th>
              <th style="padding: 15px 10px; text-align: left;">Month</th>
              <th style="padding: 15px 10px; text-align: right;">Amount</th>
              <th style="padding: 15px 10px; text-align: left;">Payment Method</th>
              <th style="padding: 15px 10px; text-align: center;">Status</th>
              <th style="padding: 15px 10px; text-align: left;">MR ID</th>
              <th style="padding: 15px 10px; text-align: center;">Date</th>
              <th style="padding: 15px 10px; text-align: center;">Tools</th>
            </tr>
          </thead>

          <tbody id="depositTableBody">

            ${
              deposits.map(d => {
                const statusClass = d.status == 'PENDING' ? 'st-pending' : 
                                   d.status == 'APPROVED' ? 'st-approved' : 'st-rejected';
                const depositDate = d.depositDate || d.submittedAt || '';
                const formattedDate = depositDate ? new Date(depositDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                }) : 'N/A';
                
                return `
                  <tr class="deposit-row" data-status="${d.status}" style="border-bottom: 1px solid #e9ecef;">
                    <td style="padding: 15px 10px; font-weight: 600;">${d.id}</td>
                    <td style="padding: 15px 10px;">${d.month} ${d.year || ''}</td>
                    <td style="padding: 15px 10px; text-align: right; font-weight: 600; color: #27ae60;">${formatMoney(d.amount)}</td>
                    <td style="padding: 15px 10px;">
                      <span style="background: #e8f0fe; padding: 4px 8px; border-radius: 6px; font-size: 12px;">
                        ${d.paymentMethod}
                      </span>
                    </td>
                    <td style="padding: 15px 10px; text-align: center;">
                      <span class="status ${statusClass}" style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
                        ${d.status}
                      </span>
                    </td>
                    <td style="padding: 15px 10px;">
                      ${d.mrId ? 
                        `<span style="background: #1e3c72; color: white; padding: 4px 8px; border-radius: 6px; font-family: monospace;">${d.mrId}</span>` : 
                        '<span style="color: #999;">—</span>'}
                    </td>
                    <td style="padding: 15px 10px; font-size: 13px; color: #666;">${formattedDate}</td>
                    <td style="padding: 15px 10px; text-align: center;">
                      ${
                        d.status == 'APPROVED' && d.mrId
                          ? `<button class="btn view-mr-receipt" data-id="${d.id}" style="padding: 6px 12px; background: #1e3c72; color: white; border: none; border-radius: 6px; cursor: pointer; margin: 2px;">
                              👁️ View MR
                            </button>`
                          : `<button class="btn view-deposit-slip" data-id="${d.id}" style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; margin: 2px;">
                              👁️ View Slip
                            </button>`
                      }
                      ${d.status == 'REJECTED' && d.note ? 
                        `<button class="btn view-rejection-note" data-id="${d.id}" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer; margin: 2px;">
                          📝 Note
                        </button>` : ''}
                    </td>
                  </tr>
                `;
              }).join('')
              ||
              `<tr>
                <td colspan="8" style="padding: 40px; text-align: center; color: #999;">
                  <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
                  <div style="font-size: 16px;">No deposits found.</div>
                  <div style="font-size: 14px; margin-top: 5px;">Make your first deposit to get started.</div>
                </td>
              </tr>`
            }

          </tbody>
        </table>
      </div>

    </div>
  `;



  // ============================================================
  // 🏆 COMPLETE PAGE HTML
  // ============================================================

  const html = `
    ${summaryHTML}
    ${filterHTML}
    ${tableHTML}
  `;

  document.getElementById('pageContent').innerHTML = html;



  // ============================================================
  // 🎯 DYNAMIC BUTTON EVENT BINDING
  // ============================================================

  bindEvents();
  
  // Filter functionality
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Update active state
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      
      // Filter rows
      const filter = e.target.dataset.filter;
      filterDepositRows(filter);
    });
  });
  
  // Search functionality
  document.getElementById('searchDeposit')?.addEventListener('input', (e) => {
    searchDeposits(e.target.value.toLowerCase());
  });
}



// ============================================================
// 🔍 FILTER FUNCTION
// ============================================================

function filterDepositRows(filter) {
  const rows = document.querySelectorAll('.deposit-row');
  
  rows.forEach(row => {
    if (filter == 'all') {
      row.style.display = '';
    } else {
      const status = row.dataset.status;
      row.style.display = status == filter ? '' : 'none';
    }
  });
  
  // Show "no results" message if all rows hidden
  const visibleRows = Array.from(rows).filter(r => r.style.display != 'none');
  const tbody = document.getElementById('depositTableBody');
  
  // Remove existing no-results row if any
  const existingNoResults = document.getElementById('noResultsRow');
  if (existingNoResults) existingNoResults.remove();
  
  if (visibleRows.length == 0 && rows.length > 0) {
    const noResultsRow = document.createElement('tr');
    noResultsRow.id = 'noResultsRow';
    noResultsRow.innerHTML = `
      <td colspan="8" style="padding: 40px; text-align: center; color: #999;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
        <div style="font-size: 16px;">No deposits match the selected filter.</div>
      </td>
    `;
    tbody.appendChild(noResultsRow);
  }
}



// ============================================================
// 🔍 SEARCH FUNCTION
// ============================================================

function searchDeposits(searchTerm) {
  const rows = document.querySelectorAll('.deposit-row');
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(searchTerm) ? '' : 'none';
  });
  
  // Show "no results" message if all rows hidden
  const visibleRows = Array.from(rows).filter(r => r.style.display != 'none');
  const tbody = document.getElementById('depositTableBody');
  
  // Remove existing no-results row if any
  const existingNoResults = document.getElementById('noResultsRow');
  if (existingNoResults) existingNoResults.remove();
  
  if (visibleRows.length == 0 && rows.length > 0 && searchTerm) {
    const noResultsRow = document.createElement('tr');
    noResultsRow.id = 'noResultsRow';
    noResultsRow.innerHTML = `
      <td colspan="8" style="padding: 40px; text-align: center; color: #999;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
        <div style="font-size: 16px;">No results found for "${searchTerm}"</div>
      </td>
    `;
    tbody.appendChild(noResultsRow);
  }
}



// ============================================================
// 🎯 BIND BUTTON EVENTS
// ============================================================

function bindEvents() {
  document.querySelectorAll('.view-mr-receipt')
    .forEach(btn => {
      btn.addEventListener('click', () =>
        viewMRReceipt(btn.dataset.id)
      );
    });

  document.querySelectorAll('.view-deposit-slip')
    .forEach(btn => {
      btn.addEventListener('click', () =>
        viewSlip(btn.dataset.id)
      );
    });
    
  document.querySelectorAll('.view-rejection-note')
    .forEach(btn => {
      btn.addEventListener('click', () =>
        viewRejectionNote(btn.dataset.id)
      );
    });
}



// ============================================================
// 🧾 VIEW MR RECEIPT
// ============================================================

/**
 * Open MR receipt modal
 */
async function viewMRReceipt(depositId) {

  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);

  if (!deposit || !deposit.mrId) {
    showToast('Error', 'No MR ID found for this deposit');
    return;
  }

  const member = await db.get('members', deposit.memberId);
  const meta = await db.get('meta', 'system') || {};

  openMRReceiptModal(deposit, member, meta);
}



// ============================================================
// 🖼 VIEW DEPOSIT SLIP
// ============================================================

/**
 * Open Slip Image Preview Modal
 */
async function viewSlip(depositId) {

  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);

  if (!deposit) return;

  const html = `
    <div class="panel" style="max-width: 800px; margin: 0 auto;">

      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="color: #1e3c72;">📎 Deposit Slip Preview</h3>
        <p class="small" style="color: #666;">
          Deposit ID: ${deposit.id} | Member: ${deposit.memberId}
        </p>
      </div>

      <div class="hr"></div>

      <div style="text-align: center; padding: 20px;">
        ${
          deposit.slip
            ? `<img src="${deposit.slip}"
                style="width:100%;
                       max-width:700px;
                       border-radius:18px;
                       border:2px solid var(--line);
                       box-shadow: 0 10px 30px rgba(0,0,0,0.1);" />`
            : `
              <div style="padding: 60px; text-align: center; background: #f8f9fa; border-radius: 12px;">
                <div style="font-size: 64px; margin-bottom: 20px;">📭</div>
                <div style="font-size: 18px; color: #666;">No slip uploaded for this deposit</div>
              </div>
              `
        }
      </div>

      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button class="btn" onclick="closeModal('modalViewer')">Close</button>
      </div>

    </div>
  `;

  openViewerModal(
    'Deposit Slip',
    'Slip image preview',
    html
  );
}



// ============================================================
// 📝 VIEW REJECTION NOTE
// ============================================================

/**
 * Open Rejection Note Modal
 */
async function viewRejectionNote(depositId) {

  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);

  if (!deposit || !deposit.note) {
    showToast('Error', 'No rejection note found');
    return;
  }

  const html = `
    <div class="panel" style="max-width: 500px; margin: 0 auto;">

      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="color: #dc3545;">📝 Rejection Note</h3>
        <p class="small" style="color: #666;">
          Deposit ID: ${deposit.id}
        </p>
      </div>

      <div class="hr"></div>

      <div style="background: #fff3f3; padding: 25px; border-radius: 12px; margin: 20px 0; border-left: 5px solid #dc3545;">
        <div style="font-size: 14px; color: #666; margin-bottom: 10px;">Reason for rejection:</div>
        <div style="font-size: 16px; line-height: 1.6; color: #333;">${deposit.note}</div>
      </div>

      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button class="btn" onclick="closeModal('modalViewer')">Close</button>
      </div>

    </div>
  `;

  openViewerModal(
    'Rejection Note',
    'Reason for rejection',
    html
  );
}
