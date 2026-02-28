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

    setPageTitle(
      'Member Dashboard',
      'Your deposit status, profit, shares and notices.'
    );

    // CSS Styles
    const styles = `
      <style>
        /* Dashboard Container */
        .member-dashboard {
          padding: 25px;
          background: #f8fafc;
          min-height: 100vh;
        }

        /* Welcome Section */
        .member-welcome {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 30px 35px;
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
          font-size: 28px;
          font-weight: 700;
          margin-bottom: 8px;
        }

        .welcome-subtitle {
          font-size: 16px;
          opacity: 0.95;
        }

        .member-badge {
          background: rgba(255,255,255,0.2);
          padding: 15px 25px;
          border-radius: 50px;
          backdrop-filter: blur(10px);
          text-align: center;
        }

        .member-badge .id {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 1px;
        }

        .member-badge .type {
          font-size: 13px;
          opacity: 0.9;
          margin-top: 5px;
        }

        /* Stats Cards Grid */
        .gridCards {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
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

        /* Card content */
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

        /* Dark text for light cards */
        .card:nth-child(7) .tag,
        .card:nth-child(7) .title,
        .card:nth-child(7) .value,
        .card:nth-child(7) .sub {
          color: #333;
          border-top-color: rgba(0,0,0,0.1);
        }

        .card:nth-child(7) .tag {
          background: rgba(0,0,0,0.1);
        }

        /* Panel Styles */
        .panel {
          background: white;
          border-radius: 24px;
          overflow: hidden;
          box-shadow: 0 15px 35px rgba(0,0,0,0.1);
          margin-bottom: 30px;
        }

        .panelHeader {
          padding: 25px 30px;
          border-bottom: 1px solid #eee;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 20px;
          background: linear-gradient(to right, #f8f9fa, #ffffff);
        }

        .panelHeader h3 {
          margin: 0;
          color: #1e3c72;
          font-size: 22px;
          font-weight: 700;
        }

        .panelHeader p {
          margin: 8px 0 0;
          color: #666;
          font-size: 14px;
        }

        .panelHeader .btn.primary {
          padding: 12px 28px;
          background: linear-gradient(135deg, #667eea, #764ba2);
          color: white;
          border: none;
          border-radius: 50px;
          font-size: 15px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          box-shadow: 0 10px 20px rgba(102,126,234,0.3);
        }

        .panelHeader .btn.primary:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(102,126,234,0.4);
        }

        /* Table Styles */
        table {
          width: 100%;
          border-collapse: collapse;
        }

        th {
          text-align: left;
          padding: 18px 25px;
          background: #f8f9fa;
          color: #1e3c72;
          font-weight: 600;
          font-size: 14px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        td {
          padding: 18px 25px;
          border-bottom: 1px solid #eee;
          color: #555;
          font-size: 15px;
        }

        tr:hover td {
          background: #f8f9fa;
        }

        /* Status Badges */
        .status {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 40px;
          font-size: 13px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .st-approved {
          background: linear-gradient(135deg, #d4edda, #c3e6cb);
          color: #155724;
          border: 1px solid #28a745;
        }

        .st-pending {
          background: linear-gradient(135deg, #fff3cd, #ffeeba);
          color: #856404;
          border: 1px solid #ffc107;
        }

        .st-rejected {
          background: linear-gradient(135deg, #f8d7da, #f5c6cb);
          color: #721c24;
          border: 1px solid #dc3545;
        }

        /* Company Mission Section */
        .companyMission {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 40px;
          border-radius: 24px;
          text-align: center;
          box-shadow: 0 20px 40px rgba(30,60,114,0.3);
        }

        .companyMission h3 {
          font-size: 28px;
          margin-bottom: 15px;
          font-weight: 700;
        }

        .companyMission p {
          font-size: 16px;
          opacity: 0.95;
          line-height: 1.8;
          max-width: 800px;
          margin: 0 auto;
        }

        .companyMission .btn {
          padding: 12px 35px;
          background: white;
          color: #1e3c72;
          border: none;
          border-radius: 50px;
          font-size: 16px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s;
          margin-top: 20px;
          box-shadow: 0 10px 20px rgba(0,0,0,0.2);
        }

        .companyMission .btn:hover {
          transform: translateY(-3px);
          box-shadow: 0 15px 30px rgba(0,0,0,0.3);
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .member-welcome {
            flex-direction: column;
            text-align: center;
          }
          
          .card .value {
            font-size: 32px;
          }
          
          .panelHeader {
            flex-direction: column;
            text-align: center;
          }
        }

        /* Quick Stats Row */
        .quick-stats {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 30px;
        }

        .stat-item {
          background: white;
          padding: 20px;
          border-radius: 16px;
          text-align: center;
          box-shadow: 0 10px 25px rgba(0,0,0,0.05);
          border: 1px solid #eee;
        }

        .stat-label {
          font-size: 14px;
          color: #666;
          margin-bottom: 8px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 700;
          color: #1e3c72;
        }
      </style>
    `;

    // Welcome Section
    const welcomeHTML = `
      <div class="member-welcome">
        <div>
          <div class="welcome-title">👋 Welcome back, ${member.name}!</div>
          <div class="welcome-subtitle">${new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div class="member-badge">
          <div class="id">${member.id}</div>
          <div class="type">${member.memberType || 'Member'}</div>
        </div>
      </div>
    `;

    // Quick Stats Row
    const quickStatsHTML = `
      <div class="quick-stats">
        <div class="stat-item">
          <div class="stat-label">Member Since</div>
          <div class="stat-value">${new Date(member.joinDate || Date.now()).getFullYear()}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Total Deposits</div>
          <div class="stat-value">${approvedDeposits.length}</div>
        </div>
        <div class="stat-item">
          <div class="stat-label">Shares Value</div>
          <div class="stat-value">${formatMoney(totalSharesAmount)}/mo</div>
        </div>
      </div>
    `;

    // Original Cards with enhanced styling
    const cardsHTML = `
      <div class="gridCards">
        <div class="card">
          <div class="tag">My Shares</div>
          <div class="title">Total Shares</div>
          <div class="value">${shares}</div>
          <div class="sub">
            Share Amount: ${formatMoney(monthlyShareAmount)} | 
            Monthly Total: ${formatMoney(totalSharesAmount)}
          </div>
        </div>

        <div class="card">
          <div class="tag">My Deposits</div>
          <div class="title">Total Approved</div>
          <div class="value">${formatMoney(totalDeposit)}</div>
          <div class="sub">Total Deposits: ${approvedDeposits.length} | All time record</div>
        </div>

        <div class="card">
          <div class="tag">Due Status</div>
          <div class="title">This Month Due</div>
          <div class="value">${formatMoney(due)}</div>
          <div class="sub">
            ${
              thisMonthApproved
                ? '✅ Approved for this month'
                : thisMonthPending
                ? '⏳ Pending submission'
                : '⚠️ Not submitted yet'
            }
          </div>
        </div>

        <div class="card">
          <div class="tag">My Profit</div>
          <div class="title">Total Profit</div>
          <div class="value">${formatMoney(myProfit)}</div>
          <div class="sub">Based on profit distribution</div>
        </div>

        <div class="card">
          <div class="tag">Active Members</div>
          <div class="title">Total Members</div>
          <div class="value">${activeMembers}</div>
          <div class="sub">Active Shares: ${activeShares} | Monthly: ${formatMoney(activeSharesAmount)}</div>
        </div>

        <div class="card">
          <div class="tag">Organization</div>
          <div class="title">Total Approved Deposit</div>
          <div class="value">${formatMoney(totalApprovedDeposit)}</div>
          <div class="sub">Bank Balance: ${formatMoney(totalBalance - (totalExpense + InvestmentStatusAmount.ACTIVE))}</div>
        </div>

        <div class="card">
          <div class="tag">Investments</div>
          <div class="title">Active Investment</div>
          <div class="value">${formatMoney(InvestmentStatusAmount.ACTIVE)}</div>
          <div class="sub">
            Total Projects: ${totalinvestments} | Total Invest: ${formatMoney(totalInvestmentAmount)}
          </div>
          <div class="sub" style="margin-top:8px;">
            Completed: ${formatMoney(InvestmentStatusAmount.COMPLETED)} | 
            Sales: ${formatMoney(totalInvestmentSales)} | 
            Net Profit: ${formatMoney(netProfitAll)}
          </div>
        </div>
      </div>
    `;

    // Current Month Status Panel
    const statusPanelHTML = `
      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>📅 Current Month Deposit Status</h3>
            <p>Month: ${currentMonth}</p>
          </div>
          <div class="panelTools">
            <button class="btn primary" onclick="navigateTo('member_deposit')">
              + Submit Deposit
            </button>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                ${
                  thisMonthApproved
                    ? '<span class="status st-approved">✓ APPROVED</span>'
                    : thisMonthPending
                    ? '<span class="status st-pending">⏳ PENDING</span>'
                    : '<span class="status st-rejected">⚠️ NOT SUBMITTED</span>'
                }
              </td>
              <td>
                ${
                  thisMonthApproved
                    ? `✅ Approved with MR ID: <strong style="color:#1e3c72;">${thisMonthApproved.mrId || '-'}</strong>`
                    : thisMonthPending
                    ? '📤 Deposit submitted. Waiting for admin approval.'
                    : '📝 Please submit your deposit slip and transaction ID.'
                }
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    `;

    // Company Mission Section
    const missionHTML = `
      <div class="companyMission">
        <h3>🚀 Our Vision & Mission</h3>
        <p>To become the leading investment management company in the region, providing exceptional returns and financial security to our valued members through transparent and innovative investment strategies.</p>
        <button class="btn" onclick="openModal('modalCompanyInfo')">
          Learn More About Us
        </button>
      </div>
    `;

    // Complete HTML
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

    const container = document.getElementById('pageContent');
    if (container) {
      container.innerHTML = html;
    }

  } catch (error) {
    console.error(error);
    showToast('Error', 'Failed to load dashboard');
  }
}
