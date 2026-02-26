import { getDatabase } from '../database/db.js';
import { showToast } from '../utils/common.js';

// স্টেট ম্যানেজমেন্ট
let currentUser = null;
let currentRole = null; // 'admin' বা 'member'

// অ্যাডমিন রোল কনস্ট্যান্ট (hasPermission-এর জন্য)
const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  FINANCE_ADMIN: 'FINANCE_ADMIN',
  ACCOUNTS_ADMIN: 'ACCOUNTS_ADMIN',
  VIEW_ONLY: 'VIEW_ONLY'
};

/**
 * ইউজার প্রমাণীকরণ (লগইন)
 * @param {string} type - 'admin' বা 'member'
 * @param {string} id - ইউজার আইডি
 * @param {string} password - পাসওয়ার্ড
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 */
export async function authenticateUser(type, id, password) {
  // ইনপুট ভ্যালিডেশন
  if (!id?.trim() || !password?.trim()) {
    return { success: false, message: 'ID and password are required' };
  }

  try {
    const db = getDatabase();

    if (type === 'admin') {
      const admins = await db.query('admins', [
        { field: 'id', operator: '==', value: id },
        { field: 'pass', operator: '==', value: password },
        { field: 'active', operator: '==', value: true }
      ]);
      if (admins.length > 0) {
        currentUser = admins[0];
        currentRole = 'admin';
        await logActivity('ADMIN_LOGIN', `Admin logged in: ${id}`);
        return { success: true, user: currentUser };
      }
    } else if (type === 'member') {
      const members = await db.query('members', [
        { field: 'id', operator: '==', value: id },
        { field: 'pass', operator: '==', value: password },
        { field: 'approved', operator: '==', value: true },
        { field: 'status', operator: '==', value: 'ACTIVE' }
      ]);
      if (members.length > 0) {
        currentUser = members[0];
        currentRole = 'member';
        await logActivity('MEMBER_LOGIN', `Member logged in: ${id}`);
        return { success: true, user: currentUser };
      }
    }

    // ভুল টাইপ বা কোনো ইউজার পাওয়া যায়নি
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Authentication failed. Please try again.' };
  }
}

/**
 * বর্তমান লগইন করা ইউজারের তথ্য রিটার্ন করে
 * @returns {object|null}
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * বর্তমান ইউজারের ভূমিকা (admin/member) রিটার্ন করে
 * @returns {string|null}
 */
export function getCurrentRole() {
  return currentRole;
}

/**
 * লগআউট প্রক্রিয়া
 * @returns {Promise<boolean>}
 */
export async function logout() {
  if (currentUser) {
    await logActivity('LOGOUT', `User logged out: ${currentUser.id}`);
  }
  currentUser = null;
  currentRole = null;
  return true;
}

/**
 * চেক করে ইউজার অ্যাডমিন কিনা
 * @returns {boolean}
 */
export function isAdmin() {
  return currentRole === 'admin';
}

/**
 * চেক করে ইউজার মেম্বার কিনা
 * @returns {boolean}
 */
export function isMember() {
  return currentRole === 'member';
}

/**
 * নির্দিষ্ট অনুমতি আছে কিনা চেক করে (শুধুমাত্র অ্যাডমিনদের জন্য)
 * @param {string} requiredRole - প্রয়োজনীয় রোল (SUPER_ADMIN, FINANCE_ADMIN, ACCOUNTS_ADMIN, VIEW_ONLY)
 * @returns {boolean}
 */
export function hasPermission(requiredRole) {
  // ইউজার না থাকলে বা অ্যাডমিন না হলে অনুমতি নেই
  if (!currentUser || !isAdmin()) return false;

  const userRole = currentUser.role; // অ্যাডমিন অবজেক্টে role ফিল্ড থাকতে হবে
  if (!userRole) return false;

  switch (requiredRole) {
    case ROLES.SUPER_ADMIN:
      return userRole === ROLES.SUPER_ADMIN;
    case ROLES.FINANCE_ADMIN:
      return [ROLES.SUPER_ADMIN, ROLES.FINANCE_ADMIN].includes(userRole);
    case ROLES.ACCOUNTS_ADMIN:
      return [ROLES.SUPER_ADMIN, ROLES.ACCOUNTS_ADMIN].includes(userRole);
    case ROLES.VIEW_ONLY:
      return [ROLES.SUPER_ADMIN, ROLES.VIEW_ONLY].includes(userRole);
    default:
      // অজানা রোলের জন্য false ফেরত দিন (নিরাপত্তা)
      return false;
  }
}

/**
 * অভ্যন্তরীণ লগিং ফাংশন (শুধু auth-এর জন্য)
 * @param {string} action - লগ অ্যাকশন
 * @param {string} details - লগের বিস্তারিত
 */
async function logActivity(action, details) {
  try {
    const db = getDatabase();
    const user = getCurrentUser();
    await db.save('activityLogs', {
      action,
      details,
      userId: user?.id || 'SYSTEM',
      userRole: getCurrentRole() || 'SYSTEM',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}

// গ্লোবাল এক্সপোজ (প্রয়োজনীয় ক্ষেত্রে)
window.getCurrentUser = getCurrentUser;
window.getCurrentRole = getCurrentRole;
window.isAdmin = isAdmin;
window.isMember = isMember;
window.hasPermission = hasPermission;
