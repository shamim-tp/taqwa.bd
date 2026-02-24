import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import {
  showToast,
  formatMoney,
  generateId,
  formatDate
} from '../utils/common.js';
import { openViewerModal } from '../modals/viewer.js';

export async function renderAdminInvestments() {
  setPageTitle('Investments Management', 'Create and manage investment projects');
  
  // FIX: Added 'await' here
  const db = await getDatabase();
  const investments = await db.getAll('investments') || [];

  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Add New Investment</h3>
          <p>Create investment project with details</p>
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Investment Name *</label>
          <input id="inv_name" placeholder="Investment Name" />
        </div>
        <div>
          <label>Investment ID (Auto)</label>
          <input id="inv_id" value="${generateId('INV', investments)}" disabled />
        </div>
        <div>
          <label>Amount *</label>
          <input id="inv_amount" type="number" placeholder="Enter amount" />
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Start Date</label>
          <input id="inv_start" type="date" value="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div>
          <label>End Date</label>
          <input id="inv_end" type="date" />
        </div>
        <div>
          <label>Status</label>
          <select id="inv_status">
            <option value="PLANNING">Planning</option>
            <option value="ACTIVE">Active</option>
            <option value="COMPLETED">Completed</option>
            <option value="HOLD">Hold</option>
          </select>
        </div>
      </div>

      <div class="row">
        <div>
          <label>Description</label>
          <textarea id="inv_desc" placeholder="Investment description..."></textarea>
        </div>
      </div>

      <div class="row row-2">
        <div>
          <label>Responsible Person</label>
          <input id="inv_responsible" placeholder="Person name" />
        </div>
        <div>
          <label>Expected Return (%)</label>
          <input id="inv_return" type="number" placeholder="Expected return percentage" />
        </div>
      </div>

      <div class="hr"></div>
      <button class="btn success" id="addInvestmentBtn">Add Investment</button>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>All Investments</h3>
          <p>Total Investments: ${investments.length}</p>
        </div>
        <div class="panelTools">
          <input id="investmentSearch" placeholder="Search investment..." />
        </div>
      </div>

      <div id="investmentsTableContainer">
        <table>
            <thead>
            <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Amount</th>
                <th>Start Date</th>
                <th>Status</th>
                <th>Expected Return</th>
                <th>Tools</th>
            </tr>
            </thead>
            <tbody>
            ${investments.map(inv => `
                <tr>
                <td>${inv.id}</td>
                <td><b>${inv.name}</b><div class="small">${inv.description || ''}</div></td>
                <td>${formatMoney(inv.amount)}</td>
                <td>${inv.startDate || 'N/A'}</td>
                <td>
                    <span class="status 
                    ${inv.status === 'ACTIVE' ? 'st-approved' : 
                        inv.status === 'COMPLETED' ? 'st-success' : 
                        inv.status === 'PLANNING' ? 'st-pending' : 'st-rejected'}">
                    ${inv.status}
                    </span>
                </td>
                <td>${inv.expectedReturn || 0}%</td>
                <td>
                    <button class="btn view-investment" data-id="${inv.id}">View</button>
                    <button class="btn warn edit-investment" data-id="${inv.id}">Edit</button>
                </td>
                </tr>
            `).join('') || '<tr><td colspan="7" class="small">No investments found</td></tr>'}
            </tbody>
        </table>
      </div>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;

  // Attach event listeners
  document.getElementById('addInvestmentBtn').addEventListener('click', addInvestment);
  document.getElementById('investmentSearch').addEventListener('input', filterInvestments);

  document.querySelectorAll('.view-investment').forEach(btn => {
    btn.addEventListener('click', () => viewInvestment(btn.dataset.id));
  });
  document.querySelectorAll('.edit-investment').forEach(btn => {
    btn.addEventListener('click', () => editInvestment(btn.dataset.id));
  });
}

