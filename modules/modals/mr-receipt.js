// ============================================================
// 📄 MR RECEIPT MODAL MODULE
// IMS ERP V5
// Money Receipt Viewer Modal - COMPLETE VERSION
// ============================================================

import { openModal, closeModal } from './modals.js';
import { formatMoney, numberToWords } from '../utils/common.js';

// ============================================================
// 🎨 MR RECEIPT STYLES
// ============================================================

const mrReceiptStyles = `
  <style>
    .receipt-container {
      max-width: 700px;
      margin: 0 auto;
      background: white;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
    }

    .receipt-header {
      background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      color: white;
      padding: 30px;
      text-align: center;
      position: relative;
    }

    .receipt-header::after {
      content: "💰";
      position: absolute;
      right: 20px;
      top: 20px;
      font-size: 60px;
      opacity: 0.1;
    }

    .receipt-header h2 {
      margin: 0;
      font-size: 28px;
      font-weight: 800;
      letter-spacing: 1px;
    }

    .receipt-header p {
      margin: 8px 0 0;
      opacity: 0.9;
      font-size: 14px;
    }

    .receipt-body {
      padding: 30px;
    }

    .receipt-info {
      background: #f8f9fa;
      border-radius: 20px;
      padding: 20px;
      margin-bottom: 25px;
      border: 1px solid #e9ecef;
    }

    .info-row {
      display: flex;
      justify-content: space-between;
      padding: 12px 0;
      border-bottom: 1px dashed #dee2e6;
    }

    .info-row:last-child {
      border-bottom: none;
    }

    .info-label {
      font-weight: 600;
      color: #1e3c72;
      font-size: 14px;
    }

    .info-value {
      font-weight: 700;
      color: #2a5298;
      font-size: 14px;
    }

    .amount-words {
      background: linear-gradient(135deg, #e8f0fe, #d4e0fc);
      border-radius: 16px;
      padding: 20px;
      text-align: center;
      margin: 20px 0;
      border-left: 5px solid #1e3c72;
    }

    .amount-words h3 {
      color: #1e3c72;
      font-size: 18px;
      margin-bottom: 10px;
    }

    .amount-words p {
      color: #2a5298;
      font-size: 16px;
      font-weight: 600;
      line-height: 1.6;
    }

    .amount-number {
      text-align: center;
      margin: 30px 0;
    }

    .amount-number .big {
      font-size: 48px;
      font-weight: 800;
      color: #27ae60;
      line-height: 1.2;
    }

    .amount-number .small {
      color: #666;
      font-size: 14px;
      margin-top: 5px;
    }

    .signature-section {
      display: flex;
      justify-content: space-between;
      margin: 40px 0 20px;
      padding-top: 20px;
      border-top: 2px dashed #dee2e6;
    }

    .signature-box {
      text-align: center;
      flex: 1;
    }

    .signature-line {
      width: 80%;
      height: 2px;
      background: #333;
      margin: 0 auto 10px;
    }

    .signature-label {
      color: #666;
      font-size: 12px;
    }

    .signature-name {
      font-weight: 600;
      color: #1e3c72;
      font-size: 14px;
      margin-bottom: 5px;
    }

    .footer-note {
      text-align: center;
      color: #999;
      font-size: 11px;
      margin-top: 30px;
      padding-top: 20px;
      border-top: 1px solid #eee;
    }

    .approval-badge {
      background: #d4edda;
      color: #155724;
      padding: 10px 20px;
      border-radius: 50px;
      display: inline-block;
      font-weight: 700;
      font-size: 13px;
      margin: 10px 0;
      border: 1px solid #c3e6cb;
    }

    .print-btn {
      background: linear-gradient(135deg, #1e3c72, #2a5298);
      color: white;
      border: none;
      border-radius: 50px;
      padding: 12px 30px;
      font-size: 16px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s;
      margin-top: 20px;
      width: 100%;
    }

    .print-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 10px 20px rgba(30,60,114,0.3);
    }

    .print-btn:active {
      transform: translateY(0);
    }

    @media (max-width: 640px) {
      .receipt-header h2 {
        font-size: 22px;
      }

      .amount-number .big {
        font-size: 36px;
      }

      .signature-section {
        flex-direction: column;
        gap: 20px;
      }
    }
  </style>
`;


