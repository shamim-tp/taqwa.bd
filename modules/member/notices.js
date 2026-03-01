// ============================================================
// 📢 MEMBER NOTICES MODULE
// IMS ERP V5
// Shows system notices for logged-in member
// Fully Responsive - Mobile & PC Optimized
// ============================================================


// ============================================================
// 📦 IMPORTS
// ============================================================

import { getDatabase } from '../database/db.js';
import { getCurrentUser } from '../auth/auth.js';
import { setPageTitle } from '../auth/session.js';
import { openViewerModal } from '../modals/viewer.js';


// ============================================================
// 🎨 FULLY RESPONSIVE STYLES
// ============================================================

const noticesStyles = `
  <style>
    /* CSS Variables for consistent theming */
    :root {
      --primary-gradient: linear-gradient(135deg, #4158D0 0%, #C850C0 46%, #FFCC70 100%);
      --secondary-gradient: linear-gradient(135deg, #1e3c72 0%, #2a5298 100%);
      --success-gradient: linear-gradient(135deg, #11998e 0%, #38ef7d 100%);
      --warning-gradient: linear-gradient(135deg, #f2994a 0%, #f2c94c 100%);
      --danger-gradient: linear-gradient(135deg, #eb5757 0%, #f2994a 100%);
      --shadow-sm: 0 5px 15px rgba(0,0,0,0.05);
      --shadow-md: 0 10px 25px rgba(0,0,0,0.1);
      --shadow-lg: 0 15px 35px rgba(0,0,0,0.15);
      --border-radius-sm: 12px;
      --border-radius-md: 16px;
      --border-radius-lg: 20px;
      --border-radius-xl: 24px;
      --border-radius-xxl: 30px;
      
      /* Text Colors - High Contrast */
      --text-primary: #1e293b;
      --text-secondary: #334155;
      --text-muted: #64748b;
      --text-light: #f8fafc;
      --text-white: #ffffff;
      --text-dark: #0f172a;
      
      /* Background Colors */
      --bg-primary: #ffffff;
      --bg-secondary: #f8fafc;
      --bg-tertiary: #f1f5f9;
      --bg-accent: #eef2ff;
      --bg-warning: #fff3cd;
      --bg-danger: #f8d7da;
      --bg-success: #d4edda;
      --bg-notice: #f0f7ff;
      
      /* Priority Colors */
      --priority-urgent-bg: #f8d7da;
      --priority-urgent-text: #721c24;
      --priority-urgent-border: #f5c6cb;
      --priority-high-bg: #fff3cd;
      --priority-high-text: #856404;
      --priority-high-border: #ffeeba;
      --priority-normal-bg: #d4edda;
      --priority-normal-text: #0a5c3b;
      --priority-normal-border: #a3e4c5;
      --priority-low-bg: #e2e3e5;
      --priority-low-text: #383d41;
      --priority-low-border: #d6d8db;
      
      /* Accent Colors */
      --accent-1: #4158D0;
      --accent-2: #C850C0;
      --accent-3: #FFCC70;
      --accent-success: #11998e;
      --accent-warning: #f2994a;
      --accent-danger: #eb5757;
      --accent-notice: #3498db;
    }

    /* Container - Mobile First */
    .notices-container {
      width: 100%;
      max-width: 1400px;
      margin: 0 auto;
      padding: clamp(12px, 3vw, 25px);
      background: linear-gradient(135deg, #f1f5f9 0%, #e2e8f0 100%);
      min-height: 100vh;
    }

    /* Header Section */
    .notices-header {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
      border-radius: var(--border-radius-xl);
      padding: clamp(25px, 4vw, 40px);
      margin-bottom: clamp(20px, 3vw, 30px);
      color: var(--text-white);
      position: relative;
      overflow: hidden;
      box-shadow: var(--shadow-lg);
    }

    .notices-header::before {
      content: '📢';
      position: absolute;
      right: -20px;
      bottom: -20px;
      font-size: 150px;
      opacity: 0.1;
      transform: rotate(-15deg);
      color: var(--text-white);
    }

    .notices-header h2 {
      font-size: clamp(24px, 4vw, 32px);
      font-weight: 800;
      margin-bottom: 10px;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .notices-header p {
      font-size: clamp(14px, 2vw, 16px);
      opacity: 0.95;
      position: relative;
      z-index: 1;
      text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
    }

    /* Summary Cards Grid */
    .summary-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(15px, 2.5vw, 25px);
      margin-bottom: clamp(25px, 4vw, 35px);
    }

    @media (min-width: 640px) {
      .summary-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .summary-grid {
        grid-template-columns: repeat(4, 1fr);
      }
    }

    /* Summary Card */
    .summary-card {
      padding: clamp(20px, 3vw, 25px);
      border-radius: var(--border-radius-lg);
      color: var(--text-white);
      position: relative;
      overflow: hidden;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-md);
    }

    .summary-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .summary-card::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -50%;
      width: 150px;
      height: 150px;
      background: rgba(255,255,255,0.1);
      border-radius: 50%;
      transform: rotate(25deg);
      transition: all 0.5s;
    }

    .summary-card:hover::before {
      transform: rotate(45deg) scale(1.2);
    }

    .summary-card.total {
      background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    }

    .summary-card.urgent {
      background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    }

    .summary-card.high {
      background: linear-gradient(135deg, #f39c12 0%, #e67e22 100%);
    }

    .summary-card.normal {
      background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    }

    .summary-label {
      font-size: clamp(13px, 2vw, 15px);
      opacity: 0.9;
      margin-bottom: 10px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      position: relative;
      z-index: 1;
    }

    .summary-value {
      font-size: clamp(28px, 4vw, 36px);
      font-weight: 800;
      margin-bottom: 8px;
      position: relative;
      z-index: 1;
      text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
    }

    .summary-sub {
      font-size: clamp(11px, 1.8vw, 13px);
      opacity: 0.8;
      position: relative;
      z-index: 1;
    }

    .summary-icon {
      position: absolute;
      top: 15px;
      right: 15px;
      font-size: 48px;
      opacity: 0.2;
      color: var(--text-white);
    }

    /* Search Box */
    .search-box {
      padding: clamp(10px, 2vw, 12px) clamp(14px, 2.5vw, 18px);
      border: 2px solid var(--bg-tertiary);
      border-radius: var(--border-radius-md);
      font-size: clamp(14px, 2vw, 15px);
      width: 100%;
      max-width: 400px;
      background: var(--bg-primary);
      color: var(--text-primary);
      margin-bottom: 20px;
    }

    .search-box:focus {
      border-color: var(--accent-notice);
      outline: none;
      box-shadow: 0 0 0 4px rgba(52,152,219,0.1);
    }

    .search-box::placeholder {
      color: var(--text-muted);
    }

    /* Notices Grid */
    .notices-grid {
      display: grid;
      grid-template-columns: 1fr;
      gap: clamp(16px, 2.5vw, 22px);
      margin-bottom: 20px;
    }

    @media (min-width: 640px) {
      .notices-grid {
        grid-template-columns: repeat(2, 1fr);
      }
    }

    @media (min-width: 1024px) {
      .notices-grid {
        grid-template-columns: repeat(3, 1fr);
      }
    }

    /* Notice Card */
    .notice-card {
      background: var(--bg-primary);
      border-radius: var(--border-radius-lg);
      padding: clamp(20px, 3vw, 25px);
      box-shadow: var(--shadow-md);
      transition: all 0.3s ease;
      border: 1px solid rgba(0,0,0,0.05);
      position: relative;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    .notice-card:hover {
      transform: translateY(-5px);
      box-shadow: var(--shadow-lg);
    }

    .notice-card::before {
      content: '';
      position: absolute;
      top: 0;
      right: 0;
      width: 100px;
      height: 100px;
      background: linear-gradient(135deg, rgba(52,152,219,0.05), rgba(41,128,185,0.05));
      border-radius: 0 0 0 100%;
    }

    .notice-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 15px;
    }

    .notice-title {
      font-size: clamp(16px, 2.5vw, 18px);
      font-weight: 800;
      color: var(--text-primary);
      margin: 0;
      line-height: 1.3;
    }

    /* Priority Badge */
    .priority-badge {
      padding: 6px 14px;
      border-radius: 30px;
      font-size: clamp(11px, 1.6vw, 12px);
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      white-space: nowrap;
    }

    .priority-urgent {
      background: var(--priority-urgent-bg);
      color: var(--priority-urgent-text);
      border: 1px solid var(--priority-urgent-border);
    }

    .priority-high {
      background: var(--priority-high-bg);
      color: var(--priority-high-text);
      border: 1px solid var(--priority-high-border);
    }

    .priority-normal {
      background: var(--priority-normal-bg);
      color: var(--priority-normal-text);
      border: 1px solid var(--priority-normal-border);
    }

    .priority-low {
      background: var(--priority-low-bg);
      color: var(--priority-low-text);
      border: 1px solid var(--priority-low-border);
    }

    /* Notice Message Preview */
    .notice-message {
      color: var(--text-secondary);
      font-size: clamp(13px, 2vw, 14px);
      line-height: 1.6;
      margin-bottom: 20px;
      flex: 1;
    }

    /* Notice Footer */
    .notice-footer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-top: auto;
      padding-top: 15px;
      border-top: 1px solid var(--bg-tertiary);
    }

    .notice-date {
      display: flex;
      align-items: center;
      gap: 5px;
      color: var(--text-muted);
      font-size: clamp(11px, 1.6vw, 12px);
    }

    .notice-date::before {
      content: '📅';
      font-size: 12px;
    }

    .read-more-btn {
      padding: 8px 16px;
      background: linear-gradient(135deg, #3498db, #2980b9);
      color: var(--text-white);
      border: none;
      border-radius: 30px;
      font-size: clamp(11px, 1.6vw, 13px);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 5px rgba(52,152,219,0.3);
    }

    .read-more-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(52,152,219,0.4);
    }

    .read-more-btn:active {
      transform: translateY(0);
    }

    /* No Data Message */
    .no-data {
      text-align: center;
      padding: 60px;
      color: var(--text-muted);
      grid-column: 1 / -1;
    }

    .no-data-icon {
      font-size: 64px;
      margin-bottom: 20px;
      opacity: 0.5;
    }

    .no-data-title {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 10px;
      color: var(--text-primary);
    }

    .no-data-text {
      font-size: 16px;
    }

    /* Loading State */
    .loading-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--bg-tertiary);
      border-top: 4px solid var(--accent-notice);
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Responsive Typography */
    @media (max-width: 480px) {
      .summary-value {
        font-size: 24px;
      }
      
      .notice-title {
        font-size: 16px;
      }
      
      .read-more-btn {
        padding: 6px 12px;
        font-size: 11px;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .notice-card:active {
        transform: scale(0.98);
      }
      
      .read-more-btn:active {
        transform: scale(0.95);
      }
    }

    /* Print Styles */
    @media print {
      .notices-container {
        background: white;
        padding: 20px;
      }
      
      .read-more-btn {
        display: none;
      }
    }
  </style>
`;


