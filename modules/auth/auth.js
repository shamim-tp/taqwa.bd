import { getDatabase } from '../database/db.js';
import { showToast } from '../utils/common.js';

let currentUser = null;
let currentRole = null;

export async function authenticateUser(type, id, password) {
  try {
    const db = getDatabase();
    
    if (type === 'admin') {
      const admins = await db.query('admins', [
        { field: 'id', operator: '==', value: id },          // পরিবর্তন: === → ==
        { field: 'pass', operator: '==', value: password },  // পরিবর্তন
        { field: 'active', operator: '==', value: true }     // পরিবর্তন
      ]);
      if (admins.length > 0) {
        currentUser = admins[0];
        currentRole = 'admin';
        await logActivity('ADMIN_LOGIN', `Admin logged in: ${id}`);
        return { success: true, user: currentUser };
      }
    } else if (type === 'member') {
      const members = await db.query('members', [
        { field: 'id', operator: '==', value: id },          // পরিবর্তন
        { field: 'pass', operator: '==', value: password },  // পরিবর্তন
        { field: 'approved', operator: '==', value: true },  // পরিবর্তন
        { field: 'status', operator: '==', value: 'ACTIVE' } // পরিবর্তন
      ]);
      if (members.length > 0) {
        currentUser = members[0];
        currentRole = 'member';
        await logActivity('MEMBER_LOGIN', `Member logged in: ${id}`);
        return { success: true, user: currentUser };
      }
    }
    
    return { success: false, message: 'Invalid credentials' };
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Authentication failed' };
  }
}

export function getCurrentUser() {
  return currentUser;
}

export function getCurrentRole() {
  return currentRole;
}

export async function logout() {
  if (currentUser) {
    await logActivity('LOGOUT', `User logged out: ${currentUser.id}`);
  }
  currentUser = null;
  currentRole = null;
  return true;
}

export function isAdmin() {
  return currentRole === 'admin';
}

export function isMember() {
  return currentRole === 'member';
}

export function hasPermission(requiredRole) {
  if (!currentUser) return false;
  switch(requiredRole) {
    case 'SUPER_ADMIN': return currentUser.role === 'SUPER_ADMIN';
    case 'FINANCE_ADMIN': return ['SUPER_ADMIN','FINANCE_ADMIN'].includes(currentUser.role);
    case 'ACCOUNTS_ADMIN': return ['SUPER_ADMIN','ACCOUNTS_ADMIN'].includes(currentUser.role);
    case 'VIEW_ONLY': return ['SUPER_ADMIN','VIEW_ONLY'].includes(currentUser.role);
    default: return true;
  }
}

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

window.getCurrentUser = getCurrentUser;
window.getCurrentRole = getCurrentRole;
window.isAdmin = isAdmin;
window.isMember = isMember;
window.hasPermission = hasPermission;
