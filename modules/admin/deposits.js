import { getDatabase } from '../database/db.js'; // Local DB module
import { getCurrentUser } from '../auth/auth.js'; // Current logged-in user info
import { setPageTitle, logActivity, buildSidebar } from '../auth/session.js'; // Page title, logging, sidebar update
import { showToast, formatMoney, generateId, numberToWords, fileToBase64 } from '../utils/common.js'; // Helpers
import { openModal, closeModal } from '../modals/modals.js'; // Modal open/close
import { openViewerModal } from '../modals/viewer.js'; // Viewer modal
import { openMRReceiptModal } from '../modals/mr-receipt.js'; // MR receipt modal
import { BANGLADESH_BANKS } from '../utils/common.js';

// ------------------------------------------------------------
// Main Admin Deposit Page Renderer - UPDATED with Summary Cards
// ------------------------------------------------------------
export async function renderAdminDeposits() {
  setPageTitle('Deposit Management', 'Approve/Reject deposits, generate MR ID, check slip and transaction.');

  const db = getDatabase();
  const deposits = await db.getAll('deposits') || []; // Fetch all deposits
  const pending = deposits.filter(d => d.status == 'PENDING'); // Pending deposits
  const approved = deposits.filter(d => d.status == 'APPROVED'); // Approved deposits
  const rejected = deposits.filter(d => d.status == 'REJECTED'); // Rejected deposits

  // Calculate summary statistics
  const totalAmount = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const pendingAmount = pending.reduce((sum, d) => sum + Number(d.amount || 0), 0);
  const approvedAmount = approved.reduce((sum, d) => sum + Number(d.amount || 0), 0);

  // Summary Cards HTML
  const summaryHTML = `
    <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; margin-bottom: 30px;">
      
      <!-- Total Deposits Card -->
      <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; border-radius: 16px; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Total Deposits</div>
            <div style="font-size: 32px; font-weight: 700;">${deposits.length}</div>
          </div>
          <div style="font-size: 48px; opacity: 0.3;">📊</div>
        </div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">All time deposits</div>
      </div>
      
      <!-- Total Amount Card -->
      <div style="background: linear-gradient(135deg, #11998e 0%, #38ef7d 100%); padding: 20px; border-radius: 16px; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Total Amount</div>
            <div style="font-size: 32px; font-weight: 700;">${formatMoney(totalAmount)}</div>
          </div>
          <div style="font-size: 48px; opacity: 0.3;">💰</div>
        </div>
        <div style="font-size: 12px; opacity: 0.8; margin-top: 10px;">Sum of all deposits</div>
      </div>
      
      <!-- Approved Card -->
      <div style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); padding: 20px; border-radius: 16px; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Approved</div>
            <div style="font-size: 32px; font-weight: 700;">${approved.length}</div>
            <div style="font-size: 14px; opacity: 0.8;">${formatMoney(approvedAmount)}</div>
          </div>
          <div style="font-size: 48px; opacity: 0.3;">✅</div>
        </div>
      </div>
      
      <!-- Pending Card -->
      <div style="background: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%); padding: 20px; border-radius: 16px; color: white; box-shadow: 0 10px 20px rgba(0,0,0,0.1);">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div>
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Pending</div>
            <div style="font-size: 32px; font-weight: 700;">${pending.length}</div>
            <div style="font-size: 14px; opacity: 0.8;">${formatMoney(pendingAmount)}</div>
          </div>
          <div style="font-size: 48px; opacity: 0.3;">⏳</div>
        </div>
      </div>
      
    </div>
  `;

  // HTML layout for pending and approved deposits
  const html = `
    ${summaryHTML}
    
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Pending Deposits</h3>
          <p>Verify slip, approve deposit, generate MR ID and signature.</p>
        </div>
        <div class="panelTools" style="display: flex; gap: 10px;">
          <input type="text" id="searchPending" placeholder="🔍 Search pending deposits..." style="padding: 8px 15px; border: 1px solid var(--line); border-radius: 8px; width: 250px;" />
          <button class="btn" id="refreshDeposits">🔄 Refresh</button>
          <button class="btn primary" id="addCashMRBtn">➕ Add Cash MR</button>
        </div>
      </div>
      <div id="pendingDepositTable">${await renderDepositTable(pending, true)}</div>
      <div id="pendingNoResults" style="display: none; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 12px; margin-top: 20px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
        <div style="font-size: 18px; color: #666;">No pending deposits match your search</div>
      </div>
    </div>

    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>Approved Deposits</h3>
          <p>All confirmed deposits with MR ID.</p>
        </div>
        <div class="panelTools">
          <input type="text" id="searchApproved" placeholder="🔍 Search approved deposits..." style="padding: 8px 15px; border: 1px solid var(--line); border-radius: 8px; width: 250px;" />
        </div>
      </div>
      <div id="approvedDepositTable">${await renderDepositTable(approved, false)}</div>
      <div id="approvedNoResults" style="display: none; text-align: center; padding: 40px; background: #f8f9fa; border-radius: 12px; margin-top: 20px;">
        <div style="font-size: 48px; margin-bottom: 10px;">🔍</div>
        <div style="font-size: 18px; color: #666;">No approved deposits match your search</div>
      </div>
    </div>
  `;

  document.getElementById('pageContent').innerHTML = html;

  // Event listeners
  document.getElementById('refreshDeposits').addEventListener('click', renderAdminDeposits);
  document.getElementById('addCashMRBtn').addEventListener('click', addCashMR);
  
  // Search functionality
  document.getElementById('searchPending')?.addEventListener('input', (e) => {
    filterTable('pending', e.target.value.toLowerCase());
  });
  
  document.getElementById('searchApproved')?.addEventListener('input', (e) => {
    filterTable('approved', e.target.value.toLowerCase());
  });

  // Attach events after DOM update
  setTimeout(() => {
    attachPendingEvents();
    attachApprovedEvents();
  }, 0);
}

