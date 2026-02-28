// ============================================================
// 📄 MR RECEIPT MODAL MODULE
// IMS ERP V5
// Money Receipt Viewer Modal - UPDATED with Approver Info
// ============================================================

import { openViewerModal } from './viewer.js';
import { formatMoney, numberToWords } from '../utils/common.js';

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

  // Approver information from deposit
  const approvedByName = deposit.approvedByName || 'Admin';
  const approvedByEmail = deposit.approvedByEmail || 'admin@ims.com';
  const approvedAt = deposit.approvedAt ? new Date(deposit.approvedAt).toLocaleString() : 'N/A';

  return `
   <div class="receipt" style="max-width: 700px; margin: 0 auto; background: white; border-radius: 18px; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
      <div class="header" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white; padding: 30px; text-align: center;">
        <h2 style="margin: 0 0 10px; font-size: 28px;">${meta?.companyName || "Taqwa Properties BD"}</h2>
        <p style="margin: 5px 0; opacity: 0.9;">${meta?.companyAddress || "Dhaka, Bangladesh"}</p>
        <p style="margin: 5px 0; opacity: 0.8; font-size: 14px;">📞 ${meta?.companyPhone || "+8801344119333"} | ✉️ ${meta?.companyEmail || "shaque.shamim@gmail.com"}</p>
      </div>
      
      <div style="padding: 30px;">
        <h2 style="text-align:center; margin: 0 0 30px; color: #1e3c72; border-bottom: 2px solid #1e3c72; padding-bottom: 15px;">💰 MONEY RECEIPT</h2>
        
        <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 25px;">
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #dee2e6;">
            <div><strong style="color: #1e3c72;">MR No:</strong> <span style="font-size: 18px; font-weight: bold;">${deposit.mrId || deposit.id}</span></div>
            <div><strong style="color: #1e3c72;">Date:</strong> ${formattedDate}</div>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #dee2e6;">
            <div><strong style="color: #1e3c72;">Received from:</strong> ${member?.name || "N/A"}</div>
            <div><strong style="color: #1e3c72;">Member ID:</strong> <span style="background: #1e3c72; color: white; padding: 3px 10px; border-radius: 20px;">${deposit.memberId}</span></div>
          </div>
          
          <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding-bottom: 10px; border-bottom: 1px dashed #dee2e6;">
            <div><strong style="color: #1e3c72;">For the month of:</strong> ${deposit.month} ${deposit.year}</div>
            <div><strong style="color: #1e3c72;">Payment Method:</strong> ${deposit.paymentMethod}</div>
          </div>
          
          <div style="display: flex; justify-content: space-between;">
            <div><strong style="color: #1e3c72;">Transaction ID:</strong> ${deposit.trxId || "N/A"}</div>
            <div></div>
          </div>
        </div>
        
        <!-- APPROVER INFORMATION SECTION - NEW -->
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
        
        <div style="background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%); border-radius: 12px; padding: 20px; text-align: center; margin-bottom: 25px;">
          <h3 style="font-size: 16px; color: #1e3c72; margin: 0 0 10px;">📝 Amount in Words</h3>
          <p style="font-size: 20px; font-weight: 600; color: #2c3e50; margin: 0;">${numberToWords(deposit.amount)} Taka Only</p>
        </div>
        
        <div style="text-align:center; margin: 30px 0;">
          <div style="font-size: 48px; font-weight: 800; color: #27ae60; margin-bottom: 5px;">${formatMoney(deposit.amount)}</div>
          <p style="font-size: 14px; color: #666;">(Paid in full)</p>
        </div>
        
        <div style="display: flex; justify-content: space-between; margin-top: 40px; padding-top: 20px; border-top: 2px dashed #dee2e6;">
          <div style="text-align: center; flex: 1;">
            <div style="width: 200px; height: 1px; background: #333; margin: 0 auto 10px;"></div>
            <p style="margin: 0; font-weight: 600;">Receiver's Signature</p>
            <p style="margin: 5px 0 0; font-size: 12px; color: #666;">Date: ${new Date().toLocaleDateString()}</p>
          </div>
          <div style="text-align: center; flex: 1;">
            <div style="width: 200px; height: 1px; background: #333; margin: 0 auto 10px;"></div>
            <p style="margin: 0; font-weight: 600;">Authorized Signature</p>
            <p style="margin: 5px 0 0; font-size: 12px; color: #666;">${approvedByName}</p>
            <p style="margin: 2px 0 0; font-size: 10px; color: #999;">${approvedByEmail}</p>
          </div>
        </div>
        
        <div style="margin-top: 30px; font-size: 11px; text-align: center; color: #999; border-top: 1px solid #eee; padding-top: 20px;">
          <p style="margin: 0 0 5px;">*** This is a computer generated receipt. No signature required. ***</p>
          <p style="margin: 0;">Generated on: ${new Date().toLocaleString()}</p>
          <p style="margin: 5px 0 0; font-size: 10px;">Document ID: ${deposit.mrId || deposit.id}</p>
        </div>
      </div>
    </div>
  `;
}

/**
 * Open MR Receipt in Modal
 * @param {Object} deposit - Deposit data
 * @param {Object} member - Member data
 * @param {Object} meta - System settings
 */
export function openMRReceiptModal(deposit, member, meta) {
  const receiptHTML = generateMRReceipt(deposit, member, meta);
  
  // Get approver info for display in modal header
  const approvedByName = deposit.approvedByName || 'Admin';
  
  const modalHTML = `
    <div class="panel" style="max-width: 750px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h3>🧾 Money Receipt</h3>
        <p class="small">${deposit.mrId || deposit.id} | ${member?.name || 'N/A'}</p>
        <p class="small" style="color: #27ae60; margin-top: 5px;">
          ✓ Approved by: ${approvedByName}
        </p>
      </div>
      
      <div style="background: #f8f9fa; border-radius: 12px; padding: 20px; margin-bottom: 20px; max-height: 500px; overflow-y: auto;">
        ${receiptHTML}
      </div>
      
      <div style="display: flex; gap: 10px; justify-content: center;">
        <button class="btn success" onclick="window.open('', '_blank').document.write(\`${receiptHTML.replace(/`/g, '\\`')}\`); window.open('', '_blank').document.close();">
          🖨️ Print Receipt
        </button>
        <button class="btn" onclick="closeModal('modalViewer')">Close</button>
      </div>
    </div>
  `;
  
  openViewerModal('Money Receipt', 'View receipt details', modalHTML);
}

/**
 * Print MR Receipt directly
 * @param {Object} deposit - Deposit data
 * @param {Object} member - Member data
 * @param {Object} meta - System settings
 */
export function printMRReceipt(deposit, member, meta) {
  const receiptHTML = generateMRReceipt(deposit, member, meta);
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Money Receipt - ${deposit.mrId || deposit.id}</title>
      <style>
        body { 
          font-family: 'Segoe UI', Arial, sans-serif; 
          padding: 20px; 
          background: #f0f2f5;
          display: flex;
          justify-content: center;
          align-items: center;
          min-height: 100vh;
        }
        @media print {
          body { 
            background: white; 
            padding: 0;
            display: block;
          }
          .receipt {
            box-shadow: none;
          }
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
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}

// ============================================================
// Default export
// ============================================================
export default {
  openMRReceiptModal,
  printMRReceipt
};
