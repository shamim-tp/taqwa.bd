import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import { showToast, formatDate } from '../utils/common.js';
import { openViewerModal } from '../modals/viewer.js';

export async function renderAdminNotices() {
  setPageTitle('Notices Management', 'Send notices to members');
  
  const db = await getDatabase();
  const notices = await db.getAll('notices') || []; // Use async DB

  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Send New Notice</h3>
          <p>Send notice to all members or specific members</p>
        </div>
      </div>

      <div class="row">
        <div>
          <label>Notice Title *</label>
          <input id="notice_title" placeholder="Notice title" />
        </div>
      </div>

      <div class="row">
        <div>
          <label>Notice Message *</label>
          <textarea id="notice_message" placeholder="Notice message..." rows="5"></textarea>
        </div>
      </div>

      <div class="row row-3">
        <div>
          <label>Send To</label>
          <select id="notice_to">
            <option value="ALL">All Members</option>
            <option value="FOUNDER">Founder Members Only</option>
            <option value="REFERENCE">Reference Members Only</option>
          </select>
        </div>
        <div>
          <label>Priority</label>
          <select id="notice_priority">
            <option value="NORMAL">Normal</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>
        </div>
        <div>
          <label>Expiry Date</label>
          <input id="notice_expiry" type="date" />
        </div>
      </div>

      <div class="hr"></div>
      <button class="btn success" id="sendNoticeBtn">Send Notice</button>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Notice History</h3>
          <p>Previously sent notices</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Title</th>
            <th>Sent To</th>
            <th>Priority</th>
            <th>Status</th>
            <th>Tools</th>
          </tr>
        </thead>
        <tbody>
          ${notices.length > 0 ? notices.map(notice => `
            <tr>
              <td>${formatDate(notice.createdAt)}</td>
              <td><b>${notice.title}</b><div class="small">${notice.message.substring(0, 50)}...</div></td>
              <td>${notice.sentTo}</td>
              <td><span class="status ${notice.priority === 'URGENT' ? 'st-rejected' : notice.priority === 'HIGH' ? 'st-pending' : 'st-approved'}">${notice.priority}</span></td>
              <td>${notice.expiryDate && new Date(notice.expiryDate) < new Date() ? 'Expired' : 'Active'}</td>
              <td>
                <button class="btn view-notice" data-id="${notice.id}">View</button>
              </td>
            </tr>
          `).join('') : `<tr><td colspan="6" class="small">No notices found</td></tr>`}
        </tbody>
      </table>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;
  
  document.getElementById('sendNoticeBtn').addEventListener('click', sendNotice);
  
  document.querySelectorAll('.view-notice').forEach(btn => {
    btn.addEventListener('click', () => viewNotice(btn.dataset.id));
  });
}

async function sendNotice() {
  const db = await getDatabase(); // Async
  const title = document.getElementById('notice_title').value.trim();
  const message = document.getElementById('notice_message').value.trim();
  const sentTo = document.getElementById('notice_to').value;
  const priority = document.getElementById('notice_priority').value;
  const expiryDate = document.getElementById('notice_expiry').value;
  
  if (!title || !message) { showToast('Validation Error', 'Please enter notice title and message'); return; }
  
  let recipients = [];
  const members = await db.getAll('members') || [];
  
  if (sentTo === 'ALL') recipients = members.filter(m => m.approved && m.status === 'ACTIVE');
  else if (sentTo === 'FOUNDER') recipients = members.filter(m => m.approved && m.status === 'ACTIVE' && m.memberType === 'FOUNDER');
  else if (sentTo === 'REFERENCE') recipients = members.filter(m => m.approved && m.status === 'ACTIVE' && m.memberType === 'REFERENCE');
  
  const notice = {
    id: 'NOTICE-' + Date.now(),
    title, message, sentTo, priority, expiryDate,
    recipients: recipients.map(r => r.id),
    sentBy: getCurrentUser()?.id || 'ADMIN',
    createdAt: new Date().toISOString()
  };
  
  await db.save('notices', notice, notice.id);
  await logActivity('SEND_NOTICE', `Sent notice to ${recipients.length} members: ${title}`);
  
  showToast('Notice Sent', `Notice sent to ${recipients.length} members`);
  
  // Refresh UI
  await renderAdminNotices();
}

async function viewNotice(id) {
  const db = await getDatabase();
  const notice = await db.get('notices', id);
  if (!notice) return;

  const html = `
    <div class="panel">
      <h3>${notice.title}</h3>
      <p style="padding:10px; background:#f4f4f4; margin:10px 0; border-radius:5px; color:#333;">${notice.message}</p>
      <div class="row row-2">
         <div><label>Sent To</label><input value="${notice.sentTo}" disabled/></div>
         <div><label>Priority</label><input value="${notice.priority}" disabled/></div>
      </div>
    </div>
  `;
  openViewerModal('Notice Details', '', html);
}