// ============================================================
// 💰 MEMBER PROFIT MODULE
// IMS ERP V5
// Shows profit earnings and share details for logged-in member
// Fully Responsive - Mobile & PC Optimized
// ============================================================


// ============================================================
// 📦 IMPORTS
// ============================================================

import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle } from '../auth/session.js';
import { formatMoney } from '../utils/common.js';


// ============================================================
// 🎨 FULLY RESPONSIVE STYLES
// ============================================================

const profitStyles = `
  <style>
    /* CSS Variables for consistent theming */
    :root {
      --primary-gradient: linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);
      --secondary-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      --warning-gradient: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
      --danger-gradient: linear-gradient(135deg, #eb5757 0%, #f2994a 100%);
      --profit-gradient: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
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
      --bg-profit: #e6f7f0;
      
      /* Accent Colors */
      --accent-1: #4158D0;
      --accent-2: #C850C0;
      --accent-3: #FFCC70;
      --accent-success: #11998e;
      --accent-warning: #f2994a;
      --accent-danger: #eb5757;
      --accent-profit: #00b09b;
    }

    /* Container - Mobile First */
    .profit-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: clamp(12px, 3vw, 25px);
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      min-height: 100vh;
    }

    /* Header Section */
    .profit-header {
      background: var(--profit-gradient);
      border-radius: var(--border-radius-xl);
      padding: clamp(25px, 4vw, 40px);
      margin-bottom: clamp(20px, 3vw, 30px);
      color: var(--text-white);
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }

    .profit-header::before {
      content: '💰';
      position: absolute;
      right: -20px;
      bottom: -20px;
      font-size: 150px;
      opacity: 0.1;
      transform: rotate(-15deg);
      color: var(--text-white);
    }

    .profit-header h2 {
      font-size: clamp(24px, 4vw, 32px);
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .profit-header p {
      font-size: clamp(14px, 2vw, 16px);
      opacity: 0.95;
      position: relative;
      z-index: 1;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    /* Summary Cards Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(15px, 2.5vw, 25px);
      margin-bottom: clamp(25px, 4vw, 35px);
    }

    @media (min-width: 640px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .summary-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Summary Card */
    .summary-card {
      padding: clamp(20px, 3vw, 25px);
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

    .summary-card.shares {
      background: linear-gradient(135deg, #4158D0 0%, #C850C0 100%);
    }

    .summary-card.profit {
      background: linear-gradient(135deg, #00b09b 0%, #96c93d 100%);
    }

    .summary-card.value {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
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
      font-size: clamp(28px, 4vw, 36px);
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

    /* Main Panel */
    .profit-panel {
      background: var(--bg-primary);
      border-radius: var(--border-radius-xl);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.05);
    }

    .panel-header {
      padding: clamp(16px, 3vw, 22px);
      border-bottom: 1px solid var(--bg-tertiary);
      background: linear-gradient(to right, var(--bg-secondary), var(--bg-primary));
    }

    .panel-header h3 {
      color: var(--text-primary);
      font-size: clamp(18px, 3vw, 22px);
      font-weight: 800;
      margin: 0 0 8px 0;
    }

    .panel-header p {
      color: var(--text-secondary);
      font-size: clamp(13px, 2vw, 15px);
      margin: 0;
    }

    /* Search Box */
    .search-box {
      padding: clamp(10px, 2vw, 12px) clamp(14px, 2.5vw, 18px);
      border: 2px solid var(--bg-tertiary);
      border-radius: var(--border-radius-md);
      font-size: clamp(14px, 2vw, 15px);
      width: 100%;
      max-width: 300px;
      background: var(--bg-primary);
      color: var(--text-primary);
      margin-top: 15px;
    }

    .search-box:focus {
      border-color: var(--accent-profit);
      outline: none;
      box-shadow: 0 0 0 4px rgba(0,176,155,0.1);
    }

    .search-box::placeholder {
      color: var(--text-muted);
    }

    /* Mobile Card View (for very small screens) */
    @media (max-width: 600px) {
      .table-responsive {
        overflow-x: visible;
      }
      
      .profit-table,
      .profit-table thead,
      .profit-table tbody,
      .profit-table tr,
      .profit-table td {
        display: block;
      }
      
      .profit-table thead {
        display: none; /* Hide table headers on mobile */
      }
      
      .profit-table tr {
        margin-bottom: 20px;
        border: 1px solid var(--bg-tertiary);
        border-radius: var(--border-radius-lg);
        padding: 15px;
        background: var(--bg-primary);
        box-shadow: var(--shadow-sm);
      }
      
      .profit-table td {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 10px 0;
        border-bottom: 1px dashed var(--bg-tertiary);
        border-bottom-width: 1px !important;
        text-align: right;
      }
      
      .profit-table td:last-child {
        border-bottom: none;
      }
      
      .profit-table td::before {
        content: attr(data-label);
        font-weight: 700;
        color: var(--text-primary);
        text-align: left;
        padding-right: 10px;
        width: 40%;
      }
      
      .profit-amount {
        font-weight: 700;
        color: var(--accent-profit);
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
      .profit-table {
        width: 100%;
        border-collapse: collapse;
        min-width: 700px;
      }

      .profit-table th {
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

      .profit-table td {
        padding: clamp(12px, 2vw, 16px) clamp(10px, 1.5vw, 14px);
        border-bottom: 1px solid var(--bg-tertiary);
        color: var(--text-secondary);
        font-size: clamp(13px, 1.8vw, 15px);
      }

      .profit-table tr {
        transition: background-color 0.2s ease;
      }

      .profit-table tr:hover {
        background-color: var(--bg-profit);
      }
    }

    /* Profit Amount Cell */
    .profit-amount {
      font-weight: 700;
      color: var(--accent-profit);
    }

    /* Period Badge */
    .period-badge {
      background: var(--bg-profit);
      color: var(--accent-profit);
      padding: 4px 10px;
      border-radius: 20px;
      font-size: clamp(11px, 1.6vw, 13px);
      font-weight: 600;
      display: inline-block;
    }

    /* No Data Message */
    .no-data {
      text-align: center;
      padding: 60px;
      color: var(--text-muted);
    }

    .no-data-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-data-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--text-primary);
    }

    .no-data-text {
      font-size: 16px;
    }

    /* Loading State */
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--bg-tertiary);
      border-top: 4px solid var(--accent-profit);
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
        font-size: 24px;
      }
      
      .profit-table td {
        font-size: 12px;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .summary-card:active {
        transform: scale(0.98);
      }
    }

    /* Print Styles */
    @media print {
      .profit-container {
        background: white;
        padding: 20px;
      }
      
      .profit-header {
        background: #00b09b;
        color: white;
      }
    }
  </style>
`;


