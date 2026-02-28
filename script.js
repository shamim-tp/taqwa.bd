// Main Application Entry Point - Mobile Optimized
import { initializeDatabase, getDatabase } from './modules/database/db.js';
import { loadLoginModule } from './modules/auth/login.js';
import { loadModalModules } from './modules/modals/modals.js';

// Suppress Chrome extension errors
const originalConsoleError = console.error;
console.error = function(...args) {
  // Filter out Chrome extension errors
  if (args[0] && typeof args[0] == 'string' && 
      (args[0].includes('runtime.lastError') || 
       args[0].includes('message port closed') ||
       args[0].includes('Extension context invalid'))) {
    return; // Suppress these errors
  }
  originalConsoleError.apply(console, args);
};

// Global variables
window.SESSION = {
  mode: 'admin', // Default mode
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
    
    // Initialize login tabs
    initLoginTabs();
    
    // Initialize mobile menu
    initMobileMenu();
    
    // Initialize resize handler
    initResizeHandler();
    
    // Initialize touch events
    initTouchEvents();
    
    // Check network status
    initNetworkChecker();
    
    hideLoading();
    
    // Show welcome toast
    setTimeout(() => {
      showToast('স্বাগতম', 'TAQWA PROPERTIES BD-তে আপনাকে স্বাগতম', 'success');
    }, 1000);
    
  } catch (error) {
    console.error('Application initialization failed:', error);
    hideLoading();
    showToast('Error', 'অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে', 'error');
  }
});

// Login Tabs Initialization
function initLoginTabs() {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginIdLabel = document.getElementById('loginIdLabel');
  const loginId = document.getElementById('loginId');
  const loginPass = document.getElementById('loginPass');
  const loginBtn = document.getElementById('loginBtn');
  const defaultText = document.querySelector('.loginRight p:last-child');
  
  if (tabAdmin && tabMember) {
    // Admin tab click
    tabAdmin.addEventListener('click', function() {
      // Update active tab
      tabAdmin.classList.add('active');
      tabMember.classList.remove('active');
      
      // Update session mode
      window.SESSION.mode = 'admin';
      
      // Update UI
      if (loginIdLabel) loginIdLabel.innerHTML = '👤 Admin ID';
      if (loginId) {
        loginId.placeholder = 'Enter Admin ID';
        loginId.value = 'ADMIN-001';
      }
      if (loginPass) loginPass.value = '123456';
      if (defaultText) {
        defaultText.innerHTML = 'Default: Admin (ADMIN-001 / 123456)';
      }
      
      console.log('Switched to Admin mode');
    });
    
    // Member tab click
    tabMember.addEventListener('click', function() {
      // Update active tab
      tabMember.classList.add('active');
      tabAdmin.classList.remove('active');
      
      // Update session mode
      window.SESSION.mode = 'member';
      
      // Update UI
      if (loginIdLabel) loginIdLabel.innerHTML = '👥 Member ID';
      if (loginId) {
        loginId.placeholder = 'Enter Member ID';
        loginId.value = 'FM-001';
      }
      if (loginPass) loginPass.value = '123456';
      if (defaultText) {
        defaultText.innerHTML = 'Default: Member (FM-001 / 123456)';
      }
      
      console.log('Switched to Member mode');
    });
  }
  
  // Login form submission
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      handleLogin();
    });
  }
  
  // Login button click
  if (loginBtn) {
    loginBtn.addEventListener('click', function(e) {
      e.preventDefault();
      handleLogin();
    });
  }
}

