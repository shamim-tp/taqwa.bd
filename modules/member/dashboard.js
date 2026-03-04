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

    // ========== Fully Responsive Styles (Mobile & Desktop Optimized) ==========
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
          width: 100%;
          max-width: 1400px;
          margin: 0 auto;
          padding: clamp(12px, 3vw, 25px);
          background: linear-gradient(135deg, #f5f7fa 0%, #e9edf5 100%);
          min-height: 100vh;
        }

        /* Welcome Section – Mobile First */
        .member-welcome {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: clamp(20px, 4vw, 35px);
          border-radius: clamp(20px, 4vw, 30px);
          margin-bottom: clamp(20px, 3vw, 30px);
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
          }
        }

        .welcome-title {
          font-size: clamp(22px, 5vw, 32px);
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.5px;
          position: relative;
          z-index: 1;
          color: white;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .welcome-subtitle {
          font-size: clamp(13px, 3vw, 16px);
          opacity: 0.95;
          display: flex;
          align-items: center;
          gap: 5px;
          position: relative;
          z-index: 1;
          color: rgba(255,255,255,0.95);
        }

        .member-badge {
          background: rgba(255,255,255,0.2);
          padding: clamp(12px, 3vw, 20px) clamp(16px, 4vw, 28px);
          border-radius: 60px;
          backdrop-filter: blur(10px);
          text-align: center;
          border: 2px solid rgba(255,255,255,0.3);
          position: relative;
          z-index: 1;
          min-width: 180px;
        }

        .member-badge .id {
          font-size: clamp(16px, 4vw, 22px);
          font-weight: 800;
          letter-spacing: 1px;
          color: white;
        }

        .member-badge .type {
          font-size: clamp(11px, 2.5vw, 13px);
          opacity: 0.9;
          margin-top: 5px;
          text-transform: uppercase;
          letter-spacing: 1px;
          color: rgba(255,255,255,0.9);
        }

        /* Quick Stats Row */
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: clamp(8px, 2vw, 16px);
          margin-bottom: clamp(20px, 3vw, 30px);
        }

        .stat-item {
          background: white;
          padding: clamp(12px, 2.5vw, 18px) clamp(8px, 2vw, 12px);
          border-radius: clamp(16px, 3vw, 24px);
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          border: 1px solid rgba(0,0,0,0.05);
          transition: all 0.3s;
        }

        .stat-item:active {
          transform: scale(0.95);
        }

        .stat-label {
          font-size: clamp(10px, 2.2vw, 12px);
          color: #4a5568;  /* গাঢ় ধূসর – ভালো কনট্রাস্ট */
          margin-bottom: 6px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 700;
        }

        .stat-value {
          font-size: clamp(16px, 4vw, 22px);
          font-weight: 800;
          color: #1e3c72;  /* গাঢ় নেভি */
          word-break: break-word;
        }

        /* Stats Cards Grid */
        .gridCards {
          display: grid;
          grid-template-columns: 1fr;
          gap: clamp(12px, 2.5vw, 22px);
          margin-bottom: clamp(20px, 3vw, 30px);
        }

        @media (min-width: 500px) {
          .gridCards {
            grid-template-columns: repeat(2, 1fr);
          }
        }

        @media (min-width: 1024px) {
          .gridCards {
            grid-template-columns: repeat(3, 1fr);
          }
        }

        /* Card Styles */
        .card {
          border-radius: clamp(20px, 4vw, 28px);
          padding: clamp(18px, 3.5vw, 25px);
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
          border: none;
          color: white; /* base white for gradient cards */
        }

        .card:active {
          transform: scale(0.98);
        }

        /* Gradient backgrounds with high contrast text */
        .card:nth-child(1) { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); }
        .card:nth-child(2) { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); }
        .card:nth-child(3) { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); }
        .card:nth-child(4) { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); }
        .card:nth-child(5) { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); }
        .card:nth-child(6) { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); }
        .card:nth-child(7) { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #1e3c72; } /* darker text for light card */

        /* Decorative circles */
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

        /* Card content */
        .card .tag {
          display: inline-block;
          padding: 4px 12px;
          background: rgba(255,255,255,0.2);
          color: inherit;
          border-radius: 40px;
          font-size: clamp(10px, 2.2vw, 12px);
          font-weight: 700;
          margin-bottom: 12px;
          letter-spacing: 0.5px;
          backdrop-filter: blur(5px);
          position: relative;
          z-index: 1;
        }

        .card .title {
          font-size: clamp(12px, 2.5vw, 14px);
          opacity: 0.9;
          margin-bottom: 8px;
          font-weight: 500;
          position: relative;
          z-index: 1;
          color: inherit;
        }

        .card .value {
          font-size: clamp(22px, 5vw, 30px);
          font-weight: 800;
          margin-bottom: 12px;
          line-height: 1.2;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
          position: relative;
          z-index: 1;
          word-break: break-word;
          color: inherit;
        }

        .card .sub {
          font-size: clamp(10px, 2.2vw, 12px);
          opacity: 0.8;
          border-top: 1px solid rgba(255,255,255,0.3);
          padding-top: 10px;
          line-height: 1.5;
          position: relative;
          z-index: 1;
          color: inherit;
        }

        /* Dark text for light card (7th card) */
        .card:nth-child(7) .sub {
          border-top-color: rgba(0,0,0,0.1);
        }

        /* Panel Styles */
        .panel {
          background: white;
          border-radius: clamp(20px, 4vw, 28px);
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.08);
          margin-bottom: 25px;
          border: 1px solid rgba(0,0,0,0.05);
        }

        .panelHeader {
          padding: clamp(16px, 3vw, 22px);
          border-bottom: 1px solid #eee;
          display: flex;
          flex-direction: column;
          gap: 12px;
          background: linear-gradient(to right, #f8f9fa, #ffffff);
        }

        @media (min-width: 640px) {
          .panelHeader {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
          }
        }

        .panelHeader h3 {
          margin: 0;
          color: #1e3c72;
          font-size: clamp(16px, 3.5vw, 20px);
          font-weight: 800;
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .panelHeader p {
          margin: 6px 0 0;
          color: #4a5568;  /* গাঢ় ধূসর */
          font-size: clamp(12px, 2.5vw, 14px);
          line-height: 1.5;
        }

        .panelHeader .btn.primary {
          padding: clamp(12px, 2.5vw, 14px) clamp(20px, 4vw, 28px);
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: clamp(14px, 3vw, 16px);
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
          }
        }

        /* Table Styles */
        .table-responsive {
          overflow-x: auto;
          -webkit-overflow-scrolling: touch;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          min-width: 280px;
        }

        th {
          text-align: left;
          padding: 14px 16px;
          background: #f8f9fa;
          color: #1e3c72;
          font-weight: 700;
          font-size: clamp(12px, 2.5vw, 14px);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 14px 16px;
          border-bottom: 1px solid #eee;
          color: #2d3748;  /* গা৘ ধূসর */
          font-size: clamp(13px, 2.8vw, 15px);
        }

        tr:last-child td {
          border-bottom: none;
        }

        tr:active td {
          background: #f0f7ff;
        }

        /* Status Badges */
        .status {
          display: inline-block;
          padding: 5px 14px;
          border-radius: 40px;
          font-size: clamp(11px, 2.4vw, 13px);
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

        /* Company Mission */
        .companyMission {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: clamp(20px, 4vw, 30px);
          border-radius: clamp(20px, 4vw, 28px);
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
          font-size: 120px;
          opacity: 0.1;
          color: white;
          transform: rotate(20deg);
        }

        .companyMission h3 {
          font-size: clamp(20px, 5vw, 28px);
          margin-bottom: 12px;
          font-weight: 800;
          position: relative;
          z-index: 1;
          color: white;
        }

        .companyMission p {
          font-size: clamp(13px, 3vw, 16px);
          opacity: 0.95;
          line-height: 1.7;
          max-width: 600px;
          margin: 0 auto;
          position: relative;
          z-index: 1;
          color: rgba(255,255,255,0.95);
        }

        .companyMission .btn {
          padding: clamp(12px, 3vw, 16px) clamp(20px, 5vw, 35px);
          background: white;
          color: #1e3c72;
          border: none;
          border-radius: 60px;
          font-size: clamp(14px, 3vw, 16px);
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
        }

        @media (min-width: 640px) {
          .companyMission .btn {
            width: auto;
          }
        }

        /* Responsive bottom spacing */
        @media (max-width: 640px) {
          .member-dashboard {
            padding-bottom: 30px;
          }
        }

        /* Touch optimizations */
        .btn, .card, .stat-item, .nav-item {
          touch-action: manipulation;
          -webkit-tap-highlight-color: transparent;
        }

        /* High contrast text everywhere */
        p, span, div, label {
          color: inherit;
        }
      </style>
    `;

    // Welcome Section
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

    // Quick Stats
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

    // Cards
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

    // Status Panel
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

    // Mission Section
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
