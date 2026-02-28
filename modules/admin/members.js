import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import {
  showToast,
  formatDate,
  generateId,
  fileToBase64,
  formatMoney,
  downloadBase64Image
} from '../utils/common.js';

import { openViewerModal } from '../modals/viewer.js';
import { previewMemberBioData, downloadMemberBioData } from '../modals/member-bio.js';

// ============================================================
// 📱 নোটিফিকেশন ফাংশন
// ============================================================

/**
 * WhatsApp নোটিফিকেশন পাঠান
 */
async function sendWhatsAppNotification(phone, message) {
  try {
    // এখানে আপনার প্রকৃত WhatsApp API কল করবেন
    console.log(`📱 WhatsApp to ${phone}:`, message);
    
    // ডেমো লগ
    await logActivity('WHATSAPP_SENT', `WhatsApp sent to ${phone}: ${message.substring(0, 50)}...`);
    
    showToast('WhatsApp Sent', `Message sent to ${phone}`);
    return true;
  } catch (error) {
    console.error('WhatsApp error:', error);
    showToast('WhatsApp Error', 'Message send failed', 'error');
    return false;
  }
}

/**
 * ইমেল নোটিফিকেশন পাঠান
 */
async function sendEmailNotification(email, subject, message) {
  try {
    // এখানে আপনার প্রকৃত Email API কল করবেন
    console.log(`📧 Email to ${email}:`, { subject, message });
    
    // ডেমো লগ
    await logActivity('EMAIL_SENT', `Email sent to ${email}: ${subject}`);
    
    showToast('Email Sent', `Email sent to ${email}`);
    return true;
  } catch (error) {
    console.error('Email error:', error);
    showToast('Email Error', 'Email send failed', 'error');
    return false;
  }
}

/**
 * মেম্বারকে লগইন তথ্য পাঠান (WhatsApp + Email)
 */
async function sendLoginInfoToMember(member) {
  if (!member) return;
  
  const loginUrl = window.location.origin + window.location.pathname;
  
  // WhatsApp মেসেজ
  const whatsappMsg = 
`🏦 *IMS Investment Ltd.*
👋 Dear ${member.name},

✅ Your membership information:
🔑 Member ID: ${member.id}
🔐 Password: ${member.pass || '123456'}
🌐 Login: ${loginUrl}

📱 Please login and complete your profile.`;

  // ইমেল মেসেজ  
  const emailMsg = `
    <h2>IMS Investment Ltd. - Membership Information</h2>
    <p>Dear ${member.name},</p>
    <p>Your membership has been created successfully.</p>
    <table style="border-collapse: collapse; margin: 20px 0;">
      <tr><td><strong>Member ID:</strong></td><td>${member.id}</td></tr>
      <tr><td><strong>Password:</strong></td><td>${member.pass || '123456'}</td></tr>
      <tr><td><strong>Member Type:</strong></td><td>${member.memberType}</td></tr>
      <tr><td><strong>Status:</strong></td><td>${member.status}</td></tr>
    </table>
    <p><strong>Login URL:</strong> <a href="${loginUrl}">${loginUrl}</a></p>
    <p>Please login and complete your profile.</p>
    <br>
    <p>Thanks,<br>IMS Investment Ltd.</p>
  `;

  // উভয় চ্যানেলে পাঠান
  await Promise.allSettled([
    sendWhatsAppNotification(member.phone, whatsappMsg),
    sendEmailNotification(member.email, 'IMS Investment Ltd. - Membership Information', emailMsg)
  ]);
}

console.log('members module loaded – FINAL FIXED VERSION');

