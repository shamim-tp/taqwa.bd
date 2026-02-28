// ============================================================
// 🏦 MEMBER DEPOSIT MODULE
// IMS ERP V5
// Monthly Share Based Deposit Submission System - Mobile Optimized
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
  // 🎨 MOBILE-FIRST STYLES
  // ============================================================
  
  const styles = `
    <style>
      /* Mobile-First Deposit Form */
      .deposit-container {
        padding: 16px;
        background: #f8fafc;
        min-height: 100vh;
      }

      /* Form Panel */
      .deposit-panel {
        background: white;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 10px 30px rgba(0,0,0,0.08);
        margin-bottom: 20px;
      }

      .deposit-header {
        padding: 20px;
        border-bottom: 1px solid #eee;
        background: linear-gradient(to right, #f8f9fa, #ffffff);
      }

      .deposit-header h3 {
        margin: 0;
        color: #1e3c72;
        font-size: 20px;
        font-weight: 700;
      }

      .deposit-header p {
        margin: 8px 0 0;
        color: #666;
        font-size: 13px;
      }

      .deposit-form {
        padding: 20px;
      }

      /* Form Grid - Mobile First */
      .form-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 16px;
        margin-bottom: 16px;
      }

      @media (min-width: 640px) {
        .form-grid {
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
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
        gap: 6px;
      }

      .form-field label {
        font-size: 13px;
        font-weight: 600;
        color: #1e3c72;
        text-transform: uppercase;
        letter-spacing: 0.3px;
      }

      .form-field input,
      .form-field select {
        padding: 14px 16px;
        border: 2px solid #e0e0e0;
        border-radius: 16px;
        font-size: 15px;
        transition: all 0.3s;
        background: white;
        width: 100%;
        -webkit-appearance: none;
        appearance: none;
      }

      .form-field input:focus,
      .form-field select:focus {
        border-color: #667eea;
        outline: none;
        box-shadow: 0 0 0 3px rgba(102,126,234,0.1);
      }

      .form-field input:disabled {
        background: #f5f5f5;
        border-color: #ddd;
        color: #666;
      }

      /* File Input */
      .form-field input[type="file"] {
        padding: 10px 16px;
        background: #f8f9fa;
        border: 2px dashed #667eea;
      }

      /* Bank Transfer Section */
      .bank-fields {
        display: none;
        background: #f8f9fa;
        padding: 20px;
        border-radius: 20px;
        margin: 20px 0;
        border: 2px solid #667eea;
      }

      .bank-fields.show {
        display: block;
      }

      .bank-grid {
        display: grid;
        grid-template-columns: 1fr;
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
        padding: 18px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 50px;
        font-size: 18px;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.3s;
        box-shadow: 0 10px 20px rgba(102,126,234,0.3);
        margin: 20px 0 15px;
        -webkit-appearance: none;
        appearance: none;
      }

      .submit-btn:active {
        transform: scale(0.98);
        box-shadow: 0 5px 10px rgba(102,126,234,0.3);
      }

      @media (min-width: 768px) {
        .submit-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(102,126,234,0.4);
        }
      }

      /* Hint Text */
      .hint-box {
        background: #e8f0fe;
        padding: 16px;
        border-radius: 16px;
        font-size: 13px;
        color: #1e3c72;
        line-height: 1.6;
        border-left: 4px solid #667eea;
      }

      .hint-box ul {
        margin: 10px 0 0 20px;
      }

      .hint-box li {
        margin-bottom: 5px;
      }

      /* Divider */
      .divider {
        height: 2px;
        background: linear-gradient(90deg, transparent, #667eea, transparent);
        margin: 25px 0;
      }

      /* Responsive adjustments */
      @media (max-width: 480px) {
        .deposit-header h3 {
          font-size: 18px;
        }
        
        .form-field input,
        .form-field select {
          padding: 12px 14px;
          font-size: 14px;
        }
        
        .submit-btn {
          padding: 16px;
          font-size: 16px;
        }
      }

      /* Success Receipt Modal */
      .receipt-modal {
        text-align: center;
      }

      .receipt-card {
        background: linear-gradient(135deg, #f8f9fa, #ffffff);
        padding: 25px;
        border-radius: 24px;
        margin: 20px 0;
        border: 2px solid #667eea;
      }

      .receipt-row {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 12px 0;
        border-bottom: 1px dashed #ddd;
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
        border-radius: 40px;
        font-size: 13px;
        font-weight: 600;
      }

      .dashboard-btn {
        padding: 14px 30px;
        background: linear-gradient(135deg, #1e3c72, #2a5298);
        color: white;
        border: none;
        border-radius: 40px;
        font-size: 16px;
        font-weight: 600;
        cursor: pointer;
        width: 100%;
        max-width: 300px;
        margin: 20px auto 0;
      }
    </style>
  `;


  // ============================================================
  // 🧾 PAGE UI TEMPLATE - Mobile Optimized
  // ============================================================

  setPageTitle('Submit Deposit', 'Submit monthly deposit with proper details.');

  const html = `
    ${styles}
    <div class="deposit-container">

      <div class="deposit-panel">
        <div class="deposit-header">
          <h3>💰 Monthly Deposit Submission</h3>
          <p>Share Based Deposit. Required amount auto calculated.</p>
        </div>

        <div class="deposit-form">
          <!-- Year, Month, Amount Row -->
          <div class="form-grid">
            <div class="form-field">
              <label>Select Year *</label>
              <select id="d_year">${yearOptions}</select>
            </div>

            <div class="form-field">
              <label>Select Month *</label>
              <select id="d_month">${monthOptions}</select>
            </div>

            <div class="form-field">
              <label>Amount (Auto)</label>
              <input id="d_amount" value="${required}" disabled />
            </div>
          </div>

          <!-- Payment Method -->
          <div class="form-field" style="margin-bottom: 16px;">
            <label>Payment Method *</label>
            <select id="d_method">
              <option value="Select Method">Select Method</option>
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Cash">Cash</option>
              <option value="Cash Deposit">Cash Deposit</option>
              <option value="Bkash">Bkash</option>
              <option value="Rocket">Rocket</option>
            </select>
          </div>

          <!-- Bank Transfer Section -->
          <div id="bankFields" class="bank-fields">
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

          <!-- TRX & Date Row -->
          <div class="form-grid">
            <div class="form-field">
              <label>Transaction ID *</label>
              <input id="d_trx" placeholder="Enter TRX ID" />
            </div>
            <div class="form-field">
              <label>Deposit Date *</label>
              <input id="d_date" type="date"
                value="${new Date().toISOString().split('T')[0]}" />
            </div>
          </div>

          <!-- Slip Upload & Notes Row -->
          <div class="form-grid">
            <div class="form-field">
              <label>Deposit Slip Upload</label>
              <input id="d_slip" type="file" accept="image/*" />
            </div>
            <div class="form-field">
              <label>Notes</label>
              <input id="d_note" placeholder="Optional note..." />
            </div>
          </div>

          <div class="divider"></div>

          <button class="submit-btn" id="submitDepositBtn">
            Submit Deposit
          </button>

          <div class="hint-box">
            <strong>ℹ️ Information</strong>
            <ul>
              <li>✔ Deposit ID auto-generated (Example: DP-${currentYear}-000001)</li>
              <li>✔ After submission, status = PENDING until admin approval</li>
              <li>✔ You'll be notified once approved</li>
            </ul>
          </div>
        </div>
      </div>

    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;

  // Event Listeners
  document.getElementById('d_method')
    .addEventListener('change', toggleBankFields);

  document.getElementById('submitDepositBtn')
    .addEventListener('click', () =>
      validateDeposit(member, meta, required)
    );
}



// ============================================================
// 🏦 TOGGLE BANK FIELDS
// ============================================================

function toggleBankFields() {

  const method = document.getElementById('d_method').value;
  const bankFields = document.getElementById('bankFields');

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

  const year = document.getElementById('d_year').value;
  const monthKey = document.getElementById('d_month').value;
  const method = document.getElementById('d_method').value;
  const trxId = document.getElementById('d_trx').value.trim();
  const date = document.getElementById('d_date').value;

  if (!year || !monthKey || !method || !trxId || !date || method === 'Select Method') {
    showToast('Validation Error', 'Please fill all required fields (*)');
    return;
  }

  // Extract month number from monthKey (YYYY-MM)
  const monthNum = monthKey.split('-')[1];
  const monthName = getMonthName(parseInt(monthNum, 10));

  // Show month name in confirmation modal with mobile-optimized styling
  const confirmHTML = `
    <div class="deposit-container" style="padding: 0;">
      <div class="deposit-panel">
        <div class="deposit-header">
          <h3>📋 Confirm Deposit</h3>
          <p>Please verify your information</p>
        </div>
        <div class="deposit-form">
          <div class="receipt-card" style="margin: 0 0 20px 0;">
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
      </div>
    </div>
  `;

  openDepositConfirmModal(confirmHTML, async () => {
    await confirmDepositSubmit(
      member,
      required,
      monthKey, // Store as YYYY-MM in database
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
  monthKey, // Format: YYYY-MM
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
    { field: 'month', operator: '==', value: monthKey }, // Compare with YYYY-MM
    { field: 'status', operator: 'in', value: ['PENDING', 'APPROVED'] }
  ]);

  if (existing.length > 0) {
    showToast('Duplicate Deposit', 'Deposit already exists for this month.');
    return;
  }

  // Convert Slip Image
  const slipFile = document.getElementById('d_slip').files[0];
  const slip = slipFile ? await fileToBase64(slipFile) : '';

  // Generate Deposit ID
  const deposits = await db.getAll('deposits') || [];
  const depositId = generateId('DP', deposits);

  const depositData = {
    id: depositId,
    memberId: member.id,
    year: year, // Store year separately for MR generation
    month: monthName, // Store month name for display
    monthKey: monthKey, // Store YYYY-MM for queries
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

  showToast('Success', 'Deposit submitted successfully.');

  showDepositReceipt(depositId, monthName, year);
  
  // Navigate back to dashboard after 2 seconds
  setTimeout(() => {
    window.navigateTo('member_dashboard');
  }, 2000);
}



// ============================================================
// 🧾 RECEIPT VIEWER - Mobile Optimized
// ============================================================

async function showDepositReceipt(depositId, monthName, year) {

  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);

  const html = `
    <div class="deposit-container" style="padding: 0;">
      <div class="deposit-panel">
        <div class="deposit-header" style="text-align: center;">
          <h3>✅ Deposit Submitted Successfully!</h3>
          <p>Your deposit has been recorded</p>
        </div>
        
        <div class="deposit-form">
          <div class="receipt-card">
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
              <span class="status-badge">PENDING</span>
            </div>
            <div class="receipt-row">
              <span class="receipt-label">Submitted:</span>
              <span class="receipt-value">${new Date(deposit.submittedAt).toLocaleString()}</span>
            </div>
          </div>
          
          <div class="hint-box" style="margin: 20px 0; text-align: center;">
            ⏳ Please wait for admin approval.<br/>
            You will be notified once your deposit is approved.
          </div>
          
          <button class="dashboard-btn" onclick="window.navigateTo('member_dashboard')">
            Go to Dashboard
          </button>
        </div>
      </div>
    </div>
  `;

  openViewerModal('Deposit Submitted', '', html);
}
