// ============================================================
// 🔐 SESSION MODULE
// IMS ERP V5
// User session management, navigation, and page loading
// Fully Responsive - Mobile & PC Optimized
// ============================================================

import { getDatabase } from '../database/db.js';
import { getCurrentUser, getCurrentRole, logout as authLogout, isAuthenticated } from './auth.js';
import { showToast } from '../utils/common.js';

// ============================================================
// 📦 STATE MANAGEMENT
// ============================================================

let currentPage = null;
let isAppInitialized = false;
let pageCache = new Map(); // Cache for loaded pages
let loadingTimeout = null;


// ============================================================
// 📋 PAGE CONFIGURATION
// ============================================================

const PAGE_TITLES = {
  // Admin Pages
  admin_dashboard: 'Admin Dashboard',
  admin_members: 'Member Management',
  admin_deposits: 'Deposit Management',
  admin_investments: 'Investments',
  admin_expenses: 'Expenses',
  admin_sales: 'Sales',
  admin_profit: 'Profit Distribution',
  admin_resign: 'Resignation & Settlement',
  admin_notices: 'Notices',
  admin_reports: 'Reports',
  admin_admins: 'Admin Accounts',
  admin_logs: 'Activity Logs',
  
  // Member Pages
  member_dashboard: 'Member Dashboard',
  member_profile: 'My Profile',
  member_deposit: 'Submit Deposit',
  member_deposit_history: 'Deposit History',
  member_investments: 'Investments',
  member_profit: 'Profit & Shares',
  member_notices: 'Notices'
};

const PAGE_SUBTITLES = {
  admin_dashboard: 'System overview and statistics',
  admin_members: 'Manage all member accounts',
  admin_deposits: 'Approve/reject member deposits',
  admin_investments: 'Manage investment projects',
  admin_expenses: 'Track all expenses',
  admin_sales: 'Monitor sales and revenue',
  admin_profit: 'Distribute profits to members',
  admin_resign: 'Handle member resignations',
  admin_notices: 'Send system notices',
  admin_reports: 'Generate system reports',
  admin_admins: 'Manage administrator accounts',
  admin_logs: 'View system activity logs',
  member_dashboard: 'Your personal dashboard',
  member_profile: 'View and edit your profile',
  member_deposit: 'Submit monthly deposit',
  member_deposit_history: 'View your deposit history',
  member_investments: 'View company investments',
  member_profit: 'View your profit earnings',
  member_notices: 'View system notices'
};

// Module mapping with error boundaries
const MODULE_MAP = {
  admin_dashboard: () => import('../admin/dashboard.js').then(m => m.renderAdminDashboard()),
  admin_members: () => import('../admin/members.js').then(m => m.renderAdminMembers()),
  admin_deposits: () => import('../admin/deposits.js').then(m => m.renderAdminDeposits()),
  admin_investments: () => import('../admin/investments.js').then(m => m.renderAdminInvestments()),
  admin_expenses: () => import('../admin/expenses.js').then(m => m.renderAdminExpenses()),
  admin_sales: () => import('../admin/sales.js').then(m => m.renderAdminSales()),
  admin_profit: () => import('../admin/profit.js').then(m => m.renderAdminProfit()),
  admin_resign: () => import('../admin/resignations.js').then(m => m.renderAdminResign()),
  admin_notices: () => import('../admin/notices.js').then(m => m.renderAdminNotices()),
  admin_reports: () => import('../admin/reports.js').then(m => m.renderAdminReports()),
  admin_admins: () => import('../admin/admins.js').then(m => m.renderAdminAdmins()),
  admin_logs: () => import('../admin/logs.js').then(m => m.renderAdminLogs()),
  member_dashboard: () => import('../member/dashboard.js').then(m => m.renderMemberDashboard()),
  member_profile: () => import('../member/profile.js').then(m => m.renderMemberProfile()),
  member_deposit: () => import('../member/deposit.js').then(m => m.renderMemberDeposit()),
  member_deposit_history: () => import('../member/deposit-history.js').then(m => m.renderMemberDepositHistory()),
  member_investments: () => import('../member/investments.js').then(m => m.renderMemberInvestments()),
  member_profit: () => import('../member/profit.js').then(m => m.renderMemberProfit()),
  member_notices: () => import('../member/notices.js').then(m => m.renderMemberNotices())
};