// ------------------------------------------------------------
// Filter Table Function - NEW
// ------------------------------------------------------------
function filterTable(type, searchTerm) {
  const table = document.getElementById(type + 'DepositTable');
  const noResults = document.getElementById(type + 'NoResults');
  const rows = table.querySelectorAll('tbody tr');
  let visibleCount = 0;
  
  rows.forEach(row => {
    const text = row.textContent.toLowerCase();
    if (text.includes(searchTerm)) {
      row.style.display = '';
      visibleCount++;
    } else {
      row.style.display = 'none';
    }
  });
  
  // Show/hide no results message
  if (visibleCount === 0) {
    noResults.style.display = 'block';
  } else {
    noResults.style.display = 'none';
  }
}

// ------------------------------------------------------------
// Render Deposit Table (Pending/Approved) - ENHANCED STYLING
// ------------------------------------------------------------
async function renderDepositTable(list, isPending) {
  const db = getDatabase();
  const members = await db.getAll('members') || [];

  // Build table rows with enhanced styling
  const rows = list.map(d => {
    const member = members.find(m => m.id == d.memberId);
    const depositDate = d.depositDate || d.submittedAt || '';
    const formattedDate = depositDate ? new Date(depositDate).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    }) : 'N/A';
    
    const statusClass = d.status == 'PENDING' ? 'st-pending' : 
                       d.status == 'APPROVED' ? 'st-approved' : 'st-rejected';
    
    return `
      <tr style="border-bottom: 1px solid #e9ecef; transition: background 0.3s;" onmouseover="this.style.background='#f8f9fa'" onmouseout="this.style.background=''">
        <td style="padding: 15px 10px; font-weight: 600;">${d.id}</td>
        <td style="padding: 15px 10px;">
          <div style="font-weight: 600;">${member?.name || 'Unknown'}</div>
          <div style="font-size: 12px; color: #666;">${d.memberId}</div>
        </td>
        <td style="padding: 15px 10px;">${d.month} ${d.year || ''}</td>
        <td style="padding: 15px 10px; font-weight: 600; color: #27ae60;">${formatMoney(d.amount)}</td>
        <td style="padding: 15px 10px;">
          <span style="background: #e8f0fe; padding: 4px 8px; border-radius: 6px; font-size: 12px;">
            ${d.paymentMethod}
          </span>
          ${d.fromBank ? `<div style="font-size: 10px; color: #666; margin-top: 4px;">${d.fromBank} → ${d.toBank}</div>` : ''}
        </td>
        <td style="padding: 15px 10px; text-align: center;">
          <span class="status ${statusClass}" style="padding: 6px 12px; border-radius: 20px; font-size: 12px; font-weight: 600;">
            ${d.status}
          </span>
        </td>
        <td style="padding: 15px 10px;">
          ${d.mrId ? 
            `<span style="background: #1e3c72; color: white; padding: 4px 8px; border-radius: 6px; font-family: monospace; font-size: 12px;">${d.mrId}</span>` : 
            '<span style="color: #999;">—</span>'}
        </td>
        <td style="padding: 15px 10px; font-size: 12px; color: #666;">${formattedDate}</td>
        ${isPending ? `
          <td style="padding: 15px 10px;">
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
              <button class="btn success approve-deposit" data-id="${d.id}" style="padding: 6px 12px; background: #27ae60; color: white; border: none; border-radius: 6px; cursor: pointer;">✓ Approve</button>
              <button class="btn danger reject-deposit" data-id="${d.id}" style="padding: 6px 12px; background: #dc3545; color: white; border: none; border-radius: 6px; cursor: pointer;">✗ Reject</button>
              <button class="btn view-slip" data-id="${d.id}" style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">👁️ Slip</button>
              ${d.mrId ? `
                <button class="btn info send-receipt-image" data-id="${d.id}" title="Send Receipt as Image (WhatsApp)" style="padding: 6px 12px; background: #17a2b8; color: white; border: none; border-radius: 6px; cursor: pointer;">
                  📸 Send
                </button>
              ` : ''}
            </div>
          </td>` : `
          <td style="padding: 15px 10px;">
            <div style="display: flex; gap: 5px; flex-wrap: wrap;">
              <button class="btn view-mr" data-id="${d.id}" style="padding: 6px 12px; background: #1e3c72; color: white; border: none; border-radius: 6px; cursor: pointer;">👁️ View MR</button>
              <button class="btn print-mr" data-id="${d.id}" style="padding: 6px 12px; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer;">🖨️ Print</button>
              <button class="btn info send-receipt-image" data-id="${d.id}" title="Send Receipt as Image (WhatsApp)" style="padding: 6px 12px; background: #17a2b8; color: white; border: none; border-radius: 6px; cursor: pointer;">
                📸 Send
              </button>
            </div>
          </td>`}
      </tr>
    `;
  }).join('');

  const colspan = isPending ? 9 : 8;
  const tbody = rows || `<tr><td colspan="${colspan}" style="padding: 40px; text-align: center; color: #999;">
    <div style="font-size: 48px; margin-bottom: 10px;">📭</div>
    <div style="font-size: 16px;">No ${isPending ? 'pending' : 'approved'} deposits found.</div>
  </td></tr>`;

  return `
    <div style="overflow-x: auto;">
      <table style="width:100%; border-collapse: collapse;">
        <thead>
          <tr style="background: #f8f9fa;">
            <th style="padding: 15px 10px; text-align: left;">Deposit ID</th>
            <th style="padding: 15px 10px; text-align: left;">Member</th>
            <th style="padding: 15px 10px; text-align: left;">Month</th>
            <th style="padding: 15px 10px; text-align: right;">Amount</th>
            <th style="padding: 15px 10px; text-align: left;">Payment Method</th>
            <th style="padding: 15px 10px; text-align: center;">Status</th>
            <th style="padding: 15px 10px; text-align: left;">MR ID</th>
            <th style="padding: 15px 10px; text-align: left;">Date</th>
            ${isPending ? '<th style="padding: 15px 10px; text-align: center;">Actions</th>' : '<th style="padding: 15px 10px; text-align: center;">Tools</th>'}
          </tr>
        </thead>
        <tbody>${tbody}</tbody>
      </table>
    </div>
  `;
}

