/**
 * Print MR Receipt directly - BEAUTIFUL VERSION like Modal
 * @param {Object} deposit - Deposit data
 * @param {Object} member - Member data
 * @param {Object} meta - System settings
 */
export function printMRReceipt(deposit, member, meta) {
  const receiptHTML = generateMRReceipt(deposit, member, meta);
  const mrId = deposit.mrId || 'PENDING';
  const memberName = member?.name || 'N/A';
  const approvedByName = deposit.approvedByName || 'Admin';
  
  const printWindow = window.open('', '_blank');
  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Money Receipt - ${mrId}</title>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        body {
          font-family: 'Segoe UI', 'Arial', sans-serif;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          min-height: 100vh;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 30px 20px;
        }
        
        /* Print Container */
        .print-container {
          max-width: 800px;
          width: 100%;
          background: white;
          border-radius: 30px;
          box-shadow: 0 30px 60px rgba(0,0,0,0.3);
          overflow: hidden;
          position: relative;
          animation: slideIn 0.5s ease-out;
        }
        
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        /* Watermark */
        .print-container::before {
          content: "IMS";
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) rotate(-30deg);
          font-size: 150px;
          font-weight: 900;
          color: rgba(30, 60, 114, 0.03);
          white-space: nowrap;
          z-index: 0;
          pointer-events: none;
        }
        
        /* Header Section */
        .print-header {
          background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
          position: relative;
          overflow: hidden;
        }
        
        .print-header::after {
          content: "★";
          position: absolute;
          right: 30px;
          top: 20px;
          font-size: 120px;
          opacity: 0.1;
          color: white;
          transform: rotate(15deg);
        }
        
        .company-name {
          font-size: 32px;
          font-weight: 700;
          letter-spacing: 1px;
          margin-bottom: 10px;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }
        
        .company-details {
          font-size: 14px;
          opacity: 0.9;
          line-height: 1.6;
        }
        
        .receipt-badge {
          display: inline-block;
          background: #ffd700;
          color: #1e3c72;
          padding: 8px 30px;
          border-radius: 50px;
          font-weight: 800;
          font-size: 18px;
          letter-spacing: 2px;
          margin-top: 20px;
          box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        
        /* Content Section */
        .print-content {
          padding: 40px;
          position: relative;
          z-index: 1;
          background: white;
        }
        
        /* MR Info Card */
        .mr-info-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-left: 5px solid #1e3c72;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .mr-number {
          font-size: 14px;
          color: #666;
        }
        
        .mr-number strong {
          font-size: 24px;
          color: #1e3c72;
          display: block;
          margin-top: 5px;
        }
        
        .mr-date {
          text-align: right;
          font-size: 14px;
          color: #666;
        }
        
        .mr-date strong {
          font-size: 18px;
          color: #1e3c72;
          display: block;
          margin-top: 5px;
        }
        
        /* Member Card */
        .member-card {
          background: #e8f0fe;
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .member-info h3 {
          font-size: 22px;
          color: #1e3c72;
          margin-bottom: 5px;
        }
        
        .member-info p {
          font-size: 14px;
          color: #555;
        }
        
        .member-id-badge {
          background: #1e3c72;
          color: white;
          padding: 10px 20px;
          border-radius: 40px;
          font-size: 16px;
          font-weight: 700;
          letter-spacing: 1px;
          box-shadow: 0 4px 10px rgba(30,60,114,0.3);
        }
        
        /* Payment Details Card */
        .payment-card {
          background: white;
          border: 2px solid #e0e0e0;
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .payment-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
        }
        
        .payment-item {
          padding: 10px;
          border-bottom: 1px dashed #dee2e6;
        }
        
        .payment-label {
          font-size: 12px;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 5px;
        }
        
        .payment-value {
          font-size: 18px;
          font-weight: 600;
          color: #1e3c72;
        }
        
        .payment-value.amount {
          font-size: 28px;
          color: #27ae60;
        }
        
        /* Approval Card */
        .approval-card {
          background: linear-gradient(135deg, #f0f7f0 0%, #e0f0e0 100%);
          border-radius: 20px;
          padding: 25px;
          margin-bottom: 30px;
          text-align: center;
          border: 3px dashed #27ae60;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .approval-badge {
          display: inline-block;
          background: #27ae60;
          color: white;
          padding: 8px 30px;
          border-radius: 40px;
          font-size: 16px;
          font-weight: 700;
          margin-bottom: 20px;
          box-shadow: 0 4px 10px rgba(39,174,96,0.3);
        }
        
        .approval-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 20px;
          text-align: left;
        }
        
        .approval-item {
          padding: 10px;
          background: rgba(255,255,255,0.5);
          border-radius: 10px;
        }
        
        .approval-item.full-width {
          grid-column: span 2;
        }
        
        .approval-label {
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
        }
        
        .approval-value {
          font-size: 16px;
          font-weight: 600;
          color: #1e3c72;
        }
        
        /* Words Card */
        .words-card {
          background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
          border-radius: 20px;
          padding: 25px;
          text-align: center;
          margin-bottom: 30px;
          border-left: 5px solid #1e3c72;
          box-shadow: 0 5px 15px rgba(0,0,0,0.05);
        }
        
        .words-label {
          font-size: 14px;
          color: #1e3c72;
          margin-bottom: 10px;
          font-weight: 600;
        }
        
        .words-value {
          font-size: 22px;
          font-weight: 600;
          color: #2c3e50;
          line-height: 1.4;
        }
        
        /* Amount Display */
        .amount-display {
          text-align: center;
          margin: 30px 0;
        }
        
        .amount-number {
          font-size: 56px;
          font-weight: 800;
          color: #27ae60;
          text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
        }
        
        .amount-label {
          font-size: 16px;
          color: #666;
          margin-top: 5px;
        }
        
        /* Signature Section */
        .signature-section {
          display: flex;
          justify-content: space-between;
          margin: 40px 0 20px;
          padding-top: 30px;
          border-top: 2px dashed #dee2e6;
        }
        
        .signature-box {
          text-align: center;
          flex: 1;
        }
        
        .signature-line {
          width: 200px;
          height: 2px;
          background: #333;
          margin: 0 auto 15px;
        }
        
        .signature-name {
          font-weight: 600;
          color: #1e3c72;
          margin-bottom: 5px;
        }
        
        .signature-email {
          font-size: 11px;
          color: #666;
        }
        
        .signature-date {
          font-size: 11px;
          color: #999;
          margin-top: 5px;
        }
        
        /* Footer */
        .print-footer {
          background: #f8f9fa;
          padding: 20px 40px;
          text-align: center;
          border-top: 1px solid #dee2e6;
        }
        
        .footer-note {
          font-size: 11px;
          color: #666;
          margin-bottom: 5px;
          font-style: italic;
        }
        
        .footer-meta {
          font-size: 10px;
          color: #999;
        }
        
        /* Print Button */
        .print-button-container {
          text-align: center;
          padding: 20px;
          background: white;
          border-top: 1px solid #eee;
        }
        
        .print-btn {
          background: linear-gradient(135deg, #1e3c72, #2a5298);
          color: white;
          border: none;
          padding: 15px 40px;
          border-radius: 50px;
          font-size: 18px;
          font-weight: 600;
          cursor: pointer;
          box-shadow: 0 10px 20px rgba(30,60,114,0.3);
          transition: all 0.3s ease;
        }
        
        .print-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 15px 30px rgba(30,60,114,0.4);
        }
        
        /* Print Styles */
        @media print {
          body {
            background: white;
            padding: 0;
          }
          
          .print-container {
            box-shadow: none;
            max-width: 100%;
          }
          
          .print-container::before {
            opacity: 0.1;
          }
          
          .print-button-container {
            display: none;
          }
          
          .signature-line {
            border-bottom: 2px solid #000;
          }
        }
        
        /* Responsive */
        @media (max-width: 600px) {
          .payment-grid,
          .approval-grid {
            grid-template-columns: 1fr;
          }
          
          .mr-info-card {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }
          
          .member-card {
            flex-direction: column;
            text-align: center;
            gap: 15px;
          }
          
          .signature-section {
            flex-direction: column;
            gap: 30px;
          }
        }
      </style>
    </head>
    <body>
      <div class="print-container">
        
        <!-- Header -->
        <div class="print-header">
          <div class="company-name">${meta?.companyName || "Taqwa Properties BD"}</div>
          <div class="company-details">
            ${meta?.companyAddress || "Dhaka, Bangladesh"}<br>
            📞 ${meta?.companyPhone || "+8801344119333"} | ✉️ ${meta?.companyEmail || "info@taqwaproperties.com"}
          </div>
          <div class="receipt-badge">MONEY RECEIPT</div>
        </div>
        
        <!-- Content -->
        <div class="print-content">
          
          <!-- MR Info -->
          <div class="mr-info-card">
            <div class="mr-number">
              📄 MR Number
              <strong>${deposit.mrId || 'PENDING'}</strong>
            </div>
            <div class="mr-date">
              📅 Issue Date
              <strong>${new Date(deposit.approvedAt || deposit.submittedAt || new Date()).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</strong>
            </div>
          </div>
          
          <!-- Member Info -->
          <div class="member-card">
            <div class="member-info">
              <h3>👤 ${member?.name || 'N/A'}</h3>
              <p>📱 ${member?.phone || 'N/A'} | ✉️ ${member?.email || 'N/A'}</p>
            </div>
            <div class="member-id-badge">${deposit.memberId || 'N/A'}</div>
          </div>
          
          <!-- Payment Details -->
          <div class="payment-card">
            <div class="payment-grid">
              <div class="payment-item">
                <div class="payment-label">For Month</div>
                <div class="payment-value">${deposit.month || 'N/A'} ${deposit.year || ''}</div>
              </div>
              <div class="payment-item">
                <div class="payment-label">Payment Method</div>
                <div class="payment-value">${deposit.paymentMethod || 'Cash'}</div>
              </div>
              <div class="payment-item">
                <div class="payment-label">Transaction ID</div>
                <div class="payment-value">${deposit.trxId || 'N/A'}</div>
              </div>
              <div class="payment-item">
                <div class="payment-label">Amount</div>
                <div class="payment-value amount">${formatMoney(deposit.amount)}</div>
              </div>
            </div>
          </div>
          
          <!-- Approval Info -->
          <div class="approval-card">
            <div class="approval-badge">✓ APPROVED & VERIFIED</div>
            <div class="approval-grid">
              <div class="approval-item">
                <div class="approval-label">Approved By</div>
                <div class="approval-value">${deposit.approvedByName || 'Admin'}</div>
              </div>
              <div class="approval-item">
                <div class="approval-label">Email</div>
                <div class="approval-value">${deposit.approvedByEmail || 'admin@taqwaproperties.com'}</div>
              </div>
              <div class="approval-item full-width">
                <div class="approval-label">Approval Date & Time</div>
                <div class="approval-value">${deposit.approvedAt ? new Date(deposit.approvedAt).toLocaleString() : new Date().toLocaleString()}</div>
              </div>
            </div>
          </div>
          
          <!-- Amount in Words -->
          <div class="words-card">
            <div class="words-label">📝 AMOUNT IN WORDS</div>
            <div class="words-value">${numberToWords(deposit.amount)} Taka Only</div>
          </div>
          
          <!-- Amount Display -->
          <div class="amount-display">
            <div class="amount-number">${formatMoney(deposit.amount)}</div>
            <div class="amount-label">(Paid in full)</div>
          </div>
          
          <!-- Signature Section -->
          <div class="signature-section">
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-name">Receiver's Signature</div>
              <div class="signature-date">Date: ${new Date().toLocaleDateString()}</div>
            </div>
            <div class="signature-box">
              <div class="signature-line"></div>
              <div class="signature-name">${deposit.approvedByName || 'Admin'}</div>
              <div class="signature-email">${deposit.approvedByEmail || 'admin@taqwaproperties.com'}</div>
              <div class="signature-date">Authorized Signatory</div>
            </div>
          </div>
          
        </div>
        
        <!-- Footer -->
        <div class="print-footer">
          <div class="footer-note">*** This is a computer generated receipt. No signature required. ***</div>
          <div class="footer-meta">Generated on: ${new Date().toLocaleString()} | Document ID: ${deposit.mrId || deposit.id}</div>
        </div>
        
      </div>
      
      <!-- Print Button -->
      <div class="print-button-container">
        <button class="print-btn" onclick="window.print()">
          🖨️ Print Receipt
        </button>
      </div>
      
      <script>
        // Auto trigger print after 1 second
        setTimeout(function() {
          // You can enable this if you want auto print
          // window.print();
        }, 1000);
      </script>
    </body>
    </html>
  `);
  printWindow.document.close();
}
