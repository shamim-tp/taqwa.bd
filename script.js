// Main Application Entry Point - Mobile Optimized
import { initializeDatabase, getDatabase } from './modules/database/db.js';
import { loadLoginModule } from './modules/auth/login.js';
import { loadModalModules } from './modules/modals/modals.js';

// Global variables
window.SESSION = {
  mode: 'admin',
  user: null,
  page: null,
  isMobile: window.innerWidth <= 768,
  isTablet: window.innerWidth > 768 && window.innerWidth <= 1024,
  isDesktop: window.innerWidth > 1024
};

// Initialize Application
document.addEventListener('DOMContentLoaded', async function() {
  try {
    console.log('Document loaded');
    showLoading('🔄 অ্যাপ্লিকেশন লোড হচ্ছে...');
    
    // Initialize Database
    const dbMode = 'firebase';
    await initializeDatabase(dbMode);
    
    // Load modules
    loadLoginModule();
    loadModalModules();
    
    // Initialize all features
    initLoginTabs();
    initMobileMenu();
    initResizeHandler();
    initTouchEvents();
    initNetworkChecker();
    
    // Initialize sidebar navigation
    initSidebarNavigation();
    
    // Add logout button listener
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
      });
    }
    
    hideLoading();
    
    setTimeout(() => {
      showToast('স্বাগতম', 'TAQWA PROPERTIES BD-তে আপনাকে স্বাগতম', 'success');
    }, 1000);
    
  } catch (error) {
    console.error('Application initialization failed:', error);
    hideLoading();
    showToast('Error', 'অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে', 'error');
  }
});

// Initialize Sidebar Navigation
function initSidebarNavigation() {
  const sidebarNav = document.getElementById('sidebarNav');
  if (!sidebarNav) return;
  
  // Clear existing content
  sidebarNav.innerHTML = '';
  
  // Admin navigation items
  const adminNavItems = [
    { icon: '📊', label: 'Dashboard', page: 'admin_dashboard' },
    { icon: '👥', label: 'Members', page: 'admin_members' },
    { icon: '💰', label: 'Deposits', page: 'admin_deposits' },
    { icon: '📈', label: 'Investments', page: 'admin_investments' },
    { icon: '💸', label: 'Expenses', page: 'admin_expenses' },
    { icon: '🛒', label: 'Sales', page: 'admin_sales' },
    { icon: '📋', label: 'Reports', page: 'admin_reports' },
    { icon: '⚙️', label: 'Settings', page: 'admin_settings' }
  ];
  
  // Member navigation items
  const memberNavItems = [
    { icon: '📊', label: 'Dashboard', page: 'member_dashboard' },
    { icon: '💰', label: 'Submit Deposit', page: 'member_deposit' },
    { icon: '📜', label: 'Deposit History', page: 'member_deposit_history' },
    { icon: '👤', label: 'My Profile', page: 'member_profile' },
    { icon: '📈', label: 'My Investments', page: 'member_investments' },
    { icon: '💰', label: 'My Profit', page: 'member_profit' }
  ];
  
  // Function to render navigation
  function renderNavigation(items) {
    sidebarNav.innerHTML = items.map(item => `
      <button class="nav-item" onclick="window.navigateTo('${item.page}')">
        <span>${item.icon}</span>
        <span style="flex:1; text-align:left;">${item.label}</span>
      </button>
    `).join('');
  }
  
  // Render based on current mode
  if (window.SESSION.mode === 'admin') {
    renderNavigation(adminNavItems);
  } else {
    renderNavigation(memberNavItems);
  }
}

// Login Tabs Initialization
function initLoginTabs() {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginId = document.getElementById('loginId');
  const loginPass = document.getElementById('loginPass');
  const loginIdLabel = document.getElementById('loginIdLabel');
  const loginBtn = document.getElementById('loginBtn');
  const defaultText = document.querySelector('.loginRight p:last-child');
  
  let currentMode = 'admin';
  
  if (tabAdmin && tabMember) {
    tabAdmin.addEventListener('click', function() {
      tabAdmin.classList.add('active');
      tabMember.classList.remove('active');
      if (loginIdLabel) loginIdLabel.innerHTML = '👤 Admin ID';
      if (loginId) {
        loginId.placeholder = 'Enter Admin ID';
        loginId.value = 'ADMIN-001';
      }
      if (loginPass) loginPass.value = '123456';
      if (defaultText) defaultText.innerHTML = 'Default: Admin (ADMIN-001 / 123456)';
      currentMode = 'admin';
      window.SESSION.mode = 'admin';
    });
    
    tabMember.addEventListener('click', function() {
      tabMember.classList.add('active');
      tabAdmin.classList.remove('active');
      if (loginIdLabel) loginIdLabel.innerHTML = '👥 Member ID';
      if (loginId) {
        loginId.placeholder = 'Enter Member ID';
        loginId.value = 'FM-001';
      }
      if (loginPass) loginPass.value = '123456';
      if (defaultText) defaultText.innerHTML = 'Default: Member (FM-001 / 123456)';
      currentMode = 'member';
      window.SESSION.mode = 'member';
    });
  }
  
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogin(currentMode);
    });
  }
  
  if (loginPass) {
    loginPass.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        handleLogin(currentMode);
      }
    });
  }
}

