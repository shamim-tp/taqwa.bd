import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle } from '../auth/session.js';
import { formatMoney } from '../utils/common.js';

export async function renderMemberProfit() {
  const user = getCurrentUser();
  if (!user) return;
  
  const db = getDatabase();
  const member = await db.get('members', user.id);
  if (!member) return;
  
  const profitDistributions = await db.getAll('profitDistributions') || [];
  const meta = await db.get('meta', 'system') || { monthlyShareAmount: 10000 };
  
  // Sort by date (newest first)
  profitDistributions.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
  
  let totalProfit = 0;
  profitDistributions.forEach(p => {
    totalProfit += (Number(p.profitPerShare || 0) * Number(member.shares || 1));
  });
  
  setPageTitle('My Profit & Shares', 'View your profit earnings and share details');
  
  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>My Profit Summary</h3>
          <p>Your total profit earnings based on shares</p>
        </div>
      </div>
      <div class="gridCards">
        <div class="card">
          <div class="tag">Shares</div>
          <div class="title">My Shares</div>
          <div class="value">${member.shares || 1}</div>
          <div class="sub">Share value: ${formatMoney(meta.monthlyShareAmount)}</div>
        </div>
        <div class="card">
          <div class="tag">Profit</div>
          <div class="title">Total Profit Earned</div>
          <div class="value">${formatMoney(totalProfit)}</div>
          <div class="sub">All time profit</div>
        </div>
        <div class="card">
          <div class="tag">Value</div>
          <div class="title">Share Value</div>
          <div class="value">${formatMoney((member.shares || 1) * meta.monthlyShareAmount)}</div>
          <div class="sub">Current share value</div>
        </div>
      </div>
    </div>
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Profit Distribution History</h3>
          <p>Your profit distribution records</p>
        </div>
      </div>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Period</th>
            <th>Profit Per Share</th>
            <th>My Shares</th>
            <th>My Profit</th>
          </tr>
        </thead>
        <tbody>
          ${profitDistributions.map(p => {
            const myProfit = Number(p.profitPerShare || 0) * Number(member.shares || 1);
            return `
              <tr>
                <td>${p.date || 'N/A'}</td>
                <td>${p.period || 'N/A'}</td>
                <td>${formatMoney(p.profitPerShare || 0)}</td>
                <td>${member.shares || 1}</td>
                <td><b>${formatMoney(myProfit)}</b></td>
              </tr>
            `;
          }).join('') || '<tr><td colspan="5" class="small">No profit distribution records</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('pageContent').innerHTML = html;
}
