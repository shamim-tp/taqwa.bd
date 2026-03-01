// Main Application Entry Point - Mobile Optimized + Full Features
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
    showLoading('🔄 অ্যাপ্লিকেশন লোড হচ্ছে...');
    
    // Initialize Database
    const dbMode = 'firebase';
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
    
    // Load modules
    loadLoginModule();
    loadModalModules();
    
    // Initialize all features
    initLoginTabs();
    initMobileMenu();
    initResizeHandler();
    initTouchEvents();
    initNetworkChecker();
    renderSidebarNav();   // সাইডবার নেভিগেশন তৈরি (লগইনের পর আবার কল হবে)
    
    // Login button events
    document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
    document.getElementById('loginForm')?.addEventListener('submit', handleLogin);
    document.getElementById('logoutBtn')?.addEventListener('click', logout);
    
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

// ==================== লগইন ট্যাব ও হ্যান্ডলিং ====================

// লগইন ট্যাব সুইচিং
function initLoginTabs() {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginIdLabel = document.getElementById('loginIdLabel');
  const loginId = document.getElementById('loginId');
  const loginPass = document.getElementById('loginPass');
  const defaultText = document.querySelector('.loginRight p:last-child');

  if (!tabAdmin || !tabMember) return;

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
      // Demo admin login
      if (loginId === 'ADMIN-001' && loginPass === '123456') {
        window.SESSION.user = { id: loginId, name: 'Administrator', role: 'Admin' };
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appPage').style.display = 'flex';
        updateUserInfo('Administrator', 'Admin', loginId, 'ADMIN');
        showToast('Success', 'Admin login successful!', 'success');
        renderSidebarNav(); // লগইনের পর নেভিগেশন রেন্ডার
        navigateTo('admin_dashboard');
      } else {
        showToast('Error', 'Invalid admin credentials', 'error');
      }
    } else {
      // Member login – verify from database
      const member = await db.get('members', loginId);
      if (member && member.pass === loginPass) {
        window.SESSION.user = { id: loginId, name: member.name, role: 'Member' };
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appPage').style.display = 'flex';
        updateUserInfo(member.name, member.memberType || 'Member', loginId, 'MEMBER');
        showToast('Success', `Welcome ${member.name}!`, 'success');
        renderSidebarNav();
        navigateTo('member_dashboard');
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

// সাইডবার নেভিগেশন জেনারেট (ইভেন্ট লিসেনার সহ)
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

  nav.innerHTML = '';
  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'nav-item';
    btn.innerHTML = `<span>${item.icon}</span><span style="flex:1; text-align:left;">${item.label}</span>`;
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      navigateTo(item.page);
    });
    nav.appendChild(btn);
  });
}

// ==================== নেভিগেশন ====================

// পৃষ্ঠা নেভিগেশন (ডায়নামিক ইম্পোর্ট + ফলব্যাক)
async function navigateTo(page, params = {}) {
  try {
    showLoading('পৃষ্ঠা লোড হচ্ছে...');
    
    // Close mobile menu if open
    if (window.SESSION.isMobile) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      closeMenu(sidebar, overlay);
    }
    
    // Try to import page module dynamically
    try {
      const module = await import(`./modules/pages/${page}.js`);
      if (module[`render${page.charAt(0).toUpperCase() + page.slice(1)}`]) {
        await module[`render${page.charAt(0).toUpperCase() + page.slice(1)}`](params);
      } else {
        throw new Error('No render function');
      }
    } catch (importError) {
      console.warn(`Page ${page} not found, using fallback.`, importError);
      // Fallback content
      const pageContent = document.getElementById('pageContent');
      const pageTitle = document.getElementById('pageTitle');
      const pageSubtitle = document.getElementById('pageSubtitle');
      
      const titleMap = {
        admin_dashboard: 'Admin Dashboard',
        member_dashboard: 'Member Dashboard',
        admin_members: 'Member Management',
        admin_deposits: 'Deposit Management',
        member_deposit: 'Submit Deposit',
        member_deposit_history: 'Deposit History'
      };
      const displayTitle = titleMap[page] || 'Dashboard';
      
      if (pageTitle) pageTitle.textContent = displayTitle;
      if (pageSubtitle) pageSubtitle.textContent = `Welcome to ${displayTitle}`;
      
      pageContent.innerHTML = `
        <div style="padding:40px; text-align:center; color:#666; font-size:18px;">
          <div style="font-size:48px; margin-bottom:20px;">📄</div>
          <div>${displayTitle} - Coming Soon</div>
          <div style="margin-top:10px; font-size:14px; color:#999;">Module: ${page}</div>
        </div>
      `;
    }
    
    // Update session
    window.SESSION.page = page;
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    hideLoading();
  } catch (error) {
    console.error('Navigation error:', error);
    hideLoading();
    showToast('Error', 'পৃষ্ঠা লোড করতে সমস্যা হয়েছে', 'error');
  }
}

// ==================== মোবাইল মেনু (আগের মতো) ====================