// ============================================================
// 🔧 UTILITY FUNCTIONS
// ============================================================

function safeShowLoading(message = 'Loading...') {
  if (typeof window.showLoading === 'function') {
    window.showLoading(message);
  } else {
    console.log('Loading:', message);
  }
  
  // Set timeout to prevent infinite loading
  if (loadingTimeout) clearTimeout(loadingTimeout);
  loadingTimeout = setTimeout(() => {
    safeHideLoading();
    console.warn('Loading timeout - forcing hide');
  }, 10000); // 10 seconds max
}

function safeHideLoading() {
  if (loadingTimeout) {
    clearTimeout(loadingTimeout);
    loadingTimeout = null;
  }
  
  if (typeof window.hideLoading === 'function') {
    window.hideLoading();
  }
}

function formatPageName(page) {
  return page.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}


// ============================================================
// 📝 ACTIVITY LOGGING
// ============================================================

export async function logActivity(action, details) {
  try {
    const db = getDatabase();
    const user = getCurrentUser();
    
    await db.save('activityLogs', {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      action,
      details,
      userId: user?.id || 'SYSTEM',
      userName: user?.name || 'System',
      userRole: getCurrentRole() || 'SYSTEM',
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href
    });
    
    console.log(`📝 Activity logged: ${action}`);
    
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}


// ============================================================
// 🚀 START APPLICATION
// ============================================================

export function startApp() {
  // Check authentication
  if (!isAuthenticated()) {
    showToast('Error', 'Session expired. Please login again.', 'error');
    window.location.reload();
    return;
  }

  const user = getCurrentUser();
  const role = getCurrentRole();
  
  if (!user || !role) {
    showToast('Error', 'User session not found', 'error');
    return;
  }

  // Hide login page, show app page
  const loginPage = document.getElementById('loginPage');
  const appPage = document.getElementById('appPage');
  
  if (loginPage) loginPage.style.display = 'none';
  if (appPage) appPage.style.display = 'grid';

  // Update user info in UI using script.js function
  if (typeof window.updateUserInfo === 'function') {
    window.updateUserInfo(user, role);
  }

  // Setup admin tools if needed
  setupAdminTools(role);

  // Setup logout button
  setupLogoutButton();

  // Build sidebar
  buildSidebar();

  // Navigate to default page
  const defaultPage = role === 'admin' ? 'admin_dashboard' : 'member_dashboard';
  navigateTo(defaultPage);

  // Log activity
  logActivity('APP_START', `Application started for ${user.name} (${role})`);

  isAppInitialized = true;
  console.log('✅ App started successfully');
}


// ============================================================
// 🛠️ SETUP ADMIN TOOLS
// ============================================================

function setupAdminTools(role) {
  const systemToolsBtn = document.getElementById('systemToolsBtn');
  const quickAddBtn = document.getElementById('quickAddBtn');

  if (!systemToolsBtn || !quickAddBtn) return;

  if (role === 'admin') {
    // Show admin tools
    systemToolsBtn.style.display = 'inline-block';
    quickAddBtn.style.display = 'inline-block';

    // Clone and replace to remove old listeners
    const newSystemToolsBtn = systemToolsBtn.cloneNode(true);
    const newQuickAddBtn = quickAddBtn.cloneNode(true);
    
    systemToolsBtn.parentNode.replaceChild(newSystemToolsBtn, systemToolsBtn);
    quickAddBtn.parentNode.replaceChild(newQuickAddBtn, quickAddBtn);

    // Add new listeners
    newSystemToolsBtn.addEventListener('click', () => {
      import('../modals/system-tools.js')
        .then(m => m.openSystemToolsModal())
        .catch(err => {
          console.error('Error loading system tools:', err);
          showToast('Error', 'Failed to open system tools', 'error');
        });
    });

    newQuickAddBtn.addEventListener('click', () => {
      import('../modals/quick-add.js')
        .then(m => m.openQuickAddModal())
        .catch(err => {
          console.error('Error loading quick add:', err);
          showToast('Error', 'Failed to open quick add', 'error');
        });
    });
  } else {
    // Hide admin tools for members
    systemToolsBtn.style.display = 'none';
    quickAddBtn.style.display = 'none';
  }
}


// ============================================================
// 🚪 SETUP LOGOUT BUTTON
// ============================================================

function setupLogoutButton() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (!logoutBtn) return;

  // Clone and replace to remove old listeners
  const newLogoutBtn = logoutBtn.cloneNode(true);
  logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
  
  newLogoutBtn.addEventListener('click', handleLogout);
}


