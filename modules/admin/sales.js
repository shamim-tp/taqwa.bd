import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import {
  showToast,
  formatMoney,
  formatDate
} from '../utils/common.js';
import { openViewerModal } from '../modals/viewer.js';

/**
 * Admin Sales Management – Merged Modern Async Version
 * Features:
 * - Add Sale linked to an Investment
 * - View all sales with investment details
 * - Search, View Sale Details
 */
export async function renderAdminSales() {
  setPageTitle('Sales Management', 'Record and manage sales transactions');

  const db = getDatabase();
  const sales = await db.getAll('sales') || [];
  const investments = await db.getAll('investments') || [];

  const totalSales = sales.reduce((sum, s) => sum + Number(s.amount || 0), 0);

  // Generate investment dropdown options
  const investmentOptions = investments.map(inv =>
    `<option value="${inv.id}">${inv.id} – ${inv.name} (${formatMoney(inv.amount)})</option>`
  ).join('') || '<option value="">No investments available</option>';

  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Add New Sale</h3>
          <p>Record sales transaction linked to an investment</p>
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Investment *</label>
          <select id="sale_investment_id" required>
            <option value="">-- Select Investment --</option>
            ${investmentOptions}
          </select>
        </div>
        <div>
          <label>Sale Title *</label>
          <input id="sale_title" placeholder="Sale title" />
        </div>
        <div>
          <label>Sale ID (Auto)</label>
          <input id="sale_id" value="SALE-${new Date().getFullYear()}-${String(sales.length + 1).padStart(6, '0')}" disabled />
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Amount *</label>
          <input id="sale_amount" type="number" placeholder="Enter amount" />
        </div>
        <div>
          <label>Customer Name</label>
          <input id="sale_customer" placeholder="Customer name" />
        </div>
        <div>
          <label>Date</label>
          <input id="sale_date" type="date" value="${new Date().toISOString().split('T')[0]}" />
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Payment Method</label>
          <select id="sale_method">
            <option value="CASH">Cash</option>
            <option value="BANK">Bank Transfer</option>
            <option value="BKASH">Bkash</option>
            <option value="ROCKET">Rocket</option>
          </select>
        </div>
        <div></div>
        <div></div>
      </div>

      <div class="row">
        <div>
          <label>Description</label>
          <textarea id="sale_desc" placeholder="Sale description..."></textarea>
        </div>
      </div>

      <div class="hr"></div>
      <button class="btn success" id="addSaleBtn">Add Sale</button>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>All Sales</h3>
          <p>Total Sales: ${formatMoney(totalSales)}</p>
        </div>
        <div class="panelTools">
          <input id="saleSearch" placeholder="Search sales..." />
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Sale ID</th>
            <th>Investment</th>
            <th>Title</th>
            <th>Customer</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Payment Method</th>
            <th>Tools</th>
          </tr>
        </thead>
        <tbody>
          ${sales.map(sale => {
            const inv = investments.find(i => i.id === sale.investmentId);
            return `
              <tr>
                <td>${sale.id}</td>
                <td>
                  <b>${inv ? inv.id : 'N/A'}</b>
                  <div class="small">${inv ? inv.name : ''}</div>
                </td>
                <td><b>${sale.title}</b><div class="small">${sale.description || ''}</div></td>
                <td>${sale.customer || 'N/A'}</td>
                <td>${formatMoney(sale.amount)}</td>
                <td>${sale.date || 'N/A'}</td>
                <td>${sale.paymentMethod}</td>
                <td>
                  <button class="btn view-sale" data-id="${sale.id}">View</button>
                </td>
              </tr>
            `;
          }).join('') || '<tr><td colspan="8" class="small">No sales found</td></tr>'}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;

  // Attach event listeners
  document.getElementById('addSaleBtn').addEventListener('click', addSale);
  document.getElementById('saleSearch').addEventListener('input', filterSales);
  document.querySelectorAll('.view-sale').forEach(btn =>
    btn.addEventListener('click', () => viewSale(btn.dataset.id))
  );
}

// ------------------------------------------------------------
// Add new sale (with investment link)
// ------------------------------------------------------------
async function addSale() {
  const db = getDatabase();

  const investmentId = document.getElementById('sale_investment_id').value;
  const title = document.getElementById('sale_title').value.trim();
  const amount = Number(document.getElementById('sale_amount').value || 0);
  const customer = document.getElementById('sale_customer').value.trim();
  const date = document.getElementById('sale_date').value;
  const method = document.getElementById('sale_method').value;
  const description = document.getElementById('sale_desc').value.trim();

  if (!investmentId) {
    showToast('Validation Error', 'Please select an investment');
    return;
  }
  if (!title || amount <= 0) {
    showToast('Validation Error', 'Please enter sale title and valid amount');
    return;
  }

  const id = 'SALE-' + Date.now();

  const saleData = {
    id,
    investmentId,
    title,
    amount,
    customer,
    date,
    paymentMethod: method,
    description,
    createdAt: new Date().toISOString()
  };

  await db.save('sales', saleData, id);
  await logActivity('ADD_SALE', `Added sale: ${title} (${id}) linked to investment ${investmentId}`);
  showToast('Sale Added', `${title} recorded successfully`);

  renderAdminSales();
}

// ------------------------------------------------------------
// View sale details (includes investment information)
// ------------------------------------------------------------
async function viewSale(saleId) {
  const db = getDatabase();
  const sale = await db.get('sales', saleId);
  if (!sale) {
    showToast('Error', 'Sale not found');
    return;
  }

  let investmentHtml = '';
  if (sale.investmentId) {
    const inv = await db.get('investments', sale.investmentId);
    investmentHtml = inv
      ? `<div><strong>Investment:</strong> ${inv.id} – ${inv.name} (${formatMoney(inv.amount)})</div>`
      : `<div><strong>Investment ID:</strong> ${sale.investmentId} (not found)</div>`;
  } else {
    investmentHtml = '<div><strong>Investment:</strong> Not linked</div>';
  }

  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>${sale.title} (${sale.id})</h3>
          <p>Sale Details</p>
        </div>
      </div>

      ${investmentHtml}

      <div class="row row-3">
        <div>
          <label>Amount</label>
          <input value="${formatMoney(sale.amount)}" disabled />
        </div>
        <div>
          <label>Customer</label>
          <input value="${sale.customer || 'N/A'}" disabled />
        </div>
        <div>
          <label>Payment Method</label>
          <input value="${sale.paymentMethod}" disabled />
        </div>
      </div>

      <div class="row row-2">
        <div>
          <label>Date</label>
          <input value="${sale.date || 'N/A'}" disabled />
        </div>
        <div>
          <label>Created At</label>
          <input value="${formatDate(sale.createdAt)}" disabled />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Description</label>
          <textarea disabled>${sale.description || ''}</textarea>
        </div>
      </div>
    </div>
  `;

  openViewerModal('Sale Details', 'View sale information', html);
}

// ------------------------------------------------------------
// Filter sales table (live search)
// ------------------------------------------------------------
function filterSales() {
  const search = document.getElementById('saleSearch')?.value.toLowerCase() || '';
  const rows = document.querySelectorAll('table tbody tr');

  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    row.style.display = text.includes(search) ? '' : 'none';
  });
}