// ------------------------------------------------------------
// Pending deposit button event listeners - UPDATED
// ------------------------------------------------------------
function attachPendingEvents() {
  document.querySelectorAll('.approve-deposit').forEach(btn =>
    btn.addEventListener('click', () => approveDeposit(btn.dataset.id))
  );
  document.querySelectorAll('.reject-deposit').forEach(btn =>
    btn.addEventListener('click', () => rejectDeposit(btn.dataset.id))
  );
  document.querySelectorAll('.view-slip').forEach(btn =>
    btn.addEventListener('click', () => viewSlip(btn.dataset.id))
  );
  document.querySelectorAll('.send-receipt-image').forEach(btn =>
    btn.addEventListener('click', () => sendMoneyReceiptAsImage(btn.dataset.id))
  );
}

// ------------------------------------------------------------
// Approved deposit button event listeners - UPDATED
// ------------------------------------------------------------
function attachApprovedEvents() {
  document.querySelectorAll('.view-mr').forEach(btn =>
    btn.addEventListener('click', () => viewMRReceipt(btn.dataset.id))
  );
  document.querySelectorAll('.print-mr').forEach(btn =>
    btn.addEventListener('click', () => printMR(btn.dataset.id))
  );
  document.querySelectorAll('.send-receipt-image').forEach(btn =>
    btn.addEventListener('click', () => sendMoneyReceiptAsImage(btn.dataset.id))
  );
}

// ------------------------------------------------------------
// Generate new MR ID in format MR-YYYY-000001
// ------------------------------------------------------------
function generateMRId(deposits, year) {
  // If year is undefined or null, use current year
  const targetYear = year || new Date().getFullYear().toString();
  
  // Filter existing MR IDs for the same year
  const yearMRs = deposits
    .map(d => d.mrId)
    .filter(mr => mr && mr.startsWith(`MR-${targetYear}-`));

  // Find max number used
  let max = 0;
  yearMRs.forEach(mr => {
    const parts = mr.split('-');
    const num = parseInt(parts[2], 10);
    if (!isNaN(num) && num > max) max = num;
  });

  // Increment by 1 and pad with zeros
  const nextNum = String(max + 1).padStart(6, '0');
  return `MR-${targetYear}-${nextNum}`;
}

