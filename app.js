// modules/app.js
import { getCurrentUser, getCurrentRole } from './auth/auth.js';
import { buildSidebar, navigateTo } from './navigation.js';

export function startApp() {
  const user = getCurrentUser();
  const role = getCurrentRole();
  if (!user || !role) return;

  // UI আপডেট
  document.getElementById('currentUserName').textContent = user.name;
  document.getElementById('currentUserRole').textContent = user.role || role;
  document.getElementById('chipId').textContent = `ID: ${user.id}`;
  document.getElementById('chipStatus').textContent = user.status || 'Active';
  document.getElementById('systemMode').textContent = role.toUpperCase();

  // অ্যাডমিন টুলস দেখাও/লুকাও
  const systemToolsBtn = document.getElementById('systemToolsBtn');
  const quickAddBtn = document.getElementById('quickAddBtn');
  if (role === 'admin') {
    systemToolsBtn.classList.remove('hidden');
    quickAddBtn.classList.remove('hidden');
    // ইভেন্ট লিসেনার যোগ করা (নিশ্চিত করুন একাধিকবার না হয়)
  } else {
    systemToolsBtn.classList.add('hidden');
    quickAddBtn.classList.add('hidden');
  }

  // সাইডবার তৈরি
  buildSidebar();

  // প্রথম পৃষ্ঠা লোড
  navigateTo(role === 'admin' ? 'admin_dashboard' : 'member_dashboard');
}
