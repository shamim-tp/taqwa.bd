// ============================================================
// 📈 MEMBER INVESTMENTS MODULE
// IMS ERP V5
// Shows all company investments to members
// Fully Responsive - Mobile & PC Optimized
// ============================================================


// ============================================================
// 📦 IMPORTS
// ============================================================

import { getDatabase } from '../database/db.js';
import { setPageTitle } from '../auth/session.js';
import { formatMoney } from '../utils/common.js';


// ============================================================
// 🎨 FULLY RESPONSIVE STYLES
// ============================================================

const investmentStyles = `
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
      
      /* Status Colors */
      --status-active-bg: #d4edda;
      --status-active-text: #0a5c3b;
      --status-active-border: #a3e4c5;
      --status-completed-bg: #cce5ff;
      --status-completed-text: #004085;
      --status-completed-border: #b8daff;
      --status-pending-bg: #fff3cd;
      --status-pending-text: #856404;
      --status-pending-border: #ffeeba;
      
      /* Accent Colors */
      --accent-1: #4158D0;
      --accent-2: #C850C0;
      --accent-3: #FFCC70;
      --accent-success: #11998e;
      --accent-warning: #f2994a;
      --accent-danger: #eb5757;
    }

    /* Container - Mobile First */
    .investments-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: clamp(12px, 3vw, 25px);
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      min-height: 100vh;
    }

    /* Header Section */
    .investments-header {
      background: var(--primary-gradient);
      border-radius: var(--border-radius-xl);
      padding: clamp(25px, 4vw, 40px);
      margin-bottom: clamp(20px, 3vw, 30px);
      color: var(--text-white);
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }

    .investments-header::before {
      content: '📈';
      position: absolute;
      right: -20px;
      bottom: -20px;
      font-size: 150px;
      opacity: 0.1;
      transform: rotate(-15deg);
      color: var(--text-white);
    }

    .investments-header h2 {
      font-size: clamp(24px, 4vw, 32px);
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .investments-header p {
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
        grid-template-columns: repeat(4, 1fr);
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

    .summary-card.total {
      background: linear-gradient(135deg, #4158D0 0%, #C850C0 100%);
    }

    .summary-card.amount {
      background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
    }

    .summary-card.active {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
    }

    .summary-card.completed {
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

    /* Cards Grid */
    .cards-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(16px, 2.5vw, 22px);
      margin-bottom: clamp(25px, 4vw, 35px);
    }

    @media (min-width: 640px) {
      .cards-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .cards-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Investment Card */
    .investment-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      padding: clamp(20px, 3vw, 25px);
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
      border: 1px solid rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
    }

    .investment-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .investment-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, rgba(65,88,208,0.05), rgba(200,80,192,0.05));
      border-radius: 0 0 0 100%;
    }

    .investment-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }

    .investment-name {
      font-size: clamp(16px, 2.5vw, 20px);
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
    }

    .investment-status {
      padding: 6px 14px;
      border-radius: 30px;
      font-size: clamp(11px, 1.6vw, 13px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .status-active {
      background: var(--status-active-bg);
      color: var(--status-active-text);
      border: 1px solid var(--status-active-border);
    }

    .status-completed {
      background: var(--status-completed-bg);
      color: var(--status-completed-text);
      border: 1px solid var(--status-completed-border);
    }

    .status-pending {
      background: var(--status-pending-bg);
      color: var(--status-pending-text);
      border: 1px solid var(--status-pending-border);
    }

    .investment-amount {
      font-size: clamp(24px, 3.5vw, 32px);
      font-weight: 800;
      color: var(--accent-success);
      margin: 15px 0;
    }

    .investment-details {
      background: var(--bg-secondary);
      border-radius: var(--border-radius-md);
      padding: 15px;
      margin-top: 15px;
    }

    .detail-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px 0;
      border-bottom: 1px dashed var(--bg-tertiary);
    }

    .detail-row:last-child {
      border-bottom: none;
    }

    .detail-label {
      font-size: clamp(12px, 1.8vw, 14px);
      color: var(--text-secondary);
      font-weight: 600;
    }

    .detail-value {
      font-size: clamp(13px, 2vw, 15px);
      color: var(--text-primary);
      font-weight: 700;
    }

    .investment-description {
      margin-top: 15px;
      font-size: clamp(13px, 2vw, 14px);
      color: var(--text-secondary);
      line-height: 1.6;
      padding: 10px;
      background: var(--bg-accent);
      border-radius: var(--border-radius-sm);
    }

    /* Main Panel */
    .investments-panel {
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

    /* Table Container - Responsive */
    .table-responsive {
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      margin: 0;
      padding: 0;
    }

    /* Table Styles */
    .investments-table {
      width: 100%;
      border-collapse: collapse;
      min-width: 800px;
    }

    @media (max-width: 640px) {
      .investments-table {
        min-width: 600px;
      }
    }

    .investments-table th {
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

    .investments-table td {
      padding: clamp(12px, 2vw, 16px) clamp(10px, 1.5vw, 14px);
      border-bottom: 1px solid var(--bg-tertiary);
      color: var(--text-secondary);
      font-size: clamp(13px, 1.8vw, 15px);
    }

    .investments-table tr {
      transition: background-color 0.2s ease;
    }

    .investments-table tr:hover {
      background-color: var(--bg-accent);
    }

    /* Status Badge for Table */
    .status-badge {
      display: inline-block;
      padding: 6px 14px;
      border-radius: 30px;
      font-size: clamp(11px, 1.6vw, 13px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
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

    /* Divider */
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent-1), var(--accent-2), transparent);
      margin: 30px 0;
    }

    /* Loading Spinner */
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
        font-size: 24px;
      }
      
      .investment-amount {
        font-size: 22px;
      }
      
      .investments-table th,
      .investments-table td {
        padding: 10px 8px;
        font-size: 12px;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .investment-card:active {
        transform: scale(0.98);
      }
    }

    /* Print Styles */
    @media print {
      .investments-container {
        background: white;
        padding: 20px;
      }
      
      .summary-card,
      .investment-card {
        break-inside: avoid;
      }
    }
  </style>
`;