// ============================================================
// 🏗️ BUILD SIDEBAR
// ============================================================

export function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;

  const role = getCurrentRole();
  let navItems = [];

  if (role === 'admin') {
    navItems = [
      { id: 'admin_dashboard', name: 'Dashboard', icon: '📊' },
      { id: 'admin_members', name: 'Members', icon: '👥' },
      { id: 'admin_deposits', name: 'Deposits', icon: '💰' },
      { id: 'admin_investments', name: 'Investments', icon: '📈' },
      { id: 'admin_expenses', name: 'Expenses', icon: '💸' },
      { id: 'admin_sales', name: 'Sales', icon: '🛒' },
      { id: 'admin_profit', name: 'Profit', icon: '🎯' },
      { id: 'admin_resign', name: 'Resignation', icon: '🚪' },
      { id: 'admin_notices', name: 'Notices', icon: '📢' },
      { id: 'admin_reports', name: 'Reports', icon: '📋' },
      { id: 'admin_admins', name: 'Admins', icon: '🔐' },
      { id: 'admin_logs', name: 'Logs', icon: '📝' }
    ];
  } else {
    navItems = [
      { id: 'member_dashboard', name: 'Dashboard', icon: '📊' },
      { id: 'member_profile', name: 'My Profile', icon: '👤' },
      { id: 'member_deposit', name: 'Submit Deposit', icon: '💰' },
      { id: 'member_deposit_history', name: 'History', icon: '📜' },
      { id: 'member_investments', name: 'Investments', icon: '📈' },
      { id: 'member_profit', name: 'Profit', icon: '🎯' },
      { id: 'member_notices', name: 'Notices', icon: '📢' }
    ];
  }

  // Clear nav
  nav.innerHTML = '';

  // Add navigation items
  navItems.forEach(item => {
    const btn = document.createElement('button');
    btn.className = `nav-item ${currentPage === item.id ? 'active' : ''}`;
    btn.setAttribute('aria-label', item.name);
    
    btn.innerHTML = `
      <span>${item.icon}</span>
      <span style="flex:1; text-align:left;">${item.name}</span>
      <span class="count">›</span>
    `;

    btn.addEventListener('click', () => navigateTo(item.id));
    
    nav.appendChild(btn);
  });

  // Add company info for members
  if (role === 'member') {
    const companyBtn = document.createElement('button');
    companyBtn.className = 'nav-item';
    companyBtn.setAttribute('aria-label', 'Company Info');
    companyBtn.innerHTML = `
      <span>🏢</span>
      <span style="flex:1; text-align:left;">Vision & Mission</span>
      <span class="count">›</span>
    `;
    
    companyBtn.addEventListener('click', () => {
      import('../modals/company-info.js')
        .then(m => m.openCompanyInfoModal())
        .catch(err => {
          console.error('Error loading company info:', err);
          showToast('Error', 'Failed to open company info', 'error');
        });
    });
    
    nav.appendChild(companyBtn);
  }
}


// ============================================================
// 🧭 NAVIGATE TO PAGE
// ============================================================

export function navigateTo(page) {
  // Validate page exists
  if (!PAGE_TITLES[page]) {
    console.error(`Invalid page: ${page}`);
    showToast('Error', 'Page not found', 'error');
    return;
  }

  // Update current page
  currentPage = page;
  
  // Update sidebar active state
  buildSidebar();

  // Close mobile sidebar if open
  const sidebar = document.getElementById('sidebar');
  if (sidebar && window.innerWidth <= 768) {
    sidebar.classList.remove('active');
    document.querySelector('.sidebar-overlay')?.classList.remove('active');
    document.body.classList.remove('sidebar-open');
  }

  // Set page title
  const title = PAGE_TITLES[page] || formatPageName(page);
  const subtitle = PAGE_SUBTITLES[page] || '';
  setPageTitle(title, subtitle);

  // Load page module
  loadPageModule(page);

  // Log navigation
  logActivity('PAGE_NAVIGATION', `Navigated to ${page}`);
}


// ============================================================
// 📥 LOAD PAGE MODULE
// ============================================================