// ------------------------------------------------------------
// Add new investment
// ------------------------------------------------------------
async function addInvestment() {
  const db = await getDatabase(); // FIX: Added await

  const name = document.getElementById('inv_name').value.trim();
  const amount = Number(document.getElementById('inv_amount').value || 0);
  const startDate = document.getElementById('inv_start').value;
  const endDate = document.getElementById('inv_end').value;
  const status = document.getElementById('inv_status').value;
  const description = document.getElementById('inv_desc').value.trim();
  const responsible = document.getElementById('inv_responsible').value.trim();
  const expectedReturn = Number(document.getElementById('inv_return').value || 0);

  if (!name || amount <= 0) {
    showToast('Validation Error', 'Please enter investment name and valid amount');
    return;
  }

  const investments = await db.getAll('investments') || [];
  const id = generateId('INV', investments);

  const investmentData = {
    id,
    name,
    amount,
    startDate,
    endDate,
    status,
    description,
    responsible,
    expectedReturn,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  await db.save('investments', investmentData, id);
  await logActivity('ADD_INVESTMENT', `Added investment: ${name} (${id})`);
  showToast('Investment Added', `${name} added successfully`);

  await renderAdminInvestments(); // FIX: await render
}

// ------------------------------------------------------------
// View investment details
// ------------------------------------------------------------
async function viewInvestment(id) {
  const db = await getDatabase(); // FIX: await
  const inv = await db.get('investments', id);
  if (!inv) {
    showToast('Error', 'Investment not found');
    return;
  }

  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>${inv.name} (${inv.id})</h3>
          <p>Investment Details</p>
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Amount</label>
          <input value="${formatMoney(inv.amount)}" disabled />
        </div>
        <div>
          <label>Status</label>
          <input value="${inv.status}" disabled />
        </div>
        <div>
          <label>Expected Return</label>
          <input value="${inv.expectedReturn || 0}%" disabled />
        </div>
      </div>

      <div class="row row-2">
        <div>
          <label>Start Date</label>
          <input value="${inv.startDate || 'N/A'}" disabled />
        </div>
        <div>
          <label>End Date</label>
          <input value="${inv.endDate || 'N/A'}" disabled />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Description</label>
          <textarea disabled>${inv.description || ''}</textarea>
        </div>
      </div>

      <div class="row">
        <div>
          <label>Responsible Person</label>
          <input value="${inv.responsible || 'N/A'}" disabled />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Created At</label>
          <input value="${formatDate(inv.createdAt)}" disabled />
        </div>
        <div>
          <label>Last Updated</label>
          <input value="${formatDate(inv.updatedAt)}" disabled />
        </div>
      </div>
    </div>
  `;

  openViewerModal('Investment Details', 'View investment information', html);
}

// ------------------------------------------------------------
// Edit investment
// ------------------------------------------------------------
async function editInvestment(id) {
  const db = await getDatabase(); // FIX: await
  const inv = await db.get('investments', id);
  if (!inv) return;

  const editHtml = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Edit Investment: ${inv.id}</h3>
        </div>
      </div>
      <div class="row row-3">
        <div><label>Name</label><input id="edit_inv_name" value="${inv.name}" /></div>
        <div><label>Amount</label><input id="edit_inv_amount" type="number" value="${inv.amount}" /></div>
        <div>
          <label>Status</label>
          <select id="edit_inv_status">
            <option value="PLANNING" ${inv.status === 'PLANNING' ? 'selected' : ''}>Planning</option>
            <option value="ACTIVE" ${inv.status === 'ACTIVE' ? 'selected' : ''}>Active</option>
            <option value="COMPLETED" ${inv.status === 'COMPLETED' ? 'selected' : ''}>Completed</option>
            <option value="HOLD" ${inv.status === 'HOLD' ? 'selected' : ''}>Hold</option>
          </select>
        </div>
      </div>
      <div class="row row-2">
         <div><label>Start</label><input id="edit_inv_start" type="date" value="${inv.startDate}" /></div>
         <div><label>End</label><input id="edit_inv_end" type="date" value="${inv.endDate}" /></div>
      </div>
      <div class="row"><label>Desc</label><textarea id="edit_inv_desc">${inv.description}</textarea></div>
      <div class="hr"></div>
      <button class="btn success" id="updateInvestmentBtn">Update</button>
    </div>
  `;

  openViewerModal('Edit Investment', 'Update details', editHtml);

  setTimeout(() => {
    document.getElementById('updateInvestmentBtn')?.addEventListener('click', async () => {
      const updateData = {
        name: document.getElementById('edit_inv_name').value,
        amount: document.getElementById('edit_inv_amount').value,
        status: document.getElementById('edit_inv_status').value,
        startDate: document.getElementById('edit_inv_start').value,
        endDate: document.getElementById('edit_inv_end').value,
        description: document.getElementById('edit_inv_desc').value,
        updatedAt: new Date().toISOString()
      };
      await db.update('investments', id, updateData);
      showToast('Updated', 'Investment updated');
      document.querySelector('.modalWrap').style.display = 'none';
      await renderAdminInvestments();
    });
  }, 100);
}

function filterInvestments() {
  const search = document.getElementById('investmentSearch')?.value.toLowerCase() || '';
  const rows = document.querySelectorAll('table tbody tr');
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(search) ? '' : 'none';
  });
}