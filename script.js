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
// localStorage.removeItem('db_mode'); // optionally clear old value
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
