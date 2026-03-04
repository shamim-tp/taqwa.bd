// ============================================================
// 📜 MEMBER DEPOSIT HISTORY MODULE
// IMS ERP V5
// Shows all deposits of logged-in member with enhanced UI
// Fully Responsive - Mobile & PC Optimized
// Uses global style.css (no inline styles)
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
  
  // Show loading state
  const pageContent = document.getElementById('pageContent');
  if (pageContent) {
    pageContent.innerHTML = `
      <div class="history-container">
        <div style="text-align: center; padding: 60px;">
          <div class="loading-spinner"></div>
          <p style="color: var(--text-secondary);">Loading deposit history...</p>
        </div>
      </div>
    `;
  }

  // Load data asynchronously
  setTimeout(async () => {
    try {
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
      const approvedAmount = deposits.filter(d => d.status == 'APPROVED').reduce((sum, d) => sum + Number(d.amount || 0), 0);

      setPageTitle(
        'Deposit History',
        'Your full deposit history with status and MR ID.'
      );

      // Generate the complete HTML
      const html = generateHistoryHTML(
        deposits,
        totalDeposits,
        totalAmount,
        approvedCount,
        pendingCount,
        rejectedCount,
        approvedAmount
      );

      // Update page content
      if (pageContent) {
        pageContent.innerHTML = html;
      }

      // Bind events
      bindEvents();

    } catch (error) {
      console.error('Error loading deposit history:', error);
      if (pageContent) {
        pageContent.innerHTML = `
          <div class="history-container">
            <div style="text-align: center; padding: 60px; background: var(--bg-danger); border-radius: var(--radius-lg);">
              <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
              <h3 style="color: #721c24; margin-bottom: 10px;">Error Loading Data</h3>
              <p style="color: #721c24; margin-bottom: 20px;">${error.message || 'Failed to load deposit history'}</p>
              <button class="filter-btn active" onclick="window.location.reload()">🔄 Try Again</button>
            </div>
          </div>
        `;
      }
    }
  }, 100);
}

// ============================================================
// 🏗️ GENERATE HISTORY HTML
// ============================================================