function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  const overlay = document.createElement('div');
  
  overlay.className = 'sidebar-overlay';
  overlay.style.cssText = `
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
  `;
  document.body.appendChild(overlay);
  
  if (menuBtn && sidebar) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      toggleMenu(sidebar, overlay);
    });
    
    overlay.addEventListener('click', () => closeMenu(sidebar, overlay));
    
    sidebar.querySelectorAll('.nav-item').forEach(item => {
      item.addEventListener('click', () => {
        if (window.SESSION.isMobile) closeMenu(sidebar, overlay);
      });
    });
    
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar.classList.contains('show')) {
        closeMenu(sidebar, overlay);
      }
    });
  }
  
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('show');
      overlay.style.display = 'none';
      overlay.style.opacity = '0';
      document.body.style.overflow = '';
    }
  });
}

function toggleMenu(sidebar, overlay) {
  if (sidebar.classList.contains('show')) {
    closeMenu(sidebar, overlay);
  } else {
    openMenu(sidebar, overlay);
  }
}

function openMenu(sidebar, overlay) {
  sidebar.classList.add('show');
  overlay.style.display = 'block';
  setTimeout(() => overlay.style.opacity = '1', 10);
  document.body.style.overflow = 'hidden';
}

function closeMenu(sidebar, overlay) {
  sidebar.classList.remove('show');
  overlay.style.opacity = '0';
  setTimeout(() => overlay.style.display = 'none', 300);
  document.body.style.overflow = '';
}

// ==================== রেস্ট অফ দ্য কোড (আপনার দেওয়া ফাংশন) ====================

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

function adjustUIForScreenSize() {
  const sidebar = document.getElementById('sidebar');
  const main = document.querySelector('.main');
  
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

function initTouchEvents() {
  let touchStartX = 0, touchEndX = 0;
  document.addEventListener('touchstart', (e) => {
    touchStartX = e.changedTouches[0].screenX;
  }, false);
  document.addEventListener('touchend', (e) => {
    touchEndX = e.changedTouches[0].screenX;
    handleSwipe();
  }, false);
  
  function handleSwipe() {
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    const swipeThreshold = 100;
    if (window.SESSION.isMobile) {
      if (touchStartX < 50 && touchEndX - touchStartX > swipeThreshold) {
        openMenu(sidebar, overlay);
      }
      if (touchStartX > 200 && touchStartX - touchEndX > swipeThreshold) {
        closeMenu(sidebar, overlay);
      }
    }
  }
}

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

// ==================== ইউটিলিটি ফাংশন ====================

function showLoading(message = 'লোড হচ্ছে...') {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    const msgElement = overlay.querySelector('p');
    if (msgElement) msgElement.textContent = message;
    overlay.classList.add('show');
    document.body.style.overflow = 'hidden';
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
    document.body.style.overflow = '';
  }
}

function showToast(title, message, type = 'info', duration = 3500) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  
  const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.innerHTML = `
    <div class="toast-icon">${icons[type] || 'ℹ️'}</div>
    <div class="toast-content">
      <div class="toast-title">${title}</div>
      <div class="toast-message">${message}</div>
      <div class="toast-time">${new Date().toLocaleTimeString()}</div>
    </div>
    <button class="toast-close" onclick="this.parentElement.remove()">✕</button>
  `;
  wrap.appendChild(toast);
  
  const timeout = setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
  toast.dataset.timeout = timeout;
  
  toast.addEventListener('mouseenter', () => clearTimeout(toast.dataset.timeout));
  toast.addEventListener('mouseleave', () => {
    const newTimeout = setTimeout(() => {
      if (toast.parentElement) {
        toast.classList.add('toast-hide');
        setTimeout(() => toast.remove(), 300);
      }
    }, duration);
    toast.dataset.timeout = newTimeout;
  });
}

// লগআউট
function logout() {
  if (confirm('Are you sure you want to logout?')) {
    window.SESSION.user = null;
    window.SESSION.mode = 'admin';
    document.getElementById('appPage').style.display = 'none';
    document.getElementById('loginPage').style.display = 'flex';
    document.getElementById('loginId').value = 'ADMIN-001';
    document.getElementById('loginPass').value = '123456';
    showToast('Info', 'Logged out successfully', 'info');
  }
}

// ==================== গ্লোবাল এরর হ্যান্ডলার ====================

window.addEventListener('error', function(event) {
  console.error('Global Error:', event.error);
  if (event.error?.message?.includes('Request was cancelled')) return;
  showToast('Error', 'একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।', 'error');
  hideLoading();
});

window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled Rejection:', event.reason);
  if (event.reason?.message?.includes('Request was cancelled')) return;
  showToast('Error', 'একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।', 'error');
  hideLoading();
});

// ==================== এক্সপোর্ট ====================

window.navigateTo = navigateTo;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.getDatabase = getDatabase;
window.logout = logout;

// স্টাইল (আপনার দেওয়া স্টাইল ইতিমধ্যেই আছে, তাই আর যোগ করলাম না)
// শুধু নিশ্চিত করার জন্য নিচের লাইনগুলো রাখা যায়, তবে আপনার কোডে স্টাইল আগে থেকেই আছে।
