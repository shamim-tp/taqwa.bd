// ========== গ্লোবাল কনফিগারেশন ও ইম্পোর্ট ==========
import { initializeDatabase, getDatabase } from './modules/database/db.js';
import { loadLoginModule } from './modules/auth/login.js';
import { loadModalModules } from './modules/modals/modals.js';

window.SESSION = {
  mode: 'member',          // ডিফল্ট মোড 'member' রাখা হলো (Admin নয়)
  user: null,
  page: null
};

// ========== অ্যাপ্লিকেশন আরম্ভ ==========
document.addEventListener('DOMContentLoaded', async function() {
  try {
    showLoading('অ্যাপ্লিকেশন লোড হচ্ছে...');
    
    // ডাটাবেজ আরম্ভ (সর্বদা Firebase)
    const dbMode = 'firebase';
    await initializeDatabase(dbMode);
    
    const dbTypeElement = document.getElementById('databaseType');
    if (dbTypeElement) {
      const modeNames = { 'firebase': 'Firebase' };
      dbTypeElement.textContent = modeNames[dbMode] || dbMode;
    }
    
    // লোকাল স্টোরেজ থেকে সেশন চেক করুন (পেজ রিফ্রেশের জন্য)
    checkAndRestoreSession();
    
    // লগইন ও মডাল মডিউল লোড
    loadLoginModule();
    loadModalModules();
    
    // ========== নতুন এনহ্যান্সমেন্টসমূহ ==========
    setupMobileMenu();            // মোবাইল মেনু টগল ও ওভারলে
    setupLoginTabs();             // লগইন ট্যাব (ডিফল্ট মেম্বার) ও মোড আপডেট
    setupRippleEffect();          // বাটনে রিপল ইফেক্ট
    setupClickOutsideSidebar();   // সাইডবারের বাইরে ক্লিলে বন্ধ
    setupHashScroll();            // পৃষ্ঠা লোডে হ্যাশ স্ক্রল
    setupLogoutHandler();         // লগআউট হ্যান্ডলার
    
    // UI আপডেট করুন সেশন অনুযায়ী
    updateUIForSession();
    
    hideLoading();
  } catch (error) {
    console.error('Application initialization failed:', error);
    showToast('Error', 'অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
  }
});

// ========== সেশন রিস্টোর ফাংশন ==========
function checkAndRestoreSession() {
  try {
    const savedSession = localStorage.getItem('taqwa_session');
    
    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      
      // সেশন ভ্যালিডিটি চেক (২৪ ঘন্টা)
      const sessionTime = sessionData.timestamp || 0;
      const currentTime = new Date().getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;
      
      if (currentTime - sessionTime < twentyFourHours) {
        // সেশন রিস্টোর করুন
        window.SESSION.user = sessionData.user;
        window.SESSION.mode = sessionData.mode || 'member';
        window.SESSION.page = sessionData.page || null;
        
        // লগইন পেজ লুকিয়ে অ্যাপ পেজ দেখান
        showAppPage();
        
        // ইউজার ইনফো আপডেট করুন
        updateUserInfo(sessionData.user, sessionData.mode);
        
        console.log('Session restored successfully');
      } else {
        // এক্সপায়ার্ড সেশন ক্লিয়ার করুন
        clearSession();
        showLoginPage();
      }
    } else {
      // কোন সেশন নেই, লগইন পেজ দেখান
      showLoginPage();
    }
  } catch (error) {
    console.error('Session restore failed:', error);
    clearSession();
    showLoginPage();
  }
}

// ========== পেজ কন্ট্রোল ফাংশন ==========
function showLoginPage() {
  const loginPage = document.getElementById('loginPage');
  const appPage = document.getElementById('appPage');
  
  if (loginPage) {
    loginPage.style.display = 'flex';
  }
  
  if (appPage) {
    appPage.style.display = 'none';
  }
  
  // মোবাইল মেনু বন্ধ করুন
  document.body.classList.remove('sidebar-open');
}

function showAppPage() {
  const loginPage = document.getElementById('loginPage');
  const appPage = document.getElementById('appPage');
  
  if (loginPage) {
    loginPage.style.display = 'none';
  }
  
  if (appPage) {
    appPage.style.display = 'grid';
  }
}

