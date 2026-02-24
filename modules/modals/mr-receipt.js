import { openModal, closeModal } from './modals.js';
import { getDatabase } from '../database/db.js';
import { showToast, formatMoney } from '../utils/common.js';

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;
  const html = `
    <div class="modalWrap" id="modalMRReceipt">
      <div class="modal" style="max-width:900px;">
        <div class="modalHead">
          <div><h2>Money Receipt</h2><p id="mrReceiptSub">Deposit Receipt Details</p></div>
          <button class="closeX">✕</button>
        </div>
        <div id="mrReceiptBody" class="printArea"></div>
        <div class="hr"></div>
        <div class="row row-3">
          <button class="btn" id="closeMRBtn">Close</button>
          <button class="btn primary" id="printReceiptBtn">Print Receipt</button>
          <button class="btn success" id="downloadReceiptBtn">Download PDF</button>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
  
  document.querySelector('#modalMRReceipt .closeX')?.addEventListener('click', () => closeModal('modalMRReceipt'));
  document.getElementById('closeMRBtn')?.addEventListener('click', () => closeModal('modalMRReceipt'));
  document.getElementById('printReceiptBtn')?.addEventListener('click', printReceipt);
  document.getElementById('downloadReceiptBtn')?.addEventListener('click', downloadReceipt);
}

export function openMRReceiptModal(deposit, member, meta) {
  const receiptHTML = generateMRReceipt(deposit, member, meta);
  document.getElementById('mrReceiptSub').innerText = `MR ID: ${deposit.mrId || ''}`;
  document.getElementById('mrReceiptBody').innerHTML = receiptHTML;
  openModal('modalMRReceipt');
}

function generateMRReceipt(deposit, member, meta) {
  const date = new Date(deposit.approvedAt || deposit.submittedAt || new Date());
  const formattedDate = date.toLocaleDateString('en-US', { year:'numeric', month:'long', day:'numeric' });
  return `
    <div class="receipt">
      <div class="header">
        <h2>${meta?.companyName || "IMS Investment Ltd."}</h2>
        <p>${meta?.companyAddress || "Dhaka, Bangladesh"}</p>
        <p>Phone: ${meta?.companyPhone || "+8801234567890"} | Email: ${meta?.companyEmail || "info@imsinvestment.com"}</p>
      </div>
      <h2 style="text-align:center;margin-bottom:30px;">MONEY RECEIPT</h2>
      <div class="details">
        <div class="row"><div><strong>MR No:</strong> ${deposit.mrId || deposit.id}</div><div><strong>Date:</strong> ${formattedDate}</div></div>
        <div class="row"><div><strong>Received from:</strong> ${member?.name || "N/A"}</div><div><strong>Member ID:</strong> ${deposit.memberId}</div></div>
        <div class="row"><div><strong>For the month of:</strong> ${deposit.month}</div><div><strong>Payment Method:</strong> ${deposit.paymentMethod}</div></div>
        <div class="row"><div><strong>Transaction ID:</strong> ${deposit.trxId || "N/A"}</div><div></div></div>
        <div style="margin-top:30px;text-align:center;">
          <h3 style="font-size:24px;margin:0;">Amount in Words:</h3>
          <p style="font-size:18px;margin:10px 0 30px 0;">${numberToWords(deposit.amount)} Taka Only</p>
        </div>
        <div style="text-align:center;margin:40px 0;">
          <h1 style="font-size:48px;margin:0;color:#2c3e50;">${formatMoney(deposit.amount)}</h1>
          <p style="font-size:18px;margin-top:10px;">(Paid in full)</p>
        </div>
      </div>
      <div class="signature">
        <div><p>_________________________</p><p>Receiver's Signature</p><p>Date: ${new Date().toLocaleDateString()}</p></div>
        <div><p>_________________________</p><p>Authorized Signature</p><p>${meta?.companyName || "IMS Investment Ltd."}</p></div>
      </div>
      <div style="margin-top:40px;font-size:12px;text-align:center;color:#666;">
        <p>*** This is a computer generated receipt. No signature required. ***</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}

function numberToWords(num) {
  const ones = ['','One','Two','Three','Four','Five','Six','Seven','Eight','Nine'];
  const teens = ['Ten','Eleven','Twelve','Thirteen','Fourteen','Fifteen','Sixteen','Seventeen','Eighteen','Nineteen'];
  const tens = ['','','Twenty','Thirty','Forty','Fifty','Sixty','Seventy','Eighty','Ninety'];
  if (num === 0) return 'Zero';
  let words = '';
  if (num >= 10000000) { words += numberToWords(Math.floor(num / 10000000)) + ' Crore '; num %= 10000000; }
  if (num >= 100000) { words += numberToWords(Math.floor(num / 100000)) + ' Lakh '; num %= 100000; }
  if (num >= 1000) { words += numberToWords(Math.floor(num / 1000)) + ' Thousand '; num %= 1000; }
  if (num >= 100) { words += numberToWords(Math.floor(num / 100)) + ' Hundred '; num %= 100; }
  if (num > 0) {
    if (words !== '') words += 'and ';
    if (num < 10) words += ones[num];
    else if (num < 20) words += teens[num - 10];
    else { words += tens[Math.floor(num / 10)]; if (num % 10 > 0) words += ' ' + ones[num % 10]; }
  }
  return words.trim();
}

function printReceipt() {
  const content = document.getElementById('mrReceiptBody').innerHTML;
  const w = window.open('', '_blank');
  w.document.write(`
    <html><head><title>Money Receipt</title><style>
      body { font-family: Arial; margin:20px; }
      .receipt { width:800px; margin:0 auto; border:2px solid #000; padding:30px; background:white; color:black; }
      .header { text-align:center; border-bottom:2px solid #000; padding-bottom:15px; margin-bottom:20px; }
      .row { display:flex; justify-content:space-between; margin-bottom:8px; }
      .signature { margin-top:40px; display:flex; justify-content:space-between; }
      @media print { body { margin:0; } }
    </style></head>
    <body>${content}</body>
    <script>window.onload=function(){ window.print(); setTimeout(()=>window.close(), 500); }</script>
    </html>
  `);
  w.document.close();
}

function downloadReceipt() {
  const content = document.getElementById('mrReceiptBody').innerHTML;
  const blob = new Blob([`<html><head><title>Money Receipt</title></head><body>${content}</body></html>`], { type: 'text/html' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `money-receipt-${new Date().getTime()}.html`;
  a.click();
  URL.revokeObjectURL(url);
}