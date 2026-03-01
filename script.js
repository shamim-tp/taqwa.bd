// Main Application Entry Point
import { initializeDatabase, getDatabase } from './modules/database/db.js';
import { loadLoginModule } from './modules/auth/login.js';
import { loadModalModules } from './modules/modals/modals.js';

// Global variables
window.SESSION = {
  mode: 'admin',
  user: null,
  page: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
  try {
    showLoading('অ্যাপ্লিকেশন লোড হচ্ছে...');
    
    // Initialize Database
    const dbMode = 'firebase'; // Always use Firebase
    await initializeDatabase(dbMode);
    
    // Update UI with current database mode
    const dbTypeElement = document.getElementById('databaseType');
    if (dbTypeElement) {
      const modeNames = {
        'local': 'LocalStorage',
        'firebase': 'Firebase',
        'mysql': 'MySQL',
        'postgresql': 'PostgreSQL'
      };
      dbTypeElement.textContent = modeNames[dbMode] || dbMode;
    }
    
    // Load login module
    loadLoginModule();
    
    // Load modal modules
    loadModalModules();
    
    // Mobile menu
    document.getElementById('mobileMenuBtn')?.addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('active');
    });
    
    hideLoading();
  } catch (error) {
    console.error('Application initialization failed:', error);
    showToast('Error', 'অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
  }
});

// ==================== মূল কোড শেষ ====================
// নিচের অংশটুকু নতুন সংযোজন (মোবাইল ফ্রেন্ডলি ও লগইন/নেভিগেশন ফিচার)
// =====================================================

// গ্লোবাল ভেরিয়েবল আপডেট
window.SESSION = window.SESSION || { mode: 'admin', user: null, page: null };

// লগইন ট্যাব সুইচিং
function initLoginTabs() {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginIdLabel = document.getElementById('loginIdLabel');
  const loginId = document.getElementById('loginId');
  const loginPass = document.getElementById('loginPass');
  const defaultText = document.querySelector('.loginRight p:last-child');

  if (tabAdmin && tabMember) {
    tabAdmin.addEventListener('click', () => {
      tabAdmin.classList.add('active');
      tabMember.classList.remove('active');
      loginIdLabel.textContent = 'Admin ID';
      loginId.placeholder = 'Enter Admin ID';
      loginId.value = 'ADMIN-001';
      loginPass.value = '123456';
      if (defaultText) defaultText.textContent = 'Default: Admin (ADMIN-001 / 123456)';
      window.SESSION.mode = 'admin';
    });

    tabMember.addEventListener('click', () => {
      tabMember.classList.add('active');
      tabAdmin.classList.remove('active');
      loginIdLabel.textContent = 'Member ID';
      loginId.placeholder = 'Enter Member ID';
      loginId.value = 'FM-001';
      loginPass.value = '123456';
      if (defaultText) defaultText.textContent = 'Default: Member (FM-001 / 123456)';
      window.SESSION.mode = 'member';
    });
  }
}

