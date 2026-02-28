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
  
  // --- CSS Styles for the dashboard - Only Cards Styled ---
  const styles = `
    <style>
      /* Dashboard Container */
      .dashboard-container {
        padding: 20px;
      }
      
      /* Stats Cards Grid - Using original gridCards class */
      .gridCards {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 25px;
        margin-bottom: 30px;
      }
      
      /* Beautiful Card Styles */
      .card {
        background: white;
        border-radius: 24px;
        padding: 25px;
        box-shadow: 0 15px 35px rgba(0,0,0,0.1);
        transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
        position: relative;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.2);
        backdrop-filter: blur(10px);
      }
      
      .card:hover {
        transform: translateY(-8px) scale(1.02);
        box-shadow: 0 25px 50px rgba(0,0,0,0.15);
      }
      
      /* Gradient backgrounds for each card */
      .card:nth-child(1) {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
      }
      .card:nth-child(2) {
        background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
        color: white;
      }
      .card:nth-child(3) {
        background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
        color: white;
      }
      .card:nth-child(4) {
        background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        color: white;
      }
      .card:nth-child(5) {
        background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        color: white;
      }
      .card:nth-child(6) {
        background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
        color: white;
      }
      .card:nth-child(7) {
        background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
        color: #333;
      }
      .card:nth-child(8) {
        background: linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%);
        color: #333;
      }
      
      /* Decorative elements */
      .card::before {
        content: '';
        position: absolute;
        top: -50%;
        right: -50%;
        width: 200px;
        height: 200px;
        background: rgba(255,255,255,0.1);
        border-radius: 50%;
        transform: rotate(25deg);
        transition: all 0.5s;
      }
      
      .card:hover::before {
        transform: rotate(45deg) scale(1.2);
      }
      
      .card::after {
        content: '';
        position: absolute;
        bottom: -50%;
        left: -50%;
        width: 200px;
        height: 200px;
        background: rgba(255,255,255,0.1);
        border-radius: 50%;
        transform: rotate(-25deg);
        transition: all 0.5s;
      }
      
      .card:hover::after {
        transform: rotate(-45deg) scale(1.2);
      }
      
      /* Card content styles */
      .card .tag {
        display: inline-block;
        padding: 6px 16px;
        background: rgba(255,255,255,0.2);
        color: inherit;
        border-radius: 40px;
        font-size: 13px;
        font-weight: 600;
        margin-bottom: 20px;
        letter-spacing: 0.5px;
        backdrop-filter: blur(5px);
        position: relative;
        z-index: 1;
      }
      
      .card .title {
        font-size: 16px;
        opacity: 0.9;
        margin-bottom: 12px;
        font-weight: 500;
        position: relative;
        z-index: 1;
      }
      
      .card .value {
        font-size: 42px;
        font-weight: 800;
        margin-bottom: 15px;
        line-height: 1.2;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        position: relative;
        z-index: 1;
      }
      
      .card .sub {
        font-size: 14px;
        opacity: 0.8;
        border-top: 1px solid rgba(255,255,255,0.2);
        padding-top: 15px;
        margin-top: 10px;
        position: relative;
        z-index: 1;
      }
      
      /* Adjust text color for dark cards */
      .card:nth-child(7) .tag,
      .card:nth-child(7) .title,
      .card:nth-child(7) .value,
      .card:nth-child(7) .sub,
      .card:nth-child(8) .tag,
      .card:nth-child(8) .title,
      .card:nth-child(8) .value,
      .card:nth-child(8) .sub {
        color: #333;
        border-top-color: rgba(0,0,0,0.1);
      }
      
      .card:nth-child(7) .tag,
      .card:nth-child(8) .tag {
        background: rgba(0,0,0,0.1);
      }
      
      /* Two Column Layout */
      .twoCols {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 25px;
        margin-bottom: 30px;
      }
      
      @media (max-width: 768px) {
        .twoCols {
          grid-template-columns: 1fr;
        }
      }
      
      /* Panel Styles */
      .panel {
        background: white;
        border-radius: 20px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      }
      
      .panelHeader {
        padding: 20px 25px;
        border-bottom: 1px solid #eee;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 15px;
      }
      
      .panelHeader h3 {
        margin: 0;
        color: #1e3c72;
        font-size: 18px;
      }
      
      .panelHeader p {
        margin: 5px 0 0;
        color: #666;
        font-size: 13px;
      }
      
      .panelHeader .btn.primary {
        padding: 8px 20px;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        color: white;
        border: none;
        border-radius: 30px;
        font-size: 14px;
        cursor: pointer;
        transition: all 0.3s;
      }
      
      .panelHeader .btn.primary:hover {
        transform: translateY(-2px);
        box-shadow: 0 5px 15px rgba(30,60,114,0.3);
      }
      
      /* Table Styles */
      table {
        width: 100%;
        border-collapse: collapse;
      }
      
      th {
        text-align: left;
        padding: 15px 25px;
        background: #f8f9fa;
        color: #1e3c72;
        font-weight: 600;
        font-size: 13px;
        text-transform: uppercase;
        letter-spacing: 0.5px;
      }
      
      td {
        padding: 15px 25px;
        border-bottom: 1px solid #eee;
        color: #555;
      }
      
      tr:hover td {
        background: #f8f9fa;
      }
      
      td .small {
        font-size: 11px;
        color: #999;
        margin-top: 3px;
      }
      
      /* Status Badges */
      .status {
        display: inline-block;
        padding: 5px 12px;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 600;
      }
      
      .st-pending {
        background: #fff3cd;
        color: #856404;
      }
      
      .st-approved {
        background: #d4edda;
        color: #155724;
      }
      
      .st-rejected {
        background: #f8d7da;
        color: #721c24;
      }
      
      /* Monthly Trend Chart */
      .trend-container {
        background: white;
        border-radius: 20px;
        padding: 25px;
        margin-bottom: 30px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
      }
      
      .trend-title {
        font-size: 18px;
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
        width: 80px;
        font-size: 13px;
        color: #666;
        font-weight: 500;
      }
      
      .chart-bar-wrapper {
        flex: 1;
        height: 36px;
        background: #f0f0f0;
        border-radius: 18px;
        overflow: hidden;
        margin: 0 15px;
        box-shadow: inset 0 2px 5px rgba(0,0,0,0.05);
      }
      
      .chart-bar {
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        border-radius: 18px;
        transition: width 1s ease;
        display: flex;
        align-items: center;
        justify-content: flex-end;
        padding-right: 15px;
        color: white;
        font-size: 12px;
        font-weight: 600;
        text-shadow: 0 1px 2px rgba(0,0,0,0.2);
      }
      
      .chart-value {
        width: 100px;
        text-align: right;
        font-weight: 700;
        color: #1e3c72;
        font-size: 14px;
      }
      
      /* Quick Actions */
      .quick-actions {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
        gap: 15px;
        margin-top: 25px;
      }
      
      .action-btn {
        padding: 18px;
        background: white;
        border: none;
        border-radius: 16px;
        text-align: center;
        cursor: pointer;
        transition: all 0.3s;
        color: #1e3c72;
        font-size: 14px;
        font-weight: 600;
        box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        border: 1px solid rgba(0,0,0,0.05);
      }
      
      .action-btn:hover {
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        color: white;
        transform: translateY(-5px);
        box-shadow: 0 15px 30px rgba(30,60,114,0.3);
      }
      
      /* Welcome Section */
      .welcome-section {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 35px;
        border-radius: 24px;
        margin-bottom: 30px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        flex-wrap: wrap;
        gap: 20px;
        box-shadow: 0 20px 40px rgba(102,126,234,0.3);
      }
      
      .welcome-title {
        font-size: 32px;
        font-weight: 700;
        margin-bottom: 8px;
        text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
      }
      
      .welcome-date {
        font-size: 16px;
        opacity: 0.95;
      }
      
      .welcome-stats {
        display: flex;
        gap: 40px;
        background: rgba(255,255,255,0.15);
        padding: 15px 30px;
        border-radius: 50px;
        backdrop-filter: blur(10px);
      }
      
      .welcome-stat {
        text-align: center;
      }
      
      .welcome-stat-value {
        font-size: 28px;
        font-weight: 700;
        line-height: 1.2;
      }
      
      .welcome-stat-label {
        font-size: 12px;
        opacity: 0.9;
        text-transform: uppercase;
        letter-spacing: 0.5px;
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

  // --- Monthly Trend Chart ---
  const trendHTML = `
    <div class="trend-container">
      <div class="trend-title">📈 Monthly Deposit Trend (Last 6 Months)</div>
      ${last6Months.map((m, index) => {
        const percentage = (monthlyDeposits[index] / maxDeposit) * 100;
        return `
          <div class="chart-bar-container">
            <div class="chart-label">${m.full}</div>
            <div class="chart-bar-wrapper">
              <div class="chart-bar" style="width: ${percentage}%">
                ${percentage > 15 ? formatMoney(monthlyDeposits[index]) : ''}
              </div>
            </div>
            <div class="chart-value">${formatMoney(monthlyDeposits[index])}</div>
          </div>
        `;
      }).join('')}
    </div>
  `;

  // --- Original Cards (with enhanced styling) ---
  const originalCardsHTML = `
    <div class="gridCards">
      <div class="card">
        <div class="tag">Members</div>
        <div class="title">Total Active Members</div>
        <div class="value">${activeMembers}</div>
        <div class="sub">Total: ${totalMembers} | Pending: ${pendingMembers} | Resigned: ${resignedMembers}</div>
      </div>

      <div class="card">
        <div class="tag">Shares</div>
        <div class="title">Total Active Shares</div>
        <div class="value">${activeShares}</div>
        <div class="sub">Total Shares: ${totalShares} | Per Share: ${formatMoney(monthlyShareAmount)}</div>
      </div>

      <div class="card">
        <div class="tag">Deposits</div>
        <div class="title">Total Approved Deposit</div>
        <div class="value">${formatMoney(totalDeposit)}</div>
        <div class="sub">This Month: ${formatMoney(currentMonthDeposit)} | Pending: ${formatMoney(currentMonthPendingAmount)}</div>
      </div>

      <div class="card">
        <div class="tag">Expense</div>
        <div class="title">Total Expenses</div>
        <div class="value">${formatMoney(totalExpense)}</div>
        <div class="sub">All time expenses</div>
      </div>

      <div class="card">
        <div class="tag">Balance</div>
        <div class="title">Current Balance</div>
        <div class="value">${formatMoney(totalBalance)}</div>
        <div class="sub">Deposits - Expenses</div>
      </div>

      <div class="card">
        <div class="tag">Investment</div>
        <div class="title">Total Invest Amount</div>
        <div class="value">${formatMoney(totalInvestAmount)}</div>
        <div class="sub">Total: ${totalInvestments} | Active: ${activeInvestCount} | Completed: ${completedInvestCount}</div>
      </div>

      <div class="card">
        <div class="tag">Sales</div>
        <div class="title">Total Sales Amount</div>
        <div class="value">${formatMoney(totalSales)}</div>
        <div class="sub">Investment Profit: ${formatMoney(completedInvestmentsProfit)}</div>
      </div>

      <div class="card">
        <div class="tag">Bank Balance</div>
        <div class="title">Present Balance</div>
        <div class="value">${formatMoney(presentBalance)}</div>
        <div class="sub">After investments</div>
      </div>
    </div>
  `;

  // --- Pending Deposits Panel ---
  const pendingHTML = `
    <div class="twoCols">
      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>⏳ Pending Deposits</h3>
            <p>Recent deposits waiting for approval</p>
          </div>
          <button class="btn primary" onclick="navigateTo('admin_deposits')">Manage All</button>
        </div>
        <table>
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
                  <td>${member ? member.name : 'Unknown'}<div class="small">${d.memberId}</div></td>
                  <td>${d.month} ${d.year || ''}</td>
                  <td><strong style="color:#27ae60;">${formatMoney(d.amount)}</strong></td>
                  <td><span class="status st-pending">PENDING</span></td>
                </tr>
              `;
            }).join('') || `<tr><td colspan="5" style="text-align:center; padding:40px;">No pending deposits found.</td></tr>`}
          </tbody>
        </table>
      </div>

      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>📊 Quick Stats</h3>
            <p>System overview</p>
          </div>
        </div>
        <table>
          <tr><td>Total Investments</td><td><strong>${totalInvestments}</strong></td></tr>
          <tr><td>Total Sales</td><td><strong>${formatMoney(totalSales)}</strong></td></tr>
          <tr><td>Net Profit</td><td><strong>${formatMoney(netProfitAll)}</strong></td></tr>
          <tr><td>Pending Deposits</td><td><strong>${pendingCount} (${formatMoney(pendingAmount)})</strong></td></tr>
          <tr><td>Monthly Share Amount</td><td><strong>${formatMoney(monthlyShareAmount)}</strong></td></tr>
          <tr><td>Total Shares</td><td><strong>${totalShares}</strong></td></tr>
          <tr><td>Active Investments</td><td><strong>${activeInvestCount} (${formatMoney(activeInvestAmount)})</strong></td></tr>
        </table>
      </div>
    </div>
  `;

  // --- Quick Actions ---
  const actionsHTML = `
    <div class="quick-actions">
      <button class="action-btn" onclick="navigateTo('admin_members')">👥 Members</button>
      <button class="action-btn" onclick="navigateTo('admin_deposits')">💰 Deposits</button>
      <button class="action-btn" onclick="navigateTo('admin_investments')">📈 Investments</button>
      <button class="action-btn" onclick="navigateTo('admin_expenses')">💸 Expenses</button>
      <button class="action-btn" onclick="navigateTo('admin_sales')">🛒 Sales</button>
      <button class="action-btn" onclick="navigateTo('admin_reports')">📊 Reports</button>
    </div>
  `;

  // --- Complete HTML ---
  const html = `
    ${styles}
    <div class="dashboard-container">
      ${welcomeHTML}
      ${originalCardsHTML}
      ${trendHTML}
      ${pendingHTML}
      ${actionsHTML}
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;
}