// ------------------------------------------------------------
// Send notification to member
// ------------------------------------------------------------
async function sendNotificationToMember(member, deposit, type) {
  if (!member) return;
  
  const db = getDatabase();
  
  // Create notification in member's panel
  const notification = {
    id: generateId('NOTIF', []),
    memberId: member.id,
    title: type == 'APPROVED' ? 'Deposit Approved' : 'Money Receipt Generated',
    message: type == 'APPROVED' 
      ? `Your deposit of ${formatMoney(deposit.amount)} for ${deposit.month} ${deposit.year} has been approved. MR ID: ${deposit.mrId}`
      : `Money Receipt (MR ID: ${deposit.mrId}) has been generated for your deposit of ${formatMoney(deposit.amount)} for ${deposit.month} ${deposit.year}.`,
    type: 'deposit',
    depositId: deposit.id,
    mrId: deposit.mrId,
    isRead: false,
    createdAt: new Date().toISOString()
  };
  
  await db.save('notifications', notification, notification.id);
  
  // Log WhatsApp and email (these would be implemented with actual APIs)
  if (member.phone) {
    console.log(`WhatsApp to ${member.phone}: ${notification.message}`);
  }
  if (member.email) {
    console.log(`Email to ${member.email}: ${notification.message}`);
    console.log(`Email attachment: Money Receipt MR-${deposit.mrId} sent to ${member.email}`);
  }
}

// ------------------------------------------------------------
// Send Money Receipt as Image to Member - EXACT SAME AS VIEW
// ------------------------------------------------------------
async function sendMoneyReceiptAsImage(depositId) {
  try {
    const db = getDatabase();
    const deposit = await db.get('deposits', depositId);
    if (!deposit) {
      showToast('Error', 'Deposit not found');
      return;
    }

    if (!deposit.mrId) {
      showToast('Error', 'No MR ID found for this deposit');
      return;
    }

    const member = await db.get('members', deposit.memberId);
    if (!member) {
      showToast('Error', 'Member not found');
      return;
    }

    // Check if member has phone or email
    if (!member.phone && !member.email) {
      showToast('Error', 'Member has no phone or email');
      return;
    }

    const meta = await db.get('meta', 'system') || {};

    const confirmSend = confirm(
      `Send Money Receipt to ${member.name}?\n\n` +
      `🧾 MR ID: ${deposit.mrId}\n` +
      `💰 Amount: ${formatMoney(deposit.amount)}\n` +
      `📆 Month: ${deposit.month} ${deposit.year}\n\n` +
      `📱 Phone: ${member.phone || 'Not provided'}\n` +
      `📧 Email: ${member.email || 'Not provided'}\n\n` +
      `Press OK to send receipt as IMAGE via WhatsApp & Email.`
    );
    
    if (!confirmSend) return;

    showToast('Sending', 'Generating receipt image...', 'info');
    
    // Generate the EXACT SAME receipt HTML as view
    const receiptHTML = generateMRReceipt(deposit, member, meta);
    
    // Create a temporary container for the receipt
    const container = document.createElement('div');
    container.style.position = 'absolute';
    container.style.left = '-9999px';
    container.style.top = '-9999px';
    container.style.width = '700px';
    container.style.background = 'white';
    container.style.borderRadius = '18px';
    container.style.overflow = 'hidden';
    container.style.boxShadow = '0 10px 30px rgba(0,0,0,0.1)';
    container.innerHTML = receiptHTML;
    document.body.appendChild(container);

    // Load html2canvas from CDN if not already loaded
    if (!window.html2canvas) {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
      document.head.appendChild(script);
      
      // Wait for script to load
      await new Promise((resolve, reject) => {
        script.onload = resolve;
        script.onerror = reject;
      });
    }

    // Convert receipt to image
    const canvas = await window.html2canvas(container, {
      scale: 2,
      backgroundColor: '#ffffff',
      allowTaint: false,
      useCORS: true,
      logging: false,
      windowWidth: 700,
      windowHeight: container.scrollHeight
    });

    // Remove temporary container
    document.body.removeChild(container);

    // Convert canvas to blob
    const imageBlob = await new Promise(resolve => {
      canvas.toBlob(resolve, 'image/png', 1.0);
    });

    // Create image URL
    const imageUrl = URL.createObjectURL(imageBlob);

    // For WhatsApp - send as image with caption
    const date = new Date(deposit.approvedAt || deposit.submittedAt || new Date());
    const formattedDate = date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });

    const approvedByName = deposit.approvedByName || 'Admin';
    
    const whatsappCaption = 