// Handle Login
async function handleLogin() {
  const loginId = document.getElementById('loginId')?.value;
  const loginPass = document.getElementById('loginPass')?.value;
  const mode = window.SESSION.mode;
  
  if (!loginId || !loginPass) {
    showToast('Error', 'Please enter ID and password', 'error');
    return;
  }
  
  showLoading('Logging in...');
  
  try {
    // Simulate login validation
    // In production, this should validate against database
    const db = getDatabase();
    
    if (mode == 'admin') {
      // Admin login validation
      if (loginId == 'ADMIN-001' && loginPass == '123456') {
        window.SESSION.user = {
          id: loginId,
          name: 'Administrator',
          role: 'Admin',
          mode: 'admin'
        };
        
        // Update UI
        const loginPage = document.getElementById('loginPage');
        const appPage = document.getElementById('appPage');
        if (loginPage) loginPage.style.display = 'none';
        if (appPage) appPage.style.display = 'flex';
        
        // Update user info
        const userNameEl = document.getElementById('currentUserName');
        const userRoleEl = document.getElementById('currentUserRole');
        const chipIdEl = document.getElementById('chipId');
        const systemModeEl = document.getElementById('systemMode');
        
        if (userNameEl) userNameEl.textContent = 'Administrator';
        if (userRoleEl) userRoleEl.textContent = 'Admin';
        if (chipIdEl) chipIdEl.textContent = `ID: ${loginId}`;
        if (systemModeEl) systemModeEl.textContent = 'ADMIN';
        
        showToast('Success', 'Admin login successful!', 'success');
        
        // Navigate to admin dashboard
        setTimeout(() => {
          navigateTo('admin_dashboard');
        }, 500);
      } else {
        showToast('Error', 'Invalid Admin credentials', 'error');
      }
    } else {
      // Member login validation
      // Check if member exists in database
      const member = await db.get('members', loginId);
      
      if (member && member.pass == loginPass) {
        window.SESSION.user = {
          id: loginId,
          name: member.name,
          role: 'Member',
          mode: 'member',
          data: member
        };
        
        // Update UI
        const loginPage = document.getElementById('loginPage');
        const appPage = document.getElementById('appPage');
        if (loginPage) loginPage.style.display = 'none';
        if (appPage) appPage.style.display = 'flex';
        
        // Update user info
        const userNameEl = document.getElementById('currentUserName');
        const userRoleEl = document.getElementById('currentUserRole');
        const chipIdEl = document.getElementById('chipId');
        const systemModeEl = document.getElementById('systemMode');
        
        if (userNameEl) userNameEl.textContent = member.name;
        if (userRoleEl) userRoleEl.textContent = member.memberType || 'Member';
        if (chipIdEl) chipIdEl.textContent = `ID: ${loginId}`;
        if (systemModeEl) systemModeEl.textContent = 'MEMBER';
        
        showToast('Success', `Welcome ${member.name}!`, 'success');
        
        // Navigate to member dashboard
        setTimeout(() => {
          navigateTo('member_dashboard');
        }, 500);
      } else {
        showToast('Error', 'Invalid Member credentials', 'error');
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Error', 'Login failed. Please try again.', 'error');
  } finally {
    hideLoading();
  }
}

// Mobile Menu Initialization
function initMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  
  if (!menuBtn || !sidebar) return;
  
  const overlay = document.createElement('div');
  
  // Create overlay for mobile
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
  
  // Toggle menu
  menuBtn.addEventListener('click', function(e) {
    e.stopPropagation();
    toggleMenu(sidebar, overlay);
  });
  
  // Close menu when clicking overlay
  overlay.addEventListener('click', function() {
    closeMenu(sidebar, overlay);
  });
  
  // Close menu when clicking a nav item (mobile)
  sidebar.querySelectorAll('.nav-item, .nav button').forEach(item => {
    item.addEventListener('click', function() {
      if (window.SESSION.isMobile) {
        closeMenu(sidebar, overlay);
      }
    });
  });
  
  // Handle escape key
  document.addEventListener('keydown', function(e) {
    if (e.key == 'Escape' && sidebar.classList.contains('show')) {
      closeMenu(sidebar, overlay);
    }
  });
  
  // Update menu visibility on resize
  window.addEventListener('resize', function() {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('show');
      if (overlay) {
        overlay.style.display = 'none';
        overlay.style.opacity = '0';
      }
      document.body.style.overflow = '';
    }
  });
}

// Toggle menu function
function toggleMenu(sidebar, overlay) {
  if (sidebar.classList.contains('show')) {
    closeMenu(sidebar, overlay);
  } else {
    openMenu(sidebar, overlay);
  }
}

