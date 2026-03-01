// ============================================================
// 🏦 MEMBER DEPOSIT MODULE
// IMS ERP V5
// Monthly Share Based Deposit Submission System - Fully Responsive
// ============================================================


// ============================================================
// 📦 IMPORTS
// ============================================================

import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle, logActivity } from '../auth/session.js';

import { 
  showToast, 
  formatMoney,
  getFullYearKey, 
  getMonthKey, 
  getMonthName, 
  generateId, 
  fileToBase64, 
  BANGLADESH_BANKS 
} from '../utils/common.js';

import { openDepositConfirmModal } from '../modals/deposit-confirm.js';
import { openViewerModal } from '../modals/viewer.js';



// ============================================================
// 🎯 MAIN RENDER FUNCTION
// ============================================================

/**
 * Render Member Deposit Submission Page
 * - Load member info
 * - Calculate required share amount
 * - Build dynamic dropdown with month names
 * - Attach event listeners
 */
export async function renderMemberDeposit() {

  const db = getDatabase();
  const user = getCurrentUser();

  if (!user) return;

  // Get logged-in member data
  const member = await db.get('members', user.id);
  if (!member) {
    showToast('Error', 'Member not found');
    return;
  }

  // System settings (Monthly share amount)
  const meta = await db.get('meta', 'system') || { monthlyShareAmount: 10000 };

  const currentYear = new Date().getFullYear();
  const currentMonthNum = new Date().getMonth() + 1; // 1-12
  

  // Required amount = Shares × Monthly Share Amount
  const required = (member.shares || 1) * meta.monthlyShareAmount;


  // ============================================================
  // 📅 YEAR DROPDOWN GENERATION
  // ============================================================

  let yearOptions = '';
  for (let y = currentYear; y >= currentYear - 5; y--) {
    yearOptions += `
      <option value="${y}" ${y == currentYear ? 'selected' : ''}>
        ${y}
      </option>
    `;
  }


  // ============================================================
  // 📅 MONTH DROPDOWN GENERATION (with proper month names)
  // ============================================================

  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  let monthOptions = '';
  for (let m = 1; m <= 12; m++) {
    const monthName = months[m - 1]; // Get month name from array
    const monthKey = `${currentYear}-${String(m).padStart(2, '0')}`; // Format: YYYY-MM
    
    monthOptions += `
      <option value="${monthKey}" ${m == currentMonthNum ? 'selected' : ''}>
        ${monthName}
      </option>
    `;
  }


  // ============================================================
  // 🎨 FULLY RESPONSIVE STYLES
  // ============================================================
  
 // ============================================================
// 🎨 FULLY RESPONSIVE STYLES WITH IMPROVED CONTRAST
// ============================================================
  
const styles = `
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
      
      /* Accent Colors */
      --accent-1: #4158D0;
      --accent-2: #C850C0;
      --accent-3: #FFCC70;
      --accent-success: #11998e;
      --accent-warning: #f2994a;
      --accent-danger: #eb5757;
    }

    /* Mobile-First Container */
    .deposit-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: clamp(12px, 3vw, 25px);
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      min-height: 100vh;
    }

    /* Main Card */
    .deposit-card {
      background: var(--bg-primary);
      border-radius: clamp(20px, 4vw, 30px);
      box-shadow: var(--shadow-lg);
      overflow: hidden;
      border: 1px solid rgba(0,0,0,0.05);
      transition: all 0.3s ease;
    }

    .deposit-card:hover {
      transform: translateY(-5px);
      box-shadow: 0 25px 50px rgba(0,0,0,0.15);
    }

    /* Header Section - Better Contrast */
    .deposit-header {
      padding: clamp(20px, 4vw, 35px);
      background: var(--primary-gradient);
      color: var(--text-white);
      position: relative;
      overflow: hidden;
    }

    .deposit-header::before {
      content: '💰';
      position: absolute;
      right: -20px;
      bottom: -20px;
      font-size: 150px;
      opacity: 0.1;
      transform: rotate(-15deg);
      color: var(--text-white);
    }

    .deposit-header h2 {
      font-size: clamp(22px, 4vw, 32px);
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
      color: var(--text-white);
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .deposit-header p {
      font-size: clamp(14px, 2vw, 16px);
      opacity: 0.95;
      position: relative;
      z-index: 1;
      color: var(--text-white);
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    /* Form Section */
    .deposit-form {
      padding: clamp(20px, 4vw, 35px);
      background: var(--bg-primary);
    }

    /* Form Fields - Better Contrast */
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
      padding: clamp(14px, 2.5vw, 18px) clamp(16px, 3vw, 20px);
      border: 2px solid var(--bg-tertiary);
      border-radius: var(--border-radius-md);
      font-size: clamp(15px, 2vw, 17px);
      transition: all 0.3s ease;
      background: var(--bg-secondary);
      color: var(--text-primary);
      font-weight: 500;
      -webkit-appearance: none;
      appearance: none;
      cursor: pointer;
    }

    .form-field input::placeholder {
      color: var(--text-muted);
      opacity: 0.7;
    }

    .form-field select {
      background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%234158D0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
      background-repeat: no-repeat;
      background-position: right 16px center;
      background-size: 16px;
    }

    .form-field input:focus,
    .form-field select:focus {
      border-color: var(--accent-1);
      outline: none;
      box-shadow: 0 0 0 4px rgba(65, 88, 208, 0.1);
      background: var(--bg-primary);
    }

    .form-field input:disabled {
      background: var(--bg-tertiary);
      border-color: #d1d5db;
      color: var(--text-muted);
      cursor: not-allowed;
    }

    /* File Input */
    .form-field input[type="file"] {
      padding: 12px;
      background: var(--bg-secondary);
      border: 2px dashed var(--accent-1);
      color: var(--text-primary);
    }

    .form-field input[type="file"]::-webkit-file-upload-button {
      padding: 10px 20px;
      background: var(--primary-gradient);
      color: var(--text-white);
      border: none;
      border-radius: 8px;
      cursor: pointer;
      margin-right: 15px;
      font-weight: 600;
      font-size: 14px;
      transition: all 0.3s;
    }

    .form-field input[type="file"]::-webkit-file-upload-button:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(65,88,208,0.3);
    }

    /* Bank Transfer Section - Better Contrast */
    .bank-section {
      background: linear-gradient(135deg, #eef2ff, #e0e7ff);
      border-radius: var(--border-radius-lg);
      padding: clamp(16px, 3vw, 25px);
      margin: 20px 0;
      border: 2px solid var(--accent-1);
      display: none;
      animation: slideDown 0.3s ease;
    }

    .bank-section.show {
      display: block;
    }

    .bank-section h4 {
      color: var(--text-primary);
      font-size: clamp(15px, 2.2vw, 18px);
      font-weight: 700;
      margin-bottom: 20px;
      display: flex;
      align-items: center;
      gap: 10px;
    }

    .bank-section h4::before {
      content: '🏦';
      font-size: 22px;
      filter: drop-shadow(0 2px 5px rgba(0,0,0,0.1));
    }

    /* Submit Button - Better Contrast */
    .submit-btn {
      width: 100%;
      padding: clamp(18px, 3vw, 22px);
      background: var(--primary-gradient);
      color: var(--text-white);
      border: none;
      border-radius: var(--border-radius-xxl);
      font-size: clamp(17px, 2.5vw, 22px);
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 15px 30px rgba(65,88,208,0.3);
      margin: 30px 0 20px;
      position: relative;
      overflow: hidden;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }

    .submit-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.3), transparent);
      transition: left 0.5s ease;
    }

    .submit-btn:hover::before {
      left: 100%;
    }

    .submit-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 20px 40px rgba(65,88,208,0.4);
    }

    .submit-btn:active {
      transform: translateY(0);
    }

    /* Hint Box - Better Contrast */
    .hint-box {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      border-radius: var(--border-radius-lg);
      padding: clamp(16px, 3vw, 22px);
      border-left: 5px solid var(--accent-1);
      margin-top: 20px;
      box-shadow: var(--shadow-sm);
    }

    .hint-box strong {
      color: var(--text-primary);
      font-size: clamp(15px, 2.2vw, 17px);
      font-weight: 800;
      display: flex;
      align-items: center;
      gap: 10px;
      margin-bottom: 15px;
    }

    .hint-box strong::before {
      content: '📌';
      font-size: 18px;
    }

    .hint-box ul {
      list-style: none;
      padding: 0;
    }

    .hint-box li {
      color: var(--text-secondary);
      font-size: clamp(13px, 2vw, 15px);
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 10px;
      font-weight: 500;
    }

    .hint-box li::before {
      content: '✓';
      color: var(--accent-success);
      font-weight: 700;
      font-size: 16px;
      background: white;
      width: 20px;
      height: 20px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    /* Divider */
    .divider {
      height: 2px;
      background: linear-gradient(90deg, transparent, var(--accent-1), var(--accent-2), transparent);
      margin: 30px 0;
    }

    /* Confirmation Modal - Better Contrast */
    .confirm-modal {
      max-width: 500px;
      width: 90%;
      margin: 0 auto;
    }

    .receipt-card {
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border-radius: var(--border-radius-xl);
      padding: clamp(25px, 4vw, 35px);
      border: 2px solid var(--accent-1);
      box-shadow: var(--shadow-lg);
    }

    .receipt-card h3 {
      color: var(--text-primary);
      font-size: 22px;
      font-weight: 800;
      margin-bottom: 20px;
      text-align: center;
    }

    .receipt-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 0;
      border-bottom: 1px dashed #d1d5db;
      font-size: clamp(14px, 2vw, 16px);
    }

    .receipt-row:last-child {
      border-bottom: none;
    }

    .receipt-label {
      font-weight: 600;
      color: var(--text-secondary);
    }

    .receipt-value {
      font-weight: 700;
      color: var(--accent-1);
      background: #eef2ff;
      padding: 4px 12px;
      border-radius: 20px;
    }

    .status-badge {
      display: inline-block;
      padding: 8px 18px;
      background: var(--warning-gradient);
      color: var(--text-dark);
      border-radius: 30px;
      font-size: 13px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }

    .dashboard-btn {
      padding: 16px 35px;
      background: var(--secondary-gradient);
      color: var(--text-white);
      border: none;
      border-radius: 50px;
      font-size: 17px;
      font-weight: 700;
      cursor: pointer;
      width: 100%;
      max-width: 300px;
      margin: 25px auto 0;
      display: block;
      transition: all 0.3s;
      box-shadow: 0 10px 20px rgba(30,60,114,0.3);
      text-shadow: 1px 1px 2px rgba(0,0,0,0.2);
    }

    .dashboard-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 30px rgba(30,60,114,0.4);
    }

    .dashboard-btn:active {
      transform: translateY(0);
    }

    /* Success Message */
    .receipt-card div[style*="background: #e8f0fe"] {
      background: linear-gradient(135deg, #dbeafe, #bfdbfe) !important;
      color: var(--text-primary) !important;
      border-radius: 16px !important;
      font-weight: 600 !important;
    }

    /* Animations */
    @keyframes slideDown {
      from {
        opacity: 0;
        transform: translateY(-20px);
      }
      to {
        opacity: 1;
        transform: translateY(0);
      }
    }

    /* Responsive Typography */
    @media (max-width: 480px) {
      .deposit-header h2 {
        font-size: 22px;
      }
      
      .form-field input,
      .form-field select {
        font-size: 15px;
        padding: 14px 16px;
      }
      
      .submit-btn {
        font-size: 18px;
        padding: 16px;
      }
      
      .receipt-card h3 {
        font-size: 20px;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .form-field input,
      .form-field select,
      .submit-btn {
        cursor: default;
        -webkit-tap-highlight-color: transparent;
      }
      
      .submit-btn:active {
        transform: scale(0.98);
      }
    }

    /* Print Styles */
    @media print {
      .deposit-container {
        background: white;
        padding: 20px;
      }
      
      .submit-btn,
      .hint-box {
        display: none;
      }
    }
  </style>
`;

  // ============================================================
  // 🧾 PAGE UI TEMPLATE - Fully Responsive
  // ============================================================

  setPageTitle('Submit Deposit', 'Submit monthly deposit with proper details.');

  const html = `
    ${styles}
    <div class="deposit-container">
      <div class="deposit-card">
        <div class="deposit-header">
          <h2>💰 Monthly Deposit Submission</h2>
          <p>Share Based Deposit • Auto-calculated amount</p>
        </div>

        <div class="deposit-form">
          <!-- Year, Month, Amount Grid -->
          <div class="form-grid">
            <div class="form-field">
              <label>Select Year</label>
              <select id="d_year">${yearOptions}</select>
            </div>

            <div class="form-field">
              <label>Select Month</label>
              <select id="d_month">${monthOptions}</select>
            </div>

            <div class="form-field">
              <label>Amount (Auto)</label>
              <input id="d_amount" value="${required}" disabled />
            </div>
          </div>

          <!-- Payment Method -->
          <div class="form-field" style="margin-bottom: 20px;">
            <label>Payment Method</label>
            <select id="d_method">
              <option value="Select Method">🔽 Select Payment Method</option>
              <option value="Bank Transfer">🏦 Bank Transfer</option>
              <option value="Cash">💵 Cash</option>
              <option value="Cash Deposit">🏧 Cash Deposit</option>
              <option value="Bkash">📱 Bkash</option>
              <option value="Rocket">🚀 Rocket</option>
            </select>
          </div>

          <!-- Bank Transfer Section -->
          <div id="bankFields" class="bank-section">
            <h4>Bank Transfer Details</h4>
            <div class="bank-grid">
              <div class="form-field">
                <label>From Bank</label>
                <select id="d_from_bank">
                  ${BANGLADESH_BANKS.map(b => `<option>${b}</option>`).join('')}
                </select>
              </div>
              <div class="form-field">
                <label>To Bank</label>
                <select id="d_to_bank">
                  ${BANGLADESH_BANKS.map(b => `<option>${b}</option>`).join('')}
                </select>
              </div>
            </div>
          </div>

          <!-- Transaction Details Grid -->
          <div class="form-grid">
            <div class="form-field">
              <label>Transaction ID</label>
              <input id="d_trx" placeholder="Enter TRX ID" />
            </div>
            <div class="form-field">
              <label>Deposit Date</label>
              <input id="d_date" type="date" value="${new Date().toISOString().split('T')[0]}" />
            </div>
          </div>

          <!-- File Upload & Notes Grid -->
          <div class="form-grid">
            <div class="form-field">
              <label>Deposit Slip</label>
              <input id="d_slip" type="file" accept="image/*" />
            </div>
            <div class="form-field">
              <label>Notes (Optional)</label>
              <input id="d_note" placeholder="Add any notes..." />
            </div>
          </div>

          <div class="divider"></div>

          <button class="submit-btn" id="submitDepositBtn">
            📤 Submit Deposit
          </button>

          <div class="hint-box">
            <strong>📌 Important Information</strong>
            <ul>
              <li>Deposit ID auto-generated (DP-${currentYear}-XXXXXX)</li>
              <li>Status will be PENDING until admin approval</li>
              <li>You'll be notified via email/WhatsApp once approved</li>
              <li>Keep your transaction ID for future reference</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;

  // Event Listeners
  const methodSelect = document.getElementById('d_method');
  if (methodSelect) {
    methodSelect.addEventListener('change', toggleBankFields);
  }

  const submitBtn = document.getElementById('submitDepositBtn');
  if (submitBtn) {
    submitBtn.addEventListener('click', () => validateDeposit(member, meta, required));
  }
}



// ============================================================
// 🏦 TOGGLE BANK FIELDS
// ============================================================

function toggleBankFields() {
  const method = document.getElementById('d_method')?.value;
  const bankFields = document.getElementById('bankFields');
  
  if (!bankFields) return;
  
  if (method === 'Bank Transfer') {
    bankFields.classList.add('show');
    bankFields.style.display = 'block';
  } else {
    bankFields.classList.remove('show');
    bankFields.style.display = 'none';
  }
}



// ============================================================
// ✅ VALIDATION BEFORE SUBMIT
// ============================================================

// member-deposit.js এর validateDeposit ফাংশন আপডেট করুন:

async function validateDeposit(member, meta, required) {
  const year = document.getElementById('d_year')?.value;
  const monthKey = document.getElementById('d_month')?.value;
  const method = document.getElementById('d_method')?.value;
  const trxId = document.getElementById('d_trx')?.value.trim();
  const date = document.getElementById('d_date')?.value;
  const slipFile = document.getElementById('d_slip')?.files?.[0]; // Get the slip file

  if (!year || !monthKey || !method || !trxId || !date || method === 'Select Method') {
    showToast('Validation Error', 'Please fill all required fields (*)', 'error');
    return;
  }

  // Extract month number from monthKey (YYYY-MM)
  const monthNum = monthKey.split('-')[1];
  const monthName = getMonthName(parseInt(monthNum, 10));

  // Show month name in confirmation modal
  const confirmHTML = `
    <div class="confirm-modal">
      <div class="receipt-card">
        <h3 style="text-align:center; color:#1e3c72; margin-bottom:20px;">📋 Confirm Deposit</h3>
        <div class="receipt-row">
          <span class="receipt-label">Member:</span>
          <span class="receipt-value">${member.name}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Month:</span>
          <span class="receipt-value">${monthName} ${year}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Amount:</span>
          <span class="receipt-value">${formatMoney(required)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Method:</span>
          <span class="receipt-value">${method}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">TRX ID:</span>
          <span class="receipt-value">${trxId}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Date:</span>
          <span class="receipt-value">${date}</span>
        </div>
      </div>
    </div>
  `;

  // Pass the slip file to the modal
  openDepositConfirmModal(confirmHTML, async () => {
    await confirmDepositSubmit(
      member_id,
      member,
      required,
      monthKey,
      method,
      trxId,
      date
    );
  }, slipFile); // Pass the slip file here
}

// ============================================================
// 💾 CONFIRM & SAVE DEPOSIT
// ============================================================

async function confirmDepositSubmit(
  member,
  required,
  monthKey,
  method,
  trxId,
  date
) {
  const db = getDatabase();

  // Extract year and month from monthKey
  const [year, monthNum] = monthKey.split('-');
  const monthName = getMonthName(parseInt(monthNum, 10));

  // Prevent duplicate deposit
  const existing = await db.query('deposits', [
    { field: 'memberId', operator: '==', value: member.id },
    { field: 'month', operator: '==', value: monthKey },
    { field: 'status', operator: 'in', value: ['PENDING', 'APPROVED'] }
  ]);

  if (existing.length > 0) {
    showToast('Duplicate Deposit', 'Deposit already exists for this month.', 'error');
    return;
  }

  // Convert Slip Image
  const slipFile = document.getElementById('d_slip')?.files?.[0];
  const slip = slipFile ? await fileToBase64(slipFile) : '';

  // Generate Deposit ID
  const deposits = await db.getAll('deposits') || [];
  const depositId = generateId('DP', deposits);

  const depositData = {
    id: depositId,
    memberId: member.id,
    year: year,
    month: monthName,
    monthKey: monthKey,
    amount: required,
    paymentMethod: method,
    trxId,
    slip,
    status: 'PENDING',
    depositDate: date,
    submittedAt: new Date().toISOString(),
    fromBank: method === 'Bank Transfer' ? document.getElementById('d_from_bank')?.value : '',
    toBank: method === 'Bank Transfer' ? document.getElementById('d_to_bank')?.value : '',
    note: document.getElementById('d_note')?.value.trim() || ''
  };

  await db.save('deposits', depositData, depositId);

  await logActivity(
    'SUBMIT_DEPOSIT',
    `Member submitted deposit ${depositId} for ${monthName} ${year}`
  );

  showToast('Success', 'Deposit submitted successfully!', 'success');
  showDepositReceipt(depositId, monthName, year);
  
  // Navigate back to dashboard after 2 seconds
  setTimeout(() => {
    if (window.navigateTo) {
      window.navigateTo('member_dashboard');
    }
  }, 2000);
}



// ============================================================
// 🧾 RECEIPT VIEWER - Mobile Optimized
// ============================================================

async function showDepositReceipt(depositId, monthName, year) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);

  const html = `
    <div class="confirm-modal">
      <div class="receipt-card">
        <div style="text-align: center; margin-bottom: 20px;">
          <div style="font-size: 60px; margin-bottom: 10px;">✅</div>
          <h3 style="color: #27ae60;">Deposit Submitted!</h3>
        </div>
        
        <div class="receipt-row">
          <span class="receipt-label">Deposit ID:</span>
          <span class="receipt-value">${deposit.id}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Month:</span>
          <span class="receipt-value">${monthName} ${year}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Amount:</span>
          <span class="receipt-value">${formatMoney(deposit.amount)}</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Status:</span>
          <span class="status-badge">⏳ PENDING</span>
        </div>
        <div class="receipt-row">
          <span class="receipt-label">Submitted:</span>
          <span class="receipt-value">${new Date(deposit.submittedAt).toLocaleString()}</span>
        </div>
        
        <div style="background: #e8f0fe; padding: 15px; border-radius: 12px; margin: 20px 0; text-align: center;">
          ⏳ Please wait for admin approval.<br/>
          You will be notified once approved.
        </div>
        
        <button class="dashboard-btn" onclick="window.navigateTo('member_dashboard')">
          Go to Dashboard
        </button>
      </div>
    </div>
  `;

  openViewerModal('Deposit Submitted', '', html);
}