// ========== সেশন সেভ ফাংশন ==========
function saveSession(userData, mode, page = null) {
  try {
    const sessionData = {
      user: {
        id: userData.id || 'N/A',
        name: userData.name || 'Unknown User',
        email: userData.email || '',
        role: userData.role || mode
      },
      mode: mode || 'member',
      page: page || window.SESSION.page,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem('taqwa_session', JSON.stringify(sessionData));
    
    // গ্লোবাল সেশন আপডেট
    window.SESSION.user = sessionData.user;
    window.SESSION.mode = mode;
    window.SESSION.page = sessionData.page;
    
    console.log('Session saved successfully');
  } catch (error) {
    console.error('Session save failed:', error);
  }
}

// ========== সেশন ক্লিয়ার ফাংশন ==========
function clearSession() {
  localStorage.removeItem('taqwa_session');
  window.SESSION.user = null;
  window.SESSION.mode = 'member';
  window.SESSION.page = null;
}

// ========== লগইন ফাংশন ==========
window.performLogin = function(userData, mode) {
  try {
    // সেশন সেভ করুন
    saveSession(userData, mode);
    
    // অ্যাপ পেজ দেখান
    showAppPage();
    
    // ইউজার ইনফো আপডেট
    updateUserInfo(userData, mode);
    
    // সাকসেস মেসেজ
    showToast('Success', 'লগইন সফল হয়েছে');
    
  } catch (error) {
    console.error('Login failed:', error);
    showToast('Error', 'লগইন করতে সমস্যা হয়েছে');
  }
};

// ========== ইউজার ইনফো আপডেট ==========
function updateUserInfo(userData, mode) {
  const userNameEl = document.getElementById('currentUserName');
  const userRoleEl = document.getElementById('currentUserRole');
  const chipIdEl = document.getElementById('chipId');
  const chipStatusEl = document.getElementById('chipStatus');
  const systemModeEl = document.getElementById('systemMode');
  
  if (userNameEl) {
    userNameEl.textContent = userData?.name || 'Unknown User';
  }
  
  if (userRoleEl) {
    userRoleEl.textContent = mode === 'admin' ? 'Administrator' : 'Member';
  }
  
  if (chipIdEl) {
    chipIdEl.textContent = `ID: ${userData?.id || 'N/A'}`;
  }
  
  if (chipStatusEl) {
    chipStatusEl.textContent = 'Active';
  }
  
  if (systemModeEl) {
    systemModeEl.textContent = mode?.toUpperCase() || 'MEMBER';
  }
}

// ========== UI আপডেট ==========
function updateUIForSession() {
  if (window.SESSION.user) {
    updateUserInfo(window.SESSION.user, window.SESSION.mode);
  }
}

// ========== লগআউট ফাংশন ==========
window.logout = function() {
  try {
    // সেশন ক্লিয়ার
    clearSession();
    
    // লগইন পেজ দেখান
    showLoginPage();
    
    // ফর্ম রিসেট
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.reset();
    }
    
    // মোবাইল মেনু বন্ধ
    const sidebar = document.getElementById('sidebar');
    const overlay = document.querySelector('.sidebar-overlay');
    if (sidebar) sidebar.classList.remove('active');
    if (overlay) overlay.classList.remove('active');
    document.body.classList.remove('sidebar-open');
    
    // সাকসেস মেসেজ
    showToast('Success', 'লগআউট সফল হয়েছে');
    
    console.log('Logout successful');
    
  } catch (error) {
    console.error('Logout failed:', error);
    showToast('Error', 'লগআউট করতে সমস্যা হয়েছে');
  }
};

// ========== লগআউট হ্যান্ডলার সেটআপ ==========
function setupLogoutHandler() {
  // লগআউট বাটন খুঁজে ইভেন্ট লিসেনার যোগ
  const setupButtons = () => {
    const logoutButtons = document.querySelectorAll('.logoutBtn, #logoutBtn');
    logoutButtons.forEach(button => {
      // পুরনো লিসেনার রিমুভ
      button.removeEventListener('click', window.logout);
      button.addEventListener('click', window.logout);
    });
  };
  
  // প্রথমবার সেটআপ
  setupButtons();
  
  // ডায়নামিক কন্টেন্টের জন্য পর্যবেক্ষণ
  const observer = new MutationObserver(setupButtons);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ========== ইউটিলিটি ফাংশন ==========
function showLoading(message) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.querySelector('p').textContent = message;
    overlay.classList.add('show');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}

function showToast(title, message) {
  const wrap = document.getElementById('toastWrap');
  const div = document.createElement('div');
  div.className = 'toast';
  div.innerHTML = `
    <div class="t1">${title}</div>
    <div class="t2">${message}</div>
    <div class="t3">${new Date().toLocaleString()}</div>
  `;
  wrap.appendChild(div);
  setTimeout(() => div.remove(), 3500);
}

// ========== নতুন ফিচারসমূহ ==========