/* --------------------------------------------------------------------------
   MAIN RENDER – full admin members page
-------------------------------------------------------------------------- */
export async function renderAdminMembers() {
  try {
    setPageTitle('Member Management', 'Create, Update, Approve Member with all details.');

    const db = getDatabase();
    const members = await db.getAll('members') || [];

    const html = `
      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>Add New Member</h3>
            <p>Create full member profile with all required information.</p>
          </div>
        </div>
        <form id="addMemberForm">
          <div class="row row-3">
            <div>
              <label>Member Type</label>
              <select id="m_type">
                <option value="FOUNDER">Founder Member (FM)</option>
                <option value="REFERENCE">Reference Member (RM)</option>
              </select>
            </div>
            <div>
              <label>Member ID (Auto)</label>
              <input id="m_id" placeholder="Member ID" required />
            </div>
            <div>
              <label>Full Name *</label>
              <input id="m_name" placeholder="Member Full Name" required />
            </div>
          </div>
          <div class="row row-3">
            <div>
              <label>Father's Name</label>
              <input id="m_father" placeholder="Father's Name" />
            </div>
            <div>
              <label>Mother's Name</label>
              <input id="m_mother" placeholder="Mother's Name" />
            </div>
            <div>
              <label>Date of Birth</label>
              <input id="m_dob" type="date" />
            </div>
          </div>
          <div class="row row-3">
            <div>
              <label>Phone Number</label>
              <div style="display:flex;gap:8px;">
                <select id="m_country_code" style="width:100px;">
                  <option value="+880">+880 (BD)</option>
                </select>
                <input id="m_phone" placeholder="17XXXXXXXX" style="flex:1;" />
              </div>
            </div>
            <div>
              <label>Email</label>
              <input id="m_email" placeholder="member@gmail.com" />
            </div>
            <div>
              <label>Shares</label>
              <input id="m_shares" type="number" value="1" />
            </div>
          </div>
          <div class="row row-2">
            <div>
              <label>Address</label>
              <input id="m_address" placeholder="Full Address" />
            </div>
            <div>
              <label>Join Date</label>
              <input id="m_join" type="date" value="${new Date().toISOString().split('T')[0]}" />
            </div>
          </div>
          <div class="row row-3">
            <div>
              <label>NID Number</label>
              <input id="m_nid" placeholder="NID No" />
            </div>
            <div>
              <label>Nominee Name</label>
              <input id="m_nom_name" placeholder="Nominee Name" />
            </div>
            <div>
              <label>Nominee NID</label>
              <input id="m_nom_nid" placeholder="Nominee NID" />
            </div>
          </div>
          <div class="row row-3">
            <div>
              <label>Nominee Relation</label>
              <select id="m_nom_rel">
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Husband">Husband</option>
                <option value="Wife">Wife</option>
                <option value="Brother">Brother</option>
                <option value="Sister">Sister</option>
                <option value="Son">Son</option>
                <option value="Daughter">Daughter</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label>Nominee Phone</label>
              <input id="m_nom_phone" placeholder="Nominee Phone" />
            </div>
            <div>
              <label>Status</label>
              <select id="m_status">
                <option value="PENDING">PENDING</option>
                <option value="ACTIVE">ACTIVE</option>
                <option value="DEACTIVE">DEACTIVE</option>
                <option value="RESIGNED">RESIGNED</option>
              </select>
            </div>
          </div>
          <div class="row row-2">
            <div>
              <label>Password *</label>
              <input id="m_pass" type="password" placeholder="Create password" required />
            </div>
            <div>
              <label>Confirm Password *</label>
              <input id="m_pass2" type="password" placeholder="Confirm password" required />
            </div>
          </div>
          <div class="row row-4">
            <div>
              <label>Member Photo</label>
              <input id="m_photo" type="file" accept="image/*" />
            </div>
            <div>
              <label>NID Front Photo</label>
              <input id="m_nid_front" type="file" accept="image/*" />
            </div>
            <div>
              <label>NID Back Photo</label>
              <input id="m_nid_back" type="file" accept="image/*" />
            </div>
            <div>
              <label>Nominee Photo</label>
              <input id="m_nom_photo" type="file" accept="image/*" />
            </div>
          </div>
          <div class="row row-2">
            <div>
              <label>Nominee NID Front</label>
              <input id="m_nom_nid_front" type="file" accept="image/*" />
            </div>
            <div>
              <label>Nominee NID Back</label>
              <input id="m_nom_nid_back" type="file" accept="image/*" />
            </div>
          </div>
          <div class="hr"></div>
          <button type="submit" class="btn success">Save Member</button>
          <div class="hint">
            ✔ Member will be saved with PENDING status. Admin must approve after verification.<br/>
            ✔ Member ID auto-generated based on member type (FM-001 or RM-001).
          </div>
        </form>
      </div>

      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>All Members</h3>
            <p>Search, view, approve, update members.</p>
          </div>
          <div class="panelTools">
            <input id="memberSearch" placeholder="Search member by name/id/phone..." />
          </div>
        </div>
        <div id="membersTable">${renderMembersTable(members)}</div>
      </div>
    `;

    document.getElementById('pageContent').innerHTML = html;

    const typeSelect = document.getElementById('m_type');
    if (typeSelect) typeSelect.addEventListener('change', updateMemberIdPreview);
    await updateMemberIdPreview();

    const form = document.getElementById('addMemberForm');
    if (form) form.addEventListener('submit', adminAddMember);

    const search = document.getElementById('memberSearch');
    if (search) search.addEventListener('input', filterMembers);

    attachMemberButtons();
  } catch (error) {
    console.error('renderAdminMembers error:', error);
    showToast('Page Error', 'মেম্বার পেজ লোড করতে সমস্যা হয়েছে: ' + error.message);
    document.getElementById('pageContent').innerHTML = `<div class="panel"><h3>Error Loading Page</h3><p>${error.message}</p></div>`;
  }
}

