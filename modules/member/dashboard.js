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

    const html = `
      <div class="gridCards">
        <div class="card">
          <div class="tag">Shares</div>
          <div class="title">My Total Shares</div>
          <div class="value">${shares}</div>
          <div class="sub">
            Share Amount: ${formatMoney(monthlyShareAmount)} |
            Per Month Total: ${formatMoney(totalSharesAmount)}
          </div>
        </div>

        <div class="card">
          <div class="tag">Deposit</div>
          <div class="title">Total Approved Deposit</div>
          <div class="value">${formatMoney(totalDeposit)}</div>
          <div class="sub">All time deposit record</div>
        </div>

        
        <div class="card">
          <div class="tag">Due</div>
          <div class="title">This Month Due</div>
          <div class="value">${formatMoney(due)}</div>
          <div class="sub">
            ${
              thisMonthApproved
                ? 'Deposit approved for this month'
                : thisMonthPending
                ? 'Pending submission exists'
                : 'No deposit submitted yet'
            }
          </div>
        </div>

        <div class="card">
          <div class="tag">Profit</div>
          <div class="title">Total Profit Earned</div>
          <div class="value">${formatMoney(myProfit)}</div>
          <div class="sub">Based on profit distribution history</div>
        </div>
      


    
        <div class="card">
        <div class="tag">Active Members</div>
        <div class="title">Total Active Members</div>
            <div class="value">${activeMembers}</div>
            <div class="sub">
              Total Active Shares: ${activeShares}</div>
              <div class="sub">
              Total Active Shares Amounts Per Month: ${formatMoney(activeSharesAmount)}</div>
          </div>

          <div class="card">
        
          <div class="title">All Members Total Approved Deposit</div>
            <div class="tag">Status</div>   
            <div class="value">${formatMoney(totalApprovedDeposit)} | Bank Balance: ${formatMoney(totalBalance - (totalExpense + InvestmentStatusAmount.ACTIVE))}</div>
            <div class="sub">
            Total Investmen & Expenses Amount: ${formatMoney(InvestmentStatusAmount.ACTIVE + totalExpense)}</div>

            </div>
          </div>

          <div class="card">
          <div class="title">Investment & Sales Summary</div>
            <div class="tag">Status</div>
            <div class='title'>Total Active Investment Amount</div>   
            <div class="value">${formatMoney(InvestmentStatusAmount.ACTIVE)}</div>
            <div class="sub">
              Total Project: ${totalinvestments} | Total Investment Amount: ${formatMoney(totalInvestmentAmount)}
              <div class="sub">Completed: ${formatMoney(InvestmentStatusAmount.COMPLETED)} | Total Sales: ${formatMoney(totalInvestmentSales)} | Net Profit: ${formatMoney(netProfitAll)}</div>
            </div>
          </div>
        </div>


      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>Current Month Deposit Status</h3>
            <p>Month: ${currentMonth}</p>
          </div>
          <div class="panelTools">
            <button class="btn primary" onclick="navigateTo('member_deposit')">
              Submit Deposit
            </button>
          </div>
        </div>

        <table>
          <tr><th>Status</th><th>Details</th></tr>
          <tr>
            <td>
              ${
                thisMonthApproved
                  ? '<span class="status st-approved">APPROVED</span>'
                  : thisMonthPending
                  ? '<span class="status st-pending">PENDING</span>'
                  : '<span class="status st-rejected">NOT SUBMITTED</span>'
              }
            </td>
            <td>
              ${
                thisMonthApproved
                  ? `Approved MR ID: <b>${thisMonthApproved.mrId || '-'}</b>`
                  : thisMonthPending
                  ? 'Deposit submitted. Waiting admin approval.'
                  : 'Please submit deposit slip and transaction ID.'
              }
            </td>
          </tr>
        </table>
      </div>

      <div class="companyMission">
        <h3>Our Vision & Mission</h3>
        <p>To become the leading investment management company in the region...</p>
        <button class="btn" onclick="openModal('modalCompanyInfo')" style="margin-top:10px;">
          Read More
        </button>
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