`🏦 *${meta?.companyName || "Taqwa Properties BD"}*
🧾 *Money Receipt - ${deposit.mrId}*
📅 Date: ${formattedDate}
━━━━━━━━━━━━━━━━━━━━━
👤 Member: ${member?.name || 'N/A'} (${deposit.memberId})
💰 Amount: ${formatMoney(deposit.amount)}
📆 Month: ${deposit.month} ${deposit.year}
━━━━━━━━━━━━━━━━━━━━━
✅ Approved by: ${approvedByName}
━━━━━━━━━━━━━━━━━━━━━

Thank you for your payment!`;

    // For Email - send HTML with embedded image
    const emailMsg = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Money Receipt - ${deposit.mrId}</title>
        <style>
          body { 
            font-family: 'Segoe UI', Arial, sans-serif; 
            margin: 0;
            padding: 20px;
            background: #f0f2f5;
          }
          .email-container {
            max-width: 700px;
            margin: 0 auto;
            background: white;
            border-radius: 18px;
            overflow: hidden;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
          }
          .header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 30px;
            text-align: center;
          }
          .content {
            padding: 30px;
          }
          .footer {
            background: #f8f9fa;
            padding: 20px;
            text-align: center;
            color: #666;
            font-size: 11px;
            border-top: 1px solid #dee2e6;
          }
          .receipt-image {
            max-width: 100%;
            height: auto;
            border-radius: 12px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            margin: 20px 0;
          }
        </style>
      </head>
      <body>
        <div class="email-container">
          <div class="header">
            <h2 style="margin:0; font-size:28px;">🏦 ${meta?.companyName || "Taqwa Properties BD"}</h2>
            <p style="margin:5px 0; opacity:0.9;">${meta?.companyAddress || "Dhaka, Bangladesh"}</p>
            <p style="margin:5px 0; opacity:0.8;">📞 ${meta?.companyPhone || "+8801344119333"}</p>
          </div>
          
          <div class="content">
            <p>Dear ${member.name},</p>
            <p>Your Money Receipt is attached below:</p>
            
            <!-- Embedded Image -->
            <img src="cid:receipt-image" alt="Money Receipt" class="receipt-image"/>
            
            <p style="margin-top:20px;">Thank you for your payment!</p>
          </div>
          
          <div class="footer">
            <p style="margin:0 0 5px;">*** This is a computer generated receipt. No signature required. ***</p>
            <p style="margin:0;">Sent on: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send via both channels
    let whatsappSent = false;
    let emailSent = false;

    if (member.phone) {
      // In production, replace with actual WhatsApp API call that supports images
      console.log(`📱 WhatsApp Image to ${member.phone}:`);
      console.log('Image URL:', imageUrl);
      console.log('Caption:', whatsappCaption);
      
      // Simulate successful send
      whatsappSent = true;
    }
    
    if (member.email) {
      // In production, replace with actual Email API call with attachment
      console.log(`📧 Email to ${member.email}:`);
      console.log('Email HTML:', emailMsg);
      console.log('Image attachment:', imageUrl);
      
      // Simulate successful send
      emailSent = true;
    }

    // Clean up image URL after 5 seconds
    setTimeout(() => URL.revokeObjectURL(imageUrl), 5000);

    // Log activity
    await logActivity('SEND_MONEY_RECEIPT_IMAGE', 
      `Money Receipt ${deposit.mrId} sent to ${member.id} - WhatsApp: ${whatsappSent ? 'Yes' : 'No'}, Email: ${emailSent ? 'Yes' : 'No'}`
    );

    // Show success message
    const channels = [];
    if (whatsappSent) channels.push('WhatsApp (as Image)');
    if (emailSent) channels.push('Email');
    
    showToast('✅ Success', `Money Receipt sent via ${channels.join(' & ')}`);
    
  } catch (error) {
    console.error('sendMoneyReceiptAsImage error:', error);
    showToast('❌ Error', 'Failed to send money receipt: ' + error.message);
  }
}

