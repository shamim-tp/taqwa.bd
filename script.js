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
        'firebase': 'Firebase'
      };
      dbTypeElement.textContent = modeNames[dbMode] || dbMode;
    }
    
    // Load login module
    loadLoginModule();
    
    // Load modal modules
    loadModalModules();
    
    // Mobile menu toggle (your original code)
    document.getElementById('mobileMenuBtn')?.addEventListener('click', function() {
      document.getElementById('sidebar').classList.toggle('active');
    });
    
    hideLoading();
  } catch (error) {
    console.error('Application initialization failed:', error);
    showToast('Error', 'অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
  }
});

// Utility functions
function showLoading(message) {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.querySelector('p').textContent = message;
    overlay.style.display = 'flex';
  }
}

function hideLoading() {
  const overlay = document.getElementById('loadingOverlay');
  if (overlay) {
    overlay.style.display = 'none';
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

// Global error handler
window.addEventListener('error', function(event) {
  console.error('Global Error:', event.error);
  showToast('Error', 'একটি ত্রুটি ঘটেছে। দয়া আবার চেষ্টা করুন।');
});

// Export global functions
window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.getDatabase = getDatabase;

/* ========== নতুন এনহ্যান্সমেন্ট ========== */
/* নিচের অংশ আপনার মূল কোডের সাথে যুক্ত হয়েছে। এখানে কোনও মূল ফাংশন মুছে দেওয়া হয়নি। */

// ১. মোবাইলে সাইডবারের বাইরে ক্লিক করলে সেটি বন্ধ হবে
document.addEventListener('click', function(e) {
  const sidebar = document.getElementById('sidebar');
  const menuBtn = document.getElementById('mobileMenuBtn');
  if (window.innerWidth <= 768 && sidebar && sidebar.classList.contains('active') && 
      !sidebar.contains(e.target) && !menuBtn?.contains(e.target)) {
    sidebar.classList.remove('active');
  }
});

// ২. পৃষ্ঠা লোড হলে যদি URL-এ হ্যাশ থাকে, তাহলে স্মুথ স্ক্রল করবে
window.addEventListener('load', function() {
  if (window.location.hash) {
    setTimeout(() => {
      document.getElementById(window.location.hash.substring(1))?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  }
});

// ৩. বাটনে রিপল ইফেক্ট যোগ করা (অপশনাল)
document.querySelectorAll('.btn, .nav-item').forEach(btn => {
  btn.addEventListener('click', function(e) {
    // শুধু মাউস ক্লিকের জন্য, টাচ ইভেন্টের জন্য আলাদা
    if (e.clientX === 0 && e.clientY === 0) return; // কিবোর্ড ক্লিক ইগনোর
    let ripple = document.createElement('span');
    ripple.className = 'ripple';
    this.appendChild(ripple);
    let x = e.clientX - e.target.getBoundingClientRect().left;
    let y = e.clientY - e.target.getBoundingClientRect().top;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    setTimeout(() => ripple.remove(), 600);
  });
});

// রিপল স্টাইল ডায়নামিকভাবে যোগ করা (style.css-এ না লিখে এখানে)
const rippleStyle = document.createElement('style');
rippleStyle.textContent = `
  .btn, .nav-item { position: relative; overflow: hidden; }
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