// লগইন হ্যান্ডলার
async function handleLogin(event) {
  event.preventDefault();
  const loginId = document.getElementById('loginId')?.value;
  const loginPass = document.getElementById('loginPass')?.value;
  if (!loginId || !loginPass) {
    showToast('Error', 'Please enter ID and password', 'error');
    return;
  }

  showLoading('Logging in...');
  try {
    const db = getDatabase();
    if (window.SESSION.mode === 'admin') {
      // ডেমো অ্যাডমিন লগইন
      if (loginId === 'ADMIN-001' && loginPass === '123456') {
        window.SESSION.user = { id: loginId, name: 'Administrator', role: 'Admin' };
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appPage').style.display = 'flex';
        updateUserInfo('Administrator', 'Admin', loginId, 'ADMIN');
        showToast('Success', 'Admin login successful!', 'success');
        loadAdminDashboard();
      } else {
        showToast('Error', 'Invalid admin credentials', 'error');
      }
    } else {
      // মেম্বার লগইন – ডাটাবেস থেকে ভেরিফাই করা যেতে পারে, এখানে ডেমো
      const member = await db.get('members', loginId);
      if (member && member.pass === loginPass) {
        window.SESSION.user = { id: loginId, name: member.name, role: 'Member' };
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appPage').style.display = 'flex';
        updateUserInfo(member.name, member.memberType || 'Member', loginId, 'MEMBER');
        showToast('Success', `Welcome ${member.name}!`, 'success');
        loadMemberDashboard();
      } else {
        showToast('Error', 'Invalid member credentials', 'error');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Error', 'Login failed', 'error');
  } finally {
    hideLoading();
  }
}

// ইউজার ইনফো আপডেট
function updateUserInfo(name, role, id, mode) {
  document.getElementById('currentUserName').textContent = name;
  document.getElementById('currentUserRole').textContent = role;
  document.getElementById('chipId').textContent = `ID: ${id}`;
  document.getElementById('systemMode').textContent = mode;
}

// সাইডবার নেভিগেশন জেনারেট
function renderSidebarNav() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  const isAdmin = window.SESSION.mode === 'admin';
  const items = isAdmin ? [
    { icon: '📊', label: 'Dashboard', page: 'admin_dashboard' },
    { icon: '👥', label: 'Members', page: 'admin_members' },
    { icon: '💰', label: 'Deposits', page: 'admin_deposits' },
    { icon: '📈', label: 'Investments', page: 'admin_investments' },
    { icon: '💸', label: 'Expenses', page: 'admin_expenses' },
    { icon: '🛒', label: 'Sales', page: 'admin_sales' },
    { icon: '📋', label: 'Reports', page: 'admin_reports' },
    { icon: '⚙️', label: 'Settings', page: 'admin_settings' }
  ] : [
    { icon: '📊', label: 'Dashboard', page: 'member_dashboard' },
    { icon: '💰', label: 'Submit Deposit', page: 'member_deposit' },
    { icon: '📜', label: 'Deposit History', page: 'member_deposit_history' },
    { icon: '👤', label: 'My Profile', page: 'member_profile' },
    { icon: '📈', label: 'My Investments', page: 'member_investments' },
    { icon: '💰', label: 'My Profit', page: 'member_profit' }
  ];
  nav.innerHTML = items.map(item => `
    <button class="nav-item" onclick="window.navigateTo('${item.page}')">
      <span>${item.icon}</span>
      <span style="flex:1; text-align:left;">${item.label}</span>
    </button>
  `).join('');
}

// নেভিগেশন ফাংশন
window.navigateTo = function(page) {
  console.log('Navigating to:', page);
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('active', 'show');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('show');
  }
  // পৃষ্ঠা অনুযায়ী কন্টেন্ট লোড (ডেমো)
  const pageContent = document.getElementById('pageContent');
  const titleMap = {
    admin_dashboard: 'Admin Dashboard',
    member_dashboard: 'Member Dashboard',
    admin_members: 'Member Management',
    admin_deposits: 'Deposit Management',
    member_deposit: 'Submit Deposit',
    member_deposit_history: 'Deposit History'
  };
  document.getElementById('pageTitle').textContent = titleMap[page] || 'Dashboard';
  document.getElementById('pageSubtitle').textContent = `Welcome to ${titleMap[page] || 'Dashboard'}`;
  pageContent.innerHTML = `<div style="padding:40px; text-align:center; color:#666;">${page} - Coming Soon</div>`;
  showToast('Navigation', `Loading ${page}...`, 'info');
};

// ড্যাশবোর্ড লোডার
function loadAdminDashboard() { window.navigateTo('admin_dashboard'); }
function loadMemberDashboard() { window.navigateTo('member_dashboard'); }

// মোবাইল মেনু উন্নয়ন (ওভারলে ও টাচ)
function enhanceMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!menuBtn || !sidebar) return;

  // ওভারলে তৈরি
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  function toggleMenu(show) {
    if (show) {
      sidebar.classList.add('active', 'show');
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    } else {
      sidebar.classList.remove('active', 'show');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(!sidebar.classList.contains('show'));
  });

  overlay.addEventListener('click', () => toggleMenu(false));

  sidebar.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) toggleMenu(false);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) toggleMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('show')) toggleMenu(false);
  });
}

// লগআউট
window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    window.SESSION.user = null;
    window.SESSION.mode = 'admin';
    document.getElementById('appPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('loginId').value = 'ADMIN-001';
    document.getElementById('loginPass').value = '123456';
    showToast('Info', 'Logged out successfully', 'info');
  }
};