async function loadPageModule(page) {
  const pageContent = document.getElementById('pageContent');
  if (!pageContent) return;

  try {
    // Show loading
    safeShowLoading(`Loading ${PAGE_TITLES[page] || page}...`);

    // Check cache first
    if (pageCache.has(page)) {
      console.log(`📦 Loading ${page} from cache`);
      const cached = pageCache.get(page);
      if (cached && typeof cached === 'function') {
        await cached();
        safeHideLoading();
        return;
      }
    }

    // Load module
    if (MODULE_MAP[page]) {
      await MODULE_MAP[page]();
      
      // Cache the result
      pageCache.set(page, MODULE_MAP[page]);
    } else {
      // Page not found
      pageContent.innerHTML = `
        <div class="panel" style="text-align: center; padding: 60px;">
          <div style="font-size: 64px; margin-bottom: 20px;">🔍</div>
          <h2 style="color: var(--text-primary); margin-bottom: 10px;">Page Not Found</h2>
          <p style="color: var(--text-secondary);">The requested page "${page}" does not exist.</p>
          <button class="btn primary" onclick="window.navigateTo('${getCurrentRole() === 'admin' ? 'admin_dashboard' : 'member_dashboard'}')" style="margin-top: 20px;">
            Go to Dashboard
          </button>
        </div>
      `;
    }
  } catch (error) {
    console.error(`❌ Error loading page ${page}:`, error);
    
    // Show error UI
    pageContent.innerHTML = `
      <div class="panel" style="text-align: center; padding: 60px; background: var(--bg-danger); border-radius: var(--border-radius-lg);">
        <div style="font-size: 48px; margin-bottom: 20px;">❌</div>
        <h2 style="color: #721c24; margin-bottom: 10px;">Error Loading Page</h2>
        <p style="color: #721c24; margin-bottom: 20px;">${error.message || 'Failed to load page'}</p>
        <button class="btn" onclick="window.location.reload()" style="margin-right: 10px;">🔄 Reload</button>
        <button class="btn primary" onclick="window.navigateTo('${getCurrentRole() === 'admin' ? 'admin_dashboard' : 'member_dashboard'}')">🏠 Dashboard</button>
      </div>
    `;
    
    showToast('Error', `Failed to load ${PAGE_TITLES[page] || page}`, 'error');
  } finally {
    safeHideLoading();
  }
}


// ============================================================
// 📌 SET PAGE TITLE
// ============================================================

export function setPageTitle(title, subtitle = '') {
  const elTitle = document.getElementById('pageTitle');
  const elSub = document.getElementById('pageSubtitle');
  
  if (elTitle) elTitle.textContent = title || 'Dashboard';
  if (elSub) elSub.textContent = subtitle || 'Welcome to IMS ERP V5';
}


// ============================================================
// 🚪 HANDLE LOGOUT
// ============================================================

async function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) return;

  try {
    safeShowLoading('Logging out...');
    
    await logActivity('LOGOUT', `User logged out: ${getCurrentUser()?.id}`);
    await authLogout();
    
    // Clear page cache
    pageCache.clear();
    currentPage = null;
    isAppInitialized = false;
    
    // Show login page
    const appPage = document.getElementById('appPage');
    const loginPage = document.getElementById('loginPage');
    
    if (appPage) appPage.style.display = 'none';
    if (loginPage) loginPage.style.display = 'flex';
    
    // Clear login form
    const loginId = document.getElementById('loginId');
    const loginPass = document.getElementById('loginPass');
    if (loginId) loginId.value = '';
    if (loginPass) loginPass.value = '';
    
    showToast('Logged Out', 'You have been logged out successfully', 'info');
    
  } catch (error) {
    console.error('Logout error:', error);
    showToast('Error', 'Failed to logout properly', 'error');
  } finally {
    safeHideLoading();
  }
}


// ============================================================
// 🔄 CLEAR CACHE
// ============================================================

export function clearPageCache() {
  pageCache.clear();
  console.log('🗑️ Page cache cleared');
}


// ============================================================
// 🌍 GLOBAL EXPORTS
// ============================================================

window.navigateTo = navigateTo;
window.setPageTitle = setPageTitle;
window.logActivity = logActivity;
window.clearPageCache = clearPageCache;
window.buildSidebar = buildSidebar;


// ============================================================
// 📤 EXPORTS
// ============================================================

export default {
  startApp,
  buildSidebar,
  navigateTo,
  setPageTitle,
  logActivity,
  clearPageCache
};