// Handle Login
async function handleLogin(mode) {
  const loginId = document.getElementById('loginId')?.value;
  const loginPass = document.getElementById('loginPass')?.value;
  
  if (!loginId || !loginPass) {
    showToast('Error', 'Please enter ID and password', 'error');
    return;
  }
  
  showLoading('Logging in...');
  
  try {
    if (mode === 'admin') {
      // For demo, accept any admin login
      window.SESSION.user = { id: loginId, name: 'Administrator', role: 'Admin', mode: 'admin' };
      window.SESSION.mode = 'admin';
      
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('appPage').style.display = 'flex';
      
      updateUserInfo('Administrator', 'Admin', loginId, 'ADMIN');
      showToast('Success', 'Admin login successful!', 'success');
      
      // Re-initialize sidebar with admin navigation
      initSidebarNavigation();
      
      // Load admin dashboard
      loadAdminDashboard();
    } else {
      // For demo, accept any member login
      window.SESSION.user = { id: loginId, name: 'Member User', role: 'Member', mode: 'member' };
      window.SESSION.mode = 'member';
      
      document.getElementById('loginPage').style.display = 'none';
      document.getElementById('appPage').style.display = 'flex';
      
      updateUserInfo('Member User', 'Member', loginId, 'MEMBER');
      showToast('Success', 'Member login successful!', 'success');
      
      // Re-initialize sidebar with member navigation
      initSidebarNavigation();
      
      // Load member dashboard
      loadMemberDashboard();
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Error', 'Login failed', 'error');
  } finally {
    hideLoading();
  }
}

// Load Admin Dashboard
function loadAdminDashboard() {
  const pageContent = document.getElementById('pageContent');
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  if (pageTitle) pageTitle.textContent = 'Admin Dashboard';
  if (pageSubtitle) pageSubtitle.textContent = 'Welcome to Admin Panel';
  
  if (pageContent) {
    pageContent.innerHTML = `
      <div style="padding: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div class="stat-card" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 20px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Total Members</div>
            <div style="font-size: 32px; font-weight: 700;">0</div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 25px; border-radius: 20px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Total Deposits</div>
            <div style="font-size: 32px; font-weight: 700;">৳ 0</div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #43e97b, #38f9d7); color: white; padding: 25px; border-radius: 20px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Pending Approvals</div>
            <div style="font-size: 32px; font-weight: 700;">0</div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #fa709a, #fee140); color: white; padding: 25px; border-radius: 20px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Total Profit</div>
            <div style="font-size: 32px; font-weight: 700;">৳ 0</div>
          </div>
        </div>
        
        <div style="background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <h3 style="color: #1e3c72; margin-bottom: 20px;">Quick Actions</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
            <button class="quick-action-btn" onclick="window.navigateTo('admin_members')" style="padding: 15px; background: #f8f9fa; border: none; border-radius: 12px; cursor: pointer;">👥 Members</button>
            <button class="quick-action-btn" onclick="window.navigateTo('admin_deposits')" style="padding: 15px; background: #f8f9fa; border: none; border-radius: 12px; cursor: pointer;">💰 Deposits</button>
            <button class="quick-action-btn" onclick="window.navigateTo('admin_investments')" style="padding: 15px; background: #f8f9fa; border: none; border-radius: 12px; cursor: pointer;">📈 Investments</button>
            <button class="quick-action-btn" onclick="window.navigateTo('admin_reports')" style="padding: 15px; background: #f8f9fa; border: none; border-radius: 12px; cursor: pointer;">📊 Reports</button>
          </div>
        </div>
      </div>
    `;
  }
}

// Load Member Dashboard
function loadMemberDashboard() {
  const pageContent = document.getElementById('pageContent');
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  if (pageTitle) pageTitle.textContent = 'Member Dashboard';
  if (pageSubtitle) pageSubtitle.textContent = 'Welcome to Member Portal';
  
  if (pageContent) {
    pageContent.innerHTML = `
      <div style="padding: 20px;">
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px; margin-bottom: 30px;">
          <div class="stat-card" style="background: linear-gradient(135deg, #667eea, #764ba2); color: white; padding: 25px; border-radius: 20px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">My Shares</div>
            <div style="font-size: 32px; font-weight: 700;">1</div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #4facfe, #00f2fe); color: white; padding: 25px; border-radius: 20px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">Total Deposit</div>
            <div style="font-size: 32px; font-weight: 700;">৳ 0</div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #43e97b, #38f9d7); color: white; padding: 25px; border-radius: 20px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">This Month Due</div>
            <div style="font-size: 32px; font-weight: 700;">৳ 10,000</div>
          </div>
          <div class="stat-card" style="background: linear-gradient(135deg, #fa709a, #fee140); color: white; padding: 25px; border-radius: 20px;">
            <div style="font-size: 14px; opacity: 0.9; margin-bottom: 10px;">My Profit</div>
            <div style="font-size: 32px; font-weight: 700;">৳ 0</div>
          </div>
        </div>
        
        <div style="background: white; border-radius: 20px; padding: 25px; box-shadow: 0 10px 30px rgba(0,0,0,0.1);">
          <h3 style="color: #1e3c72; margin-bottom: 20px;">Quick Actions</h3>
          <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px;">
            <button class="quick-action-btn" onclick="window.navigateTo('member_deposit')" style="padding: 15px; background: #f8f9fa; border: none; border-radius: 12px; cursor: pointer;">💰 Submit Deposit</button>
            <button class="quick-action-btn" onclick="window.navigateTo('member_deposit_history')" style="padding: 15px; background: #f8f9fa; border: none; border-radius: 12px; cursor: pointer;">📜 History</button>
            <button class="quick-action-btn" onclick="window.navigateTo('member_profile')" style="padding: 15px; background: #f8f9fa; border: none; border-radius: 12px; cursor: pointer;">👤 Profile</button>
          </div>
        </div>
      </div>
    `;
  }
}

// Navigate to Page
window.navigateTo = function(page) {
  console.log('Navigating to:', page);
  
  // Update page title
  const pageTitle = document.getElementById('pageTitle');
  const pageSubtitle = document.getElementById('pageSubtitle');
  
  // Close mobile menu if open
  if (window.SESSION.isMobile) {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar && overlay) {
      sidebar.classList.remove('show');
      overlay.style.display = 'none';
      overlay.style.opacity = '0';
    }
  }
  
  // Load different pages
  const pageContent = document.getElementById('pageContent');
  
  if (page === 'admin_dashboard') {
    if (pageTitle) pageTitle.textContent = 'Admin Dashboard';
    if (pageSubtitle) pageSubtitle.textContent = 'Welcome to Admin Panel';
    loadAdminDashboard();
  } else if (page === 'member_dashboard') {
    if (pageTitle) pageTitle.textContent = 'Member Dashboard';
    if (pageSubtitle) pageSubtitle.textContent = 'Welcome to Member Portal';
    loadMemberDashboard();
  } else if (page === 'admin_members') {
    if (pageTitle) pageTitle.textContent = 'Member Management';
    if (pageSubtitle) pageSubtitle.textContent = 'Manage all members';
    if (pageContent) {
      pageContent.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">Member Management Page - Coming Soon</div>';
    }
  } else if (page === 'admin_deposits') {
    if (pageTitle) pageTitle.textContent = 'Deposit Management';
    if (pageSubtitle) pageSubtitle.textContent = 'Manage all deposits';
    if (pageContent) {
      pageContent.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">Deposit Management Page - Coming Soon</div>';
    }
  } else if (page === 'member_deposit') {
    if (pageTitle) pageTitle.textContent = 'Submit Deposit';
    if (pageSubtitle) pageSubtitle.textContent = 'Submit your monthly deposit';
    if (pageContent) {
      pageContent.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">Submit Deposit Page - Coming Soon</div>';
    }
  } else if (page === 'member_deposit_history') {
    if (pageTitle) pageTitle.textContent = 'Deposit History';
    if (pageSubtitle) pageSubtitle.textContent = 'View your deposit history';
    if (pageContent) {
      pageContent.innerHTML = '<div style="padding: 40px; text-align: center; color: #666;">Deposit History Page - Coming Soon</div>';
    }
  } else {
    if (pageContent) {
      pageContent.innerHTML = `<div style="padding: 40px; text-align: center; color: #666;">${page} - Coming Soon</div>`;
    }
  }
  
  showToast('Navigation', `Loading ${page}...`, 'info');
};

