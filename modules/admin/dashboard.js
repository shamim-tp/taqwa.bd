import { getDatabase } from '../database/db.js';
import { setPageTitle, navigateTo } from '../auth/session.js';
import { formatMoney } from '../utils/common.js';

/**
 * Admin Dashboard - Merged version
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
  const resignedMembers = members.filter(m => m.status === "RESIGNED").length;

  const totalDeposit = deposits
    .filter(d => d.status === "APPROVED")
    .reduce((a, b) => a + Number(b.amount || 0), 0);
  const currentMonthDeposit = deposits    .filter(d => d.status === "APPROVED" && d.month === new Date().toISOString().slice(0, 7))
    .reduce((a, b) => a + Number(b.amount || 0), 0);
 
  

  
  const totalExpense = expenses.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalSales = sales.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalInvestments = investments.length;

  const pendingDeposits = deposits.filter(d => d.status === "PENDING");
  const pendingCount = pendingDeposits.length;
  
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
const pendingDepositsAmount = expectedTotalDeposits - currentMonthDeposit;
const currentMonthPendingAmount = expectedTotalDeposits - currentMonthDeposit;


// ধরলাম projects collection আছে
//onst projects = await db.getAll('projects') || [];
//const totalProjects = projects.length;

const totalInvestAmount = investments
  .reduce((a, b) => a + Number(b.amount || 0), 0);

const activeInvestments = investments.filter(i => i.status === 'ACTIVE');
const activeInvestAmount = activeInvestments.reduce((a, b) => a + Number(b.amount || 0), 0);
const totalSalesFromInvestments = sales
  .filter(s => s.investmentId)
  .reduce((a, b) => a + Number(b.amount || 0), 0);
const presentBalance = (totalBalance + totalSalesFromInvestments ) - activeInvestAmount; // Assuming investments are deducted from balance
  
const completedInvestmentsProfit = investments.filter(i => i.status === 'COMPLETED').reduce((a, b) => a + Number(b.profit || 0), 0);


  // --- HTML Template (from old version, adapted with formatMoney and navigateTo) ---
  const html = `
    <div class="gridCards">
      <div class="card">
        <div class="tag">Members</div>
        <div class="title">Total Active Members</div>
        <div class="value">${activeMembers}</div>
        <div class="sub">Total Members: ${totalMembers} | Resigned: ${resignedMembers}</div>
      </div>

      <div class="card">
        <div class="tag">Shares</div>
        <div class="title">Total Active Shares</div>
        <div class="value">${activeShares}</div>
        <div class="sub">Total Shares: ${totalShares} | Resigned Shares: ${resignedShares} | Per Shares Value ${formatMoney(10000)}</div>
      </div>

      <div class="card">
        <div class="tag">Deposits</div>
        <div class="title">Total Approved Deposit</div>
        <div class="value">${formatMoney(totalDeposit)}</div>
        <div class="sub">Current Month: ${formatMoney(currentMonthDeposit)} | Pending: ${formatMoney(currentMonthPendingAmount)}</div>
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
        <div class="sub">Total Investments: ${totalInvestments} | Complet: ${investments.filter(i => i.status === 'COMPLETED').length} | Running: ${investments.filter(i => i.status === 'ACTIVE').length}</div>
      </div>


      <div class="card">
        <div class="tag">Sales</div>
        <div class="title">Total Sales Amount</div>
        <div class="value">${formatMoney(totalSales)}</div>
        <div class="sub">Total Sales: ${formatMoney(completedInvestmentsProfit)}</div>
      </div>




      <div class="card">
        <div class="tag">Bank Balance</div>
        <div class="title">Present Balance</div>
        <div class="value">${formatMoney(presentBalance)}</div>
        <div class="sub">Total Balance - Investments</div>
      </div>


    </div>


    <div class="twoCols">
      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>Quick Summary</h3>
            <p>System financial summary and performance.</p>
          </div>
        </div>

        <table>
          <tr><th>Item</th><th>Value</th></tr>
          <tr><td>Total Investments</td><td>${totalInvestments}</td></tr>
          <tr><td>Total Sales</td><td>${formatMoney(totalSales)}</td></tr>
          <tr><td>Net Profit (All)</td><td>${formatMoney(netProfitAll)}</td></tr>
          <tr><td>Pending Deposits</td><td>${pendingCount}</td></tr>
          <tr><td>Monthly Share Amount</td><td>${formatMoney(meta.monthlyShareAmount)}</td></tr>


          <tr><td>Total Shares</td><td>${totalShares}</td></tr>
          <tr><td>Present Balance</td><td>${formatMoney(presentBalance)}</td></tr>
          <tr><td>Total Invest Amount</td><td>${formatMoney(totalInvestAmount)}</td></tr>



        </table>
      </div>

      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>Latest Pending Deposits</h3>
            <p>Recent deposits waiting for approval.</p>
          </div>
          <div class="panelTools">
            <button class="btn primary" onclick="navigateTo('admin_deposits')">Manage</button>
          </div>
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
                  <td>${d.id}</td>
                  <td>${member ? member.name : 'Unknown'}<div class="small">${d.memberId}</div></td>
                  <td>${d.month}</td>
                  <td>${formatMoney(d.amount)}</td>
                  <td><span class="status st-pending">PENDING</span></td>
                </tr>
              `;
            }).join('') || `<tr><td colspan="5" class="small">No pending deposits.</td></tr>`}
          </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;
}