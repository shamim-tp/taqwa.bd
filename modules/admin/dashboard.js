import { getDatabase } from '../database/db.js';
import { setPageTitle, navigateTo } from '../auth/session.js';
import { formatMoney } from '../utils/common.js';

/**
 * Admin Dashboard - Merged version with Enhanced Styling
 * Combines the old synchronous logic (with detailed stats and HTML)
 * with the new modular async database API.
 */
export async function renderAdminDashboard() {
  setPageTitle('Admin Dashboard', 'Overview of Members, Deposits, Investments, Expenses, Profit.');
  
  const db = getDatabase();
  
  // --- Fetch all required collections asynchronously ---
  const members = await db.getAll('members') || [];
  const deposits = await db.getAll('deposits') || [];
  const expenses = await db.getAll('expenses') || [];
  const sales = await db.getAll('sales') || [];
  const investments = await db.getAll('investments') || [];
  
  // System meta data (fallback if not exists)
  const meta = await db.get('meta', 'system') || { monthlyShareAmount: 10000 };
  const monthlyShareAmount = meta.monthlyShareAmount || 10000;

  // --- Statistics (same as old version, using modern array methods) ---
  const totalMembers = members.filter(m => m.approved).length;
  const activeMembers = members.filter(m => m.status === "ACTIVE" && m.approved).length;
  const pendingMembers = members.filter(m => m.status === "PENDING" && !m.approved).length;
  const resignedMembers = members.filter(m => m.status === "RESIGNED").length;

  const totalDeposit = deposits
    .filter(d => d.status === "APPROVED")
    .reduce((a, b) => a + Number(b.amount || 0), 0);
  
  const currentMonth = new Date().toLocaleString('default', { month: 'long' });
  const currentYear = new Date().getFullYear();
  
  const currentMonthDeposit = deposits
    .filter(d => d.status === "APPROVED" && d.month === currentMonth && d.year == currentYear)
    .reduce((a, b) => a + Number(b.amount || 0), 0);
  
  const totalExpense = expenses.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalSales = sales.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalInvestments = investments.length;

  const pendingDeposits = deposits.filter(d => d.status === "PENDING");
  const pendingCount = pendingDeposits.length;
  const pendingAmount = pendingDeposits.reduce((a, b) => a + Number(b.amount || 0), 0);
  
  const netProfitAll = totalSales - totalExpense;
  const totalBalance = totalDeposit - totalExpense;
  
  // --- New Additional Stats ---
  const totalShares = members.reduce((a, b) => a + Number(b.shares || 0), 0);
  const activeShares = members
    .filter(m => m.status === "ACTIVE" && m.approved)
    .reduce((a, b) => a + Number(b.shares || 0), 0);
  const resignedShares = members
    .filter(m => m.status === "RESIGNED")
    .reduce((a, b) => a + Number(b.shares || 0), 0);
  
  const expectedTotalDeposits = (activeShares * monthlyShareAmount);
  const currentMonthPendingAmount = expectedTotalDeposits - currentMonthDeposit;
  
  const totalInvestAmount = investments
    .reduce((a, b) => a + Number(b.amount || 0), 0);
  
  const activeInvestments = investments.filter(i => i.status === 'ACTIVE');
  const activeInvestCount = activeInvestments.length;
  const activeInvestAmount = activeInvestments.reduce((a, b) => a + Number(b.amount || 0), 0);
  
  const completedInvestments = investments.filter(i => i.status === 'COMPLETED');
  const completedInvestCount = completedInvestments.length;
  const completedInvestmentsProfit = completedInvestments.reduce((a, b) => a + Number(b.profit || 0), 0);
  
  const totalSalesFromInvestments = sales
    .filter(s => s.investmentId)
    .reduce((a, b) => a + Number(b.amount || 0), 0);
  
  const presentBalance = (totalBalance + totalSalesFromInvestments) - activeInvestAmount;
  
  // --- Monthly Trend Data (for visualization) ---
  const last6Months = [];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date();
    d.setMonth(d.getMonth() - i);
    const monthName = monthNames[d.getMonth()];
    const year = d.getFullYear();
    last6Months.push({ month: monthName, year, full: `${monthName} ${year}` });
  }
  
  const monthlyDeposits = last6Months.map(m => {
    const amount = deposits
      .filter(d => d.status === "APPROVED" && d.month === m.month && d.year == m.year)
      .reduce((a, b) => a + Number(b.amount || 0), 0);
    return amount;
  });
  
  const maxDeposit = Math.max(...monthlyDeposits, 1);
  
  // --- CSS Styles for the dashboard ---
  const styles = `
    <style>
      /* Dashboard Container */
      .dashboard-container {
        padding: 20px;
      }
      
      /* Stats Cards Grid */
      .stats-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
        gap: 20px;
        margin-bottom: 30px;
      }
      
      /* Card Styles */
      .stat-card {
        background: white;
        border-radius: 20px;
        padding: 25px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        transition: all 0.3s ease;
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(0,0,0,0.05);
      }
      
      .stat-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 15px 40px rgba(0,0,0,0.12);
      }
      
      .stat-card::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 5px;
        background: linear-gradient(90deg, #1e3c72, #2a5298);
      }
      
      .stat-card.members::before { background: linear-gradient(90deg, #667eea, #764ba2); }
      .stat-card.shares::before { background: linear-gradient(90deg, #f2994a, #f2c94c); }
      .stat-card.deposits::before { background: linear-gradient(90deg, #27ae60, #2ecc71); }
      .stat-card.expense::before { background: linear-gradient(90deg, #e74c3c, #c0392b); }
      .stat-card.balance::before { background: linear-gradient(90deg, #3498db, #2980b9); }
      .stat-card.investment::before { background: linear-gradient(90deg, #9b59b6, #8e44ad); }
      .stat-card.sales::before { background: linear-gradient(90deg, #1abc9c, #16a085); }
      .stat-card.bank::before { background: linear-gradient(90deg, #34495e, #2c3e50); }
      
      .card-tag {
        display: inline-block;
        padding: 4px 12px;
        background: rgba(30,60,114,0.1);
        color: #1e3c72;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 600;
        margin-bottom: 15px;
      }
      
      .card-title {
        font-size: 14px;
        color: #666;
        margin-bottom: 10px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .card-value {
        font-size: 32px;
        font-weight: 700;
        color: #1e3c72;
        margin-bottom: 10px;
      }
      
      .card-sub {
        font-size: 13px;
        color: #888;
        border-top: 1px solid #eee;
        padding-top: 10px;
        margin-top: 5px;
      }
      
      .card-icon {
        position: absolute;
        top: 20px;
        right: 20px;
        font-size: 48px;
        opacity: 0.1;
        color: #1e3c72;
      }
      
      /* Two Column Layout */
      .dashboard-cols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        margin-bottom: 30px;
      }
      
      @media (max-width: 768px) {
        .dashboard-cols {
          grid-template-columns: 1fr;
        }
      }
      
      /* Panel Styles */
      .dashboard-panel {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      }
      
      .panel-header {
        padding: 20px 25px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
      }
      
      .panel-header h3 {
        margin: 0;
        color: #1e3c72;
        font-size: 18px;
      }
      
      .panel-header p {
        margin: 5px 0 0;
        color: #666;
        font-size: 13px;
      }
      
      .manage-btn {
        padding: 8px 20px;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        color: white;
        border: none;
        border-radius: 30px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
        display: inline-block;
      }
      
      .manage-btn:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(30,60,114,0.3);
      }
      
      /* Table Styles */
      .dashboard-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .dashboard-table th {
        text-align: left;
        padding: 15px 25px;
        background: #f8f9fa;
        color: #1e3c72;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      .dashboard-table td {
        padding: 15px 25px;
        border-bottom: 1px solid #eee;
        color: #555;
      }
      
      .dashboard-table tr:hover td {
        background: #f8f9fa;
      }
      
      .status-badge {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .status-badge.pending {
        background: #fff3cd;
        color: #856404;
      }
      
      .status-badge.approved {
        background: #d4edda;
        color: #155724;
      }
      
      .status-badge.rejected {
        background: #f8d7da;
        color: #721c24;
      }
      
      /* Summary Table */
      .summary-table {
        width: 100%;
        border-collapse: collapse;
      }
      
      .summary-table tr {
        border-bottom: 1px solid #eee;
      }
      
      .summary-table td {
        padding: 12px 25px;
      }
      
      .summary-table td:first-child {
        font-weight: 600;
        color: #1e3c72;
      }
      
      .summary-table td:last-child {
        text-align: right;
        color: #2c3e50;
      }
      
      /* Chart Bar */
      .chart-container {
        padding: 20px 25px;
      }
      
      .chart-title {
        font-size: 16px;
        color: #1e3c72;
        margin-bottom: 20px;
        font-weight: 600;
      }
      
      .chart-bar-container {
        display: flex;
        align-items: center;
        margin-bottom: 15px;
      }
      
      .chart-label {
        width: 70px;
        font-size: 13px;
        color: #666;
      }
      
      .chart-bar-wrapper {
        flex: 1;
        height: 30px;
        background: #f0f0f0;
        border-radius: 15px;
        overflow: hidden;
        margin: 0 10px;
      }
      
      .chart-bar {
        height: 100%;
        background: linear-gradient(90deg, #1e3c72, #2a5298);
        border-radius: 15px;
        transition: width 1s ease;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 10px;
        color: white;
        font-size: 11px;
        font-weight: 600;
      }
      
      .chart-value {
        width: 80px;
        text-align: right;
        font-weight: 600;
        color: #1e3c72;
      }
      
      /* Quick Actions */
      .quick-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 15px;
        margin-top: 25px;
      }
      
      .action-btn {
        padding: 15px;
        background: white;
        border: 1px solid #eee;
        border-radius: 12px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        text-decoration: none;
        color: #1e3c72;
      }
      
      .action-btn:hover {
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        color: white;
        transform: translateY(-3px);
        box-shadow: 0 10px 25px rgba(30,60,114,0.2);
      }
      
      .action-icon {
        font-size: 24px;
        margin-bottom: 8px;
      }
      
      .action-label {
        font-size: 13px;
        font-weight: 600;
      }
      
      /* Welcome Section */
      .welcome-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 30px;
        border-radius: 20px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
      }
      
      .welcome-title {
        font-size: 28px;
        font-weight: 700;
        margin-bottom: 10px;
      }
      
      .welcome-date {
        font-size: 16px;
        opacity: 0.9;
      }
      
      .welcome-stats {
        display: flex;
        gap: 30px;
      }
      
      .welcome-stat {
        text-align: center;
      }
      
      .welcome-stat-value {
        font-size: 32px;
        font-weight: 700;
      }
      
      .welcome-stat-label {
        font-size: 12px;
        opacity: 0.8;
      }
    </style>
  `;

  // --- Welcome Section ---
  const today = new Date();
  const welcomeDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  const welcomeHTML = `
    <div class="welcome-section">
      <div>
        <div class="welcome-title">👋 Welcome back, Admin!</div>
        <div class="welcome-date">${welcomeDate}</div>
      </div>
      <div class="welcome-stats">
        <div class="welcome-stat">
          <div class="welcome-stat-value">${activeMembers}</div>
          <div class="welcome-stat-label">Active Members</div>
        </div>
        <div class="welcome-stat">
          <div class="welcome-stat-value">${formatMoney(currentMonthDeposit)}</div>
          <div class="welcome-stat-label">This Month</div>
        </div>
        <div class="welcome-stat">
          <div class="welcome-stat-value">${pendingCount}</div>
          <div class="welcome-stat-label">Pending</div>
        </div>
      </div>
    </div>
  `;

  // --- Stats Cards with Icons ---
  const statsHTML = `
    <div class="stats-grid">
      <div class="stat-card members">
        <div class="card-tag">Members</div>
        <div class="card-icon">👥</div>
        <div class="card-title">Active Members</div>
        <div class="card-value">${activeMembers}</div>
        <div class="card-sub">Total: ${totalMembers} | Pending: ${pendingMembers} | Resigned: ${resignedMembers}</div>
      </div>

      <div class="stat-card shares">
        <div class="card-tag">Shares</div>
        <div class="card-icon">📊</div>
        <div class="card-title">Active Shares</div>
        <div class="card-value">${activeShares}</div>
        <div class="card-sub">Total Shares: ${totalShares} | Per Share: ${formatMoney(monthlyShareAmount)}</div>
      </div>

      <div class="stat-card deposits">
        <div class="card-tag">Deposits</div>
        <div class="card-icon">💰</div>
        <div class="card-title">Total Deposits</div>
        <div class="card-value">${formatMoney(totalDeposit)}</div>
        <div class="card-sub">This Month: ${formatMoney(currentMonthDeposit)} | Pending: ${formatMoney(pendingAmount)}</div>
      </div>

      <div class="stat-card expense">
        <div class="card-tag">Expenses</div>
        <div class="card-icon">💸</div>
        <div class="card-title">Total Expenses</div>
        <div class="card-value">${formatMoney(totalExpense)}</div>
        <div class="card-sub">All time expenses</div>
      </div>

      <div class="stat-card balance">
        <div class="card-tag">Balance</div>
        <div class="card-icon">⚖️</div>
        <div class="card-title">Current Balance</div>
        <div class="card-value">${formatMoney(totalBalance)}</div>
        <div class="card-sub">Deposits - Expenses</div>
      </div>

      <div class="stat-card investment">
        <div class="card-tag">Investments</div>
        <div class="card-icon">📈</div>
        <div class="card-title">Total Invested</div>
        <div class="card-value">${formatMoney(totalInvestAmount)}</div>
        <div class="card-sub">Total: ${totalInvestments} | Active: ${activeInvestCount} | Completed: ${completedInvestCount}</div>
      </div>

      <div class="stat-card sales">
        <div class="card-tag">Sales</div>
        <div class="card-icon">🛒</div>
        <div class="card-title">Total Sales</div>
        <div class="card-value">${formatMoney(totalSales)}</div>
        <div class="card-sub">Investment Profit: ${formatMoney(completedInvestmentsProfit)}</div>
      </div>

      <div class="stat-card bank">
        <div class="card-tag">Bank</div>
        <div class="card-icon">🏦</div>
        <div class="card-title">Present Balance</div>
        <div class="card-value">${formatMoney(presentBalance)}</div>
        <div class="card-sub">After investments</div>
      </div>
    </div>
  `;

  // --- Monthly Trend Chart ---
  const trendHTML = `
    <div class="dashboard-panel" style="margin-bottom: 30px;">
      <div class="panel-header">
        <div>
          <h3>📈 Monthly Deposit Trend</h3>
          <p>Last 6 months deposit summary</p>
        </div>
      </div>
      <div class="chart-container">
        ${last6Months.map((m, index) => {
          const percentage = (monthlyDeposits[index] / maxDeposit) * 100;
          return `
            <div class="chart-bar-container">
              <div class="chart-label">${m.full}</div>
              <div class="chart-bar-wrapper">
                <div class="chart-bar" style="width: ${percentage}%">
                  ${percentage > 20 ? formatMoney(monthlyDeposits[index]) : ''}
                </div>
              </div>
              <div class="chart-value">${formatMoney(monthlyDeposits[index])}</div>
            </div>
          `;
        }).join('')}
      </div>
    </div>
  `;

  // --- Summary Panel ---
  const summaryHTML = `
    <div class="dashboard-panel">
      <div class="panel-header">
        <div>
          <h3>📋 Financial Summary</h3>
          <p>System financial performance</p>
        </div>
      </div>
      <table class="summary-table">
        <tr><td>Total Investments</td><td>${totalInvestments}</td></tr>
        <tr><td>Total Sales</td><td>${formatMoney(totalSales)}</td></tr>
        <tr><td>Net Profit (All)</td><td>${formatMoney(netProfitAll)}</td></tr>
        <tr><td>Pending Deposits</td><td>${pendingCount} (${formatMoney(pendingAmount)})</td></tr>
        <tr><td>Monthly Share Amount</td><td>${formatMoney(monthlyShareAmount)}</td></tr>
        <tr><td>Total Shares</td><td>${totalShares}</td></tr>
        <tr><td>Present Balance</td><td>${formatMoney(presentBalance)}</td></tr>
        <tr><td>Active Investments</td><td>${activeInvestCount} (${formatMoney(activeInvestAmount)})</td></tr>
      </table>
    </div>
  `;

  // --- Pending Deposits Panel ---
  const pendingHTML = `
    <div class="dashboard-panel">
      <div class="panel-header">
        <div>
          <h3>⏳ Pending Deposits</h3>
          <p>Recent deposits waiting for approval</p>
        </div>
        <button class="manage-btn" onclick="navigateTo('admin_deposits')">Manage All</button>
      </div>
      <table class="dashboard-table">
        <thead>
          <tr>
            <th>Deposit ID</th>
            <th>Member</th>
            <th>Month</th>
            <th>Amount</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          ${pendingDeposits.slice(0, 5).map(d => {
            const member = members.find(x => x.id === d.memberId);
            return `
              <tr>
                <td><strong>${d.id}</strong></td>
                <td>${member ? member.name : 'Unknown'}<br><small style="color:#999;">${d.memberId}</small></td>
                <td>${d.month} ${d.year || ''}</td>
                <td><strong style="color:#27ae60;">${formatMoney(d.amount)}</strong></td>
                <td><span class="status-badge pending">PENDING</span></td>
              </tr>
            `;
          }).join('') || `<tr><td colspan="5" style="text-align:center; padding:40px;">No pending deposits found.</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  // --- Quick Actions ---
  const actionsHTML = `
    <div class="quick-actions">
      <div class="action-btn" onclick="navigateTo('admin_members')">
        <div class="action-icon">👥</div>
        <div class="action-label">Manage Members</div>
      </div>
      <div class="action-btn" onclick="navigateTo('admin_deposits')">
        <div class="action-icon">💰</div>
        <div class="action-label">Manage Deposits</div>
      </div>
      <div class="action-btn" onclick="navigateTo('admin_investments')">
        <div class="action-icon">📈</div>
        <div class="action-label">Investments</div>
      </div>
      <div class="action-btn" onclick="navigateTo('admin_expenses')">
        <div class="action-icon">💸</div>
        <div class="action-label">Expenses</div>
      </div>
      <div class="action-btn" onclick="navigateTo('admin_sales')">
        <div class="action-icon">🛒</div>
        <div class="action-label">Sales</div>
      </div>
      <div class="action-btn" onclick="navigateTo('admin_reports')">
        <div class="action-icon">📊</div>
        <div class="action-label">Reports</div>
      </div>
    </div>
  `;

  // --- Complete HTML ---
  const html = `
    ${styles}
    <div class="dashboard-container">
      ${welcomeHTML}
      ${statsHTML}
      ${trendHTML}
      <div class="dashboard-cols">
        ${summaryHTML}
        ${pendingHTML}
      </div>
      ${actionsHTML}
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;
}
