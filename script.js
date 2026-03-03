// ========== গ্লোবাল কনফিগারেশন ও ইম্পোর্ট ==========
import { initializeDatabase, getDatabase } from './modules/database/db.js';
import { loadLoginModule } from './modules/auth/login.js';
import { loadModalModules } from './modules/modals/modals.js';

window.SESSION = {
  mode: 'admin',
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
    
    // লগইন ও মডাল মডিউল লোড
    loadLoginModule();
    loadModalModules();
    
    // ========== নতুন এনহ্যান্সমেন্টসমূহ ==========
    setupMobileMenu();            // মোবাইল মেনু টগল ও ওভারলে
    setupLoginTabs();             // লগইন ট্যাব (ডিফল্ট মেম্বার)
    setupRippleEffect();          // বাটনে রিপল ইফেক্ট
    setupClickOutsideSidebar();   // সাইডবারের বাইরে ক্লিলে বন্ধ
    setupHashScroll();            // পৃষ্ঠা লোডে হ্যাশ স্ক্রল
    
    hideLoading();
  } catch (error) {
    console.error('Application initialization failed:', error);
    showToast('Error', 'অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
  }
});

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

// গ্লোবাল এক্সপোর্ট
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.getDatabase = getDatabase;

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

  // সাইডবারের ভেতরের আইটেম ক্লিক করলে মেনু বন্ধ
  sidebar.querySelectorAll('button, .nav-item, .logoutBtn').forEach(item => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) {
        toggleMenu();
      }
    });
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

/** ২. লগইন ট্যাব স্যুইচ (ডিফল্ট মেম্বার) */
function setupLoginTabs() {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginIdLabel = document.getElementById('loginIdLabel');
  const loginId = document.getElementById('loginId');

  if (!tabAdmin || !tabMember || !loginIdLabel || !loginId) return;

  function setActiveTab(tab) {
    tabAdmin.classList.remove('active');
    tabMember.classList.remove('active');
    tab.classList.add('active');
    if (tab === tabAdmin) {
      loginIdLabel.textContent = 'Admin ID';
      loginId.placeholder = 'Enter Admin ID';
    } else {
      loginIdLabel.textContent = 'Member ID';
      loginId.placeholder = 'Enter Member ID';
    }
  }

  tabAdmin.addEventListener('click', () => setActiveTab(tabAdmin));
  tabMember.addEventListener('click', () => setActiveTab(tabMember));

  // ডিফল্ট মেম্বার সক্রিয় (HTML-এ ইতিমধ্যে active দেওয়া আছে, তবুও নিশ্চিত করা)
  setActiveTab(tabMember);
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