/** ১. মোবাইল মেনু টগল ও ওভারলে তৈরি */
function setupMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!menuBtn || !sidebar) return;

  // ওভারলে তৈরি (যদি না থাকে)
  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  function toggleMenu() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    if (sidebar.classList.contains('active')) {
      document.body.classList.add('sidebar-open');   // পৃষ্ঠা স্ক্রল বন্ধ
    } else {
      document.body.classList.remove('sidebar-open');
    }
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  overlay.addEventListener('click', toggleMenu);

  // সাইডবারের ভেতরের আইটেম ক্লিক করলে মেনু বন্ধ (লগআউট ছাড়া)
  sidebar.querySelectorAll('button, .nav-item').forEach(item => {
    if (!item.classList.contains('logoutBtn')) {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          sidebar.classList.remove('active');
          overlay.classList.remove('active');
          document.body.classList.remove('sidebar-open');
        }
      });
    }
  });

  // রিসাইজে মেনু বন্ধ
  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }
  });

  // Escape কী চাপলে মেনু বন্ধ
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      toggleMenu();
    }
  });
}

/** ২. লগইন ট্যাব স্যুইচ ও মোড সেট করা */
function setupLoginTabs() {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginIdLabel = document.getElementById('loginIdLabel');
  const loginId = document.getElementById('loginId');
  const loginBtn = document.getElementById('loginBtn');

  if (!tabAdmin || !tabMember || !loginIdLabel || !loginId || !loginBtn) return;

  function setActiveTab(tab) {
    tabAdmin.classList.remove('active');
    tabMember.classList.remove('active');
    tab.classList.add('active');
    if (tab === tabAdmin) {
      loginIdLabel.textContent = 'Admin ID';
      loginId.placeholder = 'Enter Admin ID';
      window.SESSION.mode = 'admin';     // সেশন মোড আপডেট
    } else {
      loginIdLabel.textContent = 'Member ID';
      loginId.placeholder = 'Enter Member ID';
      window.SESSION.mode = 'member';    // সেশন মোড আপডেট
    }
  }

  tabAdmin.addEventListener('click', () => setActiveTab(tabAdmin));
  tabMember.addEventListener('click', () => setActiveTab(tabMember));

  // ডিফল্ট মেম্বার সক্রিয়
  setActiveTab(tabMember);

  // লগইন বাটন ক্লিক হ্যান্ডলার
  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const loginIdValue = document.getElementById('loginId')?.value;
    const loginPassValue = document.getElementById('loginPass')?.value;
    
    if (!loginIdValue || !loginPassValue) {
      showToast('Warning', 'আইডি এবং পাসওয়ার্ড দিন');
      return;
    }
    
    // এখানে আপনার অ্যাকচুয়াল লগইন লজিক কল হবে
    // login.js মডিউল ইতিমধ্যে লোড হয়েছে এবং SESSION.mode ব্যবহার করবে
    
    // ডেমো লগইন - সব কিছু দিলেই ঢুকবে
    const userData = {
      id: loginIdValue,
      name: loginIdValue.includes('@') ? loginIdValue.split('@')[0] : loginIdValue,
      email: loginIdValue.includes('@') ? loginIdValue : `${loginIdValue}@demo.com`
    };
    
    window.performLogin(userData, window.SESSION.mode);
  });
}

/** ৩. বাটন ও নেভ আইটেমে রিপল ইফেক্ট */
function setupRippleEffect() {
  const rippleStyle = document.createElement('style');
  rippleStyle.textContent = `
    .ripple {
      position: absolute;
      border-radius: 50%;
      background: rgba(255,255,255,0.6);
      transform: scale(0);
      animation: ripple-animation 0.6s ease-out;
      pointer-events: none;
      width: 100px;
      height: 100px;
      margin-left: -50px;
      margin-top: -50px;
    }
    @keyframes ripple-animation {
      to { transform: scale(4); opacity: 0; }
    }
  `;
  document.head.appendChild(rippleStyle);

  document.querySelectorAll('.btn, .nav-item').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (e.clientX === 0 && e.clientY === 0) return; // কিবোর্ড ক্লিক ইগনোর
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      this.appendChild(ripple);
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      setTimeout(() => ripple.remove(), 600);
    });
  });
}

/** ৪. সাইডবারের বাইরে ক্লিক করলে মোবাইলে বন্ধ */
function setupClickOutsideSidebar() {
  document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('mobileMenuBtn');
    if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
      sidebar.classList.remove('active');
      document.querySelector('.sidebar-overlay')?.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }
  });
}

/** ৫. পৃষ্ঠা লোডে হ্যাশ থাকলে স্মুথ স্ক্রল */
function setupHashScroll() {
  window.addEventListener('load', function() {
    if (window.location.hash) {
      setTimeout(() => {
        document.getElementById(window.location.hash.substring(1))?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    }
  });
}

// ========== গ্লোবাল এরর হ্যান্ডলার ==========
window.addEventListener('error', function(event) {
  console.error('Global Error:', event.error);
  showToast('Error', 'একটি ত্রুটি ঘটেছে। দয়া আবার চেষ্টা করুন।');
});

// গ্লোবাল এক্সপোর্ট
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.getDatabase = getDatabase;
