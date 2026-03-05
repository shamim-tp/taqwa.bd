// ============================================================
// 🔐 LOGIN MODULE
// IMS ERP V5
// User login interface with role selection
// Fully Responsive - Mobile & PC Optimized
// ============================================================

import { authenticateUser, isAuthenticated, extendSession } from './auth.js';
import { showToast } from '../utils/common.js';
import { startApp } from './session.js';


// ============================================================
// 🎨 LOGIN STYLES
// ============================================================

const loginStyles = `
  <style>
    /* Login Container */
    .login-module {
      width: 100%;
      max-width: 450px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    /* Login Card */
    .login-card {
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border-radius: 30px;
      padding: 35px 30px;
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.2);
      border: 1px solid rgba(255, 255, 255, 0.1);
      position: relative;
      overflow: hidden;
    }

    .login-card::before {
      content: '🏢';
      position: absolute;
      top: -30px;
      right: -30px;
      font-size: 150px;
      opacity: 0.03;
      transform: rotate(15deg);
      pointer-events: none;
    }

    /* Logo Area */
    .login-logo {
      text-align: center;
      margin-bottom: 30px;
    }

    .login-logo h1 {
      font-size: 28px;
      font-weight: 800;
      background: linear-gradient(135deg, #4158D0, #C850C0);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      margin-bottom: 5px;
    }

    .login-logo p {
      color: var(--text-secondary, #334155);
      font-size: 14px;
    }

    /* Role Tabs */
    .role-tabs {
      display: flex;
      gap: 10px;
      margin-bottom: 25px;
      background: var(--bg-secondary, #f8fafc);
      padding: 5px;
      border-radius: 50px;
      border: 1px solid var(--bg-tertiary, #e2e8f0);
    }

    .role-tab {
      flex: 1;
      padding: 12px 20px;
      border: none;
      border-radius: 40px;
      font-size: 15px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      background: transparent;
      color: var(--text-secondary, #334155);
      position: relative;
      overflow: hidden;
    }

    .role-tab::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(135deg, #4158D0, #C850C0);
      opacity: 0;
      transition: opacity 0.3s;
      z-index: 0;
    }

    .role-tab.active {
      color: white;
      transform: scale(1.02);
      box-shadow: 0 10px 20px rgba(65,88,208,0.3);
    }

    .role-tab.active::before {
      opacity: 1;
    }

    .role-tab span {
      position: relative;
      z-index: 1;
    }

    .role-tab.admin i { font-style: normal; }
    .role-tab.member i { font-style: normal; }

    /* Form Group */
    .form-group {
      margin-bottom: 20px;
      animation: slideUp 0.5s ease;
    }

    @keyframes slideUp {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .form-label {
      display: block;
      margin-bottom: 8px;
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }

    .input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .input-icon {
      position: absolute;
      left: 16px;
      font-size: 20px;
      color: var(--text-muted, #64748b);
    }

    .form-input {
      width: 100%;
      padding: 16px 16px 16px 50px;
      border: 2px solid var(--bg-tertiary, #e2e8f0);
      border-radius: 20px;
      font-size: 16px;
      transition: all 0.3s;
      background: var(--bg-primary, #ffffff);
      color: var(--text-primary, #1e293b);
    }

    .form-input:focus {
      border-color: #4158D0;
      outline: none;
      box-shadow: 0 0 0 4px rgba(65,88,208,0.1);
    }

    .form-input::placeholder {
      color: var(--text-muted, #64748b);
      font-size: 14px;
    }

    /* Password Toggle */
    .password-toggle {
      position: absolute;
      right: 16px;
      background: none;
      border: none;
      font-size: 20px;
      cursor: pointer;
      color: var(--text-muted, #64748b);
      padding: 5px;
      transition: all 0.2s;
    }

    .password-toggle:hover {
      color: #4158D0;
    }

    /* Remember Me & Forgot Password */
    .form-options {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 25px;
      flex-wrap: wrap;
      gap: 10px;
    }

    .remember-me {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .remember-me input[type="checkbox"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
      accent-color: #4158D0;
    }

    .remember-me span {
      font-size: 14px;
      color: var(--text-secondary, #334155);
    }

    .forgot-link {
      font-size: 14px;
      color: #4158D0;
      text-decoration: none;
      font-weight: 600;
      transition: all 0.2s;
    }

    .forgot-link:hover {
      color: #C850C0;
      text-decoration: underline;
    }

    /* Login Button */
    .login-btn {
      width: 100%;
      padding: 18px;
      background: linear-gradient(135deg, #4158D0, #C850C0);
      color: white;
      border: none;
      border-radius: 50px;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      box-shadow: 0 10px 25px rgba(65,88,208,0.3);
      position: relative;
      overflow: hidden;
    }

    .login-btn::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
      transition: left 0.5s;
    }

    .login-btn:hover::before {
      left: 100%;
    }

    .login-btn:hover {
      transform: translateY(-3px);
      box-shadow: 0 15px 35px rgba(65,88,208,0.4);
    }

    .login-btn:active {
      transform: translateY(0);
    }

    .login-btn:disabled {
      opacity: 0.7;
      cursor: not-allowed;
      transform: none;
    }

    /* Demo Credentials */
    .demo-credentials {
      margin-top: 25px;
      padding: 20px;
      background: linear-gradient(135deg, #e8f0fe, #d4e0fc);
      border-radius: 20px;
      border-left: 5px solid #4158D0;
    }

    .demo-title {
      font-weight: 700;
      color: #1e3c72;
      margin-bottom: 10px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .demo-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 15px;
    }

    .demo-item {
      background: white;
      padding: 12px;
      border-radius: 12px;
      text-align: center;
      box-shadow: 0 2px 5px rgba(0,0,0,0.05);
    }

    .demo-role {
      font-size: 12px;
      color: var(--text-muted, #64748b);
      margin-bottom: 4px;
    }

    .demo-id {
      font-weight: 700;
      color: #4158D0;
      font-size: 14px;
    }

    .demo-pass {
      font-size: 11px;
      color: var(--text-secondary, #334155);
    }

    /* Error Message */
    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 12px 16px;
      border-radius: 12px;
      margin-bottom: 20px;
      font-size: 14px;
      border-left: 5px solid #dc3545;
      display: none;
      align-items: center;
      gap: 10px;
    }

    .error-message.show {
      display: flex;
      animation: shake 0.5s ease;
    }

    @keyframes shake {
      0%, 100% { transform: translateX(0); }
      10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
      20%, 40%, 60%, 80% { transform: translateX(5px); }
    }

    /* Loading State */
    .login-btn.loading {
      position: relative;
      color: transparent;
    }

    .login-btn.loading::after {
      content: '';
      position: absolute;
      top: 50%;
      left: 50%;
      width: 24px;
      height: 24px;
      margin: -12px 0 0 -12px;
      border: 3px solid rgba(255,255,255,0.3);
      border-top-color: white;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    /* Mobile Optimizations */
    @media (max-width: 480px) {
      .login-card {
        padding: 25px 20px;
      }

      .login-logo h1 {
        font-size: 24px;
      }

      .role-tab {
        padding: 10px 15px;
        font-size: 14px;
      }

      .form-input {
        padding: 14px 14px 14px 45px;
        font-size: 15px;
      }

      .input-icon {
        left: 12px;
        font-size: 18px;
      }

      .login-btn {
        padding: 16px;
        font-size: 16px;
      }

      .demo-grid {
        grid-template-columns: 1fr;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .role-tab:active {
        transform: scale(0.95);
      }

      .login-btn:active {
        transform: scale(0.95);
      }
    }
  </style>
`;


