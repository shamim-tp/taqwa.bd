import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import { showToast, formatDate } from '../utils/common.js';

/**
 * Admin Accounts Management
 * Merged version – modern async, full HTML, all features preserved.
 */
export async function renderAdminAdmins() {
  setPageTitle('Admin Accounts', 'Manage admin users and permissions');

  const db = getDatabase();
  const admins = await db.getAll('admins') || [];
  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id;

  // Build the complete HTML (adapted from original)
  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Add New Admin</h3>
          <p>Create new admin account with specific role</p>
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Admin ID (Auto)</label>
          <input id="admin_id" value="ADM-${String(admins.length + 1).padStart(3, '0')}" disabled />
        </div>
        <div>
          <label>Full Name *</label>
          <input id="admin_name" placeholder="Admin full name" />
        </div>
        <div>
          <label>Role *</label>
          <select id="admin_role">
            <option value="SUPER_ADMIN">Super Admin</option>
            <option value="FINANCE_ADMIN">Finance Admin</option>
            <option value="ACCOUNTS_ADMIN">Accounts Admin</option>
            <option value="VIEW_ONLY">View Only</option>
          </select>
        </div>
      </div>

      <div class="row row-2">
        <div>
          <label>Password *</label>
          <input id="admin_pass" type="password" placeholder="Create password" />
        </div>
        <div>
          <label>Confirm Password *</label>
          <input id="admin_pass2" type="password" placeholder="Confirm password" />
        </div>
      </div>

      <div class="row row-2">
        <div>
          <label>Phone Number</label>
          <input id="admin_phone" placeholder="Phone number" />
        </div>
        <div>
          <label>Email</label>
          <input id="admin_email" placeholder="Email address" />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Status</label>
          <select id="admin_status">
            <option value="ACTIVE">Active</option>
            <option value="INACTIVE">Inactive</option>
          </select>
        </div>
      </div>

      <div class="hr"></div>
      <button class="btn success" id="addAdminBtn">Add Admin</button>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>All Admin Accounts</h3>
          <p>Manage admin accounts and permissions</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Admin ID</th>
            <th>Name</th>
            <th>Role</th>
            <th>Status</th>
            <th>Created At</th>
            <th>Tools</th>
          </tr>
        </thead>
        <tbody>
          ${admins.length > 0 ? admins.map(admin => `
            <tr>
              <td>${admin.id}</td>
              <td><b>${admin.name}</b></td>
              <td>${admin.role}</td>
              <td><span class="status ${admin.active ? 'st-approved' : 'st-rejected'}">${admin.active ? 'ACTIVE' : 'INACTIVE'}</span></td>
              <td>${formatDate(admin.createdAt)}</td>
              <td>
                ${admin.id !== currentUserId ? `
                  <button class="btn reset-admin-pass" data-id="${admin.id}">Reset Pass</button>
                  <button class="btn warn toggle-admin-status" data-id="${admin.id}">${admin.active ? 'Deactivate' : 'Activate'}</button>
                ` : '<span class="small">Current User</span>'}
              </td>
            </tr>
          `).join('') : `<tr><td colspan="6" class="small">No admin accounts found</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;

  // Attach event listeners
  document.getElementById('addAdminBtn').addEventListener('click', addAdmin);
  document.querySelectorAll('.reset-admin-pass').forEach(btn => {
    btn.addEventListener('click', () => resetAdminPassword(btn.dataset.id));
  });
  document.querySelectorAll('.toggle-admin-status').forEach(btn => {
    btn.addEventListener('click', () => toggleAdminStatus(btn.dataset.id));
  });
}

// ------------------------------------------------------------
// Helper functions (async, using modular DB API)
// ------------------------------------------------------------

async function addAdmin() {
  const db = getDatabase();
  const name = document.getElementById('admin_name').value.trim();
  const role = document.getElementById('admin_role').value;
  const pass = document.getElementById('admin_pass').value;
  const pass2 = document.getElementById('admin_pass2').value;
  const phone = document.getElementById('admin_phone').value.trim();
  const email = document.getElementById('admin_email').value.trim();
  const status = document.getElementById('admin_status').value;

  if (!name || !pass) {
    showToast('Validation Error', 'Please enter admin name and password');
    return;
  }
  if (pass !== pass2) {
    showToast('Password Error', 'Passwords do not match');
    return;
  }

  const admins = await db.getAll('admins') || [];
  const id = 'ADM-' + String(admins.length + 1).padStart(3, '0');

  const newAdmin = {
    id,
    name,
    role,
    pass,
    phone,
    email,
    active: status === 'ACTIVE',
    createdAt: new Date().toISOString()
  };

  await db.save('admins', newAdmin, id);
  await logActivity('ADD_ADMIN', `Added admin: ${name} (${id})`);
  showToast('Admin Added', `${name} added as ${role}`);
  renderAdminAdmins(); // refresh the page
}

async function resetAdminPassword(adminId) {
  const db = getDatabase();
  const admin = await db.get('admins', adminId);
  if (!admin) return;

  const newPass = prompt(`Enter new password for ${admin.name}:`);
  if (!newPass) return;

  admin.pass = newPass;
  await db.update('admins', adminId, { pass: newPass, updatedAt: new Date().toISOString() });
  await logActivity('RESET_ADMIN_PASSWORD', `Password reset for admin: ${adminId}`);
  showToast('Password Reset', `Password updated for ${admin.name}`);
  renderAdminAdmins();
}

async function toggleAdminStatus(adminId) {
  const db = getDatabase();
  const admin = await db.get('admins', adminId);
  if (!admin) return;

  const newStatus = !admin.active;
  await db.update('admins', adminId, { active: newStatus, updatedAt: new Date().toISOString() });
  await logActivity('TOGGLE_ADMIN_STATUS', `Admin ${adminId} ${newStatus ? 'activated' : 'deactivated'}`);
  showToast('Status Updated', `${admin.name} is now ${newStatus ? 'ACTIVE' : 'INACTIVE'}`);
  renderAdminAdmins();
}