// ============================================================
// 🎯 MAIN RENDER FUNCTION
// ============================================================

export async function renderMemberNotices() {
  
  // Show loading state
  const pageContent = document.getElementById('pageContent');
  if (pageContent) {
    pageContent.innerHTML = `
      ${noticesStyles}
      <div class="notices-container">
        <div style="text-align: center; padding: 60px;">
          <div class="loading-spinner"></div>
          <p style="color: var(--text-secondary);">Loading notices...</p>
        </div>
      </div>
    `;
  }

  // Load data asynchronously
  setTimeout(async () => {
    try {
      const user = getCurrentUser();
      if (!user) return;
      
      const db = getDatabase();
      const member = await db.get('members', user.id);
      if (!member) return;
      
      const notices = await db.getAll('notices') || [];
      
      // Filter notices for this member
      const memberNotices = notices.filter(notice => {
        if (notice.sentTo === 'ALL') return true;
        if (notice.sentTo === 'FOUNDER' && member.memberType === 'FOUNDER') return true;
        if (notice.sentTo === 'REFERENCE' && member.memberType === 'REFERENCE') return true;
        if (notice.recipients && notice.recipients.includes(member.id)) return true;
        return false;
      });
      
      // Sort by date (newest first)
      memberNotices.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));
      
      // Calculate statistics
      const totalNotices = memberNotices.length;
      const urgentCount = memberNotices.filter(n => n.priority === 'URGENT').length;
      const highCount = memberNotices.filter(n => n.priority === 'HIGH').length;
      const normalCount = memberNotices.filter(n => !n.priority || n.priority === 'NORMAL' || n.priority === 'LOW').length;
      
      setPageTitle('Notices', 'View all system notices');
      
      // Generate HTML
      const html = generateNoticesHTML(
        memberNotices,
        totalNotices,
        urgentCount,
        highCount,
        normalCount
      );
      
      // Update page content
      if (pageContent) {
        pageContent.innerHTML = html;
      }
      
      // Bind search functionality
      bindSearch();
      
      // Bind view buttons
      bindViewButtons();

    } catch (error) {
      console.error('Error loading notices:', error);
      if (pageContent) {
        pageContent.innerHTML = `
          ${noticesStyles}
          <div class="notices-container">
            <div style="text-align: center; padding: 60px; background: var(--bg-danger); border-radius: var(--border-radius-lg);">
              <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
              <h3 style="color: #721c24; margin-bottom: 10px;">Error Loading Data</h3>
              <p style="color: #721c24; margin-bottom: 20px;">${error.message || 'Failed to load notices'}</p>
              <button class="summary-card total" onclick="window.location.reload()" style="border: none; cursor: pointer; padding: 12px 30px;">🔄 Try Again</button>
            </div>
          </div>
        `;
      }
    }
  }, 100);
}