// ============================================================
// 📦 STATE MANAGEMENT
// ============================================================

let loginAttempts = 0;
const MAX_LOGIN_ATTEMPTS = 5;
const LOCKOUT_TIME = 5 * 60 * 1000; // 5 minutes
let lockoutUntil = null;


// ============================================================
// 🚀 LOAD LOGIN MODULE
// ============================================================

export function loadLoginModule() {
  // Add styles
  const styleEl = document.createElement('style');
  styleEl.textContent = loginStyles;
  document.head.appendChild(styleEl);

  // Check if already authenticated
  if (isAuthenticated()) {
    console.log('User already authenticated, starting app...');
    startApp();
    return;
  }

  // Set up event listeners
  document.getElementById('tabAdmin')?.addEventListener('click', () => switchLoginTab('admin'));
  document.getElementById('tabMember')?.addEventListener('click', () => switchLoginTab('member'));
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  
  const loginPass = document.getElementById('loginPass');
  if (loginPass) {
    loginPass.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') handleLogin();
    });
  }

  // Add password toggle
  addPasswordToggle();

  // Add remember me functionality
  loadRememberedCredentials();

  // Set default tab
  switchLoginTab('admin');

  console.log('✅ Login module loaded');
}


// ============================================================
// 🔄 SWITCH LOGIN TAB
// ============================================================

