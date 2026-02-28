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

    // Mobile-First CSS Styles
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
          padding: 12px;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* Welcome Section - Mobile First */
        .member-welcome {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 20px;
          border-radius: 20px;
          margin-bottom: 20px;
          display: flex;
          flex-direction: column;
          gap: 15px;
        }

        @media (min-width: 640px) {
          .member-welcome {
            flex-direction: row;
            justify-content: space-between;
            align-items: center;
            padding: 25px 30px;
          }
        }

        .welcome-title {
          font-size: 20px;
          font-weight: 700;
          margin-bottom: 5px;
        }

        @media (min-width: 640px) {
          .welcome-title {
            font-size: 24px;
          }
        }

        .welcome-subtitle {
          font-size: 12px;
          opacity: 0.9;
        }

        .member-badge {
          background: rgba(255,255,255,0.2);
          padding: 12px 20px;
          border-radius: 40px;
          backdrop-filter: blur(10px);
          text-align: center;
        }

        .member-badge .id {
          font-size: 16px;
          font-weight: 700;
        }

        .member-badge .type {
          font-size: 11px;
          opacity: 0.9;
          margin-top: 3px;
        }

        /* Quick Stats Row - Mobile First */
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 8px;
          margin-bottom: 20px;
        }

        @media (min-width: 640px) {
          .quick-stats {
            gap: 15px;
            margin-bottom: 25px;
          }
        }

        .stat-item {
          background: white;
          padding: 12px 8px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
          border: 1px solid #eee;
        }

        .stat-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.3px;
        }

        .stat-value {
          font-size: 16px;
          font-weight: 700;
          color: #1e3c72;
          word-break: break-word;
        }

        @media (min-width: 640px) {
          .stat-value {
            font-size: 18px;
          }
        }

        /* Stats Cards Grid - Mobile First */
        .gridCards {
          display: grid;
          grid-template-columns: 1fr;
          gap: 12px;
          margin-bottom: 20px;
        }

        @media (min-width: 480px) {
          .gridCards {
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
          }
        }

        @media (min-width: 1024px) {
          .gridCards {
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
        }

        /* Card Styles - Mobile Optimized */
        .card {
          background: white;
          border-radius: 18px;
          padding: 16px;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          transition: all 0.3s ease;
          position: relative;
          overflow: hidden;
        }

        .card:active {
          transform: scale(0.98);
        }

        /* Gradient backgrounds */
        .card:nth-child(1) { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
        .card:nth-child(2) { background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; }
        .card:nth-child(3) { background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; }
        .card:nth-child(4) { background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%); color: white; }
        .card:nth-child(5) { background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; }
        .card:nth-child(6) { background: linear-gradient(135deg, #30cfd0 0%, #330867 100%); color: white; }
        .card:nth-child(7) { background: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%); color: #333; }

        /* Card Content */
        .card .tag {
          display: inline-block;
          padding: 4px 10px;
          background: rgba(255,255,255,0.2);
          color: inherit;
          border-radius: 30px;
          font-size: 10px;
          font-weight: 600;
          margin-bottom: 10px;
        }

        .card .title {
          font-size: 12px;
          opacity: 0.9;
          margin-bottom: 6px;
        }

        .card .value {
          font-size: 22px;
          font-weight: 800;
          margin-bottom: 8px;
          line-height: 1.2;
          word-break: break-word;
        }

        @media (min-width: 640px) {
          .card .value {
            font-size: 24px;
          }
        }

        .card .sub {
          font-size: 10px;
          opacity: 0.8;
          border-top: 1px solid rgba(255,255,255,0.2);
          padding-top: 8px;
          line-height: 1.4;
        }

        /* Panel Styles */
        .panel {
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 8px 20px rgba(0,0,0,0.06);
          margin-bottom: 20px;
        }

        .panelHeader {
          padding: 16px;
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
            padding: 18px 20px;
          }
        }

        .panelHeader h3 {
          margin: 0;
          color: #1e3c72;
          font-size: 16px;
          font-weight: 700;
        }

        .panelHeader p {
          margin: 5px 0 0;
          color: #666;
          font-size: 12px;
        }

        .panelHeader .btn.primary {
          padding: 10px 20px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          width: 100%;
          text-align: center;
        }

        @media (min-width: 640px) {
          .panelHeader .btn.primary {
            width: auto;
            padding: 10px 24px;
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
        }

        th {
          text-align: left;
          padding: 12px 16px;
          background: #f8f9fa;
          color: #1e3c72;
          font-weight: 600;
          font-size: 12px;
        }

        td {
          padding: 12px 16px;
          border-bottom: 1px solid #eee;
          color: #555;
          font-size: 13px;
        }

        /* Status Badges */
        .status {
          display: inline-block;
          padding: 4px 10px;
          border-radius: 30px;
          font-size: 11px;
          font-weight: 600;
        }

        .st-approved { background: #d4edda; color: #155724; }
        .st-pending { background: #fff3cd; color: #856404; }
        .st-rejected { background: #f8d7da; color: #721c24; }

        /* Company Mission */
        .companyMission {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 25px 20px;
          border-radius: 20px;
          text-align: center;
        }

        .companyMission h3 {
          font-size: 20px;
          margin-bottom: 10px;
          font-weight: 700;
        }

        .companyMission p {
          font-size: 13px;
          opacity: 0.95;
          line-height: 1.6;
        }

        .companyMission .btn {
          padding: 10px 25px;
          background: white;
          color: #1e3c72;
          border: none;
          border-radius: 40px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          margin-top: 15px;
          width: 100%;
        }

        @media (min-width: 640px) {
          .companyMission .btn {
            width: auto;
          }
        }
      </style>
    `;

    // Welcome Section
    const welcomeHTML = `
      <div class="member-welcome">
        <div>
          <div class="welcome-title">👋 Welcome, ${member.name}!</div>
          <div class="welcome-subtitle">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
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
        <div class="stat-item"><div class="stat-label">Joined</div><div class="stat-value">${new Date(member.joinDate || Date.now()).getFullYear()}</div></div>
        <div class="stat-item"><div class="stat-label">Deposits</div><div class="stat-value">${approvedDeposits.length}</div></div>
        <div class="stat-item"><div class="stat-label">Shares</div><div class="stat-value">${formatMoney(totalSharesAmount)}/mo</div></div>
      </div>
    `;

    // Cards
    const cardsHTML = `
      <div class="gridCards">
        <div class="card"><div class="tag">My Shares</div><div class="title">Total Shares</div><div class="value">${shares}</div><div class="sub">Per Share: ${formatMoney(monthlyShareAmount)}</div></div>
        <div class="card"><div class="tag">My Deposits</div><div class="title">Total Approved</div><div class="value">${formatMoney(totalDeposit)}</div><div class="sub">${approvedDeposits.length} deposits</div></div>
        <div class="card"><div class="tag">Due Status</div><div class="title">This Month</div><div class="value">${formatMoney(due)}</div><div class="sub">${thisMonthApproved ? '✅ Approved' : thisMonthPending ? '⏳ Pending' : '⚠️ Not submitted'}</div></div>
        <div class="card"><div class="tag">My Profit</div><div class="title">Total Profit</div><div class="value">${formatMoney(myProfit)}</div><div class="sub">From investments</div></div>
        <div class="card"><div class="tag">Organization</div><div class="title">Total Deposit</div><div class="value">${formatMoney(totalApprovedDeposit)}</div><div class="sub">Bank Balance: ${formatMoney(totalBalance - (totalExpense + InvestmentStatusAmount.ACTIVE))}</div></div>
        <div class="card"><div class="tag">Investments</div><div class="title">Active Investment</div><div class="value">${formatMoney(InvestmentStatusAmount.ACTIVE)}</div><div class="sub">${totalinvestments} Projects</div></div>
        <div class="card"><div class="tag">Sales</div><div class="title">Total Sales</div><div class="value">${formatMoney(totalInvestmentSales)}</div><div class="sub">Net Profit: ${formatMoney(netProfitAll)}</div></div>
      </div>
    `;

    // Status Panel
    const statusPanelHTML = `
      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>📅 Current Month</h3>
            <p>${currentMonth}</p>
          </div>
          <button class="btn primary" onclick="navigateTo('member_deposit')">+ Submit</button>
        </div>
        <div class="table-responsive">
          <table>
            <tr>
              <td>Status</td>
              <td>
                ${thisMonthApproved ? '<span class="status st-approved">✓ APPROVED</span>' : 
                  thisMonthPending ? '<span class="status st-pending">⏳ PENDING</span>' : 
                  '<span class="status st-rejected">⚠️ NOT SUBMITTED</span>'}
              </td>
            </tr>
            <tr>
              <td>Details</td>
              <td>${thisMonthApproved ? `MR: ${thisMonthApproved.mrId || '-'}` : 
                  thisMonthPending ? 'Waiting approval' : 
                  'Please submit deposit'}</td>
            </tr>
          </table>
        </div>
      </div>
    `;

    // Mission Section
    const missionHTML = `
      <div class="companyMission">
        <h3>🚀 Our Vision</h3>
        <p>Leading investment management company providing exceptional returns to our members.</p>
        <button class="btn" onclick="openModal('modalCompanyInfo')">Learn More</button>
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