// ------------------------------------------------------------
// Add Cash MR Modal with Year, Month & Slip Upload
// ------------------------------------------------------------
async function addCashMR() {
  const db = getDatabase();
  const members = await db.query('members', [
    { field: 'approved', operator: '==', value: true },
    { field: 'status', operator: '==', value: 'ACTIVE' }
  ]);

  // Build member options dropdown
  const memberOptions = members.map(m => `<option value="${m.id}">${m.name} (${m.id})</option>`).join('');

  // Build year & month dropdowns
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => `<option value="${currentYear - i}">${currentYear - i}</option>`).join('');
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ].map(m => `<option value="${m}" ${m == new Date().toLocaleString('default', { month: 'long' }) ? 'selected' : ''}>${m}</option>`).join('');

  // HTML for Cash MR Modal
  const html = `
    <div class="panel">
      <h3>Add Cash Money Receipt</h3>

      <!-- Row 1: Member + Year -->
      <div class="row row-3">
        <div>
          <label>Member *</label>
          <select id="cash_member">${memberOptions}</select>
        </div>
        <div>
          <label>Year *</label>
          <select id="cash_year">${years}</select>
        </div>
      </div>

      <!-- Row 2: Month + Amount + Payment Method -->
      <div class="row row-3">
        <div>
          <label>Month *</label>
          <select id="cash_month">${months}</select>
        </div>
        <div>
          <label>Amount *</label>
          <input id="cash_amount" value="10000" type="number" />
        </div>
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

      <!-- Bank Transfer Section (Toggleable) -->
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

      <!-- Row 3: Transaction ID + Date + Deposit Slip + Notes -->
      <div class="row row-2">
        <div>
          <label>Transaction ID *</label>
          <input id="d_trx" placeholder="Enter TRX ID" />
        </div>
        <div>
          <label>Date</label>
          <input id="cash_date" type="date" value="${new Date().toISOString().split('T')[0]}" />
        </div>
        <div class="row row-1">
          <div>
            <label>Deposit Slip</label>
            <input type="file" id="cash_slip" accept="image/*" />
          </div>
        </div>
        <div>
          <label>Notes</label>
          <input id="cash_note" placeholder="Optional" />
        </div>
      </div>

      <div class="hr"></div>

      <!-- Action Buttons -->
      <button class="btn success" id="saveCashMRBtn">Save & Generate MR</button>
      <button class="btn" onclick="closeModal('modalViewer')">Cancel</button>
    </div>
  `;

  // Toggle Bank Fields function
  const toggleBankFields = () => {
    const method = document.getElementById('d_method').value;
    const bankFields = document.getElementById('bankFields');
    bankFields.style.display = method === 'Bank Transfer' ? 'block' : 'none';
  };

  openViewerModal('Add Cash MR', 'Create money receipt', html);

  // Attach event listeners
  document.getElementById('saveCashMRBtn').addEventListener('click', saveCashMRWithSlip);
  document.getElementById('d_method').addEventListener('change', toggleBankFields);
}

// ------------------------------------------------------------
// Save Cash MR including uploaded slip - UPDATED with approver info
// ------------------------------------------------------------
async function saveCashMRWithSlip() {
  const db = getDatabase();
  const currentUser = getCurrentUser();
  const memberId = document.getElementById('cash_member').value;
  const amount = Number(document.getElementById('cash_amount').value || 0);
  const year = document.getElementById('cash_year').value;
  const month = document.getElementById('cash_month').value;
  const date = document.getElementById('cash_date').value;
  const note = document.getElementById('cash_note').value.trim();
  const slipFile = document.getElementById('cash_slip').files[0];
  const paymentMethod = document.getElementById('d_method').value;
  const fromBank = document.getElementById('d_from_bank')?.value || '';
  const toBank = document.getElementById('d_to_bank')?.value || '';
  const trxId = document.getElementById('d_trx')?.value || 'CASH-' + Date.now();

  if (!memberId || !amount || !year || !month || !date || paymentMethod == 'Select Method') {
    showToast('Validation Error', 'Fill all required fields (*)');
    return;
  }

  const slipData = slipFile ? await fileToBase64(slipFile) : '';
  const deposits = await db.getAll('deposits') || [];

  // Generate unique MR ID automatically
  const mrId = generateMRId(deposits, year);

  const depositData = {
    id: generateId('DP', deposits),
    memberId, year, month, amount,
    paymentMethod, fromBank, toBank, trxId,
    slip: slipData, note, status: 'APPROVED',
    mrId, depositDate: date,
    submittedAt: new Date().toISOString(),
    approvedAt: new Date().toISOString(),
    approvedBy: currentUser.id,
    approvedByName: currentUser.name || currentUser.email || 'Admin',
    approvedByEmail: currentUser.email || ''
  };

  await db.save('deposits', depositData, depositData.id);
  await logActivity('ADD_CASH_MR', `Cash MR added: ${mrId} for ${memberId} by ${depositData.approvedByName}`);

  // Send notification to member
  const member = await db.get('members', memberId);
  if (member) {
    await sendNotificationToMember(member, depositData, 'APPROVED');
  }

  showToast('Cash MR Created', `MR ${mrId} generated successfully.`);
  closeModal('modalViewer');
  renderAdminDeposits();
}

// ------------------------------------------------------------
// Approve Deposit with auto MR ID - UPDATED with approver info
// ------------------------------------------------------------
async function approveDeposit(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);
  if (!deposit) return;

  const deposits = await db.getAll('deposits') || [];
  const currentUser = getCurrentUser();

  // Ensure year is defined (use current year if not set)
  const year = deposit.year || new Date().getFullYear().toString();

  // Auto-generate MR ID for approved deposit
  deposit.mrId = generateMRId(deposits, year);
  deposit.status = 'APPROVED';
  deposit.approvedAt = new Date().toISOString();
  deposit.approvedBy = currentUser.id;
  deposit.approvedByName = currentUser.name || currentUser.email || 'Admin';
  deposit.approvedByEmail = currentUser.email || '';

  await db.update('deposits', depositId, deposit);
  await logActivity('APPROVE_DEPOSIT', `Deposit approved: ${depositId} MR: ${deposit.mrId} by ${deposit.approvedByName}`);

  // Send notification to member
  const member = await db.get('members', deposit.memberId);
  if (member) {
    await sendNotificationToMember(member, deposit, 'APPROVED');
  }

  showToast('Deposit Approved', `MR ID generated: ${deposit.mrId}`);
  buildSidebar();
  renderAdminDeposits();
}

