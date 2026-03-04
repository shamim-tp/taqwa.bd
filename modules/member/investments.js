// ============================================================
// 📈 MEMBER INVESTMENTS MODULE
// IMS ERP V5
// Shows all company investments to members
// Fully Responsive - Mobile & PC Optimized
// Uses global style.css (same design as member-profile)
// ============================================================

// ============================================================
// 📦 IMPORTS
// ============================================================

import { getDatabase } from '../database/db.js';
import { setPageTitle } from '../auth/session.js';
import { formatMoney } from '../utils/common.js';

// ============================================================
// 🎯 MAIN RENDER FUNCTION
// ============================================================

export async function renderMemberInvestments() {
  
  // Show loading state
  const pageContent = document.getElementById('pageContent');
  if (pageContent) {
    pageContent.innerHTML = `
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
          <div class="investments-container">
            <div style="text-align: center; padding: 60px; background: var(--bg-danger); border-radius: var(--radius-lg);">
              <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
              <h3 style="color: #721c24; margin-bottom: 10px;">Error Loading Data</h3>
              <p style="color: #721c24; margin-bottom: 20px;">${error.message || 'Failed to load investments'}</p>
              <button class="btn btn-primary" onclick="window.location.reload()">🔄 Try Again</button>
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
    <div class="investments-container">

      <!-- Header -->
      <div class="page-header">
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
      <div class="panel">
        <div class="panel-header">
          <div>
            <h3>📋 Detailed Investment List</h3>
            <p>Complete information about all investment projects</p>
          </div>
        </div>

        <div class="table-responsive">
          <table>
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