function switchLoginTab(mode) {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginIdLabel = document.getElementById('loginIdLabel');
  const loginId = document.getElementById('loginId');
  const loginPass = document.getElementById('loginPass');
  const demoCredentials = document.getElementById('demoCredentials');
  
  if (!tabAdmin || !tabMember) return;
  
  // Update tabs
  tabAdmin.classList.toggle('active', mode === 'admin');
  tabMember.classList.toggle('active', mode === 'member');
  
  // Update label
  if (loginIdLabel) {
    loginIdLabel.innerHTML = mode === 'admin' ? '👑 Admin ID' : '👤 Member ID';
  }
  
  // Update placeholder
  if (loginId) {
    loginId.placeholder = mode === 'admin' ? 'Enter Admin ID' : 'Enter Member ID';
  }
  
  // Set demo credentials based on mode
  if (mode === 'admin') {
    if (loginId) loginId.value = 'ADMIN-001';
    if (loginPass) loginPass.value = '123456';
  } else {
    if (loginId) loginId.value = 'FM-001';
    if (loginPass) loginPass.value = '123456';
  }
  
  // Update demo credentials display
  updateDemoCredentials(mode);
  
  // Update session mode
  window.SESSION = window.SESSION || {};
  window.SESSION.mode = mode;
}


// ============================================================
// 🔑 HANDLE LOGIN
// ============================================================