// ------------------------------------------------------------
// View Deposit Slip (Preview uploaded slip)
// ------------------------------------------------------------
async function viewSlip(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);
  if (!deposit) return;

  const html = `
    <div class="panel" style="max-width: 800px; margin: 0 auto;">
      <div style="text-align: center; margin-bottom: 20px;">
        <h3 style="color: #1e3c72;">📎 Deposit Slip Preview</h3>
        <p class="small" style="color: #666;">
          Deposit ID: ${deposit.id} | Member: ${deposit.memberId}
        </p>
      </div>
      <div class="hr"></div>
      <div style="text-align: center; padding: 20px;">
        ${deposit.slip
          ? `<img src="${deposit.slip}" style="width:100%;max-width:700px;border-radius:18px;border:2px solid var(--line);box-shadow: 0 10px 30px rgba(0,0,0,0.1);"/>`
          : `<div style="padding: 60px; text-align: center; background: #f8f9fa; border-radius: 12px;">
              <div style="font-size: 64px; margin-bottom: 20px;">📭</div>
              <div style="font-size: 18px; color: #666;">No slip uploaded for this deposit</div>
            </div>`}
      </div>
      <div style="display: flex; gap: 10px; justify-content: center; margin-top: 20px;">
        <button class="btn" onclick="closeModal('modalViewer')">Close</button>
      </div>
    </div>
  `;

  openViewerModal('Deposit Slip', 'Slip preview', html);
}

// ------------------------------------------------------------
// Reject Deposit with note and send notification - UPDATED with approver info
// ------------------------------------------------------------
async function rejectDeposit(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);
  if (!deposit) return;

  const currentUser = getCurrentUser();
  const note = prompt('Rejection note?');
  if (note == null) return;

  deposit.status = 'REJECTED';
  deposit.note = (deposit.note ? deposit.note + '\n' : '') + 'Rejected: ' + note;
  deposit.approvedAt = new Date().toISOString();
  deposit.approvedBy = currentUser.id;
  deposit.approvedByName = currentUser.name || currentUser.email || 'Admin';
  deposit.approvedByEmail = currentUser.email || '';

  await db.update('deposits', depositId, deposit);
  await logActivity('REJECT_DEPOSIT', `Deposit rejected: ${depositId} by ${deposit.approvedByName}`);

  // Send notification to member
  const member = await db.get('members', deposit.memberId);
  if (member) {
    const notification = {
      id: generateId('NOTIF', []),
      memberId: member.id,
      title: 'Deposit Rejected',
      message: `Your deposit of ${formatMoney(deposit.amount)} for ${deposit.month} ${deposit.year} has been rejected. Reason: ${note}`,
      type: 'deposit',
      depositId: deposit.id,
      isRead: false,
      createdAt: new Date().toISOString()
    };
    
    await db.save('notifications', notification, notification.id);
    
    console.log(`WhatsApp to ${member.phone}: Deposit rejected. Reason: ${note}`);
    console.log(`Email to ${member.email}: Deposit rejected. Reason: ${note}`);
  }

  showToast('Deposit Rejected', `Deposit ${depositId} rejected.`);
  buildSidebar();
  renderAdminDeposits();
}

// ------------------------------------------------------------
// View MR Receipt in modal
// ------------------------------------------------------------
async function viewMRReceipt(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);
  if (!deposit || !deposit.mrId) {
    showToast('Error', 'No MR ID found');
    return;
  }

  const member = await db.get('members', deposit.memberId);
  const meta = await db.get('meta', 'system') || {};

  // Log viewing activity
  await logActivity('VIEW_MR', `MR viewed: ${deposit.mrId} for ${deposit.memberId}`);
  
  // সরাসরি openMRReceiptModal কল করুন (এটা mr-receipt.js থেকে ইম্পোর্ট করা আছে)
  openMRReceiptModal(deposit, member, meta);
}

