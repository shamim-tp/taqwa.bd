// ============================================================
// 📜 MEMBER DEPOSIT HISTORY MODULE
// IMS ERP V5
// Shows all deposits of logged-in member with enhanced UI
// Fully Responsive - Mobile & PC Optimized
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
// 🎨 FULLY RESPONSIVE STYLES - MOBILE OPTIMIZED
// ============================================================

const historyStyles = `
  <style>
    /* CSS Variables for consistent theming */
    :root {
      --primary-gradient: linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);
      --secondary-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      --warning-gradient: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
      --danger-gradient: linear-gradient(135deg, #eb5757 0%, #f2994a 100%);
      --shadow-sm: 0 5px 15px rgba(0,0,0,0.05);
      --shadow-md: 0 10px 25px rgba(0,0,0,0.1);
      --shadow-lg: 0 15px 35px rgba(0,0,0,0.15);
      --border-radius-sm: 12px;
      --border-radius-md: 16px;
      --border-radius-lg: 20px;
      --border-radius-xl: 24px;
      --border-radius-xxl: 30px;
      
      /* Text Colors - High Contrast */
      --text-primary: #1e293b;
      --text-secondary: #334155;
      --text-muted: #64748b;
      --text-light: #f8fafc;
      --text-white: #ffffff;
      --text-dark: #0f172a;
      
      /* Background Colors */
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --bg-tertiary: #f1f5f9;
      --bg-accent: #eef2ff;
      --bg-warning: #fff3cd;
      --bg-danger: #f8d7da;
      --bg-success: #d4edda;
      
      /* Accent Colors */
      --accent-1: #4158D0;
      --accent-2: #C850C0;
      --accent-3: #FFCC70;
      --accent-success: #11998e;
      --accent-warning: #f2994a;
      --accent-danger: #eb5757;
    }

    /* Container - Mobile First */
    .history-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: clamp(12px, 3vw, 25px);
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      min-height: 100vh;
    }

    /* Summary Cards Grid - Mobile First */
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(12px, 2vw, 20px);
      margin-bottom: clamp(20px, 3vw, 30px);
    }

    @media (min-width: 640px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .summary-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    /* Summary Card */
    .summary-card {
      padding: clamp(18px, 3vw, 25px);
      border-radius: var(--border-radius-lg);
      color: var(--text-white);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-md);
    }

    .summary-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .summary-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 150px;
      height: 150px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      transform: rotate(25deg);
      transition: all 0.5s;
    }

    .summary-card:hover::before {
      transform: rotate(45deg) scale(1.2);
    }

    .summary-card.total {
      background: linear-gradient(135deg, #4158D0 0%, #C850C0 100%);
    }

    .summary-card.amount {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .summary-card.approved {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    }

    .summary-card.pending {
      background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
    }

    .summary-label {
      font-size: clamp(13px, 2vw, 15px);
      opacity: 0.9;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 1;
    }

    .summary-value {
      font-size: clamp(24px, 4vw, 36px);
      font-weight: 800;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .summary-sub {
      font-size: clamp(11px, 1.8vw, 13px);
      opacity: 0.8;
      position: relative;
      z-index: 1;
    }

    .summary-icon {
      position: absolute;
      top: 15px;
      right: 15px;
      font-size: 48px;
      opacity: 0.2;
      color: var(--text-white);
    }

    /* Filter Buttons */
    .filter-section {
      display: flex;
      gap: clamp(8px, 2vw, 12px);
      margin-bottom: clamp(20px, 3vw, 25px);
      flex-wrap: wrap;
    }

    .filter-btn {
      padding: clamp(8px, 2vw, 12px) clamp(12px, 3vw, 24px);
      border: 2px solid var(--bg-tertiary);
      background: var(--bg-primary);
      color: var(--text-primary);
      border-radius: var(--border-radius-xxl);
      font-weight: 600;
      font-size: clamp(12px, 2vw, 15px);
      cursor: pointer;
      transition: all 0.3s ease;
      flex: 1 1 auto;
      min-width: 80px;
    }

    .filter-btn:hover {
      border-color: var(--accent-1);
      background: var(--bg-accent);
    }

    .filter-btn.active {
      background: var(--primary-gradient);
      color: var(--text-white);
      border-color: transparent;
      box-shadow: 0 5px 15px rgba(65,88,208,0.3);
    }

    /* Main Panel */
    .history-panel {
      background: var(--bg-primary);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.05);
    }

    .panel-header {
      padding: clamp(16px, 3vw, 22px);
      border-bottom: 1px solid var(--bg-tertiary);
      display: flex;
      flex-direction: column;
      gap: 15px;
      background: linear-gradient(to right, var(--bg-secondary), var(--bg-primary));
    }

    @media (min-width: 640px) {
      .panel-header {
        flex-direction: row;
        justify-content: space-between;
        align-items: center;
      }
    }

    .panel-header h3 {
      color: var(--text-primary);
      font-size: clamp(18px, 3vw, 22px);
      font-weight: 800;
      margin: 0;
    }

    .panel-header p {
      color: var(--text-secondary);
      font-size: clamp(13px, 2vw, 15px);
      margin-top: 5px;
    }

    .search-box {
      padding: clamp(10px, 2vw, 12px) clamp(14px, 2.5vw, 18px);
      border: 2px solid var(--bg-tertiary);
      border-radius: var(--border-radius-md);
      font-size: clamp(14px, 2vw, 15px);
      width: 100%;
      max-width: 300px;
      background: var(--bg-primary);
      color: var(--text-primary);
    }

    .search-box:focus {
      border-color: var(--accent-1);
      outline: none;
      box-shadow: 0 0 0 4px rgba(65,88,208,0.1);
    }

    .search-box::placeholder {
      color: var(--text-muted);
    }

    /* Mobile Card View (for very small screens) */
    @media (max-width: 600px) {
      .table-responsive {
        overflow-x: visible;
      }
      
      .deposit-table,
      .deposit-table thead,
      .deposit-table tbody,
      .deposit-table tr,
      .deposit-table td {
        display: block;
      }
      
      .deposit-table thead {
        display: none; /* Hide table headers on mobile */
      }
      
      .deposit-table tr {
        margin-bottom: 20px;
        border: 1px solid var(--bg-tertiary);
        border-radius: var(--border-radius-lg);
        padding: 15px;
        background: var(--bg-primary);
        box-shadow: var(--shadow-sm);
      }
      
      .deposit-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px dashed var(--bg-tertiary);
        border-bottom-width: 1px !important;
        text-align: right;
      }
      
      .deposit-table td:last-child {
        border-bottom: none;
      }
      
      .deposit-table td::before {
        content: attr(data-label);
        font-weight: 700;
        color: var(--text-primary);
        text-align: left;
        padding-right: 10px;
        width: 40%;
      }
      
      .amount-cell {
        text-align: right;
      }
      
      .method-badge,
      .status-badge,
      .mr-badge {
        display: inline-block;
        margin: 0;
      }
      
      .action-btn {
        padding: 8px 16px;
        font-size: 13px;
      }
    }

    /* Tablet and Desktop Table Styles */
    @media (min-width: 601px) {
      /* Table Container - Responsive */
      .table-responsive {
        overflow-x: auto;
        -webkit-overflow-scrolling: touch;
        margin: 0;
        padding: 0;
      }

      /* Table Styles */
      .deposit-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 700px;
      }

      .deposit-table th {
        padding: clamp(12px, 2vw, 16px) clamp(10px, 1.5vw, 14px);
        background: var(--bg-secondary);
        color: var(--text-primary);
        font-weight: 700;
        font-size: clamp(12px, 1.8vw, 14px);
        text-transform: uppercase;
        letter-spacing: 0.5px;
        text-align: left;
        border-bottom: 2px solid var(--bg-tertiary);
      }

      .deposit-table td {
        padding: clamp(12px, 2vw, 16px) clamp(10px, 1.5vw, 14px);
        border-bottom: 1px solid var(--bg-tertiary);
        color: var(--text-secondary);
        font-size: clamp(13px, 1.8vw, 15px);
      }

      .deposit-row {
        transition: background-color 0.2s ease;
      }

      .deposit-row:hover {
        background-color: var(--bg-accent);
      }
    }

    /* Amount Cell */
    .amount-cell {
      font-weight: 700;
      color: var(--accent-success);
      text-align: right;
    }

    /* Payment Method Badge */
    .method-badge {
      background: var(--bg-accent);
      color: var(--accent-1);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: clamp(11px, 1.6vw, 13px);
      font-weight: 600;
      display: inline-block;
    }

    /* Status Badges */
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 30px;
      font-size: clamp(11px, 1.6vw, 13px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .status-approved {
      background: var(--bg-success);
      color: #0a5c3b;
      border: 1px solid #a3e4c5;
    }

    .status-pending {
      background: var(--bg-warning);
      color: #856404;
      border: 1px solid #ffeeba;
    }

    .status-rejected {
      background: var(--bg-danger);
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    /* MR ID Badge */
    .mr-badge {
      background: var(--accent-1);
      color: var(--text-white);
      padding: 4px 10px;
      border-radius: 20px;
      font-family: monospace;
      font-size: clamp(11px, 1.6vw, 13px);
      font-weight: 600;
      display: inline-block;
    }

    .mr-placeholder {
      color: var(--text-muted);
      font-size: clamp(12px, 1.8vw, 14px);
    }

    /* Action Buttons */
    .action-btn {
      padding: 6px 12px;
      border: none;
      border-radius: 8px;
      font-size: clamp(11px, 1.6vw, 13px);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
      margin: 2px;
      color: var(--text-white);
    }

    .action-btn.view-mr {
      background: var(--accent-1);
    }

    .action-btn.view-slip {
      background: var(--text-secondary);
    }

    .action-btn.note {
      background: var(--accent-danger);
    }

    .action-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 10px rgba(0,0,0,0.1);
    }

    .action-btn:active {
      transform: translateY(0);
    }

    /* No Results Message */
    .no-results {
      text-align: center;
      padding: 40px;
      color: var(--text-muted);
    }

    .no-results-icon {
      font-size: 48px;
      margin-bottom: 15px;
      opacity: 0.5;
    }

    .no-results-title {
      font-size: 18px;
      font-weight: 600;
      margin-bottom: 8px;
      color: var(--text-primary);
    }

    .no-results-text {
      font-size: 14px;
    }

    /* Loading State */
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--bg-tertiary);
      border-top: 4px solid var(--accent-1);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive Typography */
    @media (max-width: 480px) {
      .summary-value {
        font-size: 22px;
      }
      
      .filter-btn {
        font-size: 11px;
        padding: 8px 10px;
        min-width: 70px;
      }
      
      .action-btn {
        padding: 6px 10px;
        font-size: 11px;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .action-btn:active {
        transform: scale(0.95);
      }
      
      .filter-btn:active {
        transform: scale(0.95);
      }
    }

    /* Print Styles */
    @media print {
      .history-container {
        background: white;
        padding: 20px;
      }
      
      .filter-section,
      .action-btn {
        display: none;
      }
    }
  </style>
`;


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
      ${historyStyles}
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
          ${historyStyles}
          <div class="history-container">
            <div style="text-align: center; padding: 60px; background: var(--bg-danger); border-radius: var(--border-radius-lg);">
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
    ${historyStyles}
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
        <div style="background: var(--bg-primary); border-radius: var(--border-radius-lg); padding: 25px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--accent-1); font-size: 22px;">📎 Deposit Slip</h3>
            <p style="color: var(--text-secondary);">
              Deposit ID: ${deposit.id} | Member: ${deposit.memberId}
            </p>
          </div>

          <div style="text-align: center; padding: 20px;">
            ${deposit.slip
              ? `<img src="${deposit.slip}"
                  style="max-width: 100%; max-height: 500px; border-radius: var(--border-radius-lg);
                         border: 2px solid var(--bg-tertiary); box-shadow: var(--shadow-lg);" />`
              : `
                <div style="padding: 60px; background: var(--bg-secondary); border-radius: var(--border-radius-lg);">
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
        <div style="background: var(--bg-primary); border-radius: var(--border-radius-lg); padding: 25px; max-width: 500px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h3 style="color: var(--accent-danger); font-size: 22px;">📝 Rejection Note</h3>
            <p style="color: var(--text-secondary);">Deposit ID: ${deposit.id}</p>
          </div>

          <div style="background: var(--bg-danger); padding: 25px; border-radius: var(--border-radius-lg); 
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