// ============================================================
// 🎯 MAIN RENDER FUNCTION
// ============================================================

export async function renderMemberProfit() {
  
  // Show loading state
  const pageContent = document.getElementById('pageContent');
  if (pageContent) {
    pageContent.innerHTML = `
      ${profitStyles}
      <div class="profit-container">
        <div style="text-align: center; padding: 60px;">
          <div class="loading-spinner"></div>
          <p style="color: var(--text-secondary);">Loading profit data...</p>
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
      const member = await db.get('members', user.id);
      if (!member) return;
      
      const profitDistributions = await db.getAll('profitDistributions') || [];
      const meta = await db.get('meta', 'system') || { monthlyShareAmount: 10000 };
      
      // Sort by date (newest first)
      profitDistributions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
      
      // Calculate total profit
      let totalProfit = 0;
      profitDistributions.forEach(p => {
        totalProfit += (Number(p.profitPerShare || 0) * Number(member.shares || 1));
      });
      
      // Calculate share value
      const shareValue = (member.shares || 1) * meta.monthlyShareAmount;
      
      setPageTitle('My Profit & Shares', 'View your profit earnings and share details');
      
      // Generate HTML
      const html = generateProfitHTML(
        member,
        profitDistributions,
        totalProfit,
        shareValue,
        meta
      );
      
      // Update page content
      if (pageContent) {
        pageContent.innerHTML = html;
      }
      
      // Bind search functionality
      bindSearch();

    } catch (error) {
      console.error('Error loading profit data:', error);
      if (pageContent) {
        pageContent.innerHTML = `
          ${profitStyles}
          <div class="profit-container">
            <div style="text-align: center; padding: 60px; background: var(--bg-danger); border-radius: var(--border-radius-lg);">
              <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
              <h3 style="color: #721c24; margin-bottom: 10px;">Error Loading Data</h3>
              <p style="color: #721c24; margin-bottom: 20px;">${error.message || 'Failed to load profit data'}</p>
              <button class="summary-card profit" onclick="window.location.reload()" style="border: none; cursor: pointer; padding: 12px 30px;">🔄 Try Again</button>
            </div>
          </div>
        `;
      }
    }
  }, 100);
}


// ============================================================
// 🏗️ GENERATE PROFIT HTML
// ============================================================

function generateProfitHTML(member, profitDistributions, totalProfit, shareValue, meta) {
  return `
    ${profitStyles}
    <div class="profit-container">

      <!-- Header -->
      <div class="profit-header">
        <h2>💰 My Profit & Shares</h2>
        <p>View your profit earnings and share details</p>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card shares">
          <div class="summary-icon">📊</div>
          <div class="summary-label">My Shares</div>
          <div class="summary-value">${member.shares || 1}</div>
          <div class="summary-sub">Share value: ${formatMoney(meta.monthlyShareAmount)} per share</div>
        </div>
        
        <div class="summary-card profit">
          <div class="summary-icon">💰</div>
          <div class="summary-label">Total Profit</div>
          <div class="summary-value">${formatMoney(totalProfit)}</div>
          <div class="summary-sub">All time profit earned</div>
        </div>
        
        <div class="summary-card value">
          <div class="summary-icon">💎</div>
          <div class="summary-label">Share Value</div>
          <div class="summary-value">${formatMoney(shareValue)}</div>
          <div class="summary-sub">Current value of your shares</div>
        </div>
      </div>

      <!-- Profit Distribution History -->
      <div class="profit-panel">
        <div class="panel-header">
          <div>
            <h3>📋 Profit Distribution History</h3>
            <p>Complete record of all profit distributions</p>
          </div>
          <div>
            <input 
              type="text" 
              id="searchProfit" 
              class="search-box" 
              placeholder="🔍 Search by date or period..."
            />
          </div>
        </div>

        <!-- Table -->
        <div class="table-responsive">
          <table class="profit-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Period</th>
                <th>Profit Per Share</th>
                <th>My Shares</th>
                <th>My Profit</th>
              </tr>
            </thead>
            <tbody id="profitTableBody">
              ${profitDistributions.length > 0 
                ? profitDistributions.map(p => generateTableRow(p, member)).join('')
                : generateEmptyState()
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}


// ============================================================
// 📊 GENERATE TABLE ROW
// ============================================================

function generateTableRow(profit, member) {
  const myProfit = Number(profit.profitPerShare || 0) * Number(member.shares || 1);
  
  // Format date
  const formattedDate = profit.date ? new Date(profit.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'N/A';
  
  return `
    <tr>
      <td data-label="Date">${formattedDate}</td>
      <td data-label="Period">
        <span class="period-badge">${escapeHtml(profit.period || 'N/A')}</span>
      </td>
      <td data-label="Profit/Share" class="profit-amount">${formatMoney(profit.profitPerShare || 0)}</td>
      <td data-label="My Shares">${member.shares || 1}</td>
      <td data-label="My Profit" class="profit-amount"><b>${formatMoney(myProfit)}</b></td>
    </tr>
  `;
}


// ============================================================
// 📭 GENERATE EMPTY STATE
// ============================================================

function generateEmptyState() {
  return `
    <tr>
      <td colspan="5" class="no-data">
        <div class="no-data-icon">📭</div>
        <div class="no-data-title">No Profit Records</div>
        <div class="no-data-text">There are no profit distribution records available.</div>
      </td>
    </tr>
  `;
}


// ============================================================
// 🔍 BIND SEARCH FUNCTIONALITY
// ============================================================

function bindSearch() {
  const searchInput = document.getElementById('searchProfit');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('.profit-table tbody tr');
    let visibleCount = 0;
    
    rows.forEach(row => {
      // Skip the no-data row if it exists
      if (row.querySelector('.no-data')) return;
      
      const text = row.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        row.style.display = '';
        visibleCount++;
      } else {
        row.style.display = 'none';
      }
    });
    
    // Show/hide no results message
    const tbody = document.getElementById('profitTableBody');
    const existingNoResults = document.getElementById('noResultsRow');
    
    if (visibleCount === 0 && rows.length > 0 && searchTerm) {
      if (existingNoResults) existingNoResults.remove();
      
      const noResultsRow = document.createElement('tr');
      noResultsRow.id = 'noResultsRow';
      noResultsRow.innerHTML = `
        <td colspan="5" class="no-data">
          <div class="no-data-icon">🔍</div>
          <div class="no-data-title">No Results Found</div>
          <div class="no-data-text">No matches for "${escapeHtml(searchTerm)}"</div>
        </td>
      `;
      tbody.appendChild(noResultsRow);
    } else {
      if (existingNoResults) existingNoResults.remove();
    }
  });
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