// Open menu function
function openMenu(sidebar, overlay) {
  sidebar.classList.add('show');
  overlay.style.display = 'block';
  setTimeout(() => {
    overlay.style.opacity = '1';
  }, 10);
  document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

// Close menu function
function closeMenu(sidebar, overlay) {
  sidebar.classList.remove('show');
  overlay.style.opacity = '0';
  setTimeout(() => {
    overlay.style.display = 'none';
  }, 300);
  document.body.style.overflow = '';
}

// Resize Handler
function initResizeHandler() {
  let resizeTimeout;
  
  window.addEventListener('resize', function() {
    // Update device type
    window.SESSION.isMobile = window.innerWidth <= 768;
    window.SESSION.isTablet = window.innerWidth > 768 && window.innerWidth <= 1024;
    window.SESSION.isDesktop = window.innerWidth > 1024;
    
    // Clear previous timeout
    clearTimeout(resizeTimeout);
    
    // Add class to body during resize
    document.body.classList.add('is-resizing');
    
    // Set timeout to remove class after resize
    resizeTimeout = setTimeout(function() {
      document.body.classList.remove('is-resizing');
      
      // Adjust UI based on new size
      adjustUIForScreenSize();
    }, 250);
  });
}

// Adjust UI based on screen size
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

// Touch Events for Mobile
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
      // Swipe right to open menu (from left edge)
      if (touchStartX < 50 && touchEndX - touchStartX > swipeThreshold) {
        openMenu(sidebar, overlay);
      }
      
      // Swipe left to close menu
      if (touchStartX > 200 && touchStartX - touchEndX > swipeThreshold) {
        closeMenu(sidebar, overlay);
      }
    }
  }
}

// Network Status Checker
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
  
  // Check initial status
  if (!navigator.onLine) {
    document.body.classList.add('offline');
  }
}

// Utility functions
function showLoading(message = 'লোড হচ্ছে...') {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    const msgElement = overlay.querySelector('p');
    if (msgElement) msgElement.textContent = message;
    overlay.classList.add('show');
    
    // Prevent background interaction
    document.body.style.overflow = 'hidden';
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
    
    // Restore background interaction
    document.body.style.overflow = '';
  }
}

// Enhanced Toast function
function showToast(title, message, type = 'info', duration = 3500) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  
  // Get icon based on type
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };
  
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
  
  // Auto remove after duration
  const timeout = setTimeout(() => {
    if (toast.parentElement) {
      toast.classList.add('toast-hide');
      setTimeout(() => toast.remove(), 300);
    }
  }, duration);
  
  // Store timeout to clear on manual close
  toast.dataset.timeout = timeout;
  
  // Pause timeout on hover
  toast.addEventListener('mouseenter', () => {
    clearTimeout(toast.dataset.timeout);
  });
  
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

// Page Transition Helper
async function navigateTo(page, params = {}) {
  try {
    showLoading('পৃষ্ঠা লোড হচ্ছে...');
    
    // Close mobile menu if open
    if (window.SESSION.isMobile) {
      const sidebar = document.getElementById('sidebar');
      const overlay = document.querySelector('.sidebar-overlay');
      if (sidebar && overlay) {
        closeMenu(sidebar, overlay);
      }
    }
    
    // Import page module dynamically
    const module = await import(`./modules/pages/${page}.js`);
    
    if (module[`render${page.charAt(0).toUpperCase() + page.slice(1)}`]) {
      await module[`render${page.charAt(0).toUpperCase() + page.slice(1)}`](params);
    } else {
      console.error(`Page ${page} has no render function`);
      showToast('Error', 'পৃষ্ঠা লোড করতে সমস্যা হয়েছে', 'error');
    }
    
    // Update session
    window.SESSION.page = page;
    
    // Scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
    
    hideLoading();
  } catch (error) {
    console.error('Navigation error:', error);
    hideLoading();
    showToast('Error', 'পৃষ্ঠা লোড করতে সমস্যা হয়েছে', 'error');
  }
}

// Logout function
window.logout = function() {
  if (confirm('Are you sure you want to logout?')) {
    window.SESSION.user = null;
    window.SESSION.mode = 'admin';
    window.SESSION.page = null;
    
    const appPage = document.getElementById('appPage');
    const loginPage = document.getElementById('loginPage');
    
    if (appPage) appPage.style.display = 'none';
    if (loginPage) loginPage.style.display = 'flex';
    
    // Reset login form
    const loginId = document.getElementById('loginId');
    const loginPass = document.getElementById('loginPass');
    if (loginId) loginId.value = 'ADMIN-001';
    if (loginPass) loginPass.value = '123456';
    
    showToast('Info', 'Logged out successfully', 'info');
  }
};