// ============================================================
// 🏗️ GENERATE NOTICES HTML
// ============================================================

function generateNoticesHTML(notices, totalNotices, urgentCount, highCount, normalCount) {
  return `
    ${noticesStyles}
    <div class="notices-container">

      <!-- Header -->
      <div class="notices-header">
        <h2>📢 System Notices</h2>
        <p>Important notices and announcements from management</p>
      </div>

      <!-- Summary Cards -->
      <div class="summary-grid">
        <div class="summary-card total">
          <div class="summary-icon">📋</div>
          <div class="summary-label">Total Notices</div>
          <div class="summary-value">${totalNotices}</div>
          <div class="summary-sub">All notices for you</div>
        </div>
        
        <div class="summary-card urgent">
          <div class="summary-icon">⚠️</div>
          <div class="summary-label">Urgent</div>
          <div class="summary-value">${urgentCount}</div>
          <div class="summary-sub">Require immediate attention</div>
        </div>
        
        <div class="summary-card high">
          <div class="summary-icon">🔔</div>
          <div class="summary-label">High Priority</div>
          <div class="summary-value">${highCount}</div>
          <div class="summary-sub">Important notices</div>
        </div>
        
        <div class="summary-card normal">
          <div class="summary-icon">📌</div>
          <div class="summary-label">Normal</div>
          <div class="summary-value">${normalCount}</div>
          <div class="summary-sub">General information</div>
        </div>
      </div>

      <!-- Search Box -->
      <div>
        <input 
          type="text" 
          id="searchNotices" 
          class="search-box" 
          placeholder="🔍 Search notices by title or message..."
        />
      </div>

      <!-- Notices Grid -->
      <div class="notices-grid" id="noticesGrid">
        ${notices.length > 0 
          ? notices.map(notice => generateNoticeCard(notice)).join('')
          : generateEmptyState()
        }
      </div>

    </div>
  `;
}


