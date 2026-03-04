// ============================================================
// 🔐 SESSION MODULE
// IMS ERP V5
// User session management, navigation, and page loading
// Fully Responsive - Mobile & PC Optimized
// ============================================================

import { getCurrentUser, getCurrentRole, isAuthenticated } from './auth.js';
import { showToast } from '../utils/common.js';

// ============================================================
// 📦 STATE MANAGEMENT
// ============================================================

let currentPage = null;
let loadingTimeout = null;

// ============================================================
// 📋 PAGE CONFIGURATION
// ============================================================

const PAGE_TITLES = {
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
  member_dashboard: 'Member Dashboard',
  member_profile: 'My Profile',
  member_deposit: 'Submit Deposit',
  member_deposit_history: 'Deposit History',
  member_investments: 'Investments',
  member_profit: 'Profit & Shares',
  member_notices: 'Notices'
};

// Module mapping with proper paths
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
  member_dashboard: () => import('./dashboard.js').then(m => m.renderMemberDashboard()),
  member_profile: () => import('./profile.js').then(m => m.renderMemberProfile()),
  member_deposit: () => import('./deposit.js').then(m => m.renderMemberDeposit()),
  member_deposit_history: () => import('./deposit-history.js').then(m => m.renderMemberDepositHistory()),
  member_investments: () => import('./investments.js').then(m => m.renderMemberInvestments()),
  member_profit: () => import('./profit.js').then(m => m.renderMemberProfit()),
  member_notices: () => import('./notices.js').then(m => m.renderMemberNotices())
};

// ============================================================
// 🔧 UTILITY FUNCTIONS
// ============================================================

function safeShowLoading(message = 'Loading...') {
  if (typeof window.showLoading === 'function') {
    window.showLoading(message);
  }
  if (loadingTimeout) clearTimeout(loadingTimeout);
  loadingTimeout = setTimeout(() => safeHideLoading(), 10000);
}

function safeHideLoading() {
  if (loadingTimeout) clearTimeout(loadingTimeout);
  if (typeof window.hideLoading === 'function') {
    window.hideLoading();
  }
}

// ============================================================
// 🚀 START APPLICATION
// ============================================================

export function startApp() {
  if (!isAuthenticated()) {
    showToast('Error', 'Session expired. Please login again.', 'error');
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

  // Update user info in UI
  document.getElementById('currentUserName').textContent = user.name;
  document.getElementById('currentUserRole').textContent = role === 'admin' ? 'Admin' : (user.memberType || 'Member');
  document.getElementById('chipId').textContent = `ID: ${user.id}`;
  document.getElementById('systemMode').textContent = role.toUpperCase();

  // Setup admin tools if needed
  setupAdminTools(role);

  // Setup logout button
  setupLogoutButton();

  // Build sidebar
  buildSidebar();

  // Navigate to default page based on role
  const defaultPage = role === 'admin' ? 'admin_dashboard' : 'member_dashboard';
  navigateTo(defaultPage);
}

// ============================================================
// 🛠️ SETUP ADMIN TOOLS
// ============================================================

function setupAdminTools(role) {
  const systemToolsBtn = document.getElementById('systemToolsBtn');
  const quickAddBtn = document.getElementById('quickAddBtn');
  if (!systemToolsBtn || !quickAddBtn) return;

  if (role === 'admin') {
    systemToolsBtn.style.display = 'inline-block';
    quickAddBtn.style.display = 'inline-block';
    systemToolsBtn.onclick = () => import('../modals/system-tools.js').then(m => m.openSystemToolsModal());
    quickAddBtn.onclick = () => import('../modals/quick-add.js').then(m => m.openQuickAddModal());
  } else {
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
  logoutBtn.onclick = handleLogout;
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

  nav.innerHTML = navItems.map(item => `
    <button class="nav-item ${currentPage === item.id ? 'active' : ''}" onclick="window.navigateTo('${item.id}')">
      <span>${item.icon}</span>
      <span style="flex:1; text-align:left;">${item.name}</span>
      <span class="count">›</span>
    </button>
  `).join('');

  // Add company info for members
  if (role === 'member') {
    nav.innerHTML += `
      <button class="nav-item" onclick="window.openCompanyInfoModal()">
        <span>🏢</span>
        <span style="flex:1; text-align:left;">Vision & Mission</span>
        <span class="count">›</span>
      </button>
    `;
  }
}

// ============================================================
// 🧭 NAVIGATE TO PAGE
// ============================================================

export function navigateTo(page) {
  if (!PAGE_TITLES[page]) {
    console.error(`Invalid page: ${page}`);
    return;
  }

  currentPage = page;
  buildSidebar(); // update active state
  setPageTitle(PAGE_TITLES[page]);
  loadPageModule(page);
}

// ============================================================
// 📥 LOAD PAGE MODULE
// ============================================================

async function loadPageModule(page) {
  const pageContent = document.getElementById('pageContent');
  if (!pageContent) return;

  try {
    safeShowLoading(`Loading ${PAGE_TITLES[page]}...`);

    if (MODULE_MAP[page]) {
      await MODULE_MAP[page]();
    } else {
      pageContent.innerHTML = '<div class="panel"><h2>Page Not Found</h2></div>';
    }
  } catch (error) {
    console.error(`Error loading page ${page}:`, error);
    pageContent.innerHTML = `<div class="panel"><h2>Error Loading Page</h2><p>${error.message}</p></div>`;
    showToast('Error', `Failed to load ${PAGE_TITLES[page] || page}`, 'error');
  } finally {
    safeHideLoading();
  }
}

// ============================================================
// 📌 SET PAGE TITLE
// ============================================================

export function setPageTitle(title) {
  const elTitle = document.getElementById('pageTitle');
  if (elTitle) elTitle.textContent = title;
}

// ============================================================
// 🚪 HANDLE LOGOUT
// ============================================================

async function handleLogout() {
  if (!confirm('Are you sure you want to logout?')) return;

  const { logout } = await import('./auth.js');
  await logout();

  document.getElementById('appPage').style.display = 'none';
  document.getElementById('loginPage').style.display = 'flex';
  document.getElementById('loginId').value = '';
  document.getElementById('loginPass').value = '';

  showToast('Logged Out', 'You have been logged out successfully', 'info');
}

// ============================================================
// 🌍 GLOBAL EXPORTS (so that inline onclick works)
// ============================================================

window.navigateTo = navigateTo;
window.setPageTitle = setPageTitle;
window.openCompanyInfoModal = () => import('../modals/company-info.js').then(m => m.openCompanyInfoModal());

export default {
  startApp,
  buildSidebar,
  navigateTo,
  setPageTitle
};
