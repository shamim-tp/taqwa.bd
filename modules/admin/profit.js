import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import { showToast, formatMoney } from '../utils/common.js';

/**
 * Admin Profit Distribution
 * Modern async – complete HTML, no legacy code
 */
export async function renderAdminProfit() {
  setPageTitle('Profit Distribution', 'Distribute profits to members based on shares');

  const db = getDatabase();
  const sales = await db.getAll('sales') || [];
  const expenses = await db.getAll('expenses') || [];
  const members = await db.getAll('members') || [];
  const profitDistributions = await db.getAll('profitDistributions') || [];

  const totalSales = sales.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalExpenses = expenses.reduce((a, b) => a + Number(b.amount || 0), 0);
  const netProfit = totalSales - totalExpenses;
  const activeMembers = members.filter(m => m.approved && m.status === 'ACTIVE');
  const totalShares = activeMembers.reduce((a, b) => a + Number(b.shares || 0), 0);
  const profitPerShare = totalShares > 0 ? netProfit / totalShares : 0;

  // Full HTML from original version
  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Profit Distribution Summary</h3>
          <p>Current profit status and distribution calculation</p>
        </div>
      </div>

      <div class="gridCards">
        <div class="card">
          <div class="tag">Sales</div>
          <div class="title">Total Sales</div>
          <div class="value">${formatMoney(totalSales)}</div>
        </div>
        <div class="card">
          <div class="tag">Expenses</div>
          <div class="title">Total Expenses</div>
          <div class="value">${formatMoney(totalExpenses)}</div>
        </div>
        <div class="card">
          <div class="tag">Profit</div>
          <div class="title">Net Profit</div>
          <div class="value">${formatMoney(netProfit)}</div>
        </div>
        <div class="card">
          <div class="tag">Shares</div>
          <div class="title">Total Shares</div>
          <div class="value">${totalShares}</div>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row row-3">
        <div>
          <label>Profit Per Share</label>
          <input value="${formatMoney(profitPerShare)}" disabled />
        </div>
        <div>
          <label>Distribution Date</label>
          <input id="profit_date" type="date" value="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div>
          <label>Distribution Period</label>
          <select id="profit_period">
            <option value="MONTHLY">Monthly</option>
            <option value="QUARTERLY">Quarterly</option>
            <option value="HALF_YEARLY">Half Yearly</option>
            <option value="YEARLY">Yearly</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div>
          <label>Notes</label>
          <textarea id="profit_notes" placeholder="Distribution notes..."></textarea>
        </div>
      </div>

      <div class="hr"></div>
      <button class="btn success" id="distributeProfitBtn">Distribute Profit</button>
      <div class="hint">This will distribute profit to all active members based on their shares</div>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Profit Distribution History</h3>
          <p>Previous profit distributions</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Period</th>
            <th>Total Profit</th>
            <th>Profit Per Share</th>
            <th>Total Shares</th>
            <th>Notes</th>
          </tr>
        </thead>
        <tbody>
          ${profitDistributions.map(p => `
            <tr>
              <td>${p.date || ''}</td>
              <td>${p.period || ''}</td>
              <td>${formatMoney(p.totalProfit)}</td>
              <td>${formatMoney(p.profitPerShare)}</td>
              <td>${p.totalShares}</td>
              <td>${p.notes || 'N/A'}</td>
            </tr>
          `).join('') || '<tr><td colspan="6" class="small">No profit distribution history</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;
  document.getElementById('distributeProfitBtn').addEventListener('click', distributeProfit);
}

async function distributeProfit() {
  const db = getDatabase();
  const sales = await db.getAll('sales') || [];
  const expenses = await db.getAll('expenses') || [];
  const netProfit = sales.reduce((a, b) => a + Number(b.amount || 0), 0) -
                    expenses.reduce((a, b) => a + Number(b.amount || 0), 0);

  if (netProfit <= 0) {
    showToast('No Profit', 'There is no profit to distribute');
    return;
  }

  const members = await db.getAll('members') || [];
  const activeMembers = members.filter(m => m.approved && m.status === 'ACTIVE');
  const totalShares = activeMembers.reduce((a, b) => a + Number(b.shares || 0), 0);

  if (totalShares === 0) {
    showToast('No Shares', 'No active members with shares found');
    return;
  }

  const profitPerShare = netProfit / totalShares;
  const date = document.getElementById('profit_date').value;
  const period = document.getElementById('profit_period').value;
  const notes = document.getElementById('profit_notes').value.trim();

  const distribution = {
    id: 'PROFIT-' + Date.now(),
    date,
    period,
    totalProfit: netProfit,
    profitPerShare,
    totalShares,
    notes,
    distributedBy: getCurrentUser().id,
    distributedAt: new Date().toISOString()
  };

  await db.save('profitDistributions', distribution, distribution.id);
  await logActivity('DISTRIBUTE_PROFIT', `Distributed profit: ${formatMoney(netProfit)} to ${activeMembers.length} members`);
  showToast('Profit Distributed', `Profit distributed to ${activeMembers.length} members`);
  renderAdminProfit();
}