async function handleLogin() {
  // Check if locked out
  if (lockoutUntil && Date.now() < lockoutUntil) {
    const minutesLeft = Math.ceil((lockoutUntil - Date.now()) / 60000);
    showToast('Account Locked', `Too many attempts. Try again in ${minutesLeft} minute(s).`, 'error');
    return;
  }

  const mode = window.SESSION?.mode || 'admin';
  const id = document.getElementById('loginId')?.value.trim();
  const password = document.getElementById('loginPass')?.value.trim();
  const rememberMe = document.getElementById('rememberMe')?.checked;
  
  // Validate inputs
  if (!id || !password) {
    showToast('Login Failed', 'Please enter ID and Password', 'error');
    showError('ID and password are required');
    return;
  }
  
  // Show loading state
  const loginBtn = document.getElementById('loginBtn');
  if (loginBtn) {
    loginBtn.disabled = true;
    loginBtn.classList.add('loading');
    loginBtn.textContent = '';
  }
  
  try {
    const result = await authenticateUser(mode, id, password);
    
    if (result.success) {
      // Reset login attempts on success
      loginAttempts = 0;
      lockoutUntil = null;
      
      // Save credentials if remember me is checked
      if (rememberMe) {
        saveCredentials(id, password, mode);
      } else {
        clearSavedCredentials();
      }
      
      // Show success message
      showToast('Login Successful', `Welcome ${result.user.name}!`, 'success');
      
      // Start the app
      setTimeout(() => {
        startApp();
      }, 500);
      
    } else {
      // Increment login attempts
      loginAttempts++;
      
      // Check if should lock out
      if (loginAttempts >= MAX_LOGIN_ATTEMPTS) {
        lockoutUntil = Date.now() + LOCKOUT_TIME;
        showToast('Account Locked', 'Too many failed attempts. Try again in 5 minutes.', 'error');
      } else {
        const attemptsLeft = MAX_LOGIN_ATTEMPTS - loginAttempts;
        showToast('Login Failed', result.message || 'Invalid credentials', 'error');
        showError(`${result.message || 'Invalid credentials'}. ${attemptsLeft} attempts left.`);
      }
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login Failed', 'An error occurred during login', 'error');
    showError('Network error. Please try again.');
  } finally {
    // Reset loading state
    if (loginBtn) {
      loginBtn.disabled = false;
      loginBtn.classList.remove('loading');
      loginBtn.textContent = mode === 'admin' ? 'Login as Admin' : 'Login as Member';
    }
  }
}


// ============================================================
// 🔐 PASSWORD TOGGLE
// ============================================================

function addPasswordToggle() {
  const passwordInput = document.getElementById('loginPass');
  if (!passwordInput) return;

  const wrapper = passwordInput.parentElement;
  if (!wrapper) return;

  const toggleBtn = document.createElement('button');
  toggleBtn.type = 'button';
  toggleBtn.className = 'password-toggle';
  toggleBtn.innerHTML = '👁️';
  toggleBtn.setAttribute('aria-label', 'Toggle password visibility');

  toggleBtn.addEventListener('click', () => {
    const type = passwordInput.type === 'password' ? 'text' : 'password';
    passwordInput.type = type;
    toggleBtn.innerHTML = type === 'password' ? '👁️' : '🔒';
  });

  wrapper.appendChild(toggleBtn);
}


// ============================================================
// 💾 REMEMBER ME
// ============================================================

const CREDENTIALS_KEY = 'ims_saved_credentials';

function saveCredentials(id, password, mode) {
  try {
    const credentials = {
      id,
      password: btoa(password), // Simple encoding (not secure for production)
      mode,
      timestamp: Date.now()
    };
    localStorage.setItem(CREDENTIALS_KEY, JSON.stringify(credentials));
  } catch (error) {
    console.error('Error saving credentials:', error);
  }
}

function loadRememberedCredentials() {
  try {
    const saved = localStorage.getItem(CREDENTIALS_KEY);
    if (!saved) return;

    const credentials = JSON.parse(saved);
    
    // Check if credentials are less than 7 days old
    if (Date.now() - credentials.timestamp < 7 * 24 * 60 * 60 * 1000) {
      document.getElementById('loginId').value = credentials.id || '';
      document.getElementById('loginPass').value = atob(credentials.password || '');
      document.getElementById('rememberMe').checked = true;
      
      // Switch to saved mode
      if (credentials.mode) {
        switchLoginTab(credentials.mode);
      }
    } else {
      clearSavedCredentials();
    }
  } catch (error) {
    console.error('Error loading credentials:', error);
  }
}

function clearSavedCredentials() {
  localStorage.removeItem(CREDENTIALS_KEY);
}


// ============================================================
// 📋 DEMO CREDENTIALS
// ============================================================

function updateDemoCredentials(mode) {
  const demoContainer = document.getElementById('demoCredentials');
  if (!demoContainer) return;

  if (mode === 'admin') {
    demoContainer.innerHTML = `
      <div class="demo-title">🔑 Demo Admin Credentials</div>
      <div class="demo-grid">
        <div class="demo-item">
          <div class="demo-role">Super Admin</div>
          <div class="demo-id">ADMIN-001</div>
          <div class="demo-pass">Password: 123456</div>
        </div>
        <div class="demo-item">
          <div class="demo-role">Finance Admin</div>
          <div class="demo-id">ADMIN-002</div>
          <div class="demo-pass">Password: 123456</div>
        </div>
      </div>
    `;
  } else {
    demoContainer.innerHTML = `
      <div class="demo-title">🔑 Demo Member Credentials</div>
      <div class="demo-grid">
        <div class="demo-item">
          <div class="demo-role">Founder Member</div>
          <div class="demo-id">FM-001</div>
          <div class="demo-pass">Password: 123456</div>
        </div>
        <div class="demo-item">
          <div class="demo-role">Reference Member</div>
          <div class="demo-id">RM-001</div>
          <div class="demo-pass">Password: 123456</div>
        </div>
      </div>
    `;
  }
}


// ============================================================
// ❌ ERROR MESSAGE
// ============================================================

function showError(message) {
  const errorEl = document.getElementById('loginError');
  if (!errorEl) return;

  errorEl.innerHTML = `⚠️ ${message}`;
  errorEl.classList.add('show');
  
  setTimeout(() => {
    errorEl.classList.remove('show');
  }, 5000);
}


// ============================================================
// 📤 EXPORTS
// ============================================================

export default {
  loadLoginModule
};