// ------------------------------------------------------------
// Print MR Receipt (new window) - UPDATED with approver info in receipt
// ------------------------------------------------------------
async function printMR(depositId) {
  const db = getDatabase();
  const deposit = await db.get('deposits', depositId);
  const member = await db.get('members', deposit.memberId);
  const meta = await db.get('meta', 'system') || {};

  if (!deposit || !deposit.mrId) {
    showToast('Error', 'No MR ID found');
    return;
  }

  const receiptHTML = generateMRReceipt(deposit, member, meta);
  const w = window.open('', '_blank');
  w.document.write(`
    <html>
      <head>
        <title>Money Receipt - ${deposit.mrId}</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          .receipt { max-width: 800px; margin: 0 auto; border: 1px solid #ddd; padding: 20px; }
          .header { text-align: center; margin-bottom: 30px; }
          .details { margin: 20px 0; }
          .row { display: flex; justify-content: space-between; margin: 10px 0; }
          .signature { display: flex; justify-content: space-between; margin-top: 50px; }
          .signature div { text-align: center; }
          .approver-info { background: #f0f7f0; padding: 10px; border-radius: 5px; margin: 20px 0; text-align: center; border: 1px dashed #27ae60; }
        </style>
      </head>
      <body>
        ${receiptHTML}
        <script>
          window.onload = () => {
            window.print();
            setTimeout(() => window.close(), 500);
          }
        </script>
      </body>
    </html>
  `);
  w.document.close();

  // Log printing activity and notify member
  await logActivity('PRINT_MR', `MR printed: ${deposit.mrId} for ${deposit.memberId}`);
  
  if (member) {
    await sendNotificationToMember(member, deposit, 'PRINT');
    console.log(`WhatsApp to ${member.phone}: Money Receipt printed. MR ID: ${deposit.mrId}`);
    console.log(`Email to ${member.email}: Money Receipt printed. MR ID: ${deposit.mrId}`);
  }
}

// ------------------------------------------------------------
// Generate MR Receipt HTML (with all details) - UPDATED with approver info
// ------------------------------------------------------------
function generateMRReceipt(deposit, member, meta) {
  const date = new Date(deposit.approvedAt || deposit.submittedAt);
  const formattedDate = date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  // Approver information
  const approvedByName = deposit.approvedByName || 'Admin';
  const approvedByEmail = deposit.approvedByEmail || 'admin@ims.com';
  const approvedAt = deposit.approvedAt ? new Date(deposit.approvedAt).toLocaleString() : 'N/A';

  return `
   <div class="receipt">
      <div class="header">
        <h2>${meta?.companyName || "Taqwa Properties BD"}</h2>
        <p>${meta?.companyAddress || "Dhaka, Bangladesh"}</p>
        <p>Phone: ${meta?.companyPhone || "+8801344119333"} | Email: ${meta?.companyEmail || "shaque.shamim@gmail.com"}</p>
      </div>
      <h2 style="text-align:center;margin-bottom:30px;">MONEY RECEIPT</h2>
      <div class="details">
        <div class="row">
          <div><strong>MR No:</strong> ${deposit.mrId || deposit.id}</div>
          <div><strong>Date:</strong> ${formattedDate}</div>
        </div>
        <div class="row">
          <div><strong>Received from:</strong> ${member?.name || "N/A"}</div>
          <div><strong>Member ID:</strong> ${deposit.memberId}</div>
        </div>
        <div class="row">
          <div><strong>For the month of:</strong> ${deposit.month} ${deposit.year}</div>
          <div><strong>Payment Method:</strong> ${deposit.paymentMethod}</div>
        </div>
        <div class="row">
          <div><strong>Transaction ID:</strong> ${deposit.trxId || "N/A"}</div>
          <div></div>
        </div>
        <div style="margin-top:30px;text-align:center;">
          <h3 style="font-size:24px;margin:0;">Amount in Words:</h3>
          <p style="font-size:18px;margin:10px 0 30px 0;">${numberToWords(deposit.amount)} Taka Only</p>
        </div>
        <div style="text-align:center;margin:40px 0;">
          <h1 style="font-size:48px;margin:0;color:#2c3e50;">${formatMoney(deposit.amount)}</h1>
          <p style="font-size:18px;margin-top:10px;">(Paid in full)</p>
        </div>
      </div>
      
      <!-- Approver Information Section -->
      <div class="approver-info" style="background: #f0f7f0; padding: 15px; border-radius: 8px; margin: 20px 0; text-align: center; border: 1px dashed #27ae60;">
        <p style="margin:0 0 5px; color:#27ae60; font-weight:600;">✓ APPROVED & VERIFIED</p>
        <p style="margin:5px 0;"><strong>Approved By:</strong> ${approvedByName}</p>
        <p style="margin:5px 0;"><strong>Email:</strong> ${approvedByEmail}</p>
        <p style="margin:5px 0;"><strong>Approval Date:</strong> ${approvedAt}</p>
      </div>
      
      <div class="signature">
        <div>
          <p>_________________________</p>
          <p>Receiver's Signature</p>
          <p>Date: ${new Date().toLocaleDateString()}</p>
        </div>
        <div>
          <p>_________________________</p>
          <p>Authorized Signature</p>
          <p>${meta?.companyName || "Taqwa Properties BD"}</p>
        </div>
      </div>
      <div style="margin-top:40px;font-size:12px;text-align:center;color:#666;">
        <p>*** This is a computer generated receipt. No signature required. ***</p>
        <p>Generated on: ${new Date().toLocaleString()}</p>
      </div>
    </div>
  `;
}
