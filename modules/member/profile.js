// =====================================================
// 📦 IMPORT SECTION (ইম্পোর্ট সেকশন)
// =====================================================
import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';
import { showToast, compressImage } from '../utils/common.js';


// =====================================================
// 🎨 রেস্পন্সিভ স্টাইলস - Mobile First
// =====================================================
const profileStyles = `
  <style>
    /* CSS Variables for consistent theming */
    :root {
      --primary-gradient: linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);
      --secondary-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      --warning-gradient: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
      --danger-gradient: linear-gradient(135deg, #eb5757 0%, #f2994a 100%);
      --shadow-sm: 0 5px 15px rgba(0,0,0,0.05);
      --shadow-md: 0 10px 25px rgba(0,0,0,0.1);
      --shadow-lg: 0 15px 35px rgba(0,0,0,0.15);
      --border-radius-sm: 12px;
      --border-radius-md: 16px;
      --border-radius-lg: 20px;
      --border-radius-xl: 24px;
      --border-radius-xxl: 30px;
      
      /* Text Colors - High Contrast */
      --text-primary: #1e293b;
      --text-secondary: #334155;
      --text-muted: #64748b;
      --text-light: #f8fafc;
      --text-white: #ffffff;
      --text-dark: #0f172a;
      
      /* Background Colors */
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --bg-tertiary: #f1f5f9;
      --bg-accent: #eef2ff;
      --bg-warning: #fff3cd;
      --bg-danger: #f8d7da;
      --bg-success: #d4edda;
      
      /* Accent Colors */
      --accent-1: #4158D0;
      --accent-2: #C850C0;
      --accent-3: #FFCC70;
      --accent-success: #11998e;
      --accent-warning: #f2994a;
      --accent-danger: #eb5757;
    }

    /* Profile Container - Mobile First */
    .profile-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: clamp(12px, 3vw, 25px);
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      min-height: 100vh;
    }

    /* Main Card */
    .profile-card {
      background: var(--bg-primary);
      border-radius: clamp(20px, 4vw, 30px);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .profile-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
    }

    /* Header Section */
    .profile-header {
      padding: clamp(20px, 4vw, 35px);
      background: var(--primary-gradient);
      color: var(--text-white);
      position: relative;
      overflow: hidden;
    }

    .profile-header::before {
      content: '👤';
      position: absolute;
      right: -20px;
      bottom: -20px;
      font-size: 150px;
      opacity: 0.1;
      transform: rotate(-15deg);
      color: var(--text-white);
    }

    .profile-header h2 {
      font-size: clamp(22px, 4vw, 32px);
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
      color: var(--text-white);
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .profile-header p {
      font-size: clamp(14px, 2vw, 16px);
      opacity: 0.95;
      position: relative;
      z-index: 1;
      color: var(--text-white);
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    /* Lock Status Badge */
    .lock-status {
      display: inline-block;
      padding: 8px 20px;
      border-radius: 50px;
      font-size: 13px;
      font-weight: 700;
      margin-top: 15px;
      background: ${m => m.profileUpdatedOnce ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.2)'};
      color: var(--text-white);
      border: 1px solid rgba(255,255,255,0.3);
    }

    /* Form Section */
    .profile-form {
      padding: clamp(20px, 4vw, 35px);
    }

    /* Section Title */
    .section-title {
      color: var(--text-primary);
      font-size: clamp(18px, 3vw, 22px);
      font-weight: 800;
      margin: 25px 0 20px;
      display: flex;
      align-items: center;
      gap: 10px;
      border-bottom: 2px solid var(--accent-1);
      padding-bottom: 10px;
    }

    .section-title::before {
      content: '';
      width: 4px;
      height: 24px;
      background: var(--primary-gradient);
      border-radius: 2px;
    }

    /* Responsive Grid */
    .profile-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(16px, 3vw, 20px);
      margin-bottom: 20px;
    }

    @media (min-width: 640px) {
      .profile-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .profile-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Form Fields */
    .form-field {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }

    .form-field label {
      font-size: clamp(12px, 1.8vw, 14px);
      font-weight: 700;
      color: var(--text-primary);
      text-transform: uppercase;
      letter-spacing: 0.5px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .form-field label i {
      color: var(--accent-1);
      font-style: normal;
      font-size: 16px;
    }

    .form-field label::before {
      content: '';
      width: 4px;
      height: 16px;
      background: var(--primary-gradient);
      border-radius: 2px;
    }

    .form-field input,
    .form-field select {
      width: 100%;
      padding: clamp(14px, 2.5vw, 16px) clamp(16px, 3vw, 18px);
      border: 2px solid var(--bg-tertiary);
      border-radius: var(--border-radius-md);
      font-size: clamp(14px, 2vw, 16px);
      transition: all 0.3s ease;
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-weight: 500;
    }

    .form-field input:focus,
    .form-field select:focus {
      border-color: var(--accent-1);
      outline: none;
      box-shadow: 0 0 0 4px rgba(65, 88, 208, 0.1);
      background: var(--bg-primary);
    }

    .form-field input:disabled,
    .form-field select:disabled {
      background: var(--bg-tertiary);
      border-color: #d1d5db;
      color: var(--text-muted);
      cursor: not-allowed;
      opacity: 0.7;
    }

    .form-field input::placeholder {
      color: var(--text-muted);
      opacity: 0.7;
    }

    /* Image Upload Section */
    .image-upload {
      background: var(--bg-secondary);
      border-radius: var(--border-radius-lg);
      padding: 20px;
      border: 2px dashed var(--accent-1);
      transition: all 0.3s;
    }

    .image-upload:hover {
      border-color: var(--accent-2);
      background: var(--bg-accent);
    }

    .image-preview {
      width: 100px;
      height: 100px;
      border-radius: var(--border-radius-md);
      object-fit: cover;
      border: 3px solid var(--accent-1);
      box-shadow: var(--shadow-md);
      margin-bottom: 10px;
    }

    .image-preview-sm {
      width: 60px;
      height: 60px;
      border-radius: var(--border-radius-sm);
      object-fit: cover;
      border: 2px solid var(--accent-1);
    }

    /* File Input Styling */
    .file-input-wrapper {
      position: relative;
      margin-top: 10px;
    }

    .file-input-wrapper input[type="file"] {
      padding: 12px;
      background: var(--bg-primary);
      border: 2px dashed var(--accent-1);
      cursor: pointer;
      color: var(--text-primary);
    }

    .file-input-wrapper input[type="file"]::-webkit-file-upload-button {
      padding: 8px 16px;
      background: var(--primary-gradient);
      color: var(--text-white);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-right: 10px;
      font-weight: 600;
      transition: all 0.3s;
    }

    .file-input-wrapper input[type="file"]::-webkit-file-upload-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(65,88,208,0.3);
    }

    /* Button Styles */
    .profile-btn {
      width: 100%;
      padding: clamp(16px, 3vw, 18px);
      border: none;
      border-radius: var(--border-radius-xxl);
      font-size: clamp(16px, 2.5vw, 18px);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      margin: 10px 0;
      color: var(--text-white);
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }

    .profile-btn.primary {
      background: var(--primary-gradient);
      box-shadow: 0 10px 20px rgba(65,88,208,0.3);
    }

    .profile-btn.primary:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px rgba(65,88,208,0.4);
    }

    .profile-btn.success {
      background: var(--success-gradient);
      box-shadow: 0 10px 20px rgba(17,153,142,0.3);
    }

    .profile-btn.success:hover:not(:disabled) {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px rgba(17,153,142,0.4);
    }

    .profile-btn:disabled {
      opacity: 0.6;
      cursor: not-allowed;
      transform: none !important;
    }

    .profile-btn:active:not(:disabled) {
      transform: translateY(0);
    }

    /* Password Section */
    .password-section {
      background: linear-gradient(135deg, #f8f9fa, #ffffff);
      border-radius: var(--border-radius-lg);
      padding: clamp(20px, 4vw, 25px);
      margin-top: 25px;
      border: 2px solid var(--accent-success);
    }

    .password-section h3 {
      color: var(--text-primary);
      font-size: clamp(18px, 3vw, 20px);
      font-weight: 800;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .password-section h3::before {
      content: '🔐';
      font-size: 24px;
    }

    /* Info Box */
    .info-box {
      background: var(--bg-accent);
      border-radius: var(--border-radius-md);
      padding: 15px;
      margin: 20px 0;
      border-left: 5px solid var(--accent-1);
      color: var(--text-primary);
      font-weight: 500;
    }

    /* Warning Box */
    .warning-box {
      background: var(--bg-warning);
      border-radius: var(--border-radius-md);
      padding: 15px;
      margin: 20px 0;
      border-left: 5px solid var(--accent-warning);
      color: #856404;
      font-weight: 500;
    }

    /* Responsive Adjustments */
    @media (max-width: 480px) {
      .profile-header h2 {
        font-size: 20px;
      }
      
      .form-field input,
      .form-field select {
        font-size: 14px;
        padding: 12px 14px;
      }
      
      .image-preview {
        width: 80px;
        height: 80px;
      }
    }

    @media (min-width: 1920px) {
      .profile-container {
        max-width: 1600px;
      }
      
      .form-field label {
        font-size: 15px;
      }
      
      .form-field input,
      .form-field select {
        font-size: 16px;
      }
    }

    /* Loading State */
    .loading-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(255,255,255,0.8);
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: var(--border-radius-lg);
    }

    /* Touch Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .profile-btn:active {
        transform: scale(0.98);
      }
      
      .form-field input,
      .form-field select {
        font-size: 16px; /* Prevent zoom on iOS */
      }
    }

    /* Print Styles */
    @media print {
      .profile-container {
        background: white;
        padding: 20px;
      }
      
      .profile-btn,
      .password-section {
        display: none;
      }
    }
  </style>
`;


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
    ? '🔒 Profile already updated once. Contact admin to unlock.'
    : '🔓 You can update profile only one time.';

  // =====================================================
  // 🧾 HTML UI STRUCTURE - Fully Responsive
  // =====================================================
  const html = `
  ${profileStyles}
  <div class="profile-container">
    <div class="profile-card">
      
      <!-- Header -->
      <div class="profile-header">
        <h2>👤 Member Profile</h2>
        <p>${lockMessage}</p>
        <div class="lock-status">
          ${m.profileUpdatedOnce ? '🔒 Profile Locked' : '🔓 Profile Editable'}
        </div>
      </div>

      <!-- Form Section -->
      <div class="profile-form">
        
        <!-- Personal Information -->
        <div class="section-title">Personal Information</div>
        
        <div class="profile-grid">
          <div class="form-field">
            <label>Member ID</label>
            <input value="${m.id}" disabled />
          </div>

          <div class="form-field">
            <label>Profile Photo</label>
            <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
              ${m.photo ? `<img src="${m.photo}" class="image-preview">` : ''}
              <div class="file-input-wrapper" style="flex:1;">
                <input id="up_photo" type="file" accept="image/*" ${isLocked}/>
              </div>
            </div>
          </div>

          <div class="form-field">
            <label>Full Name</label>
            <input id="up_name" value="${m.name || ''}" placeholder="Enter full name" ${isLocked} />
          </div>

          <div class="form-field">
            <label>Father's Name</label>
            <input id="up_fatherName" value="${m.fatherName || ''}" placeholder="Enter father's name" ${isLocked} />
          </div>

          <div class="form-field">
            <label>Mother's Name</label>
            <input id="up_motherName" value="${m.motherName || ''}" placeholder="Enter mother's name" ${isLocked} />
          </div>

          <div class="form-field">
            <label>NID Number</label>
            <input id="up_nid" value="${m.nid || ''}" placeholder="Enter NID number" ${isLocked} />
          </div>
        </div>

        <!-- Contact Information -->
        <div class="section-title">Contact Information</div>
        
        <div class="profile-grid">
          <div class="form-field">
            <label>Phone Number</label>
            <input id="up_phone" value="${m.phone || ''}" placeholder="Enter phone number" ${isLocked}/>
          </div>
          
          <div class="form-field">
            <label>Email Address</label>
            <input id="up_email" value="${m.email || ''}" placeholder="Enter email address" ${isLocked}/>
          </div>
          
          <div class="form-field">
            <label>Address</label>
            <input id="up_address" value="${m.address || ''}" placeholder="Enter address" ${isLocked}/>
          </div>
          
          <div class="form-field">
            <label>Shares</label>
            <input value="${m.shares || 0}" disabled />
          </div>
        </div>

        <!-- NID Documents -->
        <div class="section-title">NID Documents</div>
        
        <div class="profile-grid">
          <div class="form-field">
            <label>NID Front</label>
            <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
              ${m.nidFront ? `<img src="${m.nidFront}" class="image-preview-sm">` : ''}
              <div class="file-input-wrapper" style="flex:1;">
                <input id="up_nidFront" type="file" accept="image/*" ${isLocked}/>
              </div>
            </div>
          </div>
          
          <div class="form-field">
            <label>NID Back</label>
            <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
              ${m.nidBack ? `<img src="${m.nidBack}" class="image-preview-sm">` : ''}
              <div class="file-input-wrapper" style="flex:1;">
                <input id="up_nidBack" type="file" accept="image/*" ${isLocked}/>
              </div>
            </div>
          </div>
        </div>

        <!-- Nominee Information -->
        <div class="section-title">Nominee Information</div>
        
        <div class="profile-grid">
          <div class="form-field">
            <label>Nominee Name</label>
            <input id="up_nomineeName" value="${m.nomineeName || ''}" placeholder="Enter nominee name" ${isLocked} />
          </div>

          <div class="form-field">
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

          <div class="form-field">
            <label>Nominee NID</label>
            <input id="up_nomineeNid" value="${m.nomineeNid || ''}" placeholder="Enter nominee NID" ${isLocked} />
          </div>

          <div class="form-field">
            <label>Nominee Phone</label>
            <input id="up_nomineePhone" value="${m.nomineePhone || ''}" placeholder="Enter nominee phone" ${isLocked} />
          </div>
        </div>

        <!-- Nominee Documents -->
        <div class="profile-grid">
          <div class="form-field">
            <label>Nominee Photo</label>
            <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
              ${m.nomineePhoto ? `<img src="${m.nomineePhoto}" class="image-preview-sm">` : ''}
              <div class="file-input-wrapper" style="flex:1;">
                <input id="up_nomineePhoto" type="file" accept="image/*" ${isLocked}/>
              </div>
            </div>
          </div>
          
          <div class="form-field">
            <label>Nominee NID Front</label>
            <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
              ${m.nomineeNidFront ? `<img src="${m.nomineeNidFront}" class="image-preview-sm">` : ''}
              <div class="file-input-wrapper" style="flex:1;">
                <input id="up_nomineeNidFront" type="file" accept="image/*" ${isLocked}/>
              </div>
            </div>
          </div>
          
          <div class="form-field">
            <label>Nominee NID Back</label>
            <div style="display:flex; align-items:center; gap:15px; flex-wrap:wrap;">
              ${m.nomineeNidBack ? `<img src="${m.nomineeNidBack}" class="image-preview-sm">` : ''}
              <div class="file-input-wrapper" style="flex:1;">
                <input id="up_nomineeNidBack" type="file" accept="image/*" ${isLocked}/>
              </div>
            </div>
          </div>
        </div>

        <!-- Update Button -->
        <div class="info-box">
          ⚠️ You can update your profile only <strong>ONE time</strong>. After update, it will be locked.
        </div>
        
        <button class="profile-btn primary" id="updateProfileBtn" ${isLocked}>
          ${m.profileUpdatedOnce ? '🔒 Profile Locked' : '📝 Update Profile'}
        </button>

        <!-- Password Update Section -->
        <div class="password-section">
          <h3>Change Password</h3>
          
          <form id="passwordUpdateForm" onsubmit="event.preventDefault();">
            <input type="hidden" name="username" value="${m.id}" autocomplete="username">
            
            <div class="profile-grid">
              <div class="form-field">
                <label>New Password</label>
                <input id="up_pass" type="password" placeholder="Enter new password" autocomplete="new-password"/>
              </div>
              <div class="form-field">
                <label>Confirm Password</label>
                <input id="up_pass2" type="password" placeholder="Confirm new password" autocomplete="new-password"/>
              </div>
            </div>
            
            <button type="submit" class="profile-btn success" id="updatePasswordBtn">
              🔐 Update Password
            </button>
          </form>
        </div>

      </div>
    </div>
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
      showToast('Locked', 'You cannot update profile again.', 'warning');
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
      showToast('Not Allowed', 'You can update profile only once.', 'warning');
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

    showToast('Success', 'Profile updated successfully.', 'success');

    // ✅ Re-render to show lock status
    renderMemberProfile();

  } catch (error) {
    console.error(error);
    showToast('Error', 'প্রোফাইল আপডেট করতে সমস্যা হয়েছে।', 'error');
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
      showToast('Error', 'Please enter password and confirm password.', 'error');
      return;
    }

    // ✅ Match check
    if (pass !== pass2) {
      showToast('Password Error', 'Password confirmation mismatch.', 'error');
      return;
    }

    // ✅ Password strength check (optional)
    if (pass.length < 4) {
      showToast('Error', 'Password must be at least 4 characters.', 'error');
      return;
    }

    // ✅ Save new password
    m.pass = pass;
    m.updatedAt = new Date().toISOString();

    await db.update('members', m.id, m);
    await logActivity('PASSWORD_UPDATE', `Member changed password ${m.id}`);

    showToast('Success', 'Password updated successfully.', 'success');

    // ✅ Clear input
    document.getElementById('up_pass').value = '';
    document.getElementById('up_pass2').value = '';

  } catch (error) {
    console.error(error);
    showToast('Error', 'Password update failed.', 'error');
  }
}
