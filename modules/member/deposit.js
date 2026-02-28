// ============================================================
// 🏦 MEMBER DEPOSIT MODULE
// IMS ERP V5
// Monthly Share Based Deposit Submission System
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
  // 🧾 PAGE UI TEMPLATE
  // ============================================================

  setPageTitle('Submit Deposit', 'Submit monthly deposit with proper details.');

  const html = `
    <div class="panel">

      <div class="panelHeader">
        <div>
          <h3>Monthly Deposit Submission</h3>
          <p>Share Based Deposit. Required amount auto calculated.</p>
        </div>
      </div>

      <div class="row row-3">

        <!-- Year Selection -->
        <div>
          <label>Select Year *</label>
          <select id="d_year">${yearOptions}</select>
        </div>

        <!-- Month Selection (Shows Month Name) -->
        <div>
          <label>Select Month *</label>
          <select id="d_month">${monthOptions}</select>
        </div>

        <!-- Auto Calculated Amount -->
        <div>
          <label>Amount (Auto)</label>
          <input id="d_amount" value="${required}" disabled />
        </div>

        <!-- Payment Method -->
        <div>
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

      </div>


      <!-- Bank Transfer Section -->
      <div id="bankFields" style="display:none;">
        <div class="row row-2">
          <div>
            <label>From Bank</label>
            <select id="d_from_bank">
              ${BANGLADESH_BANKS.map(b => `<option>${b}</option>`).join('')}
            </select>
          </div>
          <div>
            <label>To Bank</label>
            <select id="d_to_bank">
              ${BANGLADESH_BANKS.map(b => `<option>${b}</option>`).join('')}
            </select>
          </div>
        </div>
      </div>


      <!-- TRX & Date -->
      <div class="row row-2">
        <div>
          <label>Transaction ID *</label>
          <input id="d_trx" placeholder="Enter TRX ID" />
        </div>
        <div>
          <label>Deposit Date *</label>
          <input id="d_date" type="date"
            value="${new Date().toISOString().split('T')[0]}" />
        </div>
      </div>


      <!-- Slip Upload -->
      <div class="row row-2">
        <div>
          <label>Deposit Slip Upload</label>
          <input id="d_slip" type="file" accept="image/*" />
        </div>
        <div>
          <label>Notes</label>
          <input id="d_note" placeholder="Optional note..." />
        </div>
      </div>

      <div class="hr"></div>

      <button class="btn success" id="submitDepositBtn">
        Submit Deposit
      </button>

      <div class="hint">
        ✔ Deposit ID auto-generated (Example: DP-${currentYear}-000001)<br/>
        ✔ After submission, status = PENDING until admin approval.
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

  bankFields.style.display =
    method == 'Bank Transfer' ? 'block' : 'none';
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

  if (!year || !monthKey || !method || !trxId || !date) {
    showToast('Validation Error', 'Please fill all required fields (*)');
    return;
  }

  // Extract month number from monthKey (YYYY-MM)
  const monthNum = monthKey.split('-')[1];
  const monthName = getMonthName(parseInt(monthNum, 10));

  // Show month name in confirmation modal
  openDepositConfirmModal(`
    <div class="panel">
      <h3>Confirm Deposit</h3>
      <div class="row"><b>Member:</b> ${member.name}</div>
      <div class="row"><b>Month:</b> ${monthName} ${year}</div>
      <div class="row"><b>Amount:</b> ${formatMoney(required)}</div>
      <div class="row"><b>Method:</b> ${method}</div>
      <div class="row"><b>TRX ID:</b> ${trxId}</div>
      <div class="row"><b>Date:</b> ${date}</div>
    </div>
  `, async () => {

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
// 🧾 RECEIPT VIEWER
// ============================================================

async function showDepositReceipt(depositId, monthName, year) {

  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);

  const html = `
    <div class="panel">
      <h3>✅ Deposit Submitted Successfully</h3>
      
      <div style="background: var(--bg-secondary); padding: 20px; border-radius: 12px; margin: 20px 0;">
        <div class="row" style="justify-content: space-between; margin-bottom: 15px;">
          <div><strong>Deposit ID:</strong></div>
          <div>${deposit.id}</div>
        </div>
        <div class="row" style="justify-content: space-between; margin-bottom: 15px;">
          <div><strong>Month:</strong></div>
          <div>${monthName} ${year}</div>
        </div>
        <div class="row" style="justify-content: space-between; margin-bottom: 15px;">
          <div><strong>Amount:</strong></div>
          <div>${formatMoney(deposit.amount)}</div>
        </div>
        <div class="row" style="justify-content: space-between; margin-bottom: 15px;">
          <div><strong>Status:</strong></div>
          <div><span class="status st-pending">PENDING</span></div>
        </div>
        <div class="row" style="justify-content: space-between;">
          <div><strong>Submitted:</strong></div>
          <div>${new Date(deposit.submittedAt).toLocaleString()}</div>
        </div>
      </div>
      
      <div class="hint" style="text-align: center; padding: 15px;">
        ⏳ Please wait for admin approval.<br/>
        You will be notified once your deposit is approved.
      </div>
      
      <div style="text-align: center; margin-top: 20px;">
        <button class="btn" onclick="window.navigateTo('member_dashboard')">
          Go to Dashboard
        </button>
      </div>
    </div>
  `;

  openViewerModal('Deposit Submitted', '', html);
}