// Update User Info
function updateUserInfo(name, role, id, mode) {
  const userNameEl = document.getElementById('currentUserName');
  const userRoleEl = document.getElementById('currentUserRole');
  const chipIdEl = document.getElementById('chipId');
  const systemModeEl = document.getElementById('systemMode');
  
  if (userNameEl) userNameEl.textContent = name;
  if (userRoleEl) userRoleEl.textContent = role;
  if (chipIdEl) chipIdEl.textContent = `ID: ${id}`;
  if (systemModeEl) systemModeEl.textContent = mode;
}

// Mobile Menu Initialization
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  
  if (!menuBtn || !sidebar) return;
  
  // Remove existing overlay if any
  const existingOverlay = document.querySelector('.sidebar-overlay');
  if (existingOverlay) existingOverlay.remove();
  
  const overlay = document.createElement('div');
  overlay.className = 'sidebar-overlay';
  document.body.appendChild(overlay);
  
  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu(sidebar, overlay);
  });
  
  overlay.addEventListener('click', function() {
    closeMenu(sidebar, overlay);
  });
  
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && sidebar.classList.contains('show')) {
      closeMenu(sidebar, overlay);
    }
  });
  
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('show');
      overlay.style.display = 'none';
      overlay.style.opacity = '0';
      document.body.style.overflow = '';
    }
  });
}