// ============================================================
// 🃏 GENERATE NOTICE CARD
// ============================================================

function generateNoticeCard(notice) {
  // Determine priority class
  let priorityClass = 'priority-normal';
  let priorityText = notice.priority || 'NORMAL';
  
  if (notice.priority === 'URGENT') {
    priorityClass = 'priority-urgent';
  } else if (notice.priority === 'HIGH') {
    priorityClass = 'priority-high';
  } else if (notice.priority === 'LOW') {
    priorityClass = 'priority-low';
  }
  
  // Format date
  const formattedDate = notice.createdAt 
    ? new Date(notice.createdAt).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      })
    : 'Date not available';
  
  // Truncate message
  const previewMessage = notice.message.length > 120 
    ? notice.message.substring(0, 120) + '...' 
    : notice.message;
  
  return `
    <div class="notice-card" data-notice-id="${notice.id}">
      <div class="notice-header">
        <h4 class="notice-title">${escapeHtml(notice.title)}</h4>
        <span class="priority-badge ${priorityClass}">${priorityText}</span>
      </div>
      
      <div class="notice-message">
        ${escapeHtml(previewMessage)}
      </div>
      
      <div class="notice-footer">
        <span class="notice-date">${formattedDate}</span>
        <button class="read-more-btn view-notice-btn" data-id="${notice.id}">
          Read More →
        </button>
      </div>
    </div>
  `;
}