// টোস্ট টাইপ যোগ
function showToast(title, message, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="t1">${title}</div>
    <div class="t2">${message}</div>
    <div class="t3">${new Date().toLocaleString()}</div>
  `;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// লগইন বাটন ইভেন্ট
document.addEventListener('DOMContentLoaded', function() {
  initLoginTabs();
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn')?.addEventListener('click', window.logout);
  enhanceMobileMenu();
  renderSidebarNav();
});

// এক্সপোর্ট ফাংশন (ইতিমধ্যে বিদ্যমান)
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.getDatabase = getDatabase;// Main Application Entry Point
import { initializeDatabase, getDatabase } from './modules/database/db.js';
import { loadLoginModule } from './modules/auth/login.js';
import { loadModalModules } from './modules/modals/modals.js';

// Global variables
window.SESSION = {
  mode: 'admin',
  user: null,
  page: null
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
  try {
    showLoading('অ্যাপ্লিকেশন লোড হচ্ছে...');
    
    // Initialize Database
    const dbMode = 'firebase'; // Always use Firebase
    await initializeDatabase(dbMode);
    
    // Update UI with current database mode
    const dbTypeElement = document.getElementById('databaseType');
    if (dbTypeElement) {
      const modeNames = {
        'local': 'LocalStorage',
        'firebase': 'Firebase',
        'mysql': 'MySQL',
        'postgresql': 'PostgreSQL'
      };
      dbTypeElement.textContent = modeNames[dbMode] || dbMode;
    }
    
    // Load login module
    loadLoginModule();
    
    // Load modal modules
    loadModalModules();
    
    // Mobile menu
    document.getElementById('mobileMenuBtn')?.addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('active');
    });
    
    hideLoading();
  } catch (error) {
    console.error('Application initialization failed:', error);
    showToast('Error', 'অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
  }
});

// ==================== মূল কোড শেষ ====================
// নিচের অংশটুকু নতুন সংযোজন (মোবাইল ফ্রেন্ডলি ও লগইন/নেভিগেশন ফিচার)
// =====================================================

// গ্লোবাল ভেরিয়েবল আপডেট
window.SESSION = window.SESSION || { mode: 'admin', user: null, page: null };

// লগইন ট্যাব সুইচিং
function initLoginTabs() {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginIdLabel = document.getElementById('loginIdLabel');
  const loginId = document.getElementById('loginId');
  const loginPass = document.getElementById('loginPass');
  const defaultText = document.querySelector('.loginRight p:last-child');

  if (tabAdmin && tabMember) {
    tabAdmin.addEventListener('click', () => {
      tabAdmin.classList.add('active');
      tabMember.classList.remove('active');
      loginIdLabel.textContent = 'Admin ID';
      loginId.placeholder = 'Enter Admin ID';
      loginId.value = 'ADMIN-001';
      loginPass.value = '123456';
      if (defaultText) defaultText.textContent = 'Default: Admin (ADMIN-001 / 123456)';
      window.SESSION.mode = 'admin';
    });

    tabMember.addEventListener('click', () => {
      tabMember.classList.add('active');
      tabAdmin.classList.remove('active');
      loginIdLabel.textContent = 'Member ID';
      loginId.placeholder = 'Enter Member ID';
      loginId.value = 'FM-001';
      loginPass.value = '123456';
      if (defaultText) defaultText.textContent = 'Default: Member (FM-001 / 123456)';
      window.SESSION.mode = 'member';
    });
  }
}

// লগইন হ্যান্ডলার
async function handleLogin(event) {
  event.preventDefault();
  const loginId = document.getElementById('loginId')?.value;
  const loginPass = document.getElementById('loginPass')?.value;
  if (!loginId || !loginPass) {
    showToast('Error', 'Please enter ID and password', 'error');
    return;
  }

  showLoading('Logging in...');
  try {
    const db = getDatabase();
    if (window.SESSION.mode === 'admin') {
      // ডেমো অ্যাডমিন লগইন
      if (loginId === 'ADMIN-001' && loginPass === '123456') {
        window.SESSION.user = { id: loginId, name: 'Administrator', role: 'Admin' };
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appPage').style.display = 'flex';
        updateUserInfo('Administrator', 'Admin', loginId, 'ADMIN');
        showToast('Success', 'Admin login successful!', 'success');
        loadAdminDashboard();
      } else {
        showToast('Error', 'Invalid admin credentials', 'error');
      }
    } else {
      // মেম্বার লগইন – ডাটাবেস থেকে ভেরিফাই করা যেতে পারে, এখানে ডেমো
      const member = await db.get('members', loginId);
      if (member && member.pass === loginPass) {
        window.SESSION.user = { id: loginId, name: member.name, role: 'Member' };
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appPage').style.display = 'flex';
        updateUserInfo(member.name, member.memberType || 'Member', loginId, 'MEMBER');
        showToast('Success', `Welcome ${member.name}!`, 'success');
        loadMemberDashboard();
      } else {
        showToast('Error', 'Invalid member credentials', 'error');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Error', 'Login failed', 'error');
  } finally {
    hideLoading();
  }
}

// ইউজার ইনফো আপডেট
function updateUserInfo(name, role, id, mode) {
  document.getElementById('currentUserName').textContent = name;
  document.getElementById('currentUserRole').textContent = role;
  document.getElementById('chipId').textContent = `ID: ${id}`;
  document.getElementById('systemMode').textContent = mode;
}

// সাইডবার নেভিগেশন জেনারেট
function renderSidebarNav() {
  const nav = document.getElementById('sidebarNav');
  if (!nav) return;
  const isAdmin = window.SESSION.mode === 'admin';
  const items = isAdmin ? [
    { icon: '📊', label: 'Dashboard', page: 'admin_dashboard' },
    { icon: '👥', label: 'Members', page: 'admin_members' },
    { icon: '💰', label: 'Deposits', page: 'admin_deposits' },
    { icon: '📈', label: 'Investments', page: 'admin_investments' },
    { icon: '💸', label: 'Expenses', page: 'admin_expenses' },
    { icon: '🛒', label: 'Sales', page: 'admin_sales' },
    { icon: '📋', label: 'Reports', page: 'admin_reports' },
    { icon: '⚙️', label: 'Settings', page: 'admin_settings' }
  ] : [
    { icon: '📊', label: 'Dashboard', page: 'member_dashboard' },
    { icon: '💰', label: 'Submit Deposit', page: 'member_deposit' },
    { icon: '📜', label: 'Deposit History', page: 'member_deposit_history' },
    { icon: '👤', label: 'My Profile', page: 'member_profile' },
    { icon: '📈', label: 'My Investments', page: 'member_investments' },
    { icon: '💰', label: 'My Profit', page: 'member_profit' }
  ];
  nav.innerHTML = items.map(item => `
    <button class="nav-item" onclick="window.navigateTo('${item.page}')">
      <span>${item.icon}</span>
      <span style="flex:1; text-align:left;">${item.label}</span>
    </button>
  `).join('');
}

// নেভিগেশন ফাংশন
window.navigateTo = function(page) {
  console.log('Navigating to:', page);
  if (window.innerWidth <= 768) {
    document.getElementById('sidebar').classList.remove('active', 'show');
    const overlay = document.querySelector('.sidebar-overlay');
    if (overlay) overlay.classList.remove('show');
  }
  // পৃষ্ঠা অনুযায়ী কন্টেন্ট লোড (ডেমো)
  const pageContent = document.getElementById('pageContent');
  const titleMap = {
    admin_dashboard: 'Admin Dashboard',
    member_dashboard: 'Member Dashboard',
    admin_members: 'Member Management',
    admin_deposits: 'Deposit Management',
    member_deposit: 'Submit Deposit',
    member_deposit_history: 'Deposit History'
  };
  document.getElementById('pageTitle').textContent = titleMap[page] || 'Dashboard';
  document.getElementById('pageSubtitle').textContent = `Welcome to ${titleMap[page] || 'Dashboard'}`;
  pageContent.innerHTML = `<div style="padding:40px; text-align:center; color:#666;">${page} - Coming Soon</div>`;
  showToast('Navigation', `Loading ${page}...`, 'info');
};

// ড্যাশবোর্ড লোডার
function loadAdminDashboard() { window.navigateTo('admin_dashboard'); }
function loadMemberDashboard() { window.navigateTo('member_dashboard'); }

// মোবাইল মেনু উন্নয়ন (ওভারলে ও টাচ)
function enhanceMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!menuBtn || !sidebar) return;

  // ওভারলে তৈরি
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  function toggleMenu(show) {
    if (show) {
      sidebar.classList.add('active', 'show');
      overlay.classList.add('show');
      document.body.style.overflow = 'hidden';
    } else {
      sidebar.classList.remove('active', 'show');
      overlay.classList.remove('show');
      document.body.style.overflow = '';
    }
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu(!sidebar.classList.contains('show'));
  });

  overlay.addEventListener('click', () => toggleMenu(false));

  sidebar.querySelectorAll('button').forEach(btn => {
    btn.addEventListener('click', () => {
      if (window.innerWidth <= 768) toggleMenu(false);
    });
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) toggleMenu(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('show')) toggleMenu(false);
  });
}

// লগআউট
window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    window.SESSION.user = null;
    window.SESSION.mode = 'admin';
    document.getElementById('appPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('loginId').value = 'ADMIN-001';
    document.getElementById('loginPass').value = '123456';
    showToast('Info', 'Logged out successfully', 'info');
  }
};

// টোস্ট টাইপ যোগ
function showToast(title, message, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="t1">${title}</div>
    <div class="t2">${message}</div>
    <div class="t3">${new Date().toLocaleString()}</div>
  `;
  wrap.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// লগইন বাটন ইভেন্ট
document.addEventListener('DOMContentLoaded', function() {
  initLoginTabs();
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
  document.getElementById('logoutBtn')?.addEventListener('click', window.logout);
  enhanceMobileMenu();
  renderSidebarNav();
});

// এক্সপোর্ট ফাংশন (ইতিমধ্যে বিদ্যমান)
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.getDatabase = getDatabase;