// Toggle Menu
function toggleMenu(sidebar, overlay) {
  if (sidebar.classList.contains('show')) {
    closeMenu(sidebar, overlay);
  } else {
    openMenu(sidebar, overlay);
  }
}

// Open Menu
function openMenu(sidebar, overlay) {
  sidebar.classList.add('show');
  overlay.style.display = 'block';
  setTimeout(() => overlay.style.opacity = '1', 10);
  document.body.style.overflow = 'hidden';
}

// Close Menu
function closeMenu(sidebar, overlay) {
  sidebar.classList.remove('show');
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.display = 'none', 300);
  document.body.style.overflow = '';
}

// Resize Handler
function initResizeHandler() {
  let resizeTimeout;
  
  window.addEventListener('resize', function() {
    window.SESSION.isMobile = window.innerWidth <= 768;
    window.SESSION.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    window.SESSION.isDesktop = window.innerWidth > 1024;
    
    clearTimeout(resizeTimeout);
    document.body.classList.add('is-resizing');
    
    resizeTimeout = setTimeout(function() {
      document.body.classList.remove('is-resizing');
      adjustUIForScreenSize();
    }, 250);
  });
}

// Adjust UI
function adjustUIForScreenSize() {
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('.main');
  
  if (!sidebar) return;
  
  if (window.SESSION.isDesktop) {
    sidebar.style.width = '280px';
    if (main) main.style.marginLeft = '280px';
  } else if (window.SESSION.isTablet) {
    sidebar.style.width = '240px';
    if (main) main.style.marginLeft = '240px';
  } else {
    sidebar.style.width = '280px';
    if (main) main.style.marginLeft = '0';
  }
}

// Touch Events
function initTouchEvents() {
  let touchStartX = 0;
  let touchEndX = 0;
  
  document.addEventListener('touchstart', function(e) {
    touchStartX = e.changedTouches[0].screenX;
  }, false);
  
  document.addEventListener('touchend', function(e) {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);
  
  function handleSwipe() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const swipeThreshold = 100;
    
    if (window.SESSION.isMobile && sidebar && overlay) {
      if (touchStartX < 50 && touchEndX - touchStartX > swipeThreshold) {
        openMenu(sidebar, overlay);
      }
      if (touchStartX > 200 && touchStartX - touchEndX > swipeThreshold) {
        closeMenu(sidebar, overlay);
      }
    }
  }
}

