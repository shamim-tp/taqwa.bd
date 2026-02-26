// modules/auth/login.js
import { authenticateUser } from './auth.js';
import { showToast } from '../../utils/common.js';

export function loadLoginModule() {
  const tabAdmin = document.getElementById('tabAdmin');
  const tabMember = document.getElementById('tabMember');
  const loginIdLabel = document.getElementById('loginIdLabel');
  const loginBtn = document.getElementById('loginBtn');

  // ট্যাব সুইচিং
  tabAdmin.addEventListener('click', () => {
    tabAdmin.classList.add('active');
    tabMember.classList.remove('active');
    loginIdLabel.textContent = 'Admin ID';
  });

  tabMember.addEventListener('click', () => {
    tabMember.classList.add('active');
    tabAdmin.classList.remove('active');
    loginIdLabel.textContent = 'Member ID';
  });

  // লগইন বাটন
  loginBtn.addEventListener('click', async () => {
    const type = tabAdmin.classList.contains('active') ? 'admin' : 'member';
    const id = document.getElementById('loginId').value.trim();
    const password = document.getElementById('loginPass').value.trim();

    if (!id || !password) {
      showToast('Error', 'আইডি ও পাসওয়ার্ড দিন');
      return;
    }

    window.showLoading('লগইন হচ্ছে...');

    try {
      const result = await authenticateUser(type, id, password);
      if (result.success) {
        // লগইন সফল: লগইন পৃষ্ঠা লুকাও, অ্যাপ পৃষ্ঠা দেখাও
        document.getElementById('loginPage').style.display = 'none';
        document.getElementById('appPage').style.display = 'grid';

        // অ্যাপ্লিকেশন স্টার্ট করো (sidebar, navigation)
        const { startApp } = await import('../app.js');
        startApp();
      } else {
        showToast('Error', result.message || 'লগইন ব্যর্থ');
      }
    } catch (error) {
      console.error('Login error:', error);
      showToast('Error', 'লগইন প্রক্রিয়ায় সমস্যা');
    } finally {
      window.hideLoading();
    }
  });
}