// ============================================================
// 📭 GENERATE EMPTY STATE
// ============================================================

function generateEmptyState() {
  return `
    <div class="no-data">
      <div class="no-data-icon">📭</div>
      <div class="no-data-title">No Notices Available</div>
      <div class="no-data-text">There are no notices for you at this time.</div>
    </div>
  `;
}


// ============================================================
// 🔍 BIND SEARCH FUNCTIONALITY
// ============================================================

function bindSearch() {
  const searchInput = document.getElementById('searchNotices');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    const cards = document.querySelectorAll('.notice-card');
    const grid = document.getElementById('noticesGrid');
    let visibleCount = 0;
    
    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(searchTerm)) {
        card.style.display = '';
        visibleCount++;
      } else {
        card.style.display = 'none';
      }
    });
    
    // Show/hide no results message
    const existingNoResults = document.getElementById('noResultsMessage');
    
    if (visibleCount === 0 && cards.length > 0 && searchTerm) {
      if (existingNoResults) existingNoResults.remove();
      
      const noResultsDiv = document.createElement('div');
      noResultsDiv.id = 'noResultsMessage';
      noResultsDiv.className = 'no-data';
      noResultsDiv.innerHTML = `
        <div class="no-data-icon">🔍</div>
        <div class="no-data-title">No Results Found</div>
        <div class="no-data-text">No notices match "${escapeHtml(searchTerm)}"</div>
      `;
      grid.appendChild(noResultsDiv);
    } else {
      if (existingNoResults) existingNoResults.remove();
    }
  });
}


// ============================================================
// 🎯 BIND VIEW BUTTONS
// ============================================================

function bindViewButtons() {
  document.querySelectorAll('.view-notice-btn').forEach(btn => {
    btn.addEventListener('click', () => viewNotice(btn.dataset.id));
  });
}


// ============================================================
// 📄 VIEW NOTICE DETAILS
// ============================================================