/* --------------------------------------------------------------------------
   RENDER MEMBERS TABLE (static HTML)
-------------------------------------------------------------------------- */
function renderMembersTable(members) {
  if (!members || members.length == 0) {
    return '<p class="small">No members found.</p>';
  }
  return `
    <table>
      <thead>
        <tr>
          <th>Member ID</th>
          <th>Name</th>
          <th>Type</th>
          <th>Phone</th>
          <th>Status</th>
          <th>Approved</th>
          <th style="min-width: 250px;">Tools</th>
        </tr>
      </thead>
      <tbody>
        ${members.map(m => `
          <tr>
            <td><b>${m.id}</b><div class="small">${m.memberType || 'N/A'}</div></td>
            <td><b>${m.name}</b><div class="small">${m.fatherName || ''}</div></td>
            <td>${m.memberType || 'N/A'}</td>
            <td>${m.phone}</td>
            <td>
              <span class="status ${m.status == 'ACTIVE' ? 'st-approved' : m.status == 'PENDING' ? 'st-pending' : 'st-rejected'}">
                ${m.status}
              </span>
            </td>
            <td>${m.approved ? '<span class="status st-approved">YES</span>' : '<span class="status st-pending">NO</span>'}</td>
            <td>
              <button class="btn view-member" data-id="${m.id}">View</button>
              <button class="btn info bio-data-btn" data-id="${m.id}">📄 Bio</button>
              ${!m.approved ? `
                <button class="btn success approve-member" data-id="${m.id}">Approve</button>
                <button class="btn warn update-member" data-id="${m.id}">Update</button>
              ` : ''}
              ${m.approved ? `
                <button class="btn warn reset-pass" data-id="${m.id}">Reset Pass</button>
                <button class="btn warn resetProfileBtn" data-id="${m.id}">Reset Profile</button>
              ` : ''}
              <button class="btn primary send-login-info" data-id="${m.id}" title="Send Login Info via WhatsApp & Email">
                📨 Send Info
              </button>
            </td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

/* --------------------------------------------------------------------------
   ATTACH DYNAMIC BUTTON LISTENERS
-------------------------------------------------------------------------- */
function attachMemberButtons() {
  document.querySelectorAll('.view-member').forEach(btn =>
    btn.addEventListener('click', () => viewMember(btn.dataset.id))
  );
  
  document.querySelectorAll('.approve-member').forEach(btn =>
    btn.addEventListener('click', () => approveMember(btn.dataset.id))
  );
  
  document.querySelectorAll('.update-member').forEach(btn =>
    btn.addEventListener('click', () => openMemberForUpdate(btn.dataset.id))
  );
  
  document.querySelectorAll('.reset-pass').forEach(btn =>
    btn.addEventListener('click', () => resetMemberPassword(btn.dataset.id))
  );
  
  document.querySelectorAll('.resetProfileBtn').forEach(btn => {
    btn.addEventListener('click', async function () {
      const memberId = this.dataset.id;
      await resetProfilePermission(memberId);
    });
  });
  
  document.querySelectorAll('.bio-data-btn').forEach(btn => {
    btn.addEventListener('click', async function () {
      const memberId = this.dataset.id;
      await previewMemberBioData(memberId);
    });
  });
  
  // নতুন: লগইন তথ্য পাঠানোর বাটন
  document.querySelectorAll('.send-login-info').forEach(btn => {
    btn.addEventListener('click', async function () {
      const memberId = this.dataset.id;
      await sendLoginInfoManually(memberId);
    });
  });
}

/* --------------------------------------------------------------------------
   MEMBER ID PREVIEW (auto‑generate next ID)
-------------------------------------------------------------------------- */
async function updateMemberIdPreview() {
  try {
    const typeSelect = document.getElementById('m_type');
    if (!typeSelect) return;
    const type = typeSelect.value;
    const prefix = type == 'FOUNDER' ? 'FM' : 'RM';

    const db = getDatabase();
    const members = await db.getAll('members') || [];

    const max = members
      .filter(m => m.id && m.id.startsWith(prefix))
      .reduce((max, m) => {
        const num = parseInt(m.id.split('-')[1], 10) || 0;
        return num > max ? num : max;
      }, 0);

    const id = `${prefix}-${String(max + 1).padStart(3, '0')}`;
    const m_id = document.getElementById('m_id');
    if (m_id) m_id.value = id;
  } catch (error) {
    console.error('updateMemberIdPreview error:', error);
  }
}

/* --------------------------------------------------------------------------
   RESET PROFILE PERMISSION
-------------------------------------------------------------------------- */
async function resetProfilePermission(memberId) {
  try {
    const db = getDatabase();
    const m = await db.get('members', memberId);
    if (!m) return;

    if (!m.profileUpdatedOnce) {
      showToast('Info', 'This member has not used profile update yet.');
      return;
    }

    const confirmReset = confirm('Are you sure you want to allow profile update again?');
    if (!confirmReset) return;

    m.profileUpdatedOnce = false;
    m.updatedAt = new Date().toISOString();

    await db.update('members', m.id, m);
    await logActivity('ADMIN_RESET_PROFILE_PERMISSION', `Admin reset profile update for ${m.id}`);

    showToast('Success', 'Profile update permission restored.');
    await renderAdminMembers();

  } catch (error) {
    console.error('resetProfilePermission error:', error);
    showToast('Error', 'Failed to reset permission.');
  }
}

/* --------------------------------------------------------------------------
   ADD NEW MEMBER (async)
-------------------------------------------------------------------------- */
async function adminAddMember(e) {
  e.preventDefault();
  try {
    const db = getDatabase();

    const id = document.getElementById('m_id')?.value?.trim();
    const name = document.getElementById('m_name')?.value?.trim();
    const memberType = document.getElementById('m_type')?.value;
    const fatherName = document.getElementById('m_father')?.value?.trim() || '';
    const motherName = document.getElementById('m_mother')?.value?.trim() || '';
    const dob = document.getElementById('m_dob')?.value || '';
    const countryCode = document.getElementById('m_country_code')?.value || '+880';
    const phone = document.getElementById('m_phone')?.value?.trim() || '';
    const fullPhone = countryCode + phone;
    const email = document.getElementById('m_email')?.value?.trim() || '';
    const shares = Number(document.getElementById('m_shares')?.value || 1);
    const pass = document.getElementById('m_pass')?.value?.trim();
    const pass2 = document.getElementById('m_pass2')?.value?.trim();
    const address = document.getElementById('m_address')?.value?.trim() || '';
    const joinDate = document.getElementById('m_join')?.value || new Date().toISOString().split('T')[0];
    const nidNo = document.getElementById('m_nid')?.value?.trim() || '';
    const nomineeName = document.getElementById('m_nom_name')?.value?.trim() || '';
    const nomineeRelation = document.getElementById('m_nom_rel')?.value || '';
    const nomineeNid = document.getElementById('m_nom_nid')?.value?.trim() || '';
    const nomineePhone = document.getElementById('m_nom_phone')?.value?.trim() || '';
    const status = document.getElementById('m_status')?.value || 'PENDING';

    if (!id || !name || !pass) {
      showToast('Validation Error', 'Member ID, Name and Password required.');
      return;
    }
    if (pass !== pass2) {
      showToast('Password Error', 'Passwords do not match.');
      return;
    }

    const existing = await db.get('members', id);
    if (existing) {
      showToast('Duplicate Member', 'This Member ID already exists.');
      return;
    }

    const photoFile = document.getElementById('m_photo')?.files?.[0];
    const nidFrontFile = document.getElementById('m_nid_front')?.files?.[0];
    const nidBackFile = document.getElementById('m_nid_back')?.files?.[0];
    const nomineePhotoFile = document.getElementById('m_nom_photo')?.files?.[0];
    const nomineeNidFrontFile = document.getElementById('m_nom_nid_front')?.files?.[0];
    const nomineeNidBackFile = document.getElementById('m_nom_nid_back')?.files?.[0];

    const photo = photoFile ? await fileToBase64(photoFile) : '';
    const nidFront = nidFrontFile ? await fileToBase64(nidFrontFile) : '';
    const nidBack = nidBackFile ? await fileToBase64(nidBackFile) : '';
    const nomineePhoto = nomineePhotoFile ? await fileToBase64(nomineePhotoFile) : '';
    const nomineeNidFront = nomineeNidFrontFile ? await fileToBase64(nomineeNidFrontFile) : '';
    const nomineeNidBack = nomineeNidBackFile ? await fileToBase64(nomineeNidBackFile) : '';

    const approved = status == 'ACTIVE';

    const memberData = {
      id, name, memberType, fatherName, motherName, dob,
      phone: fullPhone, email, shares, pass,
      address, joinDate,
      photo, nidNo, nidFront, nidBack,
      nomineeName, nomineeRelation, nomineeNid, nomineePhone, nomineePhoto,
      nomineeNidFront, nomineeNidBack,
      status, approved,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await db.save('members', memberData, id);
    await logActivity('ADD_MEMBER', `Added member: ${id} (${memberType})`);
    
    // যদি ACTIVE status দেওয়া হয় তাহলে লগইন তথ্য পাঠান
    if (approved) {
      await sendLoginInfoToMember(memberData);
      showToast('Member Added', `${name} (${id}) saved with ACTIVE status. Login info sent.`);
    } else {
      showToast('Member Added', `${name} (${id}) saved with ${status} status.`);
    }

    e.target.reset();
    await updateMemberIdPreview();
    await renderAdminMembers();
  } catch (error) {
    console.error('adminAddMember error:', error);
    showToast('Error', 'মেম্বার যোগ করতে সমস্যা: ' + error.message);
  }
}

/* --------------------------------------------------------------------------
   APPROVE MEMBER – with missing field check & notifications
-------------------------------------------------------------------------- */
async function approveMember(memberId) {
  try {
    const db = getDatabase();
    const member = await db.get('members', memberId);
    if (!member) return;

    const missing = [];
    if (!member.nidNo?.trim()) missing.push('NID Number');
    if (!member.nomineeName?.trim()) missing.push('Nominee Name');
    if (!member.nomineeNid?.trim()) missing.push('Nominee NID');
    if (!member.photo) missing.push('Member Photo');

    if (missing.length > 0) {
      showToast('Information Gap', `Missing: ${missing.join(', ')}. Please update member first.`);
      openMemberForUpdate(memberId);
      return;
    }

    member.approved = true;
    member.status = 'ACTIVE';
    member.updatedAt = new Date().toISOString();

    await db.update('members', memberId, member);
    await logActivity('APPROVE_MEMBER', `Member approved: ${memberId}`);

    // অ্যাপ্রুভ করার পর লগইন তথ্য পাঠান
    await sendLoginInfoToMember(member);

    showToast('Member Approved', `${member.name} has been approved successfully. Login info sent.`);
    await renderAdminMembers();
  } catch (error) {
    console.error('approveMember error:', error);
    showToast('Error', 'Approve করতে সমস্যা হয়েছে।');
  }
}

/* --------------------------------------------------------------------------
   MANUALLY SEND LOGIN INFO
-------------------------------------------------------------------------- */
async function sendLoginInfoManually(memberId) {
  try {
    const db = getDatabase();
    const member = await db.get('members', memberId);
    if (!member) return;

    const confirmSend = confirm(`Send login information to ${member.name}?\nPhone: ${member.phone}\nEmail: ${member.email}`);
    if (!confirmSend) return;

    showToast('Sending', 'Sending login information...', 'info');
    
    await sendLoginInfoToMember(member);
    
    await logActivity('MANUAL_LOGIN_INFO', `Login info sent manually to ${memberId}`);
    
  } catch (error) {
    console.error('sendLoginInfoManually error:', error);
    showToast('Error', 'লগইন তথ্য পাঠাতে সমস্যা।');
  }
}

/* --------------------------------------------------------------------------
   RESET MEMBER PASSWORD
-------------------------------------------------------------------------- */
async function resetMemberPassword(memberId) {
  try {
    const db = getDatabase();
    const member = await db.get('members', memberId);
    if (!member) return;

    const newPass = prompt(`Enter new password for ${member.name}:`, '123456');
    if (!newPass) return;

    member.pass = newPass;
    member.updatedAt = new Date().toISOString();

    await db.update('members', memberId, member);
    await logActivity('RESET_MEMBER_PASSWORD', `Password reset for ${memberId}`);
    
    // পাসওয়ার্ড রিসেট করার পর নতুন পাসওয়ার্ড পাঠান কিনা জিজ্ঞাসা করুন
    if (confirm('Send new password to member via WhatsApp/Email?')) {
      await sendLoginInfoToMember(member);
    }
    
    showToast('Password Reset', `New password saved for ${memberId}`);
    await renderAdminMembers();
  } catch (error) {
    console.error('resetMemberPassword error:', error);
    showToast('Error', 'পাসওয়ার্ড রিসেট করতে সমস্যা।');
  }
}

/* --------------------------------------------------------------------------
   VIEW FULL MEMBER PROFILE (modal via viewer) – with download buttons
-------------------------------------------------------------------------- */
async function viewMember(memberId) {
  try {
    const db = getDatabase();
    const member = await db.get('members', memberId);
    if (!member) {
      showToast('Error', 'Member not found');
      return;
    }

    const deposits = await db.query('deposits', [
      { field: 'memberId', operator: '==', value: memberId },
      { field: 'status', operator: '==', value: 'APPROVED' }
    ]);
    const totalDeposit = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // Helper to render image with download button
    const renderImageWithDownload = (base64, filename, label) => {
      if (!base64) return `<div class="small">No ${label}</div>`;
      return `
        <div>
          <img src="${base64}" style="width:100%;max-width:320px;border-radius:18px;border:1px solid var(--line);">
          <button class="btn download-btn" data-base64="${base64}" data-filename="${filename}">Download ${label}</button>
        </div>
      `;
    };

    const html = `
      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>${member.name} (${member.id})</h3>
            <p>Full Profile Information</p>
          </div>
          <div class="panelTools">
            <button class="btn primary" id="modalSendLoginInfo" data-id="${member.id}">
              📨 Send Login Info
            </button>
          </div>
        </div>

        <div class="row row-3">
          <div>
            <label>Member Photo</label>
            ${renderImageWithDownload(member.photo, `${member.id}_photo.png`, 'Photo')}
          </div>
          <div>
            <label>Nominee Photo</label>
            ${renderImageWithDownload(member.nomineePhoto, `${member.id}_nominee_photo.png`, 'Nominee Photo')}
          </div>
          <div>
            <label>Status</label>
            <div><span class="status ${member.status == 'ACTIVE' ? 'st-approved' : member.status == 'PENDING' ? 'st-pending' : 'st-rejected'}">${member.status}</span></div>
            <div class="small" style="margin-top:8px;">Type: <b>${member.memberType}</b></div>
            <div class="small">Shares: <b>${member.shares}</b></div>
            <div class="small">Approved: <b>${member.approved ? 'YES' : 'NO'}</b></div>
          </div>
        </div>

        <div class="hr"></div>

        <div class="row row-3">
          <div><label>Father's Name</label><input value="${member.fatherName || 'Not set'}" disabled /></div>
          <div><label>Mother's Name</label><input value="${member.motherName || 'Not set'}" disabled /></div>
          <div><label>Date of Birth</label><input value="${member.dob || 'Not set'}" disabled /></div>
        </div>

        <div class="row row-2">
          <div><label>Phone</label><input value="${member.phone}" disabled /></div>
          <div><label>Email</label><input value="${member.email}" disabled /></div>
        </div>

        <div class="row row-2">
          <div><label>Address</label><input value="${member.address}" disabled /></div>
          <div><label>Join Date</label><input value="${member.joinDate}" disabled /></div>
        </div>

        <div class="row row-2">
          <div><label>NID No</label><input value="${member.nidNo || 'Not set'}" disabled /></div>
          <div><label>Password</label><input value="${member.pass}" disabled /></div>
        </div>

        <div class="hr"></div>
        <h4>Nominee Information</h4>

        <div class="row row-3">
          <div><label>Nominee Name</label><input value="${member.nomineeName || 'Not set'}" disabled /></div>
          <div><label>Nominee Relation</label><input value="${member.nomineeRelation || 'Not set'}" disabled /></div>
          <div><label>Nominee NID</label><input value="${member.nomineeNid || 'Not set'}" disabled /></div>
        </div>

        <div class="row row-2">
          <div><label>Nominee Phone</label><input value="${member.nomineePhone || 'Not set'}" disabled /></div>
          <div></div>
        </div>

        <div class="hr"></div>

        <!-- NID Images with Download -->
        <div class="row row-2">
          <div>
            <label>NID Front</label>
            ${renderImageWithDownload(member.nidFront, `${member.id}_nid_front.png`, 'NID Front')}
          </div>
          <div>
            <label>NID Back</label>
            ${renderImageWithDownload(member.nidBack, `${member.id}_nid_back.png`, 'NID Back')}
          </div>
        </div>

        <!-- Nominee NID Images (if exist) -->
        <div class="row row-2">
          <div>
            <label>Nominee NID Front</label>
            ${renderImageWithDownload(member.nomineeNidFront, `${member.id}_nominee_nid_front.png`, 'Nominee NID Front')}
          </div>
          <div>
            <label>Nominee NID Back</label>
            ${renderImageWithDownload(member.nomineeNidBack, `${member.id}_nominee_nid_back.png`, 'Nominee NID Back')}
          </div>
        </div>

        <div class="hr"></div>
        <div class="hint">
          Total Approved Deposits: <b>${formatMoney(totalDeposit)}</b>
        </div>
      </div>
    `;

    openViewerModal('Member Viewer', 'Member profile details preview', html);

    // Attach download event listeners after modal is loaded
    setTimeout(() => {
      document.querySelectorAll('.download-btn').forEach(btn => {
        btn.addEventListener('click', (e) => {
          const base64 = e.target.dataset.base64;
          const filename = e.target.dataset.filename;
          downloadBase64Image(base64, filename);
        });
      });
      
      // Modal এর ভিতরে Send Login Info বাটন
      const modalSendBtn = document.getElementById('modalSendLoginInfo');
      if (modalSendBtn) {
        modalSendBtn.addEventListener('click', () => {
          sendLoginInfoManually(memberId);
        });
      }
    }, 200);
  } catch (error) {
    console.error('viewMember error:', error);
    showToast('Error', 'মেম্বার দেখতে সমস্যা।');
  }
}

/* --------------------------------------------------------------------------
   OPEN MODAL FOR UPDATE (missing fields)
-------------------------------------------------------------------------- */
async function openMemberForUpdate(memberId) {
  try {
    const db = getDatabase();
    const member = await db.get('members', memberId);
    if (!member) return;

    const html = `
      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>Update Member Information</h3>
            <p>Fill missing information for: ${member.name} (${member.id})</p>
          </div>
        </div>

        <div class="row row-2">
          <div>
            <label>NID Number *</label>
            <input id="upd_nid" value="${member.nidNo || ''}" />
          </div>
          <div>
            <label>Member Photo</label>
            <input id="upd_photo" type="file" accept="image/*" />
            ${member.photo ? '<div class="small">Current photo exists</div>' : ''}
          </div>
          <div>
            <label>Member NID Front</label>
            <input id="upd_nid_front" type="file" accept="image/*" />
            ${member.nidFront ? '<div class="small">Current NID Front exists</div>' : ''}
          </div>
          <div>
            <label>Member NID Back</label>
            <input id="upd_nid_back" type="file" accept="image/*" />
            ${member.nidBack ? '<div class="small">Current NID Back exists</div>' : ''}
          </div>
          <div><label>Phone Number</label><input id="upd_phone" value="${member.phone || ''}" /></div>
          <div><label>Email</label><input id="upd_email" value="${member.email || ''}" /></div>
          <div><label>Address</label><input id="upd_address" value="${member.address || ''}" /></div>
        </div>

        <div class="row row-3">
          <div>
            <label>Nominee Name *</label>
            <input id="upd_nom_name" value="${member.nomineeName || ''}" />
          </div>
          <div><label>Nominee Phone</label><input id="upd_nom_phone" value="${member.nomineePhone || ''}" /></div>
          <div>
            <label>Nominee NID *</label>
            <input id="upd_nom_nid" value="${member.nomineeNid || ''}" />
          </div>
          <div>
            <label>Nominee photo</label>
            <input id="upd_nom_photo" type="file" accept="image/*" />
            ${member.nomineePhoto ? '<div class="small">Current Nominee Photo exists</div>' : ''}
          </div>
          <div>
            <label>Nominee NID Front</label>
            <input id="upd_nom_nid_front" type="file" accept="image/*" />
            ${member.nomineeNidFront ? '<div class="small">Current Nominee NID Front exists</div>' : ''}
          </div>
          <div>
            <label>Nominee NID Back</label>
            <input id="upd_nom_nid_back" type="file" accept="image/*" />
            ${member.nomineeNidBack ? '<div class="small">Current Nominee NID Back exists</div>' : ''}
          </div>
          <div>
            <label>Nominee Relation</label>
            <select id="upd_nom_rel">
              ${['Father','Mother','Husband','Wife','Brother','Sister','Son','Daughter','Other']
                .map(rel => `<option value="${rel}" ${member.nomineeRelation == rel ? 'selected' : ''}>${rel}</option>`)
                .join('')}
            </select>
          </div>
        </div>

        <div class="row row-3">
          <div>
            <label>Father's Name</label>
            <input id="upd_father" value="${member.fatherName || ''}" />
          </div>
          <div>
            <label>Mother's Name</label>
            <input id="upd_mother" value="${member.motherName || ''}" />
          </div>
          <div>
            <label>Date of Birth</label>
            <input id="upd_dob" type="date" value="${member.dob || ''}" />
          </div>
        </div>

        <div class="hr"></div>
        <button class="btn success" id="updateMemberBtn">Update Information</button>
        <button class="btn" id="cancelUpdateBtn">Cancel</button>
      </div>
    `;

    openViewerModal('Update Member', 'Fill missing information', html);

    setTimeout(() => {
      document.getElementById('updateMemberBtn')?.addEventListener('click', () => updateMemberInfo(memberId));
      document.getElementById('cancelUpdateBtn')?.addEventListener('click', () => {
        const modal = document.querySelector('.modalWrap[style*="display: flex"]');
        if (modal) modal.style.display = 'none';
      });
    }, 100);
  } catch (error) {
    console.error('openMemberForUpdate error:', error);
  }
}

/* --------------------------------------------------------------------------
   UPDATE MEMBER INFO (save from modal)
-------------------------------------------------------------------------- */
async function updateMemberInfo(memberId) {
  try {
    const db = getDatabase();
    const member = await db.get('members', memberId);
    if (!member) return;

    const nidNo = document.getElementById('upd_nid')?.value?.trim();
    const nomineeName = document.getElementById('upd_nom_name')?.value?.trim();
    const nomineeNid = document.getElementById('upd_nom_nid')?.value?.trim();
    const nomineeRelation = document.getElementById('upd_nom_rel')?.value;
    const fatherName = document.getElementById('upd_father')?.value?.trim();
    const motherName = document.getElementById('upd_mother')?.value?.trim();
    const dob = document.getElementById('upd_dob')?.value;
    const phone = document.getElementById('upd_phone')?.value?.trim();
    const email = document.getElementById('upd_email')?.value?.trim();
    const address = document.getElementById('upd_address')?.value?.trim();

    if (!nidNo || !nomineeName || !nomineeNid) {
      showToast('Required Fields', 'Please fill all required fields (*)');
      return;
    }

    const photoFile = document.getElementById('upd_photo')?.files?.[0];
    const nidFrontFile = document.getElementById('upd_nid_front')?.files?.[0];
    const nidBackFile = document.getElementById('upd_nid_back')?.files?.[0];
    const nomineePhotoFile = document.getElementById('upd_nom_photo')?.files?.[0];
    const nomineeNidFrontFile = document.getElementById('upd_nom_nid_front')?.files?.[0];
    const nomineeNidBackFile = document.getElementById('upd_nom_nid_back')?.files?.[0];

    if (photoFile) member.photo = await fileToBase64(photoFile);
    if (nidFrontFile) member.nidFront = await fileToBase64(nidFrontFile);
    if (nidBackFile) member.nidBack = await fileToBase64(nidBackFile);
    if (nomineePhotoFile) member.nomineePhoto = await fileToBase64(nomineePhotoFile);
    if (nomineeNidFrontFile) member.nomineeNidFront = await fileToBase64(nomineeNidFrontFile);
    if (nomineeNidBackFile) member.nomineeNidBack = await fileToBase64(nomineeNidBackFile);

    member.nidNo = nidNo;
    member.nomineeName = nomineeName;
    member.nomineeNid = nomineeNid;
    member.nomineeRelation = nomineeRelation;
    member.fatherName = fatherName;
    member.motherName = motherName;
    member.dob = dob;
    if (phone) member.phone = phone;
    if (email) member.email = email;
    if (address) member.address = address;
    
    member.updatedAt = new Date().toISOString();

    await db.update('members', memberId, member);
    await logActivity('UPDATE_MEMBER', `Updated member info: ${memberId}`);
    showToast('Information Updated', 'Member information updated successfully.');

    const modal = document.querySelector('.modalWrap[style*="display: flex"]');
    if (modal) modal.style.display = 'none';

    await renderAdminMembers();
  } catch (error) {
    console.error('updateMemberInfo error:', error);
    showToast('Error', 'আপডেট করতে সমস্যা।');
  }
}

/* --------------------------------------------------------------------------
   FILTER MEMBERS TABLE (client‑side DOM filtering)
-------------------------------------------------------------------------- */
function filterMembers() {
  const search = document.getElementById('memberSearch')?.value.toLowerCase().trim() || '';
  const rows = document.querySelectorAll('#membersTable tbody tr');
  rows.forEach(row => {
    row.style.display = row.textContent.toLowerCase().includes(search) ? '' : 'none';
  });
}