// ============================================================
// 🏗️ INITIALIZE MODAL
// ============================================================

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;

  // Add styles
  const styleEl = document.createElement('style');
  styleEl.textContent = mrReceiptStyles;
  document.head.appendChild(styleEl);

  const html = `
    <div class="modalWrap" id="modalMRReceipt">
      <div class="modal large">
        <div class="modalHead">
          <div>
            <h2>🧾 Money Receipt</h2>
            <p>View money receipt details</p>
          </div>
          <button class="closeX">✕</button>
        </div>
        <div class="modalBody" id="mrReceiptBody">
          <!-- Content will be inserted here -->
        </div>
        <div class="modalFooter">
          <button class="btn btn-primary" id="printReceiptBtn">🖨️ Print Receipt</button>
          <button class="btn btn-secondary" onclick="closeModal('modalMRReceipt')">Close</button>
        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);

  // Close button
  document.querySelector('#modalMRReceipt .closeX')?.addEventListener('click', () => closeModal('modalMRReceipt'));

  // Print button
  document.getElementById('printReceiptBtn')?.addEventListener('click', () => {
    const deposit = window.currentReceiptDeposit;
    const member = window.currentReceiptMember;
    const meta = window.currentReceiptMeta;
    if (deposit && member && meta) {
      printMRReceipt(deposit, member, meta);
    }
  });

  console.log('✅ MR Receipt modal initialized');
}


// ============================================================
// 🚪 OPEN MR RECEIPT MODAL
// ============================================================

export function openMRReceiptModal(deposit, member, meta) {
  const bodyEl = document.getElementById('mrReceiptBody');
  if (!bodyEl) return;

  // Store data for printing
  window.currentReceiptDeposit = deposit;
  window.currentReceiptMember = member;
  window.currentReceiptMeta = meta;

  // Generate receipt HTML
  const receiptHTML = generateMRReceipt(deposit, member, meta);
  
  // Set content
  bodyEl.innerHTML = receiptHTML;

  // Open modal
  openModal('modalMRReceipt');
}


// ============================================================
// 📄 GENERATE MR RECEIPT HTML
// ============================================================

/**
 * Generate MR Receipt HTML
 * @param {Object} deposit - Deposit data
 * @param {Object} member - Member data
 * @param {Object} meta - System settings
 * @returns {string} HTML receipt
 */
function generateMRReceipt(deposit, member, meta) {
  const date = new Date(deposit.approvedAt || deposit.submittedAt || new Date());
  const formattedDate = date.toLocaleDateString('en-US', { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  // Fix undefined values
  const mrId = deposit.mrId || 'MR-PENDING';
  const memberName = member?.name || 'N/A';
  const memberId = deposit.memberId || 'N/A';
  const month = deposit.month || 'N/A';
  const year = deposit.year || new Date().getFullYear();
  
  // Format month display
  const monthDisplay = month.includes('-') ? month.split('-')[1] : month;
  const yearDisplay = year || new Date().getFullYear();

  // Approver information from deposit
  const approvedByName = deposit.approvedByName || 'System Admin';
  const approvedByEmail = deposit.approvedByEmail || 'admin@taqwaproperties.com';
  const approvedAt = deposit.approvedAt ? new Date(deposit.approvedAt).toLocaleString() : new Date().toLocaleString();

  return `
    <div class="receipt-container">
      <div class="receipt-header">
        <h2>${meta?.companyName || "Taqwa Properties BD"}</h2>
        <p>${meta?.companyAddress || "Dhaka, Bangladesh"} | 📞 ${meta?.companyPhone || "+8801344119333"}</p>
      </div>

      <div class="receipt-body">
        <h3 style="text-align: center; color: #1e3c72; margin: 0 0 20px;">MONEY RECEIPT</h3>

        <div class="receipt-info">
          <div class="info-row">
            <span class="info-label">MR No:</span>
            <span class="info-value">${mrId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Date:</span>
            <span class="info-value">${formattedDate}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Received from:</span>
            <span class="info-value">${memberName}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Member ID:</span>
            <span class="info-value">${memberId}</span>
          </div>
          <div class="info-row">
            <span class="info-label">For month:</span>
            <span class="info-value">${monthDisplay} ${yearDisplay}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Payment method:</span>
            <span class="info-value">${deposit.paymentMethod || 'Cash'}</span>
          </div>
          <div class="info-row">
            <span class="info-label">Transaction ID:</span>
            <span class="info-value">${deposit.trxId || 'N/A'}</span>
          </div>
        </div>

        <!-- APPROVER INFORMATION SECTION -->
        <div style="background: #f0f7f0; border-radius: 12px; padding: 15px; margin-bottom: 25px; text-align: center; border: 2px dashed #27ae60;">
          <div style="display: inline-block; background: #27ae60; color: white; padding: 5px 20px; border-radius: 30px; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
            ✓ APPROVED & VERIFIED
          </div>
          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-top: 10px;">
            <div style="text-align: left;">
              <div style="font-size: 11px; color: #666;">Approved By</div>
              <div style="font-weight: 600; color: #1e3c72;">${approvedByName}</div>
            </div>
            <div style="text-align: left;">
              <div style="font-size: 11px; color: #666;">Email</div>
              <div style="font-weight: 600; color: #1e3c72; font-size: 12px;">${approvedByEmail}</div>
            </div>
            <div style="text-align: left; grid-column: span 2;">
              <div style="font-size: 11px; color: #666;">Approval Date & Time</div>
              <div style="font-weight: 600; color: #1e3c72;">${approvedAt}</div>
            </div>
          </div>
        </div>

        <div class="amount-words">
          <h3>📝 Amount in Words</h3>
          <p>${numberToWords(deposit.amount)} Taka Only</p>
        </div>

        <div class="amount-number">
          <div class="big">${formatMoney(deposit.amount)}</div>
          <div class="small">(Paid in full)</div>
        </div>

        <div class="signature-section">
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">${memberName}</div>
            <div class="signature-label">Receiver's Signature</div>
            <div style="font-size: 11px; color: #666;">Date: ${new Date().toLocaleDateString()}</div>
          </div>
          <div class="signature-box">
            <div class="signature-line"></div>
            <div class="signature-name">${approvedByName}</div>
            <div class="signature-label">Authorized Signature</div>
            <div style="font-size: 11px; color: #666;">${approvedByEmail}</div>
          </div>
        </div>

        <div class="footer-note">
          <p>*** This is a computer generated receipt. No signature required. ***</p>
          <p>Generated on: ${new Date().toLocaleString()}</p>
          <p>Document ID: ${mrId}</p>
        </div>
      </div>
    </div>
  `;
}


// ============================================================
// 🖨️ PRINT MR RECEIPT
// ============================================================

/**
 * Print MR Receipt directly
 * @param {Object} deposit - Deposit data
 * @param {Object} member - Member data
 * @param {Object} meta - System settings
 */
export function printMRReceipt(deposit, member, meta) {
  const receiptHTML = generateMRReceipt(deposit, member, meta);
  const mrId = deposit.mrId || 'PENDING';
  
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Please allow pop-ups to print');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Money Receipt - ${mrId}</title>
      <meta charset="UTF-8">
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 20px; 
          margin: 0;
          background: white;
        }
        .receipt-container {
          max-width: 700px;
          margin: 0 auto;
          background: white;
          border-radius: 18px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0,0,0,0.1);
        }
        @media print {
          body { padding: 0; }
          .receipt-container { box-shadow: none; border: 1px solid #ddd; }
        }
      </style>
    </head>
    <body>
      ${receiptHTML}
      <script>
        window.onload = function() {
          setTimeout(function() {
            window.print();
            setTimeout(function() {
              window.close();
            }, 500);
          }, 300);
        }
      <\/script>
    </body>
    </html>
  `);
  printWindow.document.close();
}


// ============================================================
// 📤 EXPORTS
// ============================================================

export default {
  initializeModal,
  openMRReceiptModal,
  printMRReceipt
};
