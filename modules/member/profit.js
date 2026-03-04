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
// 🎯 MAIN RENDER FUNCTION
// ============================================================

export async function renderMemberProfit() {
  
  // Show loading state
  const pageContent = document.getElementById('pageContent');
  if (pageContent) {
    pageContent.innerHTML = `
      <div class="profit-container">
        <div style="text-align: center; padding: 60px;">
          <div class="loading-spinner mx-auto mb-4"></div>
          <p class="text-muted">Loading profit data...</p>
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
          <div class="profit-container">
            <div class="p-8 text-center bg-danger rounded-xl">
              <div class="text-5xl mb-4">❌</div>
              <h3 class="text-danger text-xl font-bold mb-2">Error Loading Data</h3>
              <p class="text-danger mb-4">${error.message || 'Failed to load profit data'}</p>
              <button class="btn btn-primary" onclick="window.location.reload()">🔄 Try Again</button>
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
