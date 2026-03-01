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
  
  const styles = `
    <style>
      /* CSS Variables for consistent theming */
      :root {
        --primary-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        --secondary-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
        --success-gradient: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
        --warning-gradient: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
        --shadow-sm: 0 5px 15px rgba(0,0,0,0.05);
        --shadow-md: 0 10px 25px rgba(0,0,0,0.1);
        --shadow-lg: 0 15px 35px rgba(0,0,0,0.15);
        --border-radius-sm: 12px;
        --border-radius-md: 16px;
        --border-radius-lg: 20px;
        --border-radius-xl: 24px;
        --border-radius-xxl: 30px;
      }

      /* Mobile-First Container */
      .deposit-container {
        width: 100%;
        max-width: 1400px;
        margin: 0 auto;
        padding: clamp(12px, 3vw, 25px);
        background: linear-gradient(135deg, #f5f7fa 0%, #e9edf5 100%);
        min-height: 100vh;
      }

      /* Main Card */
      .deposit-card {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
        border-radius: clamp(20px, 4vw, 30px);
        box-shadow: var(--shadow-lg);
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.2);
        transition: all 0.3s ease;
      }

      .deposit-card:hover {
        transform: translateY(-5px);
        box-shadow: 0 20px 40px rgba(0,0,0,0.15);
      }

      /* Header Section */
      .deposit-header {
        padding: clamp(20px, 4vw, 30px);
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        position: relative;
        overflow: hidden;
      }

      .deposit-header::before {
        content: '💰';
        position: absolute;
        right: -20px;
        bottom: -20px;
        font-size: 120px;
        opacity: 0.1;
        transform: rotate(-15deg);
      }

      .deposit-header h2 {
        font-size: clamp(20px, 4vw, 28px);
        font-weight: 700;
        margin-bottom: 8px;
        letter-spacing: -0.5px;
        position: relative;
        z-index: 1;
      }

      .deposit-header p {
        font-size: clamp(13px, 2vw, 15px);
        opacity: 0.95;
        position: relative;
        z-index: 1;
      }

      /* Form Section */
      .deposit-form {
        padding: clamp(20px, 4vw, 35px);
      }

      /* Responsive Grid */
      .form-grid {
        display: grid;
        gap: clamp(16px, 3vw, 25px);
        margin-bottom: 25px;
      }

      /* Grid breakpoints */
      @media (min-width: 640px) {
        .form-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      @media (min-width: 1024px) {
        .form-grid {
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
        color: #1e3c72;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        display: flex;
        align-items: center;
        gap: 5px;
      }

      .form-field label::before {
        content: '●';
        color: #667eea;
        font-size: 8px;
      }

      .form-field input,
      .form-field select {
        width: 100%;
        padding: clamp(12px, 2.5vw, 16px) clamp(14px, 3vw, 18px);
        border: 2px solid #e0e0e0;
        border-radius: var(--border-radius-md);
        font-size: clamp(14px, 2vw, 16px);
        transition: all 0.3s ease;
        background: white;
        -webkit-appearance: none;
        appearance: none;
        cursor: pointer;
      }

      .form-field input:focus,
      .form-field select:focus {
        border-color: #667eea;
        outline: none;
        box-shadow: 0 0 0 4px rgba(102,126,234,0.1);
      }

      .form-field input:disabled {
        background: #f8f9fa;
        border-color: #ddd;
        color: #666;
        cursor: not-allowed;
      }

      /* File Input */
      .form-field input[type="file"] {
        padding: 10px;
        background: #f8f9fa;
        border: 2px dashed #667eea;
        cursor: pointer;
      }

      .form-field input[type="file"]::-webkit-file-upload-button {
        padding: 8px 16px;
        background: var(--primary-gradient);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        margin-right: 10px;
        font-weight: 600;
      }

      /* Bank Transfer Section */
      .bank-section {
        background: linear-gradient(135deg, #f8f9fa, #ffffff);
        border-radius: var(--border-radius-lg);
        padding: clamp(16px, 3vw, 25px);
        margin: 20px 0;
        border: 2px solid #667eea;
        display: none;
        animation: slideDown 0.3s ease;
      }

      .bank-section.show {
        display: block;
      }

      .bank-section h4 {
        color: #1e3c72;
        font-size: clamp(14px, 2.2vw, 16px);
        margin-bottom: 15px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .bank-section h4::before {
        content: '🏦';
        font-size: 18px;
      }

      .bank-grid {
        display: grid;
        gap: 16px;
      }

      @media (min-width: 640px) {
        .bank-grid {
          grid-template-columns: repeat(2, 1fr);
        }
      }

      /* Submit Button */
      .submit-btn {
        width: 100%;
        padding: clamp(16px, 3vw, 20px);
        background: var(--primary-gradient);
        color: white;
        border: none;
        border-radius: var(--border-radius-xxl);
        font-size: clamp(16px, 2.5vw, 20px);
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s ease;
        box-shadow: 0 10px 25px rgba(102,126,234,0.4);
        margin: 25px 0 20px;
        position: relative;
        overflow: hidden;
      }

      .submit-btn::before {
        content: '';
        position: absolute;
        top: 0;
        left: -100%;
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        transition: left 0.5s ease;
      }

      .submit-btn:hover::before {
        left: 100%;
      }

      .submit-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 35px rgba(102,126,234,0.5);
      }

      .submit-btn:active {
        transform: translateY(0);
      }

      /* Hint Box */
      .hint-box {
        background: linear-gradient(135deg, #e8f0fe, #d4e0fc);
        border-radius: var(--border-radius-lg);
        padding: clamp(16px, 3vw, 20px);
        border-left: 5px solid #667eea;
        margin-top: 20px;
      }

      .hint-box strong {
        color: #1e3c72;
        font-size: clamp(14px, 2.2vw, 16px);
        display: flex;
        align-items: center;
        gap: 8px;
        margin-bottom: 10px;
      }

      .hint-box ul {
        list-style: none;
        padding: 0;
      }

      .hint-box li {
        color: #2c3e50;
        font-size: clamp(12px, 2vw, 14px);
        margin-bottom: 8px;
        display: flex;
        align-items: center;
        gap: 8px;
      }

      .hint-box li::before {
        content: '✓';
        color: #27ae60;
        font-weight: 700;
      }

      /* Divider */
      .divider {
        height: 2px;
        background: linear-gradient(90deg, transparent, #667eea, transparent);
        margin: 25px 0;
      }

      /* Confirmation Modal */
      .confirm-modal {
        max-width: 500px;
        width: 90%;
        margin: 0 auto;
      }

      .receipt-card {
        background: linear-gradient(135deg, #ffffff, #f8f9fa);
        border-radius: var(--border-radius-lg);
        padding: clamp(20px, 4vw, 30px);
        border: 2px solid #667eea;
        box-shadow: var(--shadow-md);
      }

      .receipt-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px dashed #e0e0e0;
        font-size: clamp(13px, 2vw, 15px);
      }

      .receipt-row:last-child {
        border-bottom: none;
      }

      .receipt-label {
        font-weight: 600;
        color: #1e3c72;
      }

      .receipt-value {
        font-weight: 700;
        color: #667eea;
      }

      .status-badge {
        display: inline-block;
        padding: 6px 16px;
        background: #fff3cd;
        color: #856404;
        border-radius: 30px;
        font-size: 12px;
        font-weight: 700;
        border: 1px solid #ffeeba;
      }

      .dashboard-btn {
        padding: 14px 30px;
        background: var(--secondary-gradient);
        color: white;
        border: none;
        border-radius: 40px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        max-width: 300px;
        margin: 20px auto 0;
        display: block;
        transition: all 0.3s;
        box-shadow: 0 10px 20px rgba(30,60,114,0.3);
      }

      .dashboard-btn:hover {
        transform: translateY(-3px);
        box-shadow: 0 15px 30px rgba(30,60,114,0.4);
      }

      .dashboard-btn:active {
        transform: translateY(0);
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

      @keyframes fadeIn {
        from {
          opacity: 0;
        }
        to {
          opacity: 1;
        }
      }

      /* Loading State */
      .loading-skeleton {
        background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
        background-size: 200% 100%;
        animation: loading 1.5s infinite;
        border-radius: 8px;
        height: 20px;
      }

      @keyframes loading {
        0% { background-position: 200% 0; }
        100% { background-position: -200% 0; }
      }

      /* Responsive Typography */
      @media (max-width: 480px) {
        .deposit-header h2 {
          font-size: 20px;
        }
        
        .form-field input,
        .form-field select {
          font-size: 14px;
          padding: 12px 14px;
        }
        
        .submit-btn {
          font-size: 16px;
          padding: 14px;
        }
      }

      /* Landscape Mode */
      @media (max-height: 600px) and (orientation: landscape) {
        .deposit-container {
          padding: 10px;
        }
        
        .form-grid {
          gap: 12px;
        }
        
        .submit-btn {
          margin: 15px 0;
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

      /* High Resolution Screens */
      @media (min-width: 1920px) {
        .deposit-container {
          max-width: 1600px;
        }
        
        .form-field label {
          font-size: 15px;
        }
        
        .form-field input,
        .form-field select {
          font-size: 17px;
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

async function validateDeposit(member, meta, required) {
  const year = document.getElementById('d_year')?.value;
  const monthKey = document.getElementById('d_month')?.value;
  const method = document.getElementById('d_method')?.value;
  const trxId = document.getElementById('d_trx')?.value.trim();
  const date = document.getElementById('d_date')?.value;

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

  openDepositConfirmModal(confirmHTML, async () => {
    await confirmDepositSubmit(
      member,
      required,
      monthKey,
      method,
      trxId,
      date
    );
  });
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