// Global error handler
window.addEventListener('error', function(event) {
  // Filter out extension errors
  if (event.error?.message?.includes('runtime.lastError') ||
      event.error?.message?.includes('message port closed') ||
      event.error?.message?.includes('Extension context')) {
    return; // Suppress extension errors
  }
  
  console.error('Global Error:', event.error);
  
  // Don't show error for cancelled requests
  if (event.error?.message?.includes('Request was cancelled')) {
    return;
  }
  
  showToast('Error', 'একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।', 'error');
  hideLoading();
});

// Handle unhandled promise rejections
window.addEventListener('unhandledrejection', function(event) {
  // Filter out extension errors
  if (event.reason?.message?.includes('runtime.lastError') ||
      event.reason?.message?.includes('message port closed') ||
      event.reason?.message?.includes('Extension context')) {
    return; // Suppress extension errors
  }
  
  console.error('Unhandled Rejection:', event.reason);
  
  // Don't show error for cancelled requests
  if (event.reason?.message?.includes('Request was cancelled')) {
    return;
  }
  
  showToast('Error', 'একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।', 'error');
  hideLoading();
});

// Export global functions
window.navigateTo = navigateTo;
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.getDatabase = getDatabase;
window.handleLogin = handleLogin;

// Add CSS for toast types and mobile features
const style = document.createElement('style');
style.textContent = `
  /* Toast Types */
  .toast.success { border-left-color: #27ae60; }
  .toast.error { border-left-color: #dc3545; }
  .toast.warning { border-left-color: #f39c12; }
  .toast.info { border-left-color: #667eea; }
  
  .toast {
    background: white;
    border-radius: 16px;
    padding: 16px 20px;
    margin-bottom: 10px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    display: flex;
    align-items: center;
    gap: 15px;
    animation: toastSlideIn 0.3s ease;
    border-left: 5px solid;
    position: relative;
    transition: all 0.3s ease;
  }
  
  .toast.toast-hide {
    transform: translateX(100%);
    opacity: 0;
  }
  
  .toast-icon {
    font-size: 24px;
    min-width: 40px;
    text-align: center;
  }
  
  .toast-content {
    flex: 1;
  }
  
  .toast-title {
    font-weight: 700;
    font-size: 16px;
    color: #1e3c72;
    margin-bottom: 4px;
  }
  
  .toast-message {
    font-size: 14px;
    color: #666;
    margin-bottom: 4px;
  }
  
  .toast-time {
    font-size: 11px;
    color: #999;
  }
  
  .toast-close {
    background: none;
    border: none;
    font-size: 18px;
    color: #999;
    cursor: pointer;
    padding: 5px;
    transition: color 0.3s;
  }
  
  .toast-close:hover {
    color: #333;
  }
  
  @keyframes toastSlideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
  
  /* Mobile Features */
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
  
  /* Offline Mode */
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
  
  /* Resizing Indicator */
  body.is-resizing {
    cursor: col-resize;
  }
  
  body.is-resizing * {
    pointer-events: none;
    transition: none !important;
  }
  
  /* Mobile Optimizations */
  @media (max-width: 768px) {
    .toastWrap {
      width: calc(100% - 30px);
      left: 15px;
      right: 15px;
    }
    
    .toast {
      padding: 14px 16px;
    }
    
    .toast-icon {
      font-size: 22px;
      min-width: 35px;
    }
    
    .toast-title {
      font-size: 15px;
    }
    
    .toast-message {
      font-size: 13px;
    }
  }

  /* Login Tabs Enhancement */
  .tabs button {
    transition: all 0.3s ease;
  }
  
  .tabs button.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    transform: scale(1.02);
  }
  
  /* Navigation Enhancement */
  .nav button {
    cursor: pointer;
    transition: all 0.3s ease;
  }
  
  .nav button:hover {
    background: rgba(102,126,234,0.1);
  }
  
  .nav button.active {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
`;

document.head.appendChild(style);
