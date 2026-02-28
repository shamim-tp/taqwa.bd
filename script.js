// ===============================
// Main Application Entry Point
// ===============================

import { initializeDatabase, getDatabase } from './modules/database/db.js';
import { loadLoginModule } from './modules/auth/login.js';
import { loadModalModules } from './modules/modals/modals.js';


// ===============================
// Global Session
// ===============================

window.SESSION = {
  mode: 'admin',
  user: null,
  page: null
};


// ===============================
// App Initialize
// ===============================

document.addEventListener('DOMContentLoaded', async function () {
  try {
    showLoading('অ্যাপ্লিকেশন লোড হচ্ছে...');

    const dbMode = 'firebase'; // Always use Firebase
    await initializeDatabase(dbMode);

    // Show DB Mode in UI
    const dbTypeElement = document.getElementById('databaseType');
    if (dbTypeElement) {
      const modeNames = {
        local: 'LocalStorage',
        firebase: 'Firebase',
        mysql: 'MySQL',
        postgresql: 'PostgreSQL'
      };
      dbTypeElement.textContent = modeNames[dbMode] || dbMode;
    }

    // Load Modules
    loadLoginModule();
    loadModalModules();

    // Mobile Sidebar Toggle
    document.getElementById('mobileMenuBtn')
      ?.addEventListener('click', function () {
        document.getElementById('sidebar')?.classList.toggle('active');
      });

    hideLoading();

  } catch (error) {
    console.error('Application initialization failed:', error);
    showToast('Error', 'অ্যাপ্লিকেশন লোড করতে সমস্যা হয়েছে');
  }
});


// ===============================
// Utility Functions
// ===============================

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
  if (!wrap) return;

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


// ===============================
// Global Error Handler
// ===============================

window.addEventListener('error', function (event) {
  console.error('Global Error:', event.error);
  showToast('Error', 'একটি ত্রুটি ঘটেছে। দয়া আবার চেষ্টা করুন।');
});


// ===============================
// EmailJS Integration
// ===============================

// Make sure EmailJS CDN is loaded in HTML
// <script src="https://cdn.jsdelivr.net/npm/emailjs-com@3/dist/email.min.js"></script>
// <script> emailjs.init("YOUR_PUBLIC_KEY"); </script>

window.sendTestEmail = function () {

  if (typeof emailjs === "undefined") {
    alert("EmailJS not loaded!");
    return;
  }

  emailjs.send(
    "service_li1nizv",
    "template_eq13h6v",
    {
      to_name: "Test User",
      to_email: "shaque.shamim@gmail.com",
      receipt_no: "MR001",
      amount: "5000"
    }
  )
  .then(function () {
    showToast("Success", "Email Sent Successfully");
  })
  .catch(function (error) {
    console.error("Email Error:", error);
    showToast("Error", "Email sending failed");
  });

};


// ===============================
// Export Globals
// ===============================

window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;
window.getDatabase = getDatabase;
