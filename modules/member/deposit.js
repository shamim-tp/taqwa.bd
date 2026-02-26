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
 * - Build dynamic dropdown
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
  const currentMonthNum = new Date().getMonth() + 1;

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
  // 📅 MONTH DROPDOWN GENERATION
  // ============================================================

  let monthOptions = '';
  for (let m = 1; m <= 12; m++) {

    const monthKey = `${currentYear}-${String(m).padStart(2, '0')}`;
    const monthName = getMonthName(m);

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

        <!-- Month Selection -->
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

  openDepositConfirmModal(`
    <div class="panel">
      <h3>Confirm Deposit</h3>
      <div class="row"><b>Member:</b> ${member.name}</div>
      <div class="row"><b>Month:</b> ${monthKey}</div>
      <div class="row"><b>Amount:</b> ${formatMoney(required)}</div>
      <div class="row"><b>Method:</b> ${method}</div>
      <div class="row"><b>TRX ID:</b> ${trxId}</div>
      <div class="row"><b>Date:</b> ${date}</div>
    </div>
  `, async () => {

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
  month,
  method,
  trxId,
  date
) {

  const db = getDatabase();

  // Prevent duplicate deposit
  const existing = await db.query('deposits', [
    { field: 'memberId', operator: '==', value: member.id },
    { field: 'month', operator: '==', value: month },
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
    month,
    amount: required,
    paymentMethod: method,
    trxId,
    slip,
    status: 'PENDING',
    depositDate: date,
    submittedAt: new Date().toISOString()
  };

  await db.save('deposits', depositData, depositId);

  await logActivity(
    'SUBMIT_DEPOSIT',
    `Member submitted deposit ${depositId}`
  );

  showToast('Success', 'Deposit submitted successfully.');

  showDepositReceipt(depositId);
}



// ============================================================
// 🧾 RECEIPT VIEWER
// ============================================================

async function showDepositReceipt(depositId) {

  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);

  const html = `
    <div class="panel">
      <h3>Deposit Submitted Successfully</h3>
      <div class="row"><b>Deposit ID:</b> ${deposit.id}</div>
      <div class="row"><b>Status:</b> PENDING</div>
      <div class="row"><b>Submitted:</b>
        ${new Date(deposit.submittedAt).toLocaleString()}
      </div>
      <div class="hint">
        Please wait for admin approval.
      </div>
    </div>
  `;

  openViewerModal('Deposit Submitted', '', html);
}
