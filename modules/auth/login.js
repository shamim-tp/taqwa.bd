import { authenticateUser } from './auth.js';
import { showToast } from '../utils/common.js';
import { startApp } from './session.js';

export function loadLoginModule() {
  document.getElementById('tabAdmin')?.addEventListener('click', () => switchLoginTab('admin'));
  document.getElementById('tabMember')?.addEventListener('click', () => switchLoginTab('member'));
  document.getElementById('loginBtn')?.addEventListener('click', handleLogin);
  document.getElementById('loginPass')?.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') handleLogin();
  });
  switchLoginTab('admin');
}

function switchLoginTab(mode) {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginIdLabel = document.getElementById('loginIdLabel');
  if (!tabAdmin || !tabMember) return;
  
  tabAdmin.classList.toggle('active', mode === 'admin');
  tabMember.classList.toggle('active', mode === 'member');
  if (loginIdLabel) {
    loginIdLabel.textContent = mode === 'admin' ? 'Admin ID' : 'Member ID';
  }
  window.SESSION.mode = mode;
}

async function handleLogin() {
  const mode = window.SESSION.mode;
  const id = document.getElementById('loginId')?.value.trim();
  const password = document.getElementById('loginPass')?.value.trim();
  
  if (!id || !password) {
    showToast('Login Failed', 'Please enter ID and Password');
    return;
  }
  
  window.showLoading('Logging in...');
  try {
    const result = await authenticateUser(mode, id, password);
    if (result.success) {
      showToast('Login Successful', `Welcome ${result.user.name}`);
      startApp();
    } else {
      showToast('Login Failed', result.message || 'Invalid credentials');
    }
  } catch (error) {
    console.error('Login error:', error);
    showToast('Login Failed', 'An error occurred during login');
  } finally {
    window.hideLoading();
  }
}
