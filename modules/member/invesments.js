import { getDatabase } from '../database/db.js';
import { setPageTitle } from '../auth/session.js';
import { formatMoney } from '../utils/common.js';

export async function renderMemberInvestments() {
  setPageTitle('My Investments', 'View all company investments');
  
  const db = getDatabase();
  const investments = await db.getAll('investments') || [];
  
  // Sort by start date (newest first)
  investments.sort((a, b) => new Date(b.startDate || 0) - new Date(a.startDate || 0));
  
  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Company Investments</h3>
          <p>All investment projects of the company</p>
        </div>
      </div>
      <div class="gridCards">
        ${investments.length > 0 ? investments.map(inv => `
          <div class="card">
            <div class="tag">${inv.status}</div>
            <div class="title">${inv.name}</div>
            <div class="value">${formatMoney(inv.amount)}</div>
            <div class="sub">
              <div>Start: ${inv.startDate || 'N/A'}</div>
              <div>Expected Return: ${inv.expectedReturn || 0}%</div>
              <div>Responsible: ${inv.responsible || 'N/A'}</div>
            </div>
          </div>
        `).join('') : `
          <div class="card">
            <div class="title">No Investments</div>
            <div class="value">0</div>
            <div class="sub">No investment projects available</div>
          </div>
        `}
      </div>
      <div class="hr"></div>
      <table>
        <thead>
          <tr>
            <th>Investment Name</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Start Date</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${investments.map(inv => `
            <tr>
              <td><b>${inv.name}</b></td>
              <td>${formatMoney(inv.amount)}</td>
              <td><span class="status ${inv.status === 'ACTIVE' ? 'st-approved' : inv.status === 'COMPLETED' ? 'st-success' : 'st-pending'}">${inv.status}</span></td>
              <td>${inv.startDate || 'N/A'}</td>
              <td>${inv.description || 'No description'}</td>
            </tr>
          `).join('') || '<tr><td colspan="5" class="small">No investments found</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
  
  document.getElementById('pageContent').innerHTML = html;
}