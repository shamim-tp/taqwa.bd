// modules/app.js
import { getCurrentUser, getCurrentRole } from './auth/auth.js';
import { showToast } from '../utils/common.js';
import { logActivity } from './auth/auth.js'; // যদি logActivity auth.js-এ থাকে

let currentPage = null;

// পৃষ্ঠার শিরোনাম কনফিগারেশন
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

// পৃষ্ঠা মডিউল ম্যাপিং (ডায়নামিক ইম্পোর্ট)
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

// অ্যাপ শুরু করার ফাংশন (লগইন成功后 কল হবে)
export function startApp() {
  const user = getCurrentUser();
  const role = getCurrentRole();
  if (!user || !role) {
    showToast('Error', 'User session not found');
    return;
  }

  // UI এলিমেন্ট আপডেট
  document.getElementById('currentUserName').textContent = user.name;
  document.getElementById('currentUserRole').textContent = user.role || role;
  document.getElementById('chipId').textContent = `ID: ${user.id}`;
  document.getElementById('chipStatus').textContent = user.status || 'Active';
  document.getElementById('systemMode').textContent = role.toUpperCase();

  // অ্যাডমিন টুলস বাটন
  const systemToolsBtn = document.getElementById('systemToolsBtn');
  const quickAddBtn = document.getElementById('quickAddBtn');
  if (role === 'admin') {
    systemToolsBtn.classList.remove('hidden');
    quickAddBtn.classList.remove('hidden');
    // একাধিক লিসেনার এড়াতে পুরোনো লিসেনার সরানো (যদি থাকে)
    const newSystemToolsBtn = systemToolsBtn.cloneNode(true);
    const newQuickAddBtn = quickAddBtn.cloneNode(true);
    systemToolsBtn.parentNode.replaceChild(newSystemToolsBtn, systemToolsBtn);
    quickAddBtn.parentNode.replaceChild(newQuickAddBtn, quickAddBtn);
    newSystemToolsBtn.addEventListener('click', () => {
      import('../modals/system-tools.js').then(m => m.openSystemToolsModal());
    });
    newQuickAddBtn.addEventListener('click', () => {
      import('../modals/quick-add.js').then(m => m.openQuickAddModal());
    });
  } else {
    systemToolsBtn.classList.add('hidden');
    quickAddBtn.classList.add('hidden');
  }

  // লগআউট বাটন
  const logoutBtn = document.getElementById('logoutBtn');
  const newLogoutBtn = logoutBtn.cloneNode(true);
  logoutBtn.parentNode.replaceChild(newLogoutBtn, logoutBtn);
  newLogoutBtn.addEventListener('click', handleLogout);

  // সাইডবার তৈরি
  buildSidebar();

  // প্রথম পৃষ্ঠা লোড
  navigateTo(role === 'admin' ? 'admin_dashboard' : 'member_dashboard');
}

// সাইডবার বিল্ড ফাংশন
function buildSidebar() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  nav.innerHTML = '';

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
      { id: 'admin_profit', name: 'Profit Distribution', icon: '🎯' },
      { id: 'admin_resign', name: 'Resignation', icon: '🚪' },
      { id: 'admin_notices', name: 'Notices', icon: '📢' },
      { id: 'admin_reports', name: 'Reports', icon: '📋' },
      { id: 'admin_admins', name: 'Admin Accounts', icon: '🔐' },
      { id: 'admin_logs', name: 'Activity Logs', icon: '📝' }
    ];
  } else {
    navItems = [
      { id: 'member_dashboard', name: 'Dashboard', icon: '📊' },
      { id: 'member_profile', name: 'My Profile', icon: '👤' },
      { id: 'member_deposit', name: 'Submit Deposit', icon: '💰' },
      { id: 'member_deposit_history', name: 'Deposit History', icon: '📜' },
      { id: 'member_investments', name: 'Investments', icon: '📈' },
      { id: 'member_profit', name: 'Profit & Shares', icon: '🎯' },
      { id: 'member_notices', name: 'Notices', icon: '📢' },
      { id: 'company_info', name: 'Vision & Mission', icon: '🏢' }
    ];
  }

  navItems.forEach(item => {
    const btn = document.createElement('button');
    btn.className = currentPage === item.id ? 'active' : '';
    btn.setAttribute('aria-label', item.name);
    btn.innerHTML = `<span>${item.icon} ${item.name}</span><span class="count">›</span>`;
    if (item.id === 'company_info') {
      btn.addEventListener('click', () => {
        import('../modals/company-info.js').then(m => m.openCompanyInfoModal());
      });
    } else {
      btn.addEventListener('click', () => navigateTo(item.id));
    }
    nav.appendChild(btn);
  });
}

// নেভিগেট ফাংশন
export function navigateTo(page) {
  currentPage = page;
  buildSidebar(); // সক্রিয় পৃষ্ঠা হাইলাইট করতে

  const sidebar = document.getElementById('sidebar');
  if (sidebar) sidebar.classList.remove('active');

  const title = PAGE_TITLES[page] || page.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  setPageTitle(title);

  loadPageModule(page);
}

// পৃষ্ঠা মডিউল লোড
async function loadPageModule(page) {
  try {
    window.showLoading('Loading page...');

    if (MODULE_MAP[page]) {
      await MODULE_MAP[page]();
    } else {
      document.getElementById('pageContent').innerHTML = '<div class="panel"><h2>Page Not Found</h2><p>The requested page does not exist.</p></div>';
    }
  } catch (error) {
    console.error(`Error loading page ${page}:`, error);
    showToast('Error', `Failed to load ${page}`);
    document.getElementById('pageContent').innerHTML = '<div class="panel"><h2>Error Loading Page</h2><p>Please try again.</p></div>';
  } finally {
    window.hideLoading();
  }
}

// পৃষ্ঠার শিরোনাম সেট
export function setPageTitle(title, subtitle = '') {
  const elTitle = document.getElementById('pageTitle');
  const elSub = document.getElementById('pageSubtitle');
  if (elTitle) elTitle.textContent = title;
  if (elSub) elSub.textContent = subtitle || 'Welcome to TAQWA PROPERTIES ERP';
}

// লগআউট হ্যান্ডলার
async function handleLogout() {
  if (confirm('Are you sure you want to logout?')) {
    const { logout } = await import('./auth/auth.js');
    await logout();
    document.getElementById('appPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('loginId').value = '';
    document.getElementById('loginPass').value = '';
    showToast('Logged Out', 'You have been logged out successfully');
  }
}
