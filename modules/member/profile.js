// =====================================================
// 📦 IMPORT SECTION (ইম্পোর্ট সেকশন)
// =====================================================
import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import { showToast, compressImage } from '../utils/common.js';


// =====================================================
// 🧾 মেম্বার প্রোফাইল পেজ রেন্ডার করার ফাংশন
// =====================================================
export async function renderMemberProfile() {

  // ✅ ১. বর্তমান ইউজার এবং ডাটাবেস চেক করা
  const user = getCurrentUser();
  if (!user) return;

  const db = getDatabase();
  const m = await db.get('members', user.id);
  if (!m) return;

  // ✅ ২. পুরানো রেকর্ডের জন্য ডিফল্ট ভ্যালু সেট করা
  if (m.profileUpdatedOnce === undefined) {
    m.profileUpdatedOnce = false;
    await db.update('members', m.id, m);
  }

  // ✅ পেজ টাইটেল সেট করা
  setPageTitle('My Profile', 'View and update your profile information.');

  // ✅ ৩. লক স্ট্যাটাস চেক করা
  const isLocked = m.profileUpdatedOnce ? 'disabled' : '';
  const lockMessage = m.profileUpdatedOnce
    ? 'Profile already updated once. Contact admin to unlock.'
    : 'You can update profile only one time.';

  // =====================================================
  // 🧾 HTML UI STRUCTURE
  // =====================================================
  const html = `
  <div class="panel">

    <div class="panelHeader">
      <div>
        <h3>Profile Information</h3>
        <p>${lockMessage}</p>
      </div>
    </div>

    <!-- বেসিক ইনফরমেশন -->
    <div class="row row-2">
      <div>
        <label>Member ID</label>
        <input value="${m.id}" disabled />
      </div>

      <!-- প্রোফাইল ফটো -->
      <div>
        <label>Profile Photo</label>
        <div style="display:flex; align-items:center; gap:10px;">
          ${m.photo ? `<img src="${m.photo}" style="width:80px; display:block; margin-bottom:5px;">` : ''}
          <input id="up_photo" type="file" accept="image/*" ${isLocked}/>
        </div>
      </div>
    </div>

    <div class="row row-2">
      <div>
        <label>Full Name</label>
        <input id="up_name" value="${m.name || ''}" ${isLocked} />
      </div>
      <div>
        <label>Father's Name</label>
        <input id="up_fatherName" value="${m.fatherName || ''}" ${isLocked} />
      </div>
    </div>

    <div class="row row-2">
      <div>
        <label>Mother's Name</label>
        <input id="up_motherName" value="${m.motherName || ''}" ${isLocked} />
      </div>
      <div>
        <label>NID</label>
        <input id="up_nid" value="${m.nid || ''}" ${isLocked} />
      </div>
    </div>

    <div class="row row-2">
      <div>
        <label>Phone</label>
        <input id="up_phone" value="${m.phone || ''}" ${isLocked}/>
      </div>
      <div>
        <label>Email</label>
        <input id="up_email" value="${m.email || ''}" ${isLocked}/>
      </div>
    </div>

    <div class="row row-2">
      <div>
        <label>Address</label>
        <input id="up_address" value="${m.address || ''}" ${isLocked}/>
      </div>
      <div>
        <label>Shares</label>
        <input value="${m.shares || 0}" disabled />
      </div>
    </div>

    <!-- NID Card Upload -->
    <div class="hr"></div>
    <div><label>Member NID Card</label></div>

    <div class="row row-2">
      <div>
        <label>NID Front</label>
        ${m.nidFront ? `<img src="${m.nidFront}" style="width:80px; display:block; margin-bottom:5px;">` : ''}
        <input id="up_nidFront" type="file" accept="image/*" ${isLocked}/>
      </div>
      <div>
        <label>NID Back</label>
        ${m.nidBack ? `<img src="${m.nidBack}" style="width:80px; display:block; margin-bottom:5px;">` : ''}
        <input id="up_nidBack" type="file" accept="image/*" ${isLocked}/>
      </div>
    </div>

    <!-- Nominee Information -->
    <div class="hr"></div>
    <h4>Nominee Information</h4>

    <div class="row row-2">
      <div>
        <label>Nominee Name</label>
        <input id="up_nomineeName" value="${m.nomineeName || ''}" ${isLocked} />
      </div>

      <div>
        <label>Nominee Relation</label>
        <select id="up_nomineeRelation" ${isLocked}>
          <option value="Father" ${m.nomineeRelation === "Father" ? "selected" : ""}>Father</option>
          <option value="Mother" ${m.nomineeRelation === "Mother" ? "selected" : ""}>Mother</option>
          <option value="Husband" ${m.nomineeRelation === "Husband" ? "selected" : ""}>Husband</option>
          <option value="Wife" ${m.nomineeRelation === "Wife" ? "selected" : ""}>Wife</option>
          <option value="Brother" ${m.nomineeRelation === "Brother" ? "selected" : ""}>Brother</option>
          <option value="Sister" ${m.nomineeRelation === "Sister" ? "selected" : ""}>Sister</option>
          <option value="Son" ${m.nomineeRelation === "Son" ? "selected" : ""}>Son</option>
          <option value="Daughter" ${m.nomineeRelation === "Daughter" ? "selected" : ""}>Daughter</option>
          <option value="Other" ${m.nomineeRelation === "Other" ? "selected" : ""}>Other</option>
        </select>
      </div>
    </div>

    <div class="row row-2">
      <div>
        <label>Nominee NID</label>
        <input id="up_nomineeNid" value="${m.nomineeNid || ''}" ${isLocked} />
      </div>
      <div>
        <label>Nominee Phone</label>
        <input id="up_nomineePhone" value="${m.nomineePhone || ''}" ${isLocked} />
      </div>
    </div>

    <!-- Nominee Documents -->
    <div class="row row-3">
      <div>
        <label>Nominee Photo</label>
        ${m.nomineePhoto ? `<img src="${m.nomineePhoto}" style="width:80px; display:block; margin-bottom:5px;">` : ''}
        <input id="up_nomineePhoto" type="file" accept="image/*" ${isLocked}/>
      </div>
      <div>
        <label>Nominee NID Front</label>
        ${m.nomineeNidFront ? `<img src="${m.nomineeNidFront}" style="width:80px; display:block; margin-bottom:5px;">` : ''}
        <input id="up_nomineeNidFront" type="file" accept="image/*" ${isLocked}/>
      </div>
      <div>
        <label>Nominee NID Back</label>
        ${m.nomineeNidBack ? `<img src="${m.nomineeNidBack}" style="width:80px; display:block; margin-bottom:5px;">` : ''}
        <input id="up_nomineeNidBack" type="file" accept="image/*" ${isLocked}/>
      </div>
    </div>

    <!-- Profile Update Button -->
    <div class="hr"></div>
    <button class="btn success" id="updateProfileBtn" ${isLocked}>
      ${m.profileUpdatedOnce ? 'Profile Locked' : 'Update Profile'}
    </button>

    <!-- Password Update Section -->
    <div class="hr"></div>
    <h3>Password Update</h3>

    <!-- 🔐 পাসওয়ার্ড ফর্ম (এখন <form> এর ভিতরে) -->
    <form id="passwordUpdateForm" onsubmit="event.preventDefault();">
      <div class="row row-2">
        <div>
          <label>New Password</label>
          <input id="up_pass" type="password" autocomplete="new-password"/>
        </div>
        <div>
          <label>Confirm Password</label>
          <input id="up_pass2" type="password" autocomplete="new-password"/>
        </div>
      </div>
      <button type="submit" class="btn success" id="updatePasswordBtn">
        Update Password
      </button>
    </form>

  </div>
  `;

  // ✅ HTML লোড
  document.getElementById('pageContent').innerHTML = html;


  // =====================================================
  // 🎯 EVENT LISTENERS
  // =====================================================

  // ✅ Profile Update Button
  document.getElementById('updateProfileBtn')?.addEventListener('click', async () => {

    if (m.profileUpdatedOnce) {
      showToast('Locked', 'You cannot update profile again.');
      return;
    }

    const confirmUpdate = confirm(
      "⚠️ Are you sure?\n\nYou can update profile only ONE time.\nThis action cannot be undone."
    );

    if (!confirmUpdate) return;

    await memberUpdateProfile(m);
  });


  // ✅ Password Update Form (সাবমিট ইভেন্ট)
  document.getElementById('passwordUpdateForm')?.addEventListener('submit', async (e) => {
    e.preventDefault(); // পৃষ্ঠা রিলোড বন্ধ করতে
    await memberUpdatePassword(m);
  });
}