async function viewNotice(id) {
  try {
    const db = getDatabase();
    const notice = await db.get('notices', id);
    if (!notice) return;
    
    // Determine priority class for display
    let priorityClass = 'priority-normal';
    let priorityText = notice.priority || 'NORMAL';
    
    if (notice.priority === 'URGENT') {
      priorityClass = 'priority-urgent';
    } else if (notice.priority === 'HIGH') {
      priorityClass = 'priority-high';
    } else if (notice.priority === 'LOW') {
      priorityClass = 'priority-low';
    }
    
    // Format dates
    const sentDate = notice.createdAt 
      ? new Date(notice.createdAt).toLocaleString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        })
      : 'Not available';
    
    const expiryDate = notice.expiryDate 
      ? new Date(notice.expiryDate).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })
      : 'No expiry';
    
    const html = `
      <div class="notices-container" style="padding: 0;">
        <div style="background: var(--bg-primary); border-radius: var(--border-radius-lg); overflow: hidden;">
          
          <!-- Header with priority -->
          <div style="padding: 25px; background: linear-gradient(135deg, #3498db, #2980b9); color: white;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h2 style="margin:0; font-size:24px;">${escapeHtml(notice.title)}</h2>
              <span class="priority-badge ${priorityClass}" style="background: white;">${priorityText}</span>
            </div>
            <p style="opacity:0.9; margin:0;">Notice Details</p>
          </div>
          
          <!-- Content -->
          <div style="padding: 25px;">
            
            <!-- Message -->
            <div style="margin-bottom: 25px;">
              <div style="font-weight:700; color:var(--text-primary); margin-bottom:10px;">📝 Message</div>
              <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--border-radius-lg); 
                          border-left: 5px solid #3498db; line-height:1.8; color:var(--text-secondary);">
                ${notice.message.replace(/\n/g, '<br>')}
              </div>
            </div>
            
            <!-- Details Grid -->
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-top: 25px;">
              
              <div style="background: var(--bg-secondary); padding: 15px; border-radius: var(--border-radius-md);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:5px;">📌 Sent To</div>
                <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(notice.sentTo || 'ALL')}</div>
              </div>
              
              <div style="background: var(--bg-secondary); padding: 15px; border-radius: var(--border-radius-md);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:5px;">🎯 Priority</div>
                <div><span class="priority-badge ${priorityClass}">${priorityText}</span></div>
              </div>
              
              <div style="background: var(--bg-secondary); padding: 15px; border-radius: var(--border-radius-md);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:5px;">👥 Recipients</div>
                <div style="font-weight:700; color:var(--text-primary);">${notice.recipients?.length || 0} members</div>
              </div>
              
              <div style="background: var(--bg-secondary); padding: 15px; border-radius: var(--border-radius-md);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:5px;">👤 Sent By</div>
                <div style="font-weight:700; color:var(--text-primary);">${escapeHtml(notice.sentBy || 'System')}</div>
              </div>
              
              <div style="background: var(--bg-secondary); padding: 15px; border-radius: var(--border-radius-md);">
                <div style="font-size:12px; color:var(--text-muted); margin-bottom:5px;">📅 Sent Date</div>
                <div style="font-weight:700; color:var(--text-primary);">${sentDate}</div>
              </div>
              
              ${notice.expiryDate ? `
                <div style="background: var(--bg-secondary); padding: 15px; border-radius: var(--border-radius-md);">
                  <div style="font-size:12px; color:var(--text-muted); margin-bottom:5px;">⏰ Expiry Date</div>
                  <div style="font-weight:700; color:var(--text-primary);">${expiryDate}</div>
                </div>
              ` : ''}
            </div>
            
          </div>
        </div>
      </div>
    `;
    
    openViewerModal('Notice Details', 'View notice information', html);
  } catch (error) {
    console.error('Error viewing notice:', error);
    showToast('Error', 'Failed to load notice details', 'error');
  }
}


// ============================================================
// 🔒 ESCAPE HTML TO PREVENT XSS
// ============================================================

function escapeHtml(unsafe) {
  if (!unsafe) return '';
  return String(unsafe)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;")
    .replace(/\//g, "&#47;");
}


// ============================================================
// 📋 SHOW TOAST FUNCTION (if not available globally)
// ============================================================

function showToast(title, message, type = 'info') {
  if (window.showToast) {
    window.showToast(title, message, type);
  } else {
    console.log(`${type}: ${title} - ${message}`);
  }
}
