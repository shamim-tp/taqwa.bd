// ============================================================
// 💵 MONEY RECEIPT MODULE
// IMS ERP V5
// Compact & Beautiful Money Receipt Design
// ============================================================

import { formatMoney, numberToWords } from '../utils/common.js';

/**
 * Generate Compact Money Receipt HTML
 * @param {Object} deposit - Deposit data
 * @param {Object} member - Member data
 * @param {Object} meta - System settings
 * @returns {string} HTML receipt
 */
export function generateCompactReceipt(deposit, member, meta) {
  const date = new Date(deposit.approvedAt || deposit.submittedAt || new Date());
  const formattedDate = date.toLocaleDateString('bn-BD', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const timeString = date.toLocaleTimeString('bn-BD', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const amountInWords = numberToWords(deposit.amount);
  const companyName = meta?.companyName || "IMS Investment Ltd.";
  const companyAddress = meta?.companyAddress || "Dhaka, Bangladesh";
  const companyPhone = meta?.companyPhone || "+880 1234-567890";
  
  // র্যান্ডম ট্রানজেকশন আইডি
  const trxId = deposit.trxId || `TXN${Date.now().toString().slice(-8)}`;
  
  // কমপ্যাক্ট রিসিট HTML
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Money Receipt - ${deposit.mrId || deposit.id}</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
          font-family: 'Segoe UI', 'Arial', sans-serif;
        }
        
        body {
          background: #f0f2f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
          padding: 15px;
        }
        
        /* কমপ্যাক্ট রিসিট কন্টেইনার - A6サイズের কাছাকাছি */
        .receipt-compact {
          max-width: 380px;
          width: 100%;
          background: white;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 15px 30px rgba(0,0,0,0.15);
          position: relative;
        }
        
        /* ওয়াটারমার্ক */
        .receipt-compact::before {
          content: "IMS";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 80px;
          font-weight: 900;
          color: rgba(30, 60, 114, 0.03);
          white-space: nowrap;
          z-index: 0;
          pointer-events: none;
        }
        
        /* হেডার */
        .receipt-header {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 20px;
          text-align: center;
          position: relative;
        }
        
        .receipt-header::after {
          content: "";
          position: absolute;
          bottom: -10px;
          left: 0;
          right: 0;
          height: 20px;
          background: linear-gradient(to bottom, rgba(0,0,0,0.1), transparent);
        }
        
        .company-name {
          font-size: 20px;
          font-weight: 700;
          letter-spacing: 0.5px;
          margin-bottom: 3px;
        }
        
        .company-address {
          font-size: 10px;
          opacity: 0.9;
          margin-bottom: 2px;
        }
        
        .company-phone {
          font-size: 9px;
          opacity: 0.8;
        }
        
        .receipt-title {
          background: #ffd700;
          color: #1e3c72;
          padding: 6px 0;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 2px;
          text-align: center;
          margin-top: 8px;
          border-radius: 30px;
          width: 80%;
          margin-left: auto;
          margin-right: auto;
        }
        
        /* মূল কন্টেন্ট */
        .receipt-body {
          padding: 18px 18px 15px;
          position: relative;
          z-index: 1;
          background: white;
        }
        
        /* এমআর ইনফো */
        .mr-info {
          display: flex;
          justify-content: space-between;
          background: #f8f9fa;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 15px;
          border-left: 4px solid #1e3c72;
        }
        
        .mr-number {
          font-size: 14px;
        }
        
        .mr-number strong {
          font-size: 16px;
          color: #1e3c72;
          display: block;
          margin-top: 3px;
        }
        
        .mr-date {
          text-align: right;
          font-size: 12px;
        }
        
        .mr-date strong {
          font-size: 14px;
          color: #1e3c72;
          display: block;
          margin-top: 3px;
        }
        
        /* মেম্বার ইনফো */
        .member-info {
          background: #e8f0fe;
          padding: 12px;
          border-radius: 12px;
          margin-bottom: 15px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .member-details h4 {
          font-size: 16px;
          color: #1e3c72;
          margin-bottom: 3px;
        }
        
        .member-details p {
          font-size: 11px;
          color: #555;
        }
        
        .member-id-badge {
          background: #1e3c72;
          color: white;
          padding: 6px 12px;
          border-radius: 30px;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }
        
        /* পেমেন্ট ডিটেইলস */
        .payment-details {
          background: white;
          border: 1px dashed #1e3c72;
          border-radius: 12px;
          padding: 12px;
          margin-bottom: 15px;
        }
        
        .payment-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 8px;
          font-size: 12px;
          padding-bottom: 8px;
          border-bottom: 1px solid #eee;
        }
        
        .payment-row:last-child {
          border-bottom: none;
          margin-bottom: 0;
          padding-bottom: 0;
        }
        
        .payment-label {
          color: #666;
          font-weight: 500;
        }
        
        .payment-value {
          font-weight: 700;
          color: #1e3c72;
        }
        
        .payment-value.amount {
          font-size: 18px;
          color: #27ae60;
        }
        
        /* টাকার অংক কথায় */
        .amount-words {
          background: #f9f9f9;
          padding: 12px;
          border-radius: 10px;
          text-align: center;
          margin-bottom: 15px;
          border: 1px solid #e0e0e0;
        }
        
        .amount-words p {
          font-size: 11px;
          color: #555;
          margin-bottom: 5px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        
        .amount-words h3 {
          font-size: 15px;
          color: #1e3c72;
          font-weight: 600;
          line-height: 1.4;
        }
        
        /* ফুটার */
        .receipt-footer {
          padding: 0 18px 18px;
          position: relative;
          z-index: 1;
        }
        
        /* সিগনেচার */
        .signature-area {
          display: flex;
          justify-content: space-between;
          margin-bottom: 15px;
        }
        
        .signature-box {
          text-align: center;
          flex: 1;
        }
        
        .signature-line {
          width: 120px;
          height: 1px;
          background: #333;
          margin: 5px auto;
        }
        
        .signature-label {
          font-size: 9px;
          color: #666;
        }
        
        /* QR কোড সিমুলেশন */
        .qr-section {
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: #f5f5f5;
          padding: 8px 12px;
          border-radius: 30px;
          margin-bottom: 12px;
        }
        
        .qr-code {
          width: 40px;
          height: 40px;
          background: linear-gradient(45deg, #1e3c72 25%, #2a5298 25%, #2a5298 50%, #1e3c72 50%, #1e3c72 75%, #2a5298 75%);
          background-size: 10px 10px;
          border-radius: 8px;
        }
        
        .qr-text {
          font-size: 8px;
          color: #555;
          text-align: right;
        }
        
        .qr-text strong {
          font-size: 10px;
          color: #1e3c72;
          display: block;
        }
        
        /* নোট */
        .note {
          background: #f0f0f0;
          padding: 8px;
          border-radius: 8px;
          text-align: center;
          font-size: 8px;
          color: #777;
          font-style: italic;
        }
        
        /* ডিজিটাল সিল */
        .digital-seal {
          text-align: right;
          font-size: 8px;
          color: #27ae60;
          margin-top: 8px;
        }
        
        /* প্রিন্ট স্টাইল */
        @media print {
          body {
            background: white;
            padding: 0;
          }
          .receipt-compact {
            box-shadow: none;
            border: 1px solid #ddd;
          }
        }
        
        /* ছোট ডিভাইসের জন্য */
        @media (max-width: 400px) {
          .receipt-compact {
            max-width: 100%;
          }
        }
      </style>
    </head>
    <body>
      <div class="receipt-compact">
        
        <!-- হেডার -->
        <div class="receipt-header">
          <div class="company-name">🏦 ${companyName}</div>
          <div class="company-address">${companyAddress}</div>
          <div class="company-phone">📞 ${companyPhone}</div>
          <div class="receipt-title">MONEY RECEIPT</div>
        </div>
        
        <!-- বডি -->
        <div class="receipt-body">
          
          <!-- MR তথ্য -->
          <div class="mr-info">
            <div class="mr-number">
              <span>📄 MR No.</span>
              <strong>${deposit.mrId || deposit.id}</strong>
            </div>
            <div class="mr-date">
              <span>📅 Date</span>
              <strong>${formattedDate}</strong>
              <div style="font-size:8px; color:#999;">${timeString}</div>
            </div>
          </div>
          
          <!-- মেম্বার তথ্য -->
          <div class="member-info">
            <div class="member-details">
              <h4>👤 ${member?.name || 'N/A'}</h4>
              <p>📱 ${member?.phone || 'N/A'} | ✉️ ${member?.email || 'N/A'}</p>
            </div>
            <div class="member-id-badge">${deposit.memberId}</div>
          </div>
          
          <!-- পেমেন্ট ডিটেইলস -->
          <div class="payment-details">
            <div class="payment-row">
              <span class="payment-label">📆 For Month</span>
              <span class="payment-value">${deposit.month} ${deposit.year || ''}</span>
            </div>
            <div class="payment-row">
              <span class="payment-label">💳 Payment Method</span>
              <span class="payment-value">${deposit.paymentMethod || 'Cash'}</span>
            </div>
            <div class="payment-row">
              <span class="payment-label">🔢 Transaction ID</span>
              <span class="payment-value">${trxId}</span>
            </div>
            <div class="payment-row">
              <span class="payment-label">💰 Amount</span>
              <span class="payment-value amount">${formatMoney(deposit.amount)}</span>
            </div>
          </div>
          
          <!-- টাকার অংক কথায় -->
          <div class="amount-words">
            <p>📝 In Words</p>
            <h3>${amountInWords} Taka Only</h3>
          </div>
          
        </div>
        
        <!-- ফুটার -->
        <div class="receipt-footer">
          
          <!-- সিগনেচার -->
          <div class="signature-area">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Member's Signature</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-label">Authorized Signatory</div>
            </div>
          </div>
          
          <!-- QR সেকশন -->
          <div class="qr-section">
            <div class="qr-code"></div>
            <div class="qr-text">
              <strong>🔍 Verify Receipt</strong>
              Scan to verify • ${deposit.mrId || deposit.id}
            </div>
          </div>
          
          <!-- নোট -->
          <div class="note">
            *** This is a computer generated receipt. No signature required. ***
          </div>
          
          <!-- ডিজিটাল সিল -->
          <div class="digital-seal">
            ✅ Digitally Signed • ${new Date().toLocaleDateString()}
          </div>
          
        </div>
      </div>
      
      <script>
        // অটো প্রিন্ট
        window.onload = function() {
          setTimeout(function() {
            window.print();
          }, 300);
        }
      </script>
    </body>
    </html>
  `;
}

/**
 * Open Money Receipt in Modal
 * @param {Object} deposit - Deposit data
 * @param {Object} member - Member data
 * @param {Object} meta - System settings
 */
export function openCompactReceiptModal(deposit, member, meta) {
  const receiptHTML = generateCompactReceipt(deposit, member, meta);
  
  // মডালের জন্য HTML
  const modalHTML = `
    <div class="panel" style="max-width: 420px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h3>🧾 Money Receipt Preview</h3>
        <p class="small">${deposit.mrId || deposit.id} | ${member?.name}</p>
      </div>
      
      <div style="background: #f8f9fa; border-radius: 12px; padding: 15px; margin-bottom: 20px;">
        <iframe srcdoc="${escapeHTML(receiptHTML)}" style="width: 100%; height: 500px; border: none; border-radius: 8px;"></iframe>
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="btn success" onclick="window.open('', '_blank').document.write('${escapeHTML(receiptHTML)}'); window.open('', '_blank').document.close();">
          🖨️ Print / Download
        </button>
        <button class="btn" onclick="closeModal('modalViewer')">Close</button>
      </div>
    </div>
  `;
  
  // ওপেন মডাল
  import('../modals/viewer.js').then(module => {
    module.openViewerModal('Money Receipt', 'Compact receipt preview', modalHTML);
  });
}

/**
 * Print Money Receipt in new window
 * @param {Object} deposit - Deposit data
 * @param {Object} member - Member data
 * @param {Object} meta - System settings
 */
export function printCompactReceipt(deposit, member, meta) {
  const receiptHTML = generateCompactReceipt(deposit, member, meta);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(receiptHTML);
  printWindow.document.close();
}

/**
 * HTML Escape ফাংশন (সিকিউরিটির জন্য)
 */
function escapeHTML(str) {
  return str.replace(/[&<>"]/g, function(m) {
    if (m === '&') return '&amp;';
    if (m === '<') return '&lt;';
    if (m === '>') return '&gt;';
    if (m === '"') return '&quot;';
    return m;
  });
}

// ============================================================
// Export all functions
// ============================================================
export default {
  generateCompactReceipt,
  openCompactReceiptModal,
  printCompactReceipt
};
