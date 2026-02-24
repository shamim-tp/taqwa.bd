import { getDatabase } from '../database/db.js';
import { setPageTitle } from '../auth/session.js';
import { showToast, formatMoney } from '../utils/common.js';
import { openViewerModal } from '../modals/viewer.js';

/**
 * Admin Reports
 * Modern async – complete HTML, full report generation
 */
export async function renderAdminReports() {
  setPageTitle('Reports', 'Generate and view system reports');

  const db = getDatabase();
  const members = await db.getAll('members') || [];
  const deposits = await db.getAll('deposits') || [];
  const expenses = await db.getAll('expenses') || [];
  const sales = await db.getAll('sales') || [];
  const investments = await db.getAll('investments') || [];

  const totalMembers = members.filter(m => m.approved).length;
  const activeMembers = members.filter(m => m.status === 'ACTIVE' && m.approved).length;
  const totalDeposit = deposits.filter(d => d.status === 'APPROVED').reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalExpense = expenses.reduce((a, b) => a + Number(b.amount || 0), 0);
  const totalSales = sales.reduce((a, b) => a + Number(b.amount || 0), 0);
  const netProfit = totalSales - totalExpense;
  const pendingDeposits = deposits.filter(d => d.status === 'PENDING').length;
  const pendingMembers = members.filter(m => !m.approved).length;

  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Financial Reports</h3>
          <p>Generate comprehensive financial reports</p>
        </div>
        <div class="panelTools">
          <button class="btn primary" id="generateReportBtn">Generate Report</button>
        </div>
      </div>

      <div class="gridCards">
        <div class="card">
          <div class="title">Members Report</div>
          <div class="value">${totalMembers}</div>
          <div class="sub">Active: ${activeMembers} | Pending: ${pendingMembers}</div>
        </div>
        <div class="card">
          <div class="title">Deposits Report</div>
          <div class="value">${formatMoney(totalDeposit)}</div>
          <div class="sub">Pending: ${pendingDeposits} deposits</div>
        </div>
        <div class="card">
          <div class="title">Expenses Report</div>
          <div class="value">${formatMoney(totalExpense)}</div>
          <div class="sub">${expenses.length} records</div>
        </div>
        <div class="card">
          <div class="title">Profit Report</div>
          <div class="value">${formatMoney(netProfit)}</div>
          <div class="sub">Net profit</div>
        </div>
      </div>

      <div class="hr"></div>

      <div class="row row-2">
        <div>
          <label>Report Type</label>
          <select id="report_type">
            <option value="FINANCIAL">Financial Summary</option>
            <option value="MEMBER">Member Report</option>
            <option value="DEPOSIT">Deposit Report</option>
            <option value="EXPENSE">Expense Report</option>
            <option value="INVESTMENT">Investment Report</option>
          </select>
        </div>
        <div>
          <label>Date Range</label>
          <select id="report_range">
            <option value="ALL">All Time</option>
            <option value="MONTH">This Month</option>
            <option value="QUARTER">This Quarter</option>
            <option value="YEAR">This Year</option>
          </select>
        </div>
      </div>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Quick Statistics</h3>
          <p>System performance metrics</p>
        </div>
      </div>
      <table>
        <thead>
          <tr><th>Metric</th><th>Value</th><th>Details</th></tr>
        </thead>
        <tbody>
          <tr><td>Total Members</td><td>${totalMembers}</td><td>Active: ${activeMembers}, Pending: ${pendingMembers}</td></tr>
          <tr><td>Total Deposits</td><td>${formatMoney(totalDeposit)}</td><td>Pending: ${pendingDeposits} deposits</td></tr>
          <tr><td>Total Expenses</td><td>${formatMoney(totalExpense)}</td><td>${expenses.length} records</td></tr>
          <tr><td>Total Investments</td><td>${investments.length}</td><td>Active: ${investments.filter(i => i.status === 'ACTIVE').length}</td></tr>
          <tr><td>System Balance</td><td>${formatMoney(totalDeposit - totalExpense)}</td><td>Deposits - Expenses</td></tr>
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;
  document.getElementById('generateReportBtn').addEventListener('click', generateReport);
}