function generateHistoryHTML(
  deposits,
  totalDeposits,
  totalAmount,
  approvedCount,
  pendingCount,
  rejectedCount,
  approvedAmount
) {
  return `
    <div class="history-container">

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card total">
          <div class="summary-icon">📊</div>
          <div class="summary-label">Total Deposits</div>
          <div class="summary-value">${totalDeposits}</div>
          <div class="summary-sub">All time deposits</div>
        </div>
        
        <div class="summary-card amount">
          <div class="summary-icon">💰</div>
          <div class="summary-label">Total Amount</div>
          <div class="summary-value">${formatMoney(totalAmount)}</div>
          <div class="summary-sub">Sum of all deposits</div>
        </div>
        
        <div class="summary-card approved">
          <div class="summary-icon">✅</div>
          <div class="summary-label">Approved</div>
          <div class="summary-value">${approvedCount}</div>
          <div class="summary-sub">${formatMoney(approvedAmount)} approved</div>
        </div>
        
        <div class="summary-card pending">
          <div class="summary-icon">⏳</div>
          <div class="summary-label">Pending</div>
          <div class="summary-value">${pendingCount}</div>
          <div class="summary-sub">Awaiting approval</div>
        </div>
      </div>

      <!-- Filter Buttons -->
      <div class="filter-section">
        <button class="filter-btn active" data-filter="all">All</button>
        <button class="filter-btn" data-filter="APPROVED">✅ Approved</button>
        <button class="filter-btn" data-filter="PENDING">⏳ Pending</button>
        <button class="filter-btn" data-filter="REJECTED">❌ Rejected</button>
      </div>

      <!-- Main Panel -->
      <div class="history-panel">
        <div class="panel-header">
          <div>
            <h3>📋 Deposit History</h3>
            <p>Complete record of all your deposits</p>
          </div>
          <div>
            <input 
              type="text" 
              id="searchDeposit" 
              class="search-box" 
              placeholder="🔍 Search by ID, month, MR ID..."
            />
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="deposit-table">
            <thead>
              <tr>
                <th>Deposit ID</th>
                <th>Month</th>
                <th>Amount</th>
                <th>Method</th>
                <th>Status</th>
                <th>MR ID</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody id="depositTableBody">
              ${generateTableRows(deposits)}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}

// ============================================================
// 📊 GENERATE TABLE ROWS
// ============================================================

function generateTableRows(deposits) {
  if (deposits.length === 0) {
    return `
      <tr>
        <td colspan="8" class="no-results">
          <div class="no-results-icon">📭</div>
          <div class="no-results-title">No deposits found</div>
          <div class="no-results-text">Make your first deposit to get started.</div>
        </td>
      </tr>
    `;
  }

  return deposits.map(d => {
    const statusClass = d.status == 'APPROVED' ? 'status-approved' : 
                       d.status == 'PENDING' ? 'status-pending' : 'status-rejected';
    
    const depositDate = d.depositDate || d.submittedAt || '';
    const formattedDate = depositDate ? new Date(depositDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'N/A';
    
    return `
      <tr class="deposit-row" data-status="${d.status}">
        <td data-label="Deposit ID"><strong>${escapeHtml(d.id)}</strong></td>
        <td data-label="Month">${escapeHtml(d.month)} ${d.year || ''}</td>
        <td data-label="Amount" class="amount-cell">${formatMoney(d.amount)}</td>
        <td data-label="Method">
          <span class="method-badge">${escapeHtml(d.paymentMethod || 'Cash')}</span>
        </td>
        <td data-label="Status">
          <span class="status-badge ${statusClass}">${d.status}</span>
        </td>
        <td data-label="MR ID">
          ${d.mrId ? 
            `<span class="mr-badge">${escapeHtml(d.mrId)}</span>` : 
            '<span class="mr-placeholder">—</span>'}
        </td>
        <td data-label="Date">${formattedDate}</td>
        <td data-label="Actions" style="text-align: right;">
          ${d.status == 'APPROVED' && d.mrId
            ? `<button class="action-btn view-mr" data-id="${d.id}">👁️ View MR</button>`
            : `<button class="action-btn view-slip" data-id="${d.id}">👁️ Slip</button>`
          }
          ${d.status == 'REJECTED' && d.note ? 
            `<button class="action-btn note" data-id="${d.id}">📝 Note</button>` : ''}
        </td>
      </tr>
    `;
  }).join('');
}

// ============================================================
// 🎯 BIND EVENTS
// ============================================================

function bindEvents() {
  
  // Filter buttons
  document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
      e.target.classList.add('active');
      filterDepositRows(e.target.dataset.filter);
    });
  });
  
  // Search input
  document.getElementById('searchDeposit')?.addEventListener('input', (e) => {
    searchDeposits(e.target.value.toLowerCase());
  });
  
  // View MR buttons
  document.querySelectorAll('.view-mr').forEach(btn => {
    btn.addEventListener('click', () => viewMRReceipt(btn.dataset.id));
  });
  
  // View Slip buttons
  document.querySelectorAll('.view-slip').forEach(btn => {
    btn.addEventListener('click', () => viewSlip(btn.dataset.id));
  });
  
  // View Rejection Note buttons
  document.querySelectorAll('.note').forEach(btn => {
    btn.addEventListener('click', () => viewRejectionNote(btn.dataset.id));
  });
}

// ============================================================
// 🔍 FILTER FUNCTION
// ============================================================

function filterDepositRows(filter) {
  const rows = document.querySelectorAll('.deposit-row');
  let visibleCount = 0;
  
  rows.forEach(row => {
    if (filter == 'all') {
      row.style.display = '';
      visibleCount++;
    } else {
      const status = row.dataset.status;
      if (status == filter) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    }
  });
  
  // Show/hide no results message
  const tbody = document.getElementById('depositTableBody');
  const existingNoResults = document.getElementById('noResultsRow');
  
  if (visibleCount === 0 && rows.length > 0) {
    if (existingNoResults) existingNoResults.remove();
    
    const noResultsRow = document.createElement('tr');
    noResultsRow.id = 'noResultsRow';
    noResultsRow.innerHTML = `
      <td colspan="8" class="no-results">
        <div class="no-results-icon">🔍</div>
        <div class="no-results-title">No deposits found</div>
        <div class="no-results-text">No deposits match the selected filter.</div>
      </td>
    `;
    tbody.appendChild(noResultsRow);
  } else {
    if (existingNoResults) existingNoResults.remove();
  }
}

// ============================================================
// 🔍 SEARCH FUNCTION
// ============================================================

function searchDeposits(searchTerm) {
  const rows = document.querySelectorAll('.deposit-row');
  let visibleCount = 0;
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  // Show/hide no results message
  const tbody = document.getElementById('depositTableBody');
  const existingNoResults = document.getElementById('noResultsRow');
  
  if (visibleCount === 0 && rows.length > 0 && searchTerm) {
    if (existingNoResults) existingNoResults.remove();
    
    const noResultsRow = document.createElement('tr');
    noResultsRow.id = 'noResultsRow';
    noResultsRow.innerHTML = `
      <td colspan="8" class="no-results">
        <div class="no-results-icon">🔍</div>
        <div class="no-results-title">No results found</div>
        <div class="no-results-text">No matches for "${escapeHtml(searchTerm)}"</div>
      </td>
    `;
    tbody.appendChild(noResultsRow);
  } else {
    if (existingNoResults) existingNoResults.remove();
  }
}

// ============================================================
// 🧾 VIEW MR RECEIPT
// ============================================================

async function viewMRReceipt(depositId) {
  try {
    const db = getDatabase();
    const deposit = await db.get('deposits', depositId);

    if (!deposit || !deposit.mrId) {
      showToast('Error', 'No MR ID found for this deposit', 'error');
      return;
    }

    const member = await db.get('members', deposit.memberId);
    const meta = await db.get('meta', 'system') || {};

    openMRReceiptModal(deposit, member, meta);
  } catch (error) {
    console.error('Error viewing MR:', error);
    showToast('Error', 'Failed to load MR receipt', 'error');
  }
}

// ============================================================
// 🖼 VIEW DEPOSIT SLIP
// ============================================================

async function viewSlip(depositId) {
  try {
    const db = getDatabase();
    const deposit = await db.get('deposits', depositId);

    if (!deposit) return;

    const html = `
      <div class="history-container" style="padding: 0;">
        <div style="background: var(--bg-primary); border-radius: var(--radius-lg); padding: 25px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--accent-1); font-size: 22px;">📎 Deposit Slip</h3>
            <p style="color: var(--text-secondary);">
              Deposit ID: ${deposit.id} | Member: ${deposit.memberId}
            </p>
          </div>

          <div style="text-align: center; padding: 20px;">
            ${deposit.slip
              ? `<img src="${deposit.slip}"
                  style="max-width: 100%; max-height: 500px; border-radius: var(--radius-lg);
                         border: 2px solid var(--bg-tertiary); box-shadow: var(--shadow-lg);" />`
              : `
                <div style="padding: 60px; background: var(--bg-secondary); border-radius: var(--radius-lg);">
                  <div style="font-size: 64px; margin-bottom: 20px;">📭</div>
                  <div style="font-size: 18px; color: var(--text-muted);">No slip uploaded</div>
                </div>
                `}
          </div>
        </div>
      </div>
    `;

    openViewerModal('Deposit Slip', 'View deposit slip', html);
  } catch (error) {
    console.error('Error viewing slip:', error);
    showToast('Error', 'Failed to load deposit slip', 'error');
  }
}

// ============================================================
// 📝 VIEW REJECTION NOTE
// ============================================================

async function viewRejectionNote(depositId) {
  try {
    const db = getDatabase();
    const deposit = await db.get('deposits', depositId);

    if (!deposit || !deposit.note) {
      showToast('Error', 'No rejection note found', 'error');
      return;
    }

    const html = `
      <div class="history-container" style="padding: 0;">
        <div style="background: var(--bg-primary); border-radius: var(--radius-lg); padding: 25px; max-width: 500px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--accent-danger); font-size: 22px;">📝 Rejection Note</h3>
            <p style="color: var(--text-secondary);">Deposit ID: ${deposit.id}</p>
          </div>

          <div style="background: var(--bg-danger); padding: 25px; border-radius: var(--radius-lg); 
                      border-left: 5px solid var(--accent-danger);">
            <div style="font-size: 14px; color: #721c24; margin-bottom: 10px; font-weight: 600;">
              Reason for rejection:
            </div>
            <div style="font-size: 16px; line-height: 1.6; color: #721c24;">
              ${escapeHtml(deposit.note)}
            </div>
          </div>
        </div>
      </div>
    `;

    openViewerModal('Rejection Note', 'Reason for rejection', html);
  } catch (error) {
    console.error('Error viewing note:', error);
    showToast('Error', 'Failed to load rejection note', 'error');
  }
}

// ============================================================
// 🔒 ESCAPE HTML TO PREVENT XSS
// ============================================================

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}
