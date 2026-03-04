// ============================================================
// 🏠 MEMBER DASHBOARD MODULE
// IMS ERP V5
// Shows dashboard for logged-in member
// Uses global style.css (no inline styles)
// ============================================================

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
