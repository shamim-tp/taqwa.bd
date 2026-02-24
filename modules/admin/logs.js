import { getDatabase } from '../database/db.js';
import { setPageTitle } from '../auth/session.js';
import { showToast } from '../utils/common.js';

export async function renderAdminLogs() {
  setPageTitle('Activity Logs', 'View system activity and user actions');
  const db = getDatabase();
  const logs = await db.getAll('activityLogs') || [];
  const html = `
    <div class="panel">
      <div class="panelHeader"><div><h3>System Activity Logs</h3><p>All user actions and system events</p></div><div class="panelTools"><button class="btn" id="clearLogsBtn">Clear Logs</button></div></div>
      <table><thead><tr><th>Time</th><th>Action</th><th>Details</th><th>User ID</th><th>User Role</th></tr></thead>
      <tbody>${logs.map(log => `<tr>
        <td>${new Date(log.timestamp || log.at).toLocaleString()}</td>
        <td><b>${log.action}</b></td>
        <td>${log.details}</td>
        <td>${log.userId || log.byId}</td>
        <td>${log.userRole || log.byRole}</td>
      </tr>`).join('') || '<tr><td colspan="5" class="small">No activity logs found</td></tr>'}</tbody>
      </table>
    </div>
  `;
  document.getElementById('pageContent').innerHTML = html;
  document.getElementById('clearLogsBtn').addEventListener('click', clearLogs);
}

async function clearLogs() {
  if (!confirm('Are you sure you want to clear all activity logs?')) return;
  const db = getDatabase();
  // If db supports delete all for collection, else set empty array
  if (db.deleteCollection) await db.deleteCollection('activityLogs');
  else {
    // fallback: localStorage db - set to empty array
    const allLogs = await db.getAll('activityLogs');
    for (const log of allLogs) {
      await db.delete('activityLogs', log.id);
    }
  }
  showToast('Logs Cleared', 'All activity logs have been cleared');
  renderAdminLogs();
}