async function generateReport() {
  const db = getDatabase();
  const reportType = document.getElementById('report_type').value;
  const reportRange = document.getElementById('report_range').value;

  const members = await db.getAll('members') || [];
  const deposits = await db.getAll('deposits') || [];
  const expenses = await db.getAll('expenses') || [];
  const sales = await db.getAll('sales') || [];
  const investments = await db.getAll('investments') || [];

  let reportData = {};
  let reportTitle = '';

  switch (reportType) {
    case 'FINANCIAL':
      reportTitle = 'Financial Summary Report';
      reportData = {
        totalMembers: members.filter(m => m.approved).length,
        totalDeposits: deposits.filter(d => d.status === 'APPROVED').reduce((a, b) => a + Number(b.amount || 0), 0),
        totalExpenses: expenses.reduce((a, b) => a + Number(b.amount || 0), 0),
        totalSales: sales.reduce((a, b) => a + Number(b.amount || 0), 0),
        netProfit: sales.reduce((a, b) => a + Number(b.amount || 0), 0) - expenses.reduce((a, b) => a + Number(b.amount || 0), 0),
        systemBalance: deposits.filter(d => d.status === 'APPROVED').reduce((a, b) => a + Number(b.amount || 0), 0) - expenses.reduce((a, b) => a + Number(b.amount || 0), 0)
      };
      break;
    case 'MEMBER':
      reportTitle = 'Member Report';
      reportData = {
        totalMembers: members.length,
        activeMembers: members.filter(m => m.status === 'ACTIVE' && m.approved).length,
        pendingMembers: members.filter(m => !m.approved).length,
        founderMembers: members.filter(m => m.memberType === 'FOUNDER').length,
        referenceMembers: members.filter(m => m.memberType === 'REFERENCE').length,
        resignedMembers: members.filter(m => m.status === 'RESIGNED').length
      };
      break;
    case 'DEPOSIT':
      reportTitle = 'Deposit Report';
      const approvedDeposits = deposits.filter(d => d.status === 'APPROVED');
      const pendingDeposits = deposits.filter(d => d.status === 'PENDING');
      reportData = {
        totalApproved: approvedDeposits.reduce((a, b) => a + Number(b.amount || 0), 0),
        totalPending: pendingDeposits.reduce((a, b) => a + Number(b.amount || 0), 0),
        countApproved: approvedDeposits.length,
        countPending: pendingDeposits.length,
        byMonth: approvedDeposits.reduce((acc, d) => {
          acc[d.month] = (acc[d.month] || 0) + Number(d.amount || 0);
          return acc;
        }, {})
      };
      break;
    case 'EXPENSE':
      reportTitle = 'Expense Report';
      reportData = {
        totalExpenses: expenses.reduce((a, b) => a + Number(b.amount || 0), 0),
        count: expenses.length,
        byCategory: expenses.reduce((acc, e) => {
          acc[e.category] = (acc[e.category] || 0) + Number(e.amount || 0);
          return acc;
        }, {}),
        byMonth: expenses.reduce((acc, e) => {
          const month = e.date ? e.date.substring(0, 7) : 'N/A';
          acc[month] = (acc[month] || 0) + Number(e.amount || 0);
          return acc;
        }, {})
      };
      break;
    case 'INVESTMENT':
      reportTitle = 'Investment Report';
      reportData = {
        totalInvestments: investments.length,
        totalAmount: investments.reduce((a, b) => a + Number(b.amount || 0), 0),
        activeCount: investments.filter(i => i.status === 'ACTIVE').length,
        completedCount: investments.filter(i => i.status === 'COMPLETED').length,
        planningCount: investments.filter(i => i.status === 'PLANNING').length,
        byStatus: investments.reduce((acc, i) => {
          acc[i.status] = (acc[i.status] || 0) + 1;
          return acc;
        }, {})
      };
      break;
  }

  const reportHTML = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>${reportTitle}</h3>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Date Range: ${reportRange}</p>
        </div>
      </div>
      <pre style="background:rgba(255,255,255,0.03);padding:14px;border-radius:12px;border:1px solid var(--line);overflow:auto;">
${JSON.stringify(reportData, null, 2)}
      </pre>
      <div class="hr"></div>
      <button class="btn primary" id="downloadReportBtn">Download Report</button>
    </div>
  `;

  openViewerModal(reportTitle, 'Generated Report', reportHTML);
  document.getElementById('downloadReportBtn')?.addEventListener('click', () => downloadReport(reportType, reportData));
}

function downloadReport(type, data) {
  const content = JSON.stringify(data, null, 2);
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `IMS_Report_${type}_${new Date().toISOString().split('T')[0]}.json`;
  a.click();
  URL.revokeObjectURL(url);
  showToast('Report Downloaded', 'Report file downloaded successfully');
}