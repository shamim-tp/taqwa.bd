import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, navigateTo } from '../auth/session.js';
import { showToast, formatMoney, getMonthKey } from '../utils/common.js';
import { openModal } from '../modals/modals.js';

export async function renderMemberDashboard() {
  const user = getCurrentUser();
  if (!user) return;

  const db = getDatabase();

  try {
    const member = await db.get('members', user.id);
    if (!member) {
      showToast('Error', 'Member not found');
      return;
    }

    const deposits = (await db.getAll('deposits')) || [];
    const profitDistributions = (await db.getAll('profitDistributions')) || [];
    const meta = (await db.get('meta', 'system')) || { monthlyShareAmount: 10000 };

    // ---------- Deposits ----------
    const memberDeposits = deposits.filter(d => d.memberId === user.id);
    const approvedDeposits = memberDeposits.filter(d => d.status === 'APPROVED');

    const totalDeposit = approvedDeposits.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    );

    // ---------- Current Month ----------
    const currentMonth = getMonthKey();

    const thisMonthApproved = approvedDeposits.find(
      d => d.month === currentMonth
    );

    const thisMonthPending = memberDeposits.find(
      d => d.month === currentMonth && d.status === 'PENDING'
    );

    const shares = Number(member.shares || 1);
    const monthlyShareAmount = Number(meta.monthlyShareAmount || 10000);

    const required = shares * monthlyShareAmount;
    const due = thisMonthApproved ? 0 : required;
    const totalSharesAmount = shares * monthlyShareAmount;

    // ---------- Members Summary ----------
    const allMembers = (await db.getAll('members')) || [];
    const activeMembers = allMembers.length;
    const activeShares = allMembers.reduce((sum, m) => sum + Number(m.shares || 0), 0);
    const activeSharesAmount = activeShares * monthlyShareAmount;
    const totalApprovedDeposit = (await db.getAll('deposits'))?.filter(d => d.status === 'APPROVED').reduce((sum, d) => sum + Number(d.amount || 0), 0) || 0;
    const totalinvestments = (await db.getAll('investments'))?.length || 0;
    const totalInvestmentAmount = (await db.getAll('investments'))?.reduce((sum, i) => sum + Number(i.amount || 0), 0) || 0;
    const InvestmentStatusAmount = {
      PENDING: 0,
      APPROVED: 0,
      REJECTED: 0,
      ACTIVE: 0,
      COMPLETED: 0
    };
    (await db.getAll('investments'))?.forEach(i => {
      InvestmentStatusAmount[i.status] = (InvestmentStatusAmount[i.status] || 0) + Number(i.amount || 0);
    });
    
    const totalInvestmentSales = (await db.getAll('sales'))?.reduce((sum, s) => sum + Number(s.amount || 0), 0) || 0;
    const totalExpense = (await db.getAll('expenses'))?.reduce((sum, e) => sum + Number(e.amount || 0), 0) || 0;
    const netProfitAll = totalInvestmentSales - InvestmentStatusAmount.COMPLETED;
    const totalBalance = totalApprovedDeposit + netProfitAll;

    // ---------- Profit ----------
    let myProfit = 0;
    profitDistributions.forEach(p => {
      myProfit += Number(p.profitPerShare || 0) * shares;
    });

    setPageTitle('Member Dashboard', 'Your deposit status, profit, shares and notices.');

    // Mobile-First CSS Styles - Updated
    const styles = `
      <style>
        /* Mobile-First Reset */
        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        /* Dashboard Container */
        .member-dashboard {
          padding: 16px;
          background: linear-gradient(135deg, #f5f7fa 0%, #e9edf5 100%);
          min-height: 100vh;
          width: 100%;
          max-width: 100%;
          overflow-x: hidden;
        }

        @media (min-width: 1200px) {
          .member-dashboard {
            padding: 25px;
          }
        }

        /* Welcome Section - Enhanced Mobile First */
        .member-welcome {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 24px 20px;
          border-radius: 28px;
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          gap: 20px;
          box-shadow: 0 20px 40px rgba(102,126,234,0.3);
          position: relative;
          overflow: hidden;
        }

        .member-welcome::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200px;
          height: 200px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          transform: rotate(25deg);
        }

        .member-welcome::after {
          content: '';
          position: absolute;
          bottom: -50%;
          left: -50%;
          width: 200px;
          height: 200px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          transform: rotate(-25deg);
        }

        @media (min-width: 640px) {
          .member-welcome {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 30px 35px;
          }
        }

        .welcome-title {
          font-size: 24px;
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
        }

        @media (min-width: 640px) {
          .welcome-title {
            font-size: 28px;
          }
        }

        .welcome-subtitle {
          font-size: 14px;
          opacity: 0.95;
          display: flex;
          align-items: center;
          gap: 5px;
          position: relative;
          z-index: 1;
        }

        .welcome-subtitle::before {
          content: '📅';
          margin-right: 5px;
        }

        .member-badge {
          background: rgba(255,255,255,0.2);
          padding: 16px 24px;
          border-radius: 60px;
          backdrop-filter: blur(10px);
          text-align: center;
          border: 2px solid rgba(255,255,255,0.3);
          position: relative;
          z-index: 1;
          min-width: 200px;
        }

        .member-badge .id {
          font-size: 20px;
          font-weight: 800;
          letter-spacing: 1px;
        }

        .member-badge .type {
          font-size: 13px;
          opacity: 0.9;
          margin-top: 5px;
          text-transform: uppercase;
          letter-spacing: 1px;
        }

        /* Quick Stats Row - Enhanced */
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 12px;
          margin-bottom: 25px;
        }

        @media (min-width: 640px) {
          .quick-stats {
            gap: 20px;
            margin-bottom: 30px;
          }
        }

        .stat-item {
          background: white;
          padding: 16px 10px;
          border-radius: 20px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
          transition: all 0.3s;
        }

        .stat-item:active {
          transform: scale(0.95);
        }

        .stat-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .stat-value {
          font-size: 18px;
          font-weight: 800;
          color: #1e3c72;
          word-break: break-word;
        }

        @media (min-width: 640px) {
          .stat-value {
            font-size: 20px;
          }
        }

        /* Stats Cards Grid - Enhanced Mobile First */
        .gridCards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 16px;
          margin-bottom: 25px;
        }

        @media (min-width: 500px) {
          .gridCards {
            grid-template-columns: repeat(2, 1fr);
            gap: 18px;
          }
        }

        @media (min-width: 1024px) {
          .gridCards {
            grid-template-columns: repeat(3, 1fr);
            gap: 22px;
          }
        }

        /* Card Styles - Enhanced */
        .card {
          border-radius: 24px;
          padding: 20px;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: none;
        }

        .card:active {
          transform: scale(0.98);
        }

        /* Gradient backgrounds with animation */
        .card:nth-child(1) { 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
        }
        .card:nth-child(2) { 
          background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
          color: white;
        }
        .card:nth-child(3) { 
          background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
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

        /* Decorative elements */
        .card::before {
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

        .card:hover::before {
          transform: rotate(45deg) scale(1.2);
        }

        .card::after {
          content: '';
          position: absolute;
          bottom: -50%;
          left: -50%;
          width: 150px;
          height: 150px;
          background: rgba(255,255,255,0.1);
          border-radius: 50%;
          transform: rotate(-25deg);
          transition: all 0.5s;
        }

        .card:hover::after {
          transform: rotate(-45deg) scale(1.2);
        }

        /* Card Content */
        .card .tag {
          display: inline-block;
          padding: 6px 14px;
          background: rgba(255,255,255,0.2);
          color: inherit;
          border-radius: 40px;
          font-size: 11px;
          font-weight: 700;
          margin-bottom: 15px;
          letter-spacing: 0.5px;
          backdrop-filter: blur(5px);
          position: relative;
          z-index: 1;
        }

        .card .title {
          font-size: 13px;
          opacity: 0.9;
          margin-bottom: 8px;
          font-weight: 500;
          position: relative;
          z-index: 1;
        }

        .card .value {
          font-size: 26px;
          font-weight: 800;
          margin-bottom: 12px;
          line-height: 1.2;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          position: relative;
          z-index: 1;
          word-break: break-word;
        }

        @media (min-width: 640px) {
          .card .value {
            font-size: 28px;
          }
        }

        .card .sub {
          font-size: 11px;
          opacity: 0.8;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 12px;
          line-height: 1.5;
          position: relative;
          z-index: 1;
        }

        /* Dark text for light card */
        .card:nth-child(7) .tag {
          background: rgba(0,0,0,0.1);
          color: #333;
        }
        .card:nth-child(7) .sub {
          border-top-color: rgba(0,0,0,0.1);
          color: #555;
        }

        /* Panel Styles - Enhanced */
        .panel {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          margin-bottom: 25px;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .panelHeader {
          padding: 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          flex-direction: column;
          gap: 15px;
          background: linear-gradient(to right, #f8f9fa, #ffffff);
        }

        @media (min-width: 640px) {
          .panelHeader {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 22px 25px;
          }
        }

        .panelHeader h3 {
          margin: 0;
          color: #1e3c72;
          font-size: 18px;
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panelHeader p {
          margin: 8px 0 0;
          color: #666;
          font-size: 13px;
          line-height: 1.5;
        }

        .panelHeader .btn.primary {
          padding: 14px 28px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 700;
          cursor: pointer;
          width: 100%;
          text-align: center;
          box-shadow: 0 10px 20px rgba(102,126,234,0.3);
          transition: all 0.3s;
        }

        .panelHeader .btn.primary:active {
          transform: scale(0.95);
        }

        @media (min-width: 640px) {
          .panelHeader .btn.primary {
            width: auto;
            padding: 12px 30px;
          }
        }

        /* Table Styles - Enhanced */
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
          padding: 5px 0;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 300px;
        }

        th {
          text-align: left;
          padding: 16px 20px;
          background: #f8f9fa;
          color: #1e3c72;
          font-weight: 700;
          font-size: 13px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          color: #555;
          font-size: 14px;
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:active td {
          background: #f0f7ff;
        }

        /* Status Badges - Enhanced */
        .status {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 40px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .st-approved { 
          background: #d4edda; 
          color: #155724;
          border: 1px solid #c3e6cb;
        }
        .st-pending { 
          background: #fff3cd; 
          color: #856404;
          border: 1px solid #ffeeba;
        }
        .st-rejected { 
          background: #f8d7da; 
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        /* Company Mission - Enhanced */
        .companyMission {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 30px 25px;
          border-radius: 28px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(30,60,114,0.3);
          position: relative;
          overflow: hidden;
        }

        .companyMission::before {
          content: '★';
          position: absolute;
          top: -30px;
          right: -30px;
          font-size: 150px;
          opacity: 0.1;
          color: white;
          transform: rotate(20deg);
        }

        .companyMission h3 {
          font-size: 24px;
          margin-bottom: 15px;
          font-weight: 800;
          position: relative;
          z-index: 1;
        }

        .companyMission p {
          font-size: 15px;
          opacity: 0.95;
          line-height: 1.7;
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
        }

        .companyMission .btn {
          padding: 14px 35px;
          background: white;
          color: #1e3c72;
          border: none;
          border-radius: 60px;
          font-size: 16px;
          font-weight: 700;
          cursor: pointer;
          margin-top: 20px;
          width: 100%;
          max-width: 300px;
          box-shadow: 0 10px 25px rgba(0,0,0,0.2);
          transition: all 0.3s;
        }

        .companyMission .btn:active {
          transform: scale(0.95);
          box-shadow: 0 5px 15px rgba(0,0,0,0.2);
        }

        @media (min-width: 640px) {
          .companyMission .btn {
            width: auto;
          }
        }

        /* Loading State */
        .loading-skeleton {
          background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
          background-size: 200% 100%;
          animation: loading 1.5s infinite;
          border-radius: 8px;
        }

        @keyframes loading {
          0% { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }

        /* Pull to Refresh */
        .ptr-element {
          text-align: center;
          padding: 15px;
          color: #667eea;
          font-weight: 600;
          display: none;
        }

        .ptr-element.show {
          display: block;
        }

        /* Safe Area Support */
        @supports (padding: max(0px)) {
          .member-dashboard {
            padding-left: max(16px, env(safe-area-inset-left));
            padding-right: max(16px, env(safe-area-inset-right));
          }
        }

        /* Touch Optimizations */
        .btn, .card, .stat-item, .nav-item {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        /* Prevent text selection */
        .no-select {
          user-select: none;
          -webkit-user-select: none;
        }

        /* Bottom spacing for mobile */
        @media (max-width: 640px) {
          .member-dashboard {
            padding-bottom: 30px;
          }
        }
      </style>
    `;

    // Welcome Section - Enhanced
    const welcomeHTML = `
      <div class="member-welcome">
        <div>
          <div class="welcome-title">👋 Welcome, ${member.name}!</div>
          <div class="welcome-subtitle">${new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</div>
        </div>
        <div class="member-badge">
          <div class="id">${member.id}</div>
          <div class="type">${member.memberType || 'Member'}</div>
        </div>
      </div>
    `;

    // Quick Stats - Enhanced
    const quickStatsHTML = `
      <div class="quick-stats">
        <div class="stat-item">
          <div class="stat-label">📅 Joined</div>
          <div class="stat-value">${new Date(member.joinDate || Date.now()).getFullYear()}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">💰 Deposits</div>
          <div class="stat-value">${approvedDeposits.length}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">📊 Shares</div>
          <div class="stat-value">${formatMoney(totalSharesAmount)}/mo</div>
        </div>
      </div>
    `;

    // Cards - Enhanced with emojis
    const cardsHTML = `
      <div class="gridCards">
        <div class="card">
          <div class="tag">📈 My Shares</div>
          <div class="title">Total Shares</div>
          <div class="value">${shares}</div>
          <div class="sub">Per Share: ${formatMoney(monthlyShareAmount)}</div>
        </div>
        <div class="card">
          <div class="tag">💵 My Deposits</div>
          <div class="title">Total Approved</div>
          <div class="value">${formatMoney(totalDeposit)}</div>
          <div class="sub">${approvedDeposits.length} deposits total</div>
        </div>
        <div class="card">
          <div class="tag">⏰ Due Status</div>
          <div class="title">This Month</div>
          <div class="value">${formatMoney(due)}</div>
          <div class="sub">${thisMonthApproved ? '✅ Approved' : thisMonthPending ? '⏳ Pending' : '⚠️ Not submitted'}</div>
        </div>
        <div class="card">
          <div class="tag">💰 My Profit</div>
          <div class="title">Total Profit</div>
          <div class="value">${formatMoney(myProfit)}</div>
          <div class="sub">From investments</div>
        </div>
        <div class="card">
          <div class="tag">🏢 Organization</div>
          <div class="title">Total Deposit</div>
          <div class="value">${formatMoney(totalApprovedDeposit)}</div>
          <div class="sub">Bank Balance: ${formatMoney(totalBalance - (totalExpense + InvestmentStatusAmount.ACTIVE))}</div>
        </div>
        <div class="card">
          <div class="tag">📊 Investments</div>
          <div class="title">Active Investment</div>
          <div class="value">${formatMoney(InvestmentStatusAmount.ACTIVE)}</div>
          <div class="sub">${totalinvestments} Active Projects</div>
        </div>
        <div class="card">
          <div class="tag">🛒 Sales</div>
          <div class="title">Total Sales</div>
          <div class="value">${formatMoney(totalInvestmentSales)}</div>
          <div class="sub">Net Profit: ${formatMoney(netProfitAll)}</div>
        </div>
      </div>
    `;

    // Status Panel - Enhanced
    const statusPanelHTML = `
      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>📅 Current Month Status</h3>
            <p>${currentMonth}</p>
          </div>
          <button class="btn primary" onclick="navigateTo('member_deposit')">+ Submit Deposit</button>
        </div>
        <div class="table-responsive">
          <table>
            <tr>
              <td><strong>Status</strong></td>
              <td>
                ${thisMonthApproved ? '<span class="status st-approved">✓ APPROVED</span>' : 
                  thisMonthPending ? '<span class="status st-pending">⏳ PENDING</span>' : 
                  '<span class="status st-rejected">⚠️ NOT SUBMITTED</span>'}
              </td>
            </tr>
            <tr>
              <td><strong>Details</strong></td>
              <td>${thisMonthApproved ? `MR ID: ${thisMonthApproved.mrId || '-'}` : 
                  thisMonthPending ? 'Waiting for admin approval' : 
                  'Please submit your deposit'}</td>
            </tr>
          </table>
        </div>
      </div>
    `;

    // Mission Section - Enhanced
    const missionHTML = `
      <div class="companyMission">
        <h3>🚀 Our Vision</h3>
        <p>Leading investment management company providing exceptional returns and financial security to our valued members through transparent and innovative investment strategies.</p>
        <button class="btn" onclick="openModal('modalCompanyInfo')">Learn More About Us</button>
      </div>
    `;

    const html = `
      ${styles}
      <div class="member-dashboard">
        ${welcomeHTML}
        ${quickStatsHTML}
        ${cardsHTML}
        ${statusPanelHTML}
        ${missionHTML}
      </div>
    `;

    document.getElementById('pageContent').innerHTML = html;

  } catch (error) {
    console.error(error);
    showToast('Error', 'Failed to load dashboard');
  }
}