// =====================================================
// 🔄 PROFILE UPDATE FUNCTION (ONLY PROFILE)
// =====================================================
async function memberUpdateProfile(m) {

  try {
    const db = getDatabase();
    const user = getCurrentUser();
    if (!user) return;

    // ✅ Profile already updated হলে prevent করবে
    if (m.profileUpdatedOnce) {
      showToast('Not Allowed', 'You can update profile only once.');
      return;
    }

    // =====================================================
    // 📝 TEXT FIELD UPDATE
    // =====================================================
    m.name = document.getElementById('up_name')?.value.trim() || m.name;
    m.fatherName = document.getElementById('up_fatherName')?.value.trim() || m.fatherName;
    m.motherName = document.getElementById('up_motherName')?.value.trim() || m.motherName;
    m.nid = document.getElementById('up_nid')?.value.trim() || m.nid;
    m.phone = document.getElementById('up_phone')?.value.trim() || m.phone;
    m.email = document.getElementById('up_email')?.value.trim() || m.email;
    m.address = document.getElementById('up_address')?.value.trim() || m.address;

    // =====================================================
    // 👤 NOMINEE INFO UPDATE
    // =====================================================
    m.nomineeName = document.getElementById('up_nomineeName')?.value.trim() || m.nomineeName;
    m.nomineeRelation = document.getElementById('up_nomineeRelation')?.value || m.nomineeRelation;
    m.nomineeNid = document.getElementById('up_nomineeNid')?.value.trim() || m.nomineeNid;
    m.nomineePhone = document.getElementById('up_nomineePhone')?.value.trim() || m.nomineePhone;

    // =====================================================
    // 🖼 IMAGE UPLOAD + COMPRESSION
    // =====================================================
    const files = [
      ['up_photo', 'photo', 800, 0.7],
      ['up_nidFront', 'nidFront', 1000, 0.75],
      ['up_nidBack', 'nidBack', 1000, 0.75],
      ['up_nomineePhoto', 'nomineePhoto', 800, 0.7],
      ['up_nomineeNidFront', 'nomineeNidFront', 1000, 0.75],
      ['up_nomineeNidBack', 'nomineeNidBack', 1000, 0.75],
    ];

    for (const [inputId, field, width, quality] of files) {
      const fileInput = document.getElementById(inputId);

      if (fileInput?.files?.[0]) {
        const file = fileInput.files[0];
        m[field] = await compressImage(file, width, quality);
      }
    }

    // =====================================================
    // 🔒 PROFILE LOCK AFTER FIRST UPDATE
    // =====================================================
    m.profileUpdatedOnce = true;
    m.updatedAt = new Date().toISOString();

    // ✅ Save DB
    await db.update('members', m.id, m);
    await logActivity('MEMBER_PROFILE_UPDATE', `Member updated profile ${m.id}`);

    showToast('Success', 'Profile updated successfully.');

    // ✅ Re-render to show lock status
    renderMemberProfile();

  } catch (error) {
    console.error(error);
    showToast('Error', 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।');
  }
}



// =====================================================
// 🔐 PASSWORD UPDATE FUNCTION (ONLY PASSWORD)
// =====================================================
async function memberUpdatePassword(m) {

  try {
    const db = getDatabase();
    const user = getCurrentUser();
    if (!user) return;

    const pass = document.getElementById('up_pass')?.value.trim();
    const pass2 = document.getElementById('up_pass2')?.value.trim();

    // ✅ Empty check
    if (!pass || !pass2) {
      showToast('Error', 'Please enter password and confirm password.');
      return;
    }

    // ✅ Match check
    if (pass !== pass2) {
      showToast('Password Error', 'Password confirmation mismatch.');
      return;
    }

    // ✅ Save new password
    m.pass = pass;
    m.updatedAt = new Date().toISOString();

    await db.update('members', m.id, m);
    await logActivity('PASSWORD_UPDATE', `Member changed password ${m.id}`);

    showToast('Success', 'Password updated successfully.');

    // ✅ Clear input
    document.getElementById('up_pass').value = '';
    document.getElementById('up_pass2').value = '';

  } catch (error) {
    console.error(error);
    showToast('Error', 'Password update failed.');
  }
}
