import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle } from '../auth/session.js';
import { openViewerModal } from '../modals/viewer.js';

export async function renderMemberNotices() {
  const user = getCurrentUser();
  if (!user) return;
  
  const db = getDatabase();
  const member = await db.get('members', user.id);
  if (!member) return;
  
  const notices = await db.getAll('notices') || [];
  
  // Filter notices for this member
  const memberNotices = notices.filter(notice => {
    if (notice.sentTo === 'ALL') return true;
    if (notice.sentTo === 'FOUNDER' && member.memberType === 'FOUNDER') return true;
    if (notice.sentTo === 'REFERENCE' && member.memberType === 'REFERENCE') return true;
    if (notice.recipients && notice.recipients.includes(member.id)) return true;
    return false;
  });
  
  // Sort by date (newest first)
  memberNotices.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
  
  setPageTitle('Notices', 'View all system notices');
  
  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>System Notices</h3>
          <p>Important notices from management</p>
        </div>
      </div>
      ${memberNotices.length > 0 ? memberNotices.map(notice => `
        <div class="notice-item" style="margin-bottom:14px;padding:14px;border-radius:12px;border:1px solid var(--line);background:rgba(255,255,255,0.03);">
          <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:8px;">
            <h4 style="margin:0;">${notice.title}</h4>
            <span class="status ${notice.priority === 'URGENT' ? 'st-rejected' : notice.priority === 'HIGH' ? 'st-pending' : 'st-approved'}" style="font-size:11px;">
              ${notice.priority || 'NORMAL'}
            </span>
          </div>
          <p style="margin-bottom:8px;color:var(--muted);">${notice.message.substring(0, 150)}...</p>
          <div style="display:flex;justify-content:space-between;font-size:11px;color:var(--muted);">
            <span>${new Date(notice.createdAt).toLocaleDateString()}</span>
            <button class="btn view-notice-btn" data-id="${notice.id}" style="padding:4px 8px;font-size:11px;">Read More</button>
          </div>
        </div>
      `).join('') : `
        <div class="small" style="text-align:center;padding:20px;">
          No notices available
        </div>
      `}
    </div>
  `;
  
  document.getElementById('pageContent').innerHTML = html;
  
  document.querySelectorAll('.view-notice-btn').forEach(btn => {
    btn.addEventListener('click', () => viewNotice(btn.dataset.id));
  });
}

async function viewNotice(id) {
  const db = getDatabase();
  const notice = await db.get('notices', id);
  if (!notice) return;
  
  const html = `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>${notice.title}</h3>
          <p>Notice Details</p>
        </div>
      </div>
      <div class="row">
        <div>
          <label>Message</label>
          <div style="padding:12px;background:rgba(255,255,255,0.03);border-radius:12px;border:1px solid var(--line);">
            ${notice.message.replace(/\n/g, '<br>')}
          </div>
        </div>
      </div>
      <div class="row row-3">
        <div><label>Sent To</label><input value="${notice.sentTo}" disabled /></div>
        <div><label>Priority</label><input value="${notice.priority || 'NORMAL'}" disabled /></div>
        <div><label>Recipients</label><input value="${notice.recipients?.length || 0} members" disabled /></div>
      </div>
      <div class="row row-2">
        <div><label>Sent By</label><input value="${notice.sentBy || 'System'}" disabled /></div>
        <div><label>Sent Date</label><input value="${new Date(notice.createdAt).toLocaleString()}" disabled /></div>
      </div>
      ${notice.expiryDate ? `
      <div class="row">
        <div><label>Expiry Date</label><input value="${notice.expiryDate}" disabled /></div>
      </div>` : ''}
    </div>
  `;
  
  openViewerModal('Notice Details', 'View notice information', html);
}