// ============================================================
// 🎯 MAIN RENDER FUNCTION
// ============================================================

export async function renderMemberInvestments() {
  
  // Show loading state
  const pageContent = document.getElementById('pageContent');
  if (pageContent) {
    pageContent.innerHTML = `
      ${investmentStyles}
      <div class="investments-container">
        <div style="text-align: center; padding: 60px;">
          <div class="loading-spinner"></div>
          <p style="color: var(--text-secondary);">Loading investments...</p>
        </div>
      </div>
    `;
  }

  // Load data asynchronously
  setTimeout(async () => {
    try {
      setPageTitle('My Investments', 'View all company investments');
      
      const db = getDatabase();
      const investments = await db.getAll('investments') || [];
      
      // Sort by start date (newest first)
      investments.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
      
      // Calculate summary statistics
      const totalInvestments = investments.length;
      const totalAmount = investments.reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
      const activeCount = investments.filter(inv => inv.status === 'ACTIVE').length;
      const completedCount = investments.filter(inv => inv.status === 'COMPLETED').length;
      const activeAmount = investments
        .filter(inv => inv.status === 'ACTIVE')
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);
      const completedAmount = investments
        .filter(inv => inv.status === 'COMPLETED')
        .reduce((sum, inv) => sum + Number(inv.amount || 0), 0);

      // Generate HTML
      const html = generateInvestmentsHTML(
        investments,
        totalInvestments,
        totalAmount,
        activeCount,
        completedCount,
        activeAmount,
        completedAmount
      );

      // Update page content
      if (pageContent) {
        pageContent.innerHTML = html;
      }

    } catch (error) {
      console.error('Error loading investments:', error);
      if (pageContent) {
        pageContent.innerHTML = `
          ${investmentStyles}
          <div class="investments-container">
            <div style="text-align: center; padding: 60px; background: var(--bg-danger); border-radius: var(--border-radius-lg);">
              <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
              <h3 style="color: #721c24; margin-bottom: 10px;">Error Loading Data</h3>
              <p style="color: #721c24; margin-bottom: 20px;">${error.message || 'Failed to load investments'}</p>
              <button class="summary-card total" onclick="window.location.reload()" style="border: none; cursor: pointer; padding: 12px 30px;">🔄 Try Again</button>
            </div>
          </div>
        `;
      }
    }
  }, 100);
}


// ============================================================
// 🏗️ GENERATE INVESTMENTS HTML
// ============================================================

