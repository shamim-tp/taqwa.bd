// ========== গ্লোবাল কনফিগারেশন ও ইম্পোর্ট ==========
import { initializeDatabase, getDatabase } from './modules/database/db.js';
import { loadLoginModule } from './modules/auth/login.js';
import { loadModalModules } from './modules/modals/modals.js';

window.SESSION = {
  mode: 'member',          // ডিফল্ট মোড 'member' রাখা হলো (Admin নয়)
  user: null,
  page: 'dashboard',       // ডিফল্ট পেজ
  isAuthenticated: false   // অথেনটিকেশন স্ট্যাটাস ট্র্যাক করার জন্য
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
    await checkAndRestoreSession();
    
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
    setupNavigationHandlers();    // নেভিগেশন হ্যান্ডলার
    
    // UI আপডেট করুন সেশন অনুযায়ী
    updateUIForSession();
    
    hideLoading();
  } catch (error) {
    console.error('Application initialization failed:', error);
    showToast('Error', 'অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
    hideLoading();
  }
});

// ========== সেশন রিস্টোর ফাংশন ==========
async function checkAndRestoreSession() {
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
        window.SESSION.isAuthenticated = true;
        window.SESSION.page = sessionData.page || 'dashboard';
        
        // লগইন পেজ লুকিয়ে অ্যাপ পেজ দেখান
        showAppPage();
        
        // ইউজার ইনফো আপডেট করুন
        updateUserInfo(sessionData.user, sessionData.mode);
        
        // আগের পেজ লোড করুন
        await loadPage(window.SESSION.page);
        
        console.log('Session restored successfully. Current page:', window.SESSION.page);
      } else {
        // এক্সপায়ার্ড সেশন ক্লিয়ার করুন
        clearSession();
        showLoginPage();
        await loadPage('login'); // লগইন পেজ লোড
      }
    } else {
      // কোন সেশন নেই, লগইন পেজ দেখান
      showLoginPage();
      await loadPage('login'); // লগইন পেজ লোড
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

// ========== পেজ লোড ফাংশন ==========
async function loadPage(pageName) {
  try {
    showLoading(`${pageName} পেজ লোড হচ্ছে...`);
    
    // পেজ টাইটেল আপডেট
    updatePageTitle(pageName);
    
    // সক্রিয় নেভ আইটেম আপডেট
    updateActiveNavItem(pageName);
    
    // এখানে আপনার পেজ কন্টেন্ট লোড করার লজিক যোগ করুন
    // যেমন: dynamic import, AJAX call, ইত্যাদি
    
    // উদাহরণ: পেজ অনুযায়ী কন্টেন্ট লোড
    const pageContent = document.getElementById('pageContent');
    if (pageContent) {
      switch(pageName) {
        case 'dashboard':
          pageContent.innerHTML = await loadDashboardContent();
          break;
        case 'members':
          pageContent.innerHTML = await loadMembersContent();
          break;
        case 'projects':
          pageContent.innerHTML = await loadProjectsContent();
          break;
        case 'reports':
          pageContent.innerHTML = await loadReportsContent();
          break;
        case 'settings':
          pageContent.innerHTML = await loadSettingsContent();
          break;
        default:
          pageContent.innerHTML = await loadDashboardContent();
      }
    }
    
    // সেশন আপডেট করুন
    if (window.SESSION.isAuthenticated) {
      window.SESSION.page = pageName;
      updateSessionPage(pageName);
    }
    
    hideLoading();
    console.log(`Page '${pageName}' loaded successfully`);
    
  } catch (error) {
    console.error(`Failed to load page '${pageName}':`, error);
    showToast('Error', `পেজ লোড করতে সমস্যা হয়েছে: ${pageName}`);
    hideLoading();
  }
}

// ========== পেজ কন্টেন্ট লোডার ফাংশন (ডেমো) ==========
async function loadDashboardContent() {
  // এখানে আপনার অ্যাকচুয়াল ড্যাশবোর্ড কন্টেন্ট লোড করুন
  return `
    <div class="gridCards">
      <div class="card">
        <div class="title">মোট সদস্য</div>
        <div class="value">১৫০</div>
        <div class="sub">গত মাসে +১২% বৃদ্ধি</div>
      </div>
      <div class="card">
        <div class="title">সক্রিয় প্রকল্প</div>
        <div class="value">৮</div>
        <div class="sub">চলমান ৫, সম্পন্ন ৩</div>
      </div>
      <div class="card">
        <div class="title">মোট বিনিয়োগ</div>
        <div class="value">৳ ২.৫কোটি</div>
        <div class="sub">এই মাসে ৳ ২৫লাখ</div>
      </div>
      <div class="card">
        <div class="title">রিটার্ন</div>
        <div class="value">১৫%</div>
        <div class="sub">গড় বার্ষিক রিটার্ন</div>
      </div>
    </div>
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>সাম্প্রতিক কার্যক্রম</h3>
          <p>গত ৭ দিনের লেনদেন</p>
        </div>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>তারিখ</th>
              <th>বিবরণ</th>
              <th>পরিমাণ</th>
              <th>স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>০৪ মার্চ</td><td>মাসিক রিটার্ন</td><td>৳ ৫,০০০</td><td><span class="status approved">পরিশোধিত</span></td></tr>
            <tr><td>০৩ মার্চ</td><td>নতুন বিনিয়োগ</td><td>৳ ৫০,০০০</td><td><span class="status pending">বিচারাধীন</span></td></tr>
            <tr><td>০২ মার্চ</td><td>প্রজেক্ট ফান্ড</td><td>৳ ২৫,০০০</td><td><span class="status approved">পরিশোধিত</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadMembersContent() {
  return `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>সদস্য তালিকা</h3>
          <p>সমস্ত সদস্যের তথ্য</p>
        </div>
        <div class="panelTools">
          <button class="btn primary" onclick="window.addNewMember()">+ নতুন সদস্য</button>
        </div>
      </div>
      <div class="table-responsive">
        <table>
          <thead>
            <tr>
              <th>আইডি</th>
              <th>নাম</th>
              <th>ইমেইল</th>
              <th>মোবাইল</th>
              <th>জয়েন তারিখ</th>
              <th>স্ট্যাটাস</th>
            </tr>
          </thead>
          <tbody>
            <tr><td>M001</td><td>রহিম মিয়া</td><td>rahim@email.com</td><td>০১৭১২৩৪৫৬৭৮</td><td>০১-০১-২০২৪</td><td><span class="status approved">সক্রিয়</span></td></tr>
            <tr><td>M002</td><td>করিম হাসান</td><td>karim@email.com</td><td>০১৮১২৩৪৫৬৭৮</td><td>১৫-০১-২০২৪</td><td><span class="status approved">সক্রিয়</span></td></tr>
          </tbody>
        </table>
      </div>
    </div>
  `;
}

async function loadProjectsContent() {
  return `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>প্রকল্প তালিকা</h3>
          <p>চলমান ও সম্পন্ন প্রকল্প</p>
        </div>
        <div class="panelTools">
          <button class="btn primary" onclick="window.addNewProject()">+ নতুন প্রকল্প</button>
        </div>
      </div>
      <div class="grid grid-cols-2">
        <div class="card">
          <div class="title">আবাসিক প্রকল্প</div>
          <div class="value">মিরপুর</div>
          <div class="sub">অগ্রগতি: ৭৫% • বিনিয়োগ: ৳ ১.২কোটি</div>
        </div>
        <div class="card">
          <div class="title">বাণিজ্যিক প্রকল্প</div>
          <div class="value">গুলশান</div>
          <div class="sub">অগ্রগতি: ৪০% • বিনিয়োগ: ৳ ৮০লাখ</div>
        </div>
      </div>
    </div>
  `;
}

async function loadReportsContent() {
  return `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>রিপোর্ট</h3>
          <p>বিভিন্ন রিপোর্ট দেখুন</p>
        </div>
      </div>
      <div class="grid grid-cols-3">
        <div class="card">
          <div class="title">মাসিক রিপোর্ট</div>
          <div class="value">মার্চ ২০২৪</div>
          <button class="btn success w-full mt-4">ডাউনলোড</button>
        </div>
        <div class="card">
          <div class="title">বার্ষিক রিপোর্ট</div>
          <div class="value">২০২৩-২০২৪</div>
          <button class="btn success w-full mt-4">ডাউনলোড</button>
        </div>
        <div class="card">
          <div class="title">বিনিয়োগ রিপোর্ট</div>
          <div class="value">সকল বিনিয়োগ</div>
          <button class="btn success w-full mt-4">ডাউনলোড</button>
        </div>
      </div>
    </div>
  `;
}

async function loadSettingsContent() {
  return `
    <div class="panel">
      <div class="panelHeader">
        <div>
          <h3>সেটিংস</h3>
          <p>আপনার অ্যাকাউন্ট সেটিংস</p>
        </div>
      </div>
      <div class="grid grid-cols-2">
        <div class="card">
          <div class="title">প্রোফাইল সেটিংস</div>
          <div class="value">${window.SESSION.user?.name || 'ইউজার'}</div>
          <button class="btn primary w-full mt-4">এডিট প্রোফাইল</button>
        </div>
        <div class="card">
          <div class="title">পাসওয়ার্ড পরিবর্তন</div>
          <div class="value">নিরাপত্তা</div>
          <button class="btn warning w-full mt-4">পাসওয়ার্ড পরিবর্তন</button>
        </div>
      </div>
    </div>
  `;
}

// ========== পেজ টাইটেল আপডেট ==========
function updatePageTitle(pageName) {
  const titleElement = document.getElementById('pageTitle');
  const subtitleElement = document.getElementById('pageSubtitle');
  
  if (titleElement) {
    const titles = {
      'dashboard': 'ড্যাশবোর্ড',
      'members': 'সদস্য তালিকা',
      'projects': 'প্রকল্প সমূহ',
      'reports': 'রিপোর্ট',
      'settings': 'সেটিংস',
      'login': 'লগইন'
    };
    titleElement.textContent = titles[pageName] || 'ড্যাশবোর্ড';
  }
  
  if (subtitleElement && pageName !== 'login') {
    const currentDate = new Date().toLocaleDateString('bn-BD', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
    subtitleElement.textContent = `${currentDate} - স্বাগতম ${window.SESSION.user?.name || ''}`;
  }
}

// ========== অ্যাক্টিভ নেভ আইটেম আপডেট ==========
function updateActiveNavItem(pageName) {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.classList.remove('active');
    if (item.dataset.page === pageName) {
      item.classList.add('active');
    }
  });
}

// ========== সেশন পেজ আপডেট ==========
function updateSessionPage(pageName) {
  try {
    const savedSession = localStorage.getItem('taqwa_session');
    if (savedSession) {
      const sessionData = JSON.parse(savedSession);
      sessionData.page = pageName;
      localStorage.setItem('taqwa_session', JSON.stringify(sessionData));
    }
  } catch (error) {
    console.error('Failed to update session page:', error);
  }
}

// ========== সেশন সেভ ফাংশন ==========
function saveSession(userData, mode, page = 'dashboard') {
  try {
    const sessionData = {
      user: {
        id: userData.id || 'N/A',
        name: userData.name || 'Unknown User',
        email: userData.email || '',
        role: userData.role || mode
      },
      mode: mode || 'member',
      page: page,
      timestamp: new Date().getTime()
    };
    
    localStorage.setItem('taqwa_session', JSON.stringify(sessionData));
    
    // গ্লোবাল সেশন আপডেট
    window.SESSION.user = sessionData.user;
    window.SESSION.mode = mode;
    window.SESSION.isAuthenticated = true;
    window.SESSION.page = page;
    
    console.log('Session saved successfully. Current page:', page);
  } catch (error) {
    console.error('Session save failed:', error);
  }
}

// ========== সেশন ক্লিয়ার ফাংশন ==========
function clearSession() {
  localStorage.removeItem('taqwa_session');
  window.SESSION.user = null;
  window.SESSION.mode = 'member';
  window.SESSION.isAuthenticated = false;
  window.SESSION.page = 'dashboard';
}

// ========== লগইন ফাংশন ==========
window.performLogin = async function(userData, mode) {
  try {
    // সেশন সেভ করুন
    saveSession(userData, mode, 'dashboard');
    
    // অ্যাপ পেজ দেখান
    showAppPage();
    
    // ইউজার ইনফো আপডেট
    updateUserInfo(userData, mode);
    
    // ড্যাশবোর্ড পেজ লোড করুন
    await loadPage('dashboard');
    
    // সাকসেস মেসেজ
    showToast('সফল', 'লগইন সফল হয়েছে', 'success');
    
  } catch (error) {
    console.error('Login failed:', error);
    showToast('Error', 'লগইন করতে সমস্যা হয়েছে', 'error');
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
  if (window.SESSION.isAuthenticated && window.SESSION.user) {
    updateUserInfo(window.SESSION.user, window.SESSION.mode);
  }
}

// ========== নেভিগেশন হ্যান্ডলার সেটআপ ==========
function setupNavigationHandlers() {
  // নেভ আইটেমগুলোতে ক্লিক হ্যান্ডলার যোগ করুন
  const navItems = document.querySelectorAll('.nav-item');
  
  navItems.forEach(item => {
    item.addEventListener('click', async (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) {
        await loadPage(page);
      }
    });
  });
  
  // ডায়নামিকভাবে যোগ হওয়া নেভ আইটেমের জন্য
  const observer = new MutationObserver(() => {
    document.querySelectorAll('.nav-item:not([data-handler])').forEach(item => {
      item.setAttribute('data-handler', 'true');
      item.addEventListener('click', async (e) => {
        e.preventDefault();
        const page = item.dataset.page;
        if (page) {
          await loadPage(page);
        }
      });
    });
  });
  
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ========== লগআউট ফাংশন ==========
window.logout = async function() {
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
    showToast('সফল', 'লগআউট সফল হয়েছে', 'success');
    
    console.log('Logout successful');
    
  } catch (error) {
    console.error('Logout failed:', error);
    showToast('Error', 'লগআউট করতে সমস্যা হয়েছে', 'error');
  }
};

// ========== লগআউট হ্যান্ডলার সেটআপ ==========
function setupLogoutHandler() {
  const setupButtons = () => {
    const logoutButtons = document.querySelectorAll('.logoutBtn, #logoutBtn');
    logoutButtons.forEach(button => {
      button.removeEventListener('click', window.logout);
      button.addEventListener('click', window.logout);
    });
  };
  
  setupButtons();
  
  const observer = new MutationObserver(setupButtons);
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// ========== লগইন ট্যাব সেটআপ ==========
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
      window.SESSION.mode = 'admin';
    } else {
      loginIdLabel.textContent = 'Member ID';
      loginId.placeholder = 'Enter Member ID';
      window.SESSION.mode = 'member';
    }
  }

  tabAdmin.addEventListener('click', () => setActiveTab(tabAdmin));
  tabMember.addEventListener('click', () => setActiveTab(tabMember));
  setActiveTab(tabMember);

  loginBtn.addEventListener('click', function(e) {
    e.preventDefault();
    
    const loginIdValue = document.getElementById('loginId')?.value;
    const loginPassValue = document.getElementById('loginPass')?.value;
    
    if (!loginIdValue || !loginPassValue) {
      showToast('Warning', 'আইডি এবং পাসওয়ার্ড দিন', 'warning');
      return;
    }
    
    const userData = {
      id: loginIdValue,
      name: loginIdValue.includes('@') ? loginIdValue.split('@')[0] : loginIdValue,
      email: loginIdValue.includes('@') ? loginIdValue : `${loginIdValue}@demo.com`,
      role: window.SESSION.mode
    };
    
    window.performLogin(userData, window.SESSION.mode);
  });
}

// ========== ইউটিলিটি ফাংশন ==========
function showLoading(message) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    const msgEl = overlay.querySelector('p');
    if (msgEl) msgEl.textContent = message;
    overlay.classList.add('show');
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.classList.remove('show');
  }
}

function showToast(title, message, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;
  
  const div = document.createElement('div');
  div.className = `toast ${type}`;
  div.innerHTML = `
    <div class="t1">${title}</div>
    <div class="t2">${message}</div>
    <div class="t3">${new Date().toLocaleString('bn-BD')}</div>
  `;
  
  wrap.appendChild(div);
  
  setTimeout(() => {
    if (div.parentNode) {
      div.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => {
        if (div.parentNode) div.remove();
      }, 300);
    }
  }, 3500);
}

// ========== মোবাইল মেনু সেটআপ ==========
function setupMobileMenu() {
  const menuBtn = document.getElementById('mobileMenuBtn');
  const sidebar = document.getElementById('sidebar');
  if (!menuBtn || !sidebar) return;

  let overlay = document.querySelector('.sidebar-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.className = 'sidebar-overlay';
    document.body.appendChild(overlay);
  }

  function toggleMenu() {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    document.body.classList.toggle('sidebar-open');
  }

  menuBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  overlay.addEventListener('click', toggleMenu);

  sidebar.querySelectorAll('button, .nav-item').forEach(item => {
    if (!item.classList.contains('logoutBtn')) {
      item.addEventListener('click', () => {
        if (window.innerWidth <= 768) {
          toggleMenu();
        }
      });
    }
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) {
      sidebar.classList.remove('active');
      overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && sidebar.classList.contains('active')) {
      toggleMenu();
    }
  });
}

// ========== রিপল ইফেক্ট ==========
function setupRippleEffect() {
  document.querySelectorAll('.btn, .nav-item').forEach(btn => {
    btn.addEventListener('click', function(e) {
      if (e.clientX === 0 && e.clientY === 0) return;
      
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('span');
      ripple.className = 'ripple';
      
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      ripple.style.left = `${x}px`;
      ripple.style.top = `${y}px`;
      
      this.appendChild(ripple);
      
      setTimeout(() => {
        if (ripple.parentNode) ripple.remove();
      }, 600);
    });
  });
}

// ========== ক্লিক আউটসাইড সাইডবার ==========
function setupClickOutsideSidebar() {
  document.addEventListener('click', function(e) {
    const sidebar = document.getElementById('sidebar');
    const menuBtn = document.getElementById('mobileMenuBtn');
    const overlay = document.querySelector('.sidebar-overlay');
    
    if (window.innerWidth <= 768 && 
        sidebar && 
        sidebar.classList.contains('active') && 
        !sidebar.contains(e.target) && 
        !menuBtn?.contains(e.target)) {
      
      sidebar.classList.remove('active');
      if (overlay) overlay.classList.remove('active');
      document.body.classList.remove('sidebar-open');
    }
  });
}

// ========== হ্যাশ স্ক্রল ==========
function setupHashScroll() {
  window.addEventListener('load', function() {
    if (window.location.hash && window.location.hash !== '#login' && window.location.hash !== '#dashboard') {
      setTimeout(() => {
        const element = document.getElementById(window.location.hash.substring(1));
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
        }
      }, 100);
    }
  });
}

// ========== গ্লোবাল এরর হ্যান্ডলার ==========
window.addEventListener('error', function(event) {
  console.error('Global Error:', event.error);
  showToast('Error', 'একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।', 'error');
});

window.addEventListener('unhandledrejection', function(event) {
  console.error('Unhandled Rejection:', event.reason);
  showToast('Error', 'একটি ত্রুটি ঘটেছে। দয়া করে আবার চেষ্টা করুন।', 'error');
});

// গ্লোবাল এক্সপোর্ট
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.getDatabase = getDatabase;
window.loadPage = loadPage; // পেজ লোড ফাংশন এক্সপোর্ট
