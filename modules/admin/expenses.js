import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import {
  showToast,
  formatMoney,
  generateId,
  fileToBase64
} from '../utils/common.js';
import { openViewerModal } from '../modals/viewer.js';

/**
 * Admin Expenses Management – সম্পূর্ণ মার্জড, কোনো ডুপ্লিকেট নেই
 */
export async function renderAdminExpenses() {
  setPageTitle('Expenses Management', 'Record and manage all expenses');

  const db = getDatabase();
  const expenses = await db.getAll('expenses') || [];
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount || 0), 0);
  const nextVoucherId = generateId('VCH', expenses);

  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Add New Expense</h3>
          <p>Record expense with voucher details</p>
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Expense Title *</label>
          <input id="exp_title" placeholder="Expense title" />
        </div>
        <div>
          <label>Voucher ID (Auto)</label>
          <input id="exp_voucher" value="${nextVoucherId}" disabled />
        </div>
        <div>
          <label>Amount *</label>
          <input id="exp_amount" type="number" placeholder="Enter amount" />
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Category</label>
          <select id="exp_category">
            <option value="OFFICE">Office Expense</option>
            <option value="SALARY">Salary</option>
            <option value="UTILITY">Utility Bill</option>
            <option value="MAINTENANCE">Maintenance</option>
            <option value="TRAVEL">Travel</option>
            <option value="MARKETING">Marketing</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
        <div>
          <label>Date</label>
          <input id="exp_date" type="date" value="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div>
          <label>Payment Method</label>
          <select id="exp_method">
            <option value="CASH">Cash</option>
            <option value="BANK">Bank Transfer</option>
            <option value="BKASH">Bkash</option>
            <option value="ROCKET">Rocket</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div>
          <label>Description</label>
          <textarea id="exp_desc" placeholder="Expense description..."></textarea>
        </div>
      </div>

      <div class="row row-2">
        <div>
          <label>Approved By</label>
          <input id="exp_approved" placeholder="Approver name" />
        </div>
        <div>
          <label>Receipt/Bill Upload</label>
          <input id="exp_receipt" type="file" accept="image/*" />
        </div>
      </div>

      <div class="hr"></div>
      <button class="btn success" id="addExpenseBtn">Add Expense</button>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>All Expenses</h3>
          <p>Total Expenses: ${formatMoney(totalExpense)}</p>
        </div>
        <div class="panelTools">
          <input id="expenseSearch" placeholder="Search expense..." />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Voucher ID</th>
            <th>Title</th>
            <th>Amount</th>
            <th>Category</th>
            <th>Date</th>
            <th>Payment Method</th>
            <th>Tools</th>
          </tr>
        </thead>
        <tbody>
          ${expenses.map(exp => `
            <tr>
              <td>${exp.voucherId || exp.id || 'N/A'}</td>
              <td><b>${exp.title}</b><div class="small">${exp.description || ''}</div></td>
              <td>${formatMoney(exp.amount)}</td>
              <td>${exp.category}</td>
              <td>${exp.date || 'N/A'}</td>
              <td>${exp.paymentMethod}</td>
              <td>
                <button class="btn view-expense" data-id="${exp.voucherId || exp.id}">View</button>
              </td>
            </tr>
          `).join('') || '<tr><td colspan="7" class="small">No expenses found</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;

  document.getElementById('addExpenseBtn').addEventListener('click', addExpense);
  document.getElementById('expenseSearch').addEventListener('input', filterExpenses);
  document.querySelectorAll('.view-expense').forEach(btn => {
    btn.addEventListener('click', () => viewExpense(btn.dataset.id));
  });
}

async function addExpense() {
  const db = getDatabase();
  const title = document.getElementById('exp_title').value.trim();
  const amount = Number(document.getElementById('exp_amount').value || 0);
  const category = document.getElementById('exp_category').value;
  const date = document.getElementById('exp_date').value;
  const method = document.getElementById('exp_method').value;
  const description = document.getElementById('exp_desc').value.trim();
  const approvedBy = document.getElementById('exp_approved').value.trim();

  if (!title || amount <= 0) {
    showToast('Validation Error', 'Please enter expense title and valid amount');
    return;
  }

  const expenses = await db.getAll('expenses') || [];
  const voucherId = generateId('VCH', expenses);
  const receiptFile = document.getElementById('exp_receipt').files[0];
  const receipt = receiptFile ? await fileToBase64(receiptFile) : '';

  const expenseData = {
    id: 'EXP-' + Date.now(),
    voucherId,
    title,
    amount,
    category,
    date,
    paymentMethod: method,
    description,
    approvedBy,
    receipt,
    createdAt: new Date().toISOString()
  };

  await db.save('expenses', expenseData, expenseData.id);
  await logActivity('ADD_EXPENSE', `Added expense: ${title} (${voucherId})`);
  showToast('Expense Added', `${title} recorded successfully`);
  renderAdminExpenses();
}

async function viewExpense(identifier) {
  const db = getDatabase();
  let expense = await db.get('expenses', identifier);
  if (!expense) {
    const results = await db.query('expenses', [
      { field: 'voucherId', operator: '===', value: identifier }
    ]);
    expense = results[0];
  }
  if (!expense) {
    showToast('Error', 'Expense not found');
    return;
  }

  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>${expense.title} (${expense.voucherId || expense.id})</h3>
          <p>Expense Details</p>
        </div>
      </div>
      <div class="row row-3">
        <div><label>Amount</label><input value="${formatMoney(expense.amount)}" disabled /></div>
        <div><label>Category</label><input value="${expense.category}" disabled /></div>
        <div><label>Payment Method</label><input value="${expense.paymentMethod}" disabled /></div>
      </div>
      <div class="row row-2">
        <div><label>Date</label><input value="${expense.date || 'N/A'}" disabled /></div>
        <div><label>Approved By</label><input value="${expense.approvedBy || 'N/A'}" disabled /></div>
      </div>
      <div class="row">
        <div><label>Description</label><textarea disabled>${expense.description || ''}</textarea></div>
      </div>
      ${expense.receipt ? `
        <div class="row">
          <div><label>Receipt/Bill</label><img src="${expense.receipt}" style="width:100%;max-width:300px;border-radius:12px;border:1px solid var(--line);" /></div>
        </div>
      ` : ''}
      <div class="row">
        <div><label>Created At</label><input value="${new Date(expense.createdAt).toLocaleString()}" disabled /></div>
      </div>
    </div>
  `;
  openViewerModal('Expense Details', 'View expense information', html);
}

function filterExpenses() {
  const search = document.getElementById('expenseSearch')?.value.toLowerCase() || '';
  const rows = document.querySelectorAll('table tbody tr');
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? '' : 'none';
  });
}