// Network Checker
function initNetworkChecker() {
  function updateOnlineStatus() {
    if (navigator.onLine) {
      document.body.classList.remove('offline');
      showToast('অনলাইন', 'ইন্টারনেট সংযোগ পুনরুদ্ধার হয়েছে', 'success');
    } else {
      document.body.classList.add('offline');
      showToast('অফলাইন', 'ইন্টারনেট সংযোগ বিচ্ছিন্ন', 'error');
    }
  }
  
  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  
  if (!navigator.onLine) document.body.classList.add('offline');
}

// Show Loading
function showLoading(message = 'লোড হচ্ছে...') {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    const msgElement = overlay.querySelector('p');
    if (msgElement) msgElement.textContent = message;
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

// Hide Loading
function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

// Show Toast
function showToast(title, message, type = 'info', duration = 3500) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div style="font-size:24px; min-width:40px; text-align:center;">${icons[type] || 'ℹ️'}</div>
    <div style="flex:1">
      <div style="font-weight:700; margin-bottom:5px;">${title}</div>
      <div style="font-size:14px;">${message}</div>
      <div style="font-size:11px; color:#999; margin-top:8px;">${new Date().toLocaleTimeString()}</div>
    </div>
    <button onclick="this.parentElement.remove()" style="background:none; border:none; font-size:18px; cursor:pointer;">✕</button>
  `;
  
  wrap.appendChild(toast);
  
  setTimeout(() => {
    if (toast.parentElement) {
      toast.style.animation = 'slideOut 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
}

// Logout
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    window.SESSION.user = null;
    window.SESSION.mode = 'admin';
    window.SESSION.page = null;
    
    document.getElementById('appPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    
    const loginId = document.getElementById('loginId');
    const loginPass = document.getElementById('loginPass');
    if (loginId) loginId.value = 'ADMIN-001';
    if (loginPass) loginPass.value = '123456';
    
    showToast('Info', 'Logged out successfully', 'info');
  }
}

// Global error handlers
window.addEventListener('error', function(event) {
  if (event.error?.message?.includes('runtime.lastError') ||
      event.error?.message?.includes('message port closed')) {
    return;
  }
  console.error('Global Error:', event.error);
  if (!event.error?.message?.includes('Request was cancelled')) {
    showToast('Error', 'একটি ত্রুটি ঘটেছে', 'error');
    hideLoading();
  }
});

window.addEventListener('unhandledrejection', function(event) {
  if (event.reason?.message?.includes('runtime.lastError') ||
      event.reason?.message?.includes('message port closed')) {
    return;
  }
  console.error('Unhandled Rejection:', event.reason);
  if (!event.reason?.message?.includes('Request was cancelled')) {
    showToast('Error', 'একটি ত্রুটি ঘটেছে', 'error');
    hideLoading();
  }
});

// Add CSS animations
const style = document.createElement('style');
style.textContent = `
  @keyframes slideOut {
    from { transform: translateX(0); opacity: 1; }
    to { transform: translateX(100%); opacity: 0; }
  }
  
  .sidebar-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0,0,0,0.5);
    backdrop-filter: blur(5px);
    z-index: 1001;
    display: none;
    opacity: 0;
    transition: opacity 0.3s ease;
  }
  
  .sidebar.show {
    left: 0 !important;
    box-shadow: 5px 0 30px rgba(0,0,0,0.2);
  }
  
  body.offline .main::before {
    content: '📴 অফলাইন মোড';
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: #f39c12;
    color: white;
    text-align: center;
    padding: 8px;
    font-size: 13px;
    font-weight: 600;
    z-index: 9999;
  }
  
  body.offline .topbar {
    margin-top: 35px;
  }
  
  body.is-resizing {
    cursor: col-resize;
  }
  
  body.is-resizing * {
    pointer-events: none;
    transition: none !important;
  }
  
  .nav-item {
    width: 100%;
    text-align: left;
    padding: 12px 15px;
    border: none;
    background: none;
    color: #555;
    border-radius: 12px;
    cursor: pointer;
    display: flex;
    align-items: center;
    gap: 12px;
    transition: all 0.3s;
  }
  
  .nav-item:hover {
    background: #f0f0f0;
  }
  
  .nav-item.active {
    background: linear-gradient(135deg, #667eea, #764ba2);
    color: white;
  }
  
  .quick-action-btn {
    transition: all 0.3s;
  }
  
  .quick-action-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 5px 15px rgba(0,0,0,0.1);
  }
  
  @media (max-width: 768px) {
    .toastWrap {
      width: calc(100% - 30px);
      left: 15px;
      right: 15px;
    }
  }
`;
document.head.appendChild(style);
