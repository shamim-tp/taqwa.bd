// ============================================================
// 📄 MEMBER BIO-DATA FORM MODULE
// IMS ERP V5
// ============================================================

import { getDatabase } from '../database/db.js';
import { showToast, formatMoney, formatDate } from '../utils/common.js';
import { openViewerModal } from '../modals/viewer.js';

/**
 * Member Bio-data Form ডাউনলোড ফাংশন
 * @param {string} memberId - মেম্বার আইডি
 */
export async function downloadMemberBioData(memberId) {
  try {
    const db = getDatabase();
    const member = await db.get('members', memberId);
    if (!member) {
      showToast('Error', 'Member not found');
      return;
    }

    // মেম্বারের ডিপোজিট হিস্টোরি নেওয়া
    const deposits = await db.query('deposits', [
      { field: 'memberId', operator: '==', value: memberId },
      { field: 'status', operator: '==', value: 'APPROVED' }
    ]);

    const totalDeposit = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);
    const lastDeposit = deposits.length > 0 ? deposits[deposits.length - 1] : null;

    // বর্তমান তারিখ
    const today = new Date();
    const formattedDate = today.toLocaleDateString('bn-BD', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    // HTML ফরম তৈরি
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <title>Member Bio-data - ${member.id}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: 'Segoe UI', 'Arial', sans-serif;
            background: #f0f2f5;
            padding: 30px 20px;
            line-height: 1.6;
          }
          
          .bio-container {
            max-width: 1100px;
            margin: 0 auto;
            background: white;
            border-radius: 24px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.15);
            overflow: hidden;
            position: relative;
          }
          
          /* Watermark Background */
          .bio-container::before {
            content: "";
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" opacity="0.03"><text x="50" y="50" font-size="80" text-anchor="middle" dominant-baseline="middle" font-family="Arial" font-weight="bold">IMS</text></svg>') repeat;
            pointer-events: none;
          }
          
          /* Header with Gradient */
          .bio-header {
            background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
            color: white;
            padding: 40px 30px;
            position: relative;
            overflow: hidden;
          }
          
          .bio-header::after {
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
            margin-bottom: 5px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
          }
          
          .company-tagline {
            font-size: 16px;
            opacity: 0.9;
            margin-bottom: 20px;
            font-style: italic;
          }
          
          .bio-title {
            font-size: 42px;
            font-weight: 800;
            margin: 20px 0 10px;
            text-transform: uppercase;
            letter-spacing: 3px;
            border-left: 5px solid #ffd700;
            padding-left: 20px;
          }
          
          .member-id-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 12px 30px;
            border-radius: 50px;
            font-size: 24px;
            font-weight: 700;
            border: 2px solid rgba(255,255,255,0.3);
            backdrop-filter: blur(5px);
            margin-top: 15px;
          }
          
          /* Main Content */
          .bio-content {
            padding: 40px;
            background: white;
          }
          
          /* Photo Section */
          .photo-section {
            display: flex;
            gap: 30px;
            margin-bottom: 40px;
            flex-wrap: wrap;
          }
          
          .member-photo {
            flex: 0 0 200px;
            text-align: center;
          }
          
          .photo-frame {
            width: 200px;
            height: 200px;
            border-radius: 50%;
            border: 5px solid #1e3c72;
            overflow: hidden;
            box-shadow: 0 10px 20px rgba(0,0,0,0.1);
            margin-bottom: 10px;
          }
          
          .photo-frame img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }
          
          .photo-label {
            font-size: 14px;
            color: #666;
            margin-top: 5px;
          }
          
          .member-quick-info {
            flex: 1;
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            background: #f8f9fa;
            padding: 25px;
            border-radius: 20px;
          }
          
          .info-card {
            background: white;
            padding: 15px;
            border-radius: 12px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.05);
          }
          
          .info-label {
            font-size: 13px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 5px;
          }
          
          .info-value {
            font-size: 18px;
            font-weight: 600;
            color: #1e3c72;
          }
          
          .status-badge {
            display: inline-block;
            padding: 5px 15px;
            border-radius: 50px;
            font-size: 14px;
            font-weight: 600;
          }
          
          .status-active {
            background: #d4edda;
            color: #155724;
          }
          
          .status-pending {
            background: #fff3cd;
            color: #856404;
          }
          
          .status-inactive {
            background: #f8d7da;
            color: #721c24;
          }
          
          /* Section Styles */
          .section {
            margin: 40px 0;
            position: relative;
          }
          
          .section-title {
            font-size: 24px;
            color: #1e3c72;
            margin-bottom: 25px;
            padding-bottom: 12px;
            border-bottom: 3px solid #1e3c72;
            position: relative;
          }
          
          .section-title::after {
            content: "";
            position: absolute;
            bottom: -3px;
            left: 0;
            width: 100px;
            height: 3px;
            background: #ffd700;
          }
          
          /* Grid Layouts */
          .grid-2 {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 25px;
          }
          
          .grid-3 {
            display: grid;
            grid-template-columns: repeat(3, 1fr);
            gap: 20px;
          }
          
          .grid-4 {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 20px;
          }
          
          /* Field Styles */
          .field-group {
            background: #f8f9fa;
            padding: 15px;
            border-radius: 12px;
            transition: all 0.3s ease;
            border: 1px solid #e9ecef;
          }
          
          .field-group:hover {
            transform: translateY(-2px);
            box-shadow: 0 5px 15px rgba(0,0,0,0.1);
            border-color: #1e3c72;
          }
          
          .field-label {
            font-size: 12px;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 8px;
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .field-label i {
            color: #1e3c72;
          }
          
          .field-value {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            word-break: break-word;
          }
          
          .field-value.empty {
            color: #999;
            font-style: italic;
          }
          
          /* NID Images Section */
          .nid-section {
            background: #f8f9fa;
            padding: 25px;
            border-radius: 16px;
            margin: 30px 0;
          }
          
          .nid-images {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 20px;
            margin-top: 20px;
          }
          
          .nid-card {
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
          }
          
          .nid-card img {
            width: 100%;
            height: 200px;
            object-fit: cover;
          }
          
          .nid-card .nid-label {
            padding: 10px;
            text-align: center;
            background: #1e3c72;
            color: white;
            font-weight: 600;
          }
          
          /* Deposit History Table */
          .deposit-table {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            box-shadow: 0 4px 12px rgba(0,0,0,0.05);
          }
          
          .deposit-table th {
            background: #1e3c72;
            color: white;
            padding: 12px;
            font-weight: 600;
            font-size: 14px;
          }
          
          .deposit-table td {
            padding: 12px;
            border-bottom: 1px solid #e9ecef;
            text-align: center;
          }
          
          .deposit-table tr:last-child td {
            border-bottom: none;
          }
          
          .deposit-table tr:hover {
            background: #f8f9fa;
          }
          
          .total-row {
            background: #e9ecef;
            font-weight: 700;
          }
          
          .total-row td {
            border-top: 2px solid #1e3c72;
          }
          
          /* Signature Section */
          .signature-section {
            display: flex;
            justify-content: space-between;
            margin: 50px 0 30px;
            padding-top: 30px;
            border-top: 2px dashed #dee2e6;
          }
          
          .signature-box {
            text-align: center;
            flex: 1;
          }
          
          .signature-line {
            width: 250px;
            height: 1px;
            background: #333;
            margin: 20px auto 10px;
          }
          
          .signature-label {
            font-size: 14px;
            color: #666;
          }
          
          /* Footer */
          .bio-footer {
            background: #f8f9fa;
            padding: 20px 40px;
            text-align: center;
            color: #666;
            font-size: 13px;
            border-top: 1px solid #dee2e6;
          }
          
          .qr-placeholder {
            width: 100px;
            height: 100px;
            background: #1e3c72;
            margin: 10px auto;
            border-radius: 10px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-size: 12px;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            .bio-container {
              box-shadow: none;
            }
          }
        </style>
      </head>
      <body>
        <div class="bio-container">
          <!-- Header -->
          <div class="bio-header">
            <div class="company-name">IMS INVESTMENT LTD.</div>
            <div class="company-tagline">Trust • Growth • Prosperity</div>
            <div class="bio-title">MEMBER BIO-DATA</div>
            <div class="member-id-badge">ID: ${member.id}</div>
          </div>
          
          <!-- Main Content -->
          <div class="bio-content">
            <!-- Photo & Quick Info -->
            <div class="photo-section">
              <div class="member-photo">
                <div class="photo-frame">
                  ${member.photo ? 
                    `<img src="${member.photo}" alt="Member Photo" />` : 
                    `<div style="width:100%;height:100%;background:#e9ecef;display:flex;align-items:center;justify-content:center;color:#999;">No Photo</div>`
                  }
                </div>
                <div class="photo-label">Member Photograph</div>
              </div>
              
              <div class="member-quick-info">
                <div class="info-card">
                  <div class="info-label">Member Type</div>
                  <div class="info-value">${member.memberType || 'N/A'}</div>
                </div>
                <div class="info-card">
                  <div class="info-label">Status</div>
                  <div class="info-value">
                    <span class="status-badge ${member.status == 'ACTIVE' ? 'status-active' : member.status == 'PENDING' ? 'status-pending' : 'status-inactive'}">
                      ${member.status || 'N/A'}
                    </span>
                  </div>
                </div>
                <div class="info-card">
                  <div class="info-label">Shares</div>
                  <div class="info-value">${member.shares || 1}</div>
                </div>
                <div class="info-card">
                  <div class="info-label">Join Date</div>
                  <div class="info-value">${formatDate(member.joinDate) || 'N/A'}</div>
                </div>
              </div>
            </div>
            
            <!-- Personal Information -->
            <div class="section">
              <h3 class="section-title">📋 Personal Information</h3>
              <div class="grid-3">
                <div class="field-group">
                  <div class="field-label"><i>👤</i> Full Name</div>
                  <div class="field-value">${member.name || 'N/A'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>👨</i> Father's Name</div>
                  <div class="field-value ${!member.fatherName ? 'empty' : ''}">${member.fatherName || 'Not Provided'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>👩</i> Mother's Name</div>
                  <div class="field-value ${!member.motherName ? 'empty' : ''}">${member.motherName || 'Not Provided'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>🎂</i> Date of Birth</div>
                  <div class="field-value ${!member.dob ? 'empty' : ''}">${member.dob ? formatDate(member.dob) : 'Not Provided'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>📱</i> Phone Number</div>
                  <div class="field-value">${member.phone || 'N/A'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>📧</i> Email Address</div>
                  <div class="field-value ${!member.email ? 'empty' : ''}">${member.email || 'Not Provided'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>🏠</i> Present Address</div>
                  <div class="field-value ${!member.address ? 'empty' : ''}">${member.address || 'Not Provided'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>🆔</i> NID Number</div>
                  <div class="field-value ${!member.nidNo ? 'empty' : ''}">${member.nidNo || 'Not Provided'}</div>
                </div>
              </div>
            </div>
            
            <!-- Nominee Information -->
            <div class="section">
              <h3 class="section-title">👥 Nominee Information</h3>
              <div class="grid-3">
                <div class="field-group">
                  <div class="field-label"><i>👤</i> Nominee Name</div>
                  <div class="field-value ${!member.nomineeName ? 'empty' : ''}">${member.nomineeName || 'Not Provided'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>🔗</i> Relationship</div>
                  <div class="field-value ${!member.nomineeRelation ? 'empty' : ''}">${member.nomineeRelation || 'Not Provided'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>📱</i> Nominee Phone</div>
                  <div class="field-value ${!member.nomineePhone ? 'empty' : ''}">${member.nomineePhone || 'Not Provided'}</div>
                </div>
                <div class="field-group">
                  <div class="field-label"><i>🆔</i> Nominee NID</div>
                  <div class="field-value ${!member.nomineeNid ? 'empty' : ''}">${member.nomineeNid || 'Not Provided'}</div>
                </div>
              </div>
              
              ${member.nomineePhoto ? `
              <div style="margin-top: 20px;">
                <div class="field-label">Nominee Photograph</div>
                <div class="photo-frame" style="width:150px;height:150px;">
                  <img src="${member.nomineePhoto}" alt="Nominee Photo" />
                </div>
              </div>
              ` : ''}
            </div>
            
            <!-- NID Documents -->
            <div class="nid-section">
              <h4 style="color:#1e3c72; margin-bottom:15px;">🪪 NID Documents</h4>
              <div class="nid-images">
                ${member.nidFront ? `
                <div class="nid-card">
                  <img src="${member.nidFront}" alt="NID Front" />
                  <div class="nid-label">NID Front</div>
                </div>
                ` : ''}
                ${member.nidBack ? `
                <div class="nid-card">
                  <img src="${member.nidBack}" alt="NID Back" />
                  <div class="nid-label">NID Back</div>
                </div>
                ` : ''}
                ${member.nomineeNidFront ? `
                <div class="nid-card">
                  <img src="${member.nomineeNidFront}" alt="Nominee NID Front" />
                  <div class="nid-label">Nominee NID Front</div>
                </div>
                ` : ''}
                ${member.nomineeNidBack ? `
                <div class="nid-card">
                  <img src="${member.nomineeNidBack}" alt="Nominee NID Back" />
                  <div class="nid-label">Nominee NID Back</div>
                </div>
                ` : ''}
              </div>
            </div>
            
            <!-- Financial Summary -->
            <div class="section">
              <h3 class="section-title">💰 Financial Summary</h3>
              <div class="grid-2">
                <div class="field-group" style="background: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%); color: white;">
                  <div class="field-label" style="color: rgba(255,255,255,0.9);">Total Deposits</div>
                  <div class="field-value" style="font-size: 28px; color: white;">${formatMoney(totalDeposit)}</div>
                </div>
                <div class="field-group">
                  <div class="field-label">Total Shares</div>
                  <div class="field-value" style="font-size: 24px;">${member.shares || 1}</div>
                </div>
              </div>
              
              <!-- Deposit History -->
              ${deposits.length > 0 ? `
              <h4 style="margin: 30px 0 15px; color:#1e3c72;">Deposit History</h4>
              <table class="deposit-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Month</th>
                    <th>Amount</th>
                    <th>MR ID</th>
                  </tr>
                </thead>
                <tbody>
                  ${deposits.slice(-5).reverse().map(d => `
                    <tr>
                      <td>${formatDate(d.depositDate)}</td>
                      <td>${d.month || 'N/A'}</td>
                      <td>${formatMoney(d.amount)}</td>
                      <td>${d.mrId || 'Pending'}</td>
                    </tr>
                  `).join('')}
                  ${deposits.length > 5 ? `
                    <tr><td colspan="4" style="text-align:center; color:#666;">... and ${deposits.length - 5} more deposits</td></tr>
                  ` : ''}
                  <tr class="total-row">
                    <td colspan="2"><strong>Total</strong></td>
                    <td><strong>${formatMoney(totalDeposit)}</strong></td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
              ` : '<p style="color:#999; text-align:center; padding:20px;">No deposit history found.</p>'}
            </div>
            
            <!-- Signature Section -->
            <div class="signature-section">
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Member's Signature</div>
              </div>
              <div class="signature-box">
                <div class="signature-line"></div>
                <div class="signature-label">Authorized Signature</div>
              </div>
            </div>
            
            <!-- Generated Date -->
            <div style="text-align: right; margin-top: 20px; color: #666;">
              <p>Generated on: ${formattedDate}</p>
            </div>
          </div>
          
          <!-- Footer -->
          <div class="bio-footer">
            <div style="display: flex; justify-content: space-between; align-items: center;">
              <div>This is a computer generated document. No signature required.</div>
              <div style="display: flex; gap: 20px;">
                <div>www.imsinvestment.com</div>
                <div>info@imsinvestment.com</div>
              </div>
            </div>
            <div style="margin-top: 10px; font-size: 11px;">
              Document ID: BIO-${member.id}-${Date.now().toString().slice(-6)}
            </div>
          </div>
        </div>
        
        <script>
          // প্রিন্ট করার জন্য ছবি লোড হওয়া পর্যন্ত অপেক্ষা
          window.onload = function() {
            setTimeout(() => {
              window.print();
            }, 500);
          }
        </script>
      </body>
      </html>
    `;

    // নতুন উইন্ডোতে খোলা এবং প্রিন্ট/ডাউনলোড
    const printWindow = window.open('', '_blank');
    printWindow.document.write(html);
    printWindow.document.close();

  } catch (error) {
    console.error('downloadMemberBioData error:', error);
    showToast('Error', 'Bio-data form download করতে সমস্যা হয়েছে।');
  }
}

/**
 * Member Bio-data Form Preview Modal
 * @param {string} memberId - মেম্বার আইডি
 */
export async function previewMemberBioData(memberId) {
  try {
    const db = getDatabase();
    const member = await db.get('members', memberId);
    if (!member) {
      showToast('Error', 'Member not found');
      return;
    }

    const deposits = await db.query('deposits', [
      { field: 'memberId', operator: '==', value: memberId },
      { field: 'status', operator: '==', value: 'APPROVED' }
    ]);

    const totalDeposit = deposits.reduce((sum, d) => sum + Number(d.amount || 0), 0);

    // প্রিভিউ HTML (সিম্পল ভার্সন)
    const previewHtml = `
      <div class="panel">
        <div class="panelHeader">
          <div>
            <h3>Member Bio-data Form</h3>
            <p>${member.name} (${member.id})</p>
          </div>
        </div>
        
        <div style="text-align: center; padding: 30px;">
          <div style="font-size: 48px; color: #1e3c72; margin-bottom: 20px;">📄</div>
          <h2>Member Bio-data Form</h2>
          <p style="color: #666; margin: 20px 0;">Complete profile information with all documents will be downloaded as PDF.</p>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 12px; margin: 30px 0; text-align: left;">
            <div class="row"><strong>Member ID:</strong> ${member.id}</div>
            <div class="row"><strong>Name:</strong> ${member.name}</div>
            <div class="row"><strong>Type:</strong> ${member.memberType}</div>
            <div class="row"><strong>Status:</strong> <span class="status ${member.status == 'ACTIVE' ? 'st-approved' : 'st-pending'}">${member.status}</span></div>
            <div class="row"><strong>Total Deposits:</strong> ${formatMoney(totalDeposit)}</div>
            <div class="row"><strong>Documents:</strong> 
              ${member.photo ? '✓ Photo ' : '✗ Photo '}
              ${member.nidFront ? '✓ NID Front ' : '✗ NID Front '}
              ${member.nidBack ? '✓ NID Back' : '✗ NID Back'}
            </div>
          </div>
          
          <div style="display: flex; gap: 15px; justify-content: center;">
            <button class="btn success" id="downloadBioBtn">
              ⬇️ Download Bio-data Form
            </button>
            <button class="btn" onclick="closeModal('modalViewer')">
              Cancel
            </button>
          </div>
        </div>
      </div>
    `;

    openViewerModal('Member Bio-data', 'Download complete profile', previewHtml);

    setTimeout(() => {
      document.getElementById('downloadBioBtn')?.addEventListener('click', () => {
        downloadMemberBioData(memberId);
      });
    }, 100);

  } catch (error) {
    console.error('previewMemberBioData error:', error);
    showToast('Error', 'Preview দেখাতে সমস্যা হয়েছে।');
  }
}

// ============================================================
// 📱 মেম্বার টেবিলে বাটন যোগ করার জন্য আপডেট
// ============================================================

// এই ফাংশনটি আপনার existing renderMembersTable ফাংশনে যোগ করতে হবে
export function addBioDataButtonToTable() {
  // মেম্বার টেবিলের Tools কলামে নতুন বাটন যোগ করা
  document.querySelectorAll('.view-member').forEach(btn => {
    const memberId = btn.dataset.id;
    const parentTd = btn.closest('td');
    
    // ডুপ্লিকেট এড়াতে চেক করা
    if (!parentTd.querySelector('.bio-data-btn')) {
      const bioBtn = document.createElement('button');
      bioBtn.className = 'btn info bio-data-btn';
      bioBtn.dataset.id = memberId;
      bioBtn.innerHTML = '📄 Bio-data';
      bioBtn.addEventListener('click', () => previewMemberBioData(memberId));
      
      parentTd.appendChild(bioBtn);
    }
  });
}

// Export all functions
export default {
  downloadMemberBioData,
  previewMemberBioData,
  addBioDataButtonToTable
};
