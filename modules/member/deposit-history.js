// ============================================================
// 📜 MEMBER DEPOSIT HISTORY MODULE
// IMS ERP V5
// Shows all deposits of logged-in member
// ============================================================


// ============================================================
// 📦 IMPORTS
// ============================================================

import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle } from '../auth/session.js';
import { showToast, formatMoney } from '../utils/common.js';
import { openMRReceiptModal } from '../modals/mr-receipt.js';
import { openViewerModal } from '../modals/viewer.js';



// ============================================================
// 🎯 MAIN RENDER FUNCTION
// ============================================================

/**
 * Render Deposit History Page
 * - Fetch deposits from DB
 * - Sort by latest first
 * - Render table
 * - Attach dynamic event listeners
 */
export async function renderMemberDepositHistory() {

  const user = getCurrentUser();
  if (!user) return;

  const db = getDatabase();

  // Fetch deposits of current member
  const deposits = await db.query('deposits', [
    { field: 'memberId', operator: '==', value: user.id }
  ]) || [];

  // Sort by submitted date (latest first)
  deposits.sort((a, b) =>
    new Date(b.submittedAt || b.depositDate) -
    new Date(a.submittedAt || a.depositDate)
  );

  setPageTitle(
    'Deposit History',
    'Your full deposit history with status and MR ID.'
  );



  // ============================================================
  // 🧾 TABLE UI TEMPLATE
  // ============================================================

  const html = `
    <div class="panel">

      <div class="panelHeader">
        <div>
          <h3>My Deposits</h3>
          <p>Pending / Approved / Rejected history.</p>
        </div>
      </div>

      <table>
        <thead>
          <tr>
            <th>Deposit ID</th>
            <th>Month</th>
            <th>Amount</th>
            <th>Payment Method</th>
            <th>Status</th>
            <th>MR ID</th>
            <th>Tools</th>
          </tr>
        </thead>

        <tbody>

          ${
            deposits.map(d => `
              <tr>

                <td>${d.id}</td>

                <td>${d.month}</td>

                <td>${formatMoney(d.amount)}</td>

                <td>${d.paymentMethod}</td>

                <td>
                  <span class="status ${
                    d.status == 'PENDING'
                      ? 'st-pending'
                      : d.status == 'APPROVED'
                        ? 'st-approved'
                        : 'st-rejected'
                  }">
                    ${d.status}
                  </span>
                </td>

                <td>${d.mrId || '-'}</td>

                <td>
                  ${
                    d.status == 'APPROVED' && d.mrId
                      ? `<button class="btn view-mr-receipt" data-id="${d.id}">
                          View MR
                        </button>`
                      : `<button class="btn view-deposit-slip" data-id="${d.id}">
                          View Slip
                        </button>`
                  }
                </td>

              </tr>
            `).join('')
            ||
            `<tr>
              <td colspan="7" class="small">
                No deposits found.
              </td>
            </tr>`
          }

        </tbody>
      </table>

    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;



  // ============================================================
  // 🎯 DYNAMIC BUTTON EVENT BINDING
  // ============================================================

  document.querySelectorAll('.view-mr-receipt')
    .forEach(btn => {
      btn.addEventListener('click', () =>
        viewMRReceipt(btn.dataset.id)
      );
    });

  document.querySelectorAll('.view-deposit-slip')
    .forEach(btn => {
      btn.addEventListener('click', () =>
        viewSlip(btn.dataset.id)
      );
    });
}



// ============================================================
// 🧾 VIEW MR RECEIPT
// ============================================================

/**
 * Open MR receipt modal
 */
async function viewMRReceipt(depositId) {

  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);

  if (!deposit || !deposit.mrId) {
    showToast('Error', 'No MR ID found for this deposit');
    return;
  }

  const member = await db.get('members', deposit.memberId);
  const meta = await db.get('meta', 'system') || {};

  openMRReceiptModal(deposit, member, meta);
}



// ============================================================
// 🖼 VIEW DEPOSIT SLIP
// ============================================================

/**
 * Open Slip Image Preview Modal
 */
async function viewSlip(depositId) {

  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);

  if (!deposit) return;

  const html = `
    <div class="panel">

      <h3>Deposit Slip Preview</h3>

      <p class="small">
        Deposit ID: ${deposit.id} |
        Member: ${deposit.memberId}
      </p>

      <div class="hr"></div>

      ${
        deposit.slip
          ? `<img src="${deposit.slip}"
              style="width:100%;
                     max-width:700px;
                     border-radius:18px;
                     border:1px solid var(--line);" />`
          : '<p>No slip uploaded</p>'
      }

    </div>
  `;

  openViewerModal(
    'Deposit Slip',
    'Slip image preview',
    html
  );
}