function generateInvestmentsHTML(
  investments,
  totalInvestments,
  totalAmount,
  activeCount,
  completedCount,
  activeAmount,
  completedAmount
) {
  return `
    ${investmentStyles}
    <div class="investments-container">

      <!-- Header -->
      <div class="investments-header">
        <h2>📈 Company Investments</h2>
        <p>View all investment projects and their details</p>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card total">
          <div class="summary-icon">📊</div>
          <div class="summary-label">Total Projects</div>
          <div class="summary-value">${totalInvestments}</div>
          <div class="summary-sub">All investments</div>
        </div>
        
        <div class="summary-card amount">
          <div class="summary-icon">💰</div>
          <div class="summary-label">Total Amount</div>
          <div class="summary-value">${formatMoney(totalAmount)}</div>
          <div class="summary-sub">Invested capital</div>
        </div>
        
        <div class="summary-card active">
          <div class="summary-icon">✅</div>
          <div class="summary-label">Active Projects</div>
          <div class="summary-value">${activeCount}</div>
          <div class="summary-sub">${formatMoney(activeAmount)} invested</div>
        </div>
        
        <div class="summary-card completed">
          <div class="summary-icon">🎯</div>
          <div class="summary-label">Completed</div>
          <div class="summary-value">${completedCount}</div>
          <div class="summary-sub">${formatMoney(completedAmount)} returned</div>
        </div>
      </div>

      <!-- Investment Cards Grid -->
      <div class="cards-grid">
        ${investments.length > 0 
          ? investments.map(inv => generateInvestmentCard(inv)).join('')
          : generateEmptyState()
        }
      </div>

      <div class="divider"></div>

      <!-- Detailed Table -->
      <div class="investments-panel">
        <div class="panel-header">
          <div>
            <h3>📋 Detailed Investment List</h3>
            <p>Complete information about all investment projects</p>
          </div>
        </div>

        <div class="table-responsive">
          <table class="investments-table">
            <thead>
              <tr>
                <th>Investment Name</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Start Date</th>
                <th>End Date</th>
                <th>Expected Return</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${investments.length > 0
                ? investments.map(inv => generateTableRow(inv)).join('')
                : `
                  <tr>
                    <td colspan="7" class="no-data">
                      <div class="no-data-icon">📭</div>
                      <div class="no-data-title">No Investments Found</div>
                      <div class="no-data-text">There are no investment projects available.</div>
                    </td>
                  </tr>
                `
              }
            </tbody>
          </table>
        </div>
      </div>

    </div>
  `;
}


// ============================================================
// 🃏 GENERATE INVESTMENT CARD
// ============================================================

function generateInvestmentCard(inv) {
  // Determine status class
  let statusClass = 'status-pending';
  if (inv.status === 'ACTIVE') statusClass = 'status-active';
  if (inv.status === 'COMPLETED') statusClass = 'status-completed';
  
  // Format dates
  const startDate = inv.startDate ? new Date(inv.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Not set';
  
  const endDate = inv.endDate ? new Date(inv.endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Ongoing';
  
  return `
    <div class="investment-card">
      <div class="investment-header">
        <h4 class="investment-name">${escapeHtml(inv.name || 'Unnamed Project')}</h4>
        <span class="investment-status ${statusClass}">${inv.status || 'PENDING'}</span>
      </div>
      
      <div class="investment-amount">${formatMoney(inv.amount || 0)}</div>
      
      <div class="investment-details">
        <div class="detail-row">
          <span class="detail-label">📅 Start Date</span>
          <span class="detail-value">${startDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">🏁 End Date</span>
          <span class="detail-value">${endDate}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">📈 Expected Return</span>
          <span class="detail-value">${inv.expectedReturn || 0}%</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">👤 Responsible</span>
          <span class="detail-value">${escapeHtml(inv.responsible || 'N/A')}</span>
        </div>
      </div>
      
      ${inv.description ? `
        <div class="investment-description">
          ${escapeHtml(inv.description)}
        </div>
      ` : ''}
    </div>
  `;
}


// ============================================================
// 📊 GENERATE TABLE ROW
// ============================================================

function generateTableRow(inv) {
  // Determine status class
  let statusClass = 'status-pending';
  if (inv.status === 'ACTIVE') statusClass = 'status-active';
  if (inv.status === 'COMPLETED') statusClass = 'status-completed';
  
  // Format dates
  const startDate = inv.startDate ? new Date(inv.startDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'N/A';
  
  const endDate = inv.endDate ? new Date(inv.endDate).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }) : 'Ongoing';
  
  return `
    <tr>
      <td><strong>${escapeHtml(inv.name || 'Unnamed')}</strong></td>
      <td style="color: var(--accent-success); font-weight: 700;">${formatMoney(inv.amount || 0)}</td>
      <td>
        <span class="status-badge ${statusClass}">${inv.status || 'PENDING'}</span>
      </td>
      <td>${startDate}</td>
      <td>${endDate}</td>
      <td style="font-weight: 600;">${inv.expectedReturn || 0}%</td>
      <td>${escapeHtml(inv.description || 'No description')}</td>
    </tr>
  `;
}


// ============================================================
// 📭 GENERATE EMPTY STATE
// ============================================================

function generateEmptyState() {
  return `
    <div class="investment-card" style="grid-column: 1 / -1;">
      <div class="no-data" style="padding: 40px;">
        <div class="no-data-icon">📭</div>
        <div class="no-data-title">No Investments Available</div>
        <div class="no-data-text">There are currently no investment projects to display.</div>
      </div>
    </div>
  `;
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
