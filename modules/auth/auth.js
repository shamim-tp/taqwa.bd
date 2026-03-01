// ============================================================
// 🔐 AUTHENTICATION MODULE
// IMS ERP V5
// User authentication, session management, role-based access control
// Fully Responsive - Mobile & PC Optimized
// ============================================================


// ============================================================
// 📦 IMPORTS
// ============================================================

import { getDatabase } from '../database/db.js';
import { showToast } from '../utils/common.js';


// ============================================================
// 🔑 CONSTANTS
// ============================================================

// Admin roles with hierarchy
export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  FINANCE_ADMIN: 'FINANCE_ADMIN',
  ACCOUNTS_ADMIN: 'ACCOUNTS_ADMIN',
  MEMBER_MANAGER: 'MEMBER_MANAGER',
  INVESTMENT_MANAGER: 'INVESTMENT_MANAGER',
  VIEW_ONLY: 'VIEW_ONLY'
};

// Role hierarchy (higher index = more permissions)
const ROLE_HIERARCHY = {
  [ROLES.SUPER_ADMIN]: 100,
  [ROLES.FINANCE_ADMIN]: 80,
  [ROLES.ACCOUNTS_ADMIN]: 80,
  [ROLES.MEMBER_MANAGER]: 70,
  [ROLES.INVESTMENT_MANAGER]: 70,
  [ROLES.VIEW_ONLY]: 10
};

// Session storage keys
const SESSION_KEYS = {
  USER: 'ims_current_user',
  ROLE: 'ims_current_role',
  TOKEN: 'ims_auth_token',
  EXPIRY: 'ims_session_expiry'
};

// Session expiry (24 hours in milliseconds)
const SESSION_EXPIRY = 24 * 60 * 60 * 1000;


// ============================================================
// 📊 STATE MANAGEMENT
// ============================================================

let currentUser = null;
let currentRole = null;
let authToken = null;
let sessionExpiry = null;


// ============================================================
// 🚀 INITIALIZE AUTH MODULE
// ============================================================

export function initializeAuth() {
  // Try to restore session from storage
  restoreSession();
  
  // Set up session expiry checker
  setInterval(checkSessionExpiry, 60000); // Check every minute
  
  console.log('✅ Auth module initialized');
}


// ============================================================
:// 🔐 AUTHENTICATE USER
// ============================================================

/**
 * User authentication (login)
 * @param {string} type - 'admin' or 'member'
 * @param {string} id - User ID
 * @param {string} password - Password
 * @returns {Promise<{success: boolean, user?: object, message?: string}>}
 */
export async function authenticateUser(type, id, password) {
  // Input validation
  if (!id?.trim() || !password?.trim()) {
    return { success: false, message: 'ID and password are required' };
  }

  try {
    const db = getDatabase();

    if (type === 'admin') {
      // Admin login - check admins collection
      const admins = await db.query('admins', [
        { field: 'id', operator: '==', value: id },
        { field: 'pass', operator: '==', value: password },
        { field: 'active', operator: '==', value: true }
      ]);
      
      if (admins.length > 0) {
        const admin = admins[0];
        
        // Set current user
        currentUser = {
          id: admin.id,
          name: admin.name,
          email: admin.email,
          role: admin.role || ROLES.VIEW_ONLY,
          type: 'admin',
          permissions: admin.permissions || []
        };
        currentRole = 'admin';
        
        // Generate auth token
        authToken = generateAuthToken(currentUser.id);
        sessionExpiry = Date.now() + SESSION_EXPIRY;
        
        // Save session
        saveSession();
        
        await logActivity('ADMIN_LOGIN', `Admin logged in: ${id} (${currentUser.role})`);
        return { success: true, user: currentUser };
      }
    } else if (type === 'member') {
      // Member login - check members collection
      const members = await db.query('members', [
        { field: 'id', operator: '==', value: id },
        { field: 'pass', operator: '==', value: password },
        { field: 'approved', operator: '==', value: true },
        { field: 'status', operator: '==', value: 'ACTIVE' }
      ]);
      
      if (members.length > 0) {
        const member = members[0];
        
        // Set current user
        currentUser = {
          id: member.id,
          name: member.name,
          email: member.email,
          memberType: member.memberType,
          shares: member.shares,
          type: 'member'
        };
        currentRole = 'member';
        
        // Generate auth token
        authToken = generateAuthToken(currentUser.id);
        sessionExpiry = Date.now() + SESSION_EXPIRY;
        
        // Save session
        saveSession();
        
        await logActivity('MEMBER_LOGIN', `Member logged in: ${id}`);
        return { success: true, user: currentUser };
      }
    }

    // Invalid credentials
    return { success: false, message: 'Invalid credentials' };
    
  } catch (error) {
    console.error('Authentication error:', error);
    return { success: false, message: 'Authentication failed. Please try again.' };
  }
}


// ============================================================
// 🔑 GENERATE AUTH TOKEN
// ============================================================

function generateAuthToken(userId) {
  // Simple token generation (in production, use proper JWT)
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2);
  const token = btoa(`${userId}:${timestamp}:${random}`);
  return token;
}


// ============================================================
// 💾 SESSION MANAGEMENT
// ============================================================

/**
 * Save session to localStorage
 */
function saveSession() {
  try {
    if (currentUser) {
      localStorage.setItem(SESSION_KEYS.USER, JSON.stringify(currentUser));
      localStorage.setItem(SESSION_KEYS.ROLE, currentRole);
      localStorage.setItem(SESSION_KEYS.TOKEN, authToken);
      localStorage.setItem(SESSION_KEYS.EXPIRY, sessionExpiry);
    }
  } catch (error) {
    console.error('Error saving session:', error);
  }
}

/**
 * Restore session from localStorage
 */
function restoreSession() {
  try {
    const savedUser = localStorage.getItem(SESSION_KEYS.USER);
    const savedRole = localStorage.getItem(SESSION_KEYS.ROLE);
    const savedToken = localStorage.getItem(SESSION_KEYS.TOKEN);
    const savedExpiry = localStorage.getItem(SESSION_KEYS.EXPIRY);

    if (savedUser && savedRole && savedToken && savedExpiry) {
      // Check if session is expired
      if (Date.now() < parseInt(savedExpiry)) {
        currentUser = JSON.parse(savedUser);
        currentRole = savedRole;
        authToken = savedToken;
        sessionExpiry = parseInt(savedExpiry);
        console.log('✅ Session restored for:', currentUser.name);
      } else {
        // Session expired, clear storage
        clearSession();
        console.log('⚠️ Session expired');
      }
    }
  } catch (error) {
    console.error('Error restoring session:', error);
    clearSession();
  }
}

/**
 * Clear session from localStorage
 */
function clearSession() {
  try {
    localStorage.removeItem(SESSION_KEYS.USER);
    localStorage.removeItem(SESSION_KEYS.ROLE);
    localStorage.removeItem(SESSION_KEYS.TOKEN);
    localStorage.removeItem(SESSION_KEYS.EXPIRY);
  } catch (error) {
    console.error('Error clearing session:', error);
  }
}

/**
 * Check if session is expired
 */
function checkSessionExpiry() {
  if (sessionExpiry && Date.now() > sessionExpiry) {
    console.log('⚠️ Session expired');
    logout();
  }
}

/**
 * Extend session expiry
 */
export function extendSession() {
  if (currentUser) {
    sessionExpiry = Date.now() + SESSION_EXPIRY;
    localStorage.setItem(SESSION_KEYS.EXPIRY, sessionExpiry);
  }
}


// ============================================================
// 👤 USER INFORMATION
// ============================================================

/**
 * Get current logged-in user
 * @returns {object|null}
 */
export function getCurrentUser() {
  return currentUser;
}

/**
 * Get current user role (admin/member)
 * @returns {string|null}
 */
export function getCurrentRole() {
  return currentRole;
}

/**
 * Get auth token
 * @returns {string|null}
 */
export function getAuthToken() {
  return authToken;
}

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
export function isAuthenticated() {
  return !!(currentUser && authToken && sessionExpiry && Date.now() < sessionExpiry);
}


// ============================================================
:// 🚪 LOGOUT
// ============================================================

/**
 * Logout process
 * @returns {Promise<boolean>}
 */
export async function logout() {
  if (currentUser) {
    await logActivity('LOGOUT', `User logged out: ${currentUser.id}`);
    
    // Show logout message
    showToast('Success', 'Logged out successfully', 'info');
  }
  
  // Clear state
  currentUser = null;
  currentRole = null;
  authToken = null;
  sessionExpiry = null;
  
  // Clear storage
  clearSession();
  
  return true;
}


// ============================================================
:// 🎯 ROLE CHECK FUNCTIONS
// ============================================================

/**
 * Check if user is admin
 * @returns {boolean}
 */
export function isAdmin() {
  return currentRole === 'admin';
}

/**
 * Check if user is member
 * @returns {boolean}
 */
export function isMember() {
  return currentRole === 'member';
}

/**
 * Check if user has specific role
 * @param {string} role - Role to check
 * @returns {boolean}
 */
export function hasRole(role) {
  if (!currentUser || !isAdmin()) return false;
  return currentUser.role === role;
}

/**
 * Check if user has permission (role-based)
 * @param {string|Array} requiredRoles - Required role(s)
 * @param {string} mode - 'any' or 'all'
 * @returns {boolean}
 */
export function hasPermission(requiredRoles, mode = 'any') {
  // User not logged in or not admin
  if (!currentUser || !isAdmin()) return false;

  const userRole = currentUser.role;
  if (!userRole) return false;

  // Convert to array if string
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];

  if (mode === 'any') {
    // Check if user has ANY of the required roles
    return roles.some(role => {
      if (role === ROLES.SUPER_ADMIN) return userRole === ROLES.SUPER_ADMIN;
      if (role === ROLES.FINANCE_ADMIN) return [ROLES.SUPER_ADMIN, ROLES.FINANCE_ADMIN].includes(userRole);
      if (role === ROLES.ACCOUNTS_ADMIN) return [ROLES.SUPER_ADMIN, ROLES.ACCOUNTS_ADMIN].includes(userRole);
      if (role === ROLES.MEMBER_MANAGER) return [ROLES.SUPER_ADMIN, ROLES.MEMBER_MANAGER].includes(userRole);
      if (role === ROLES.INVESTMENT_MANAGER) return [ROLES.SUPER_ADMIN, ROLES.INVESTMENT_MANAGER].includes(userRole);
      if (role === ROLES.VIEW_ONLY) return [ROLES.SUPER_ADMIN, ROLES.VIEW_ONLY].includes(userRole);
      return false;
    });
  } else {
    // Check if user has ALL required roles (super admin only)
    if (userRole === ROLES.SUPER_ADMIN) return true;
    return roles.every(role => role === userRole);
  }
}

/**
 * Check if user has higher role than required
 * @param {string} requiredRole - Required role
 * @returns {boolean}
 */
export function hasHigherRole(requiredRole) {
  if (!currentUser || !isAdmin()) return false;
  
  const userRole = currentUser.role;
  const userLevel = ROLE_HIERARCHY[userRole] || 0;
  const requiredLevel = ROLE_HIERARCHY[requiredRole] || 0;
  
  return userLevel >= requiredLevel;
}


// ============================================================
:// 📋 PERMISSION HELPERS
// ============================================================

/**
 * Check if user can manage members
 * @returns {boolean}
 */
export function canManageMembers() {
  return hasPermission([ROLES.SUPER_ADMIN, ROLES.MEMBER_MANAGER]);
}

/**
 * Check if user can manage investments
 * @returns {boolean}
 */
export function canManageInvestments() {
  return hasPermission([ROLES.SUPER_ADMIN, ROLES.INVESTMENT_MANAGER]);
}

/**
 * Check if user can manage finances
 * @returns {boolean}
 */
export function canManageFinance() {
  return hasPermission([ROLES.SUPER_ADMIN, ROLES.FINANCE_ADMIN, ROLES.ACCOUNTS_ADMIN]);
}

/**
 * Check if user can view reports
 * @returns {boolean}
 */
export function canViewReports() {
  return hasPermission([ROLES.SUPER_ADMIN, ROLES.FINANCE_ADMIN, ROLES.ACCOUNTS_ADMIN, ROLES.VIEW_ONLY]);
}


// ============================================================
:// 📝 ACTIVITY LOGGING
// ============================================================

/**
 * Internal logging function
 * @param {string} action - Log action
 * @param {string} details - Log details
 */
async function logActivity(action, details) {
  try {
    const db = getDatabase();
    const user = getCurrentUser();
    
    await db.save('activityLogs', {
      id: `LOG_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      action,
      details,
      userId: user?.id || 'SYSTEM',
      userName: user?.name || 'System',
      userRole: getCurrentRole() || 'SYSTEM',
      timestamp: new Date().toISOString(),
      ip: 'client-side', // Can't get real IP from client
      userAgent: navigator.userAgent
    });
    
    console.log(`📝 Activity logged: ${action}`);
    
  } catch (error) {
    console.error('Error logging activity:', error);
  }
}


// ============================================================
:// 🔒 PASSWORD MANAGEMENT
// ============================================================

/**
 * Change user password
 * @param {string} oldPassword - Old password
 * @param {string} newPassword - New password
 * @returns {Promise<{success: boolean, message?: string}>}
 */
export async function changePassword(oldPassword, newPassword) {
  if (!currentUser) {
    return { success: false, message: 'Not logged in' };
  }

  try {
    const db = getDatabase();
    
    if (isAdmin()) {
      const admins = await db.query('admins', [
        { field: 'id', operator: '==', value: currentUser.id },
        { field: 'pass', operator: '==', value: oldPassword }
      ]);
      
      if (admins.length === 0) {
        return { success: false, message: 'Current password is incorrect' };
      }
      
      const admin = admins[0];
      admin.pass = newPassword;
      admin.updatedAt = new Date().toISOString();
      
      await db.update('admins', admin.id, admin);
      
    } else {
      const members = await db.query('members', [
        { field: 'id', operator: '==', value: currentUser.id },
        { field: 'pass', operator: '==', value: oldPassword }
      ]);
      
      if (members.length === 0) {
        return { success: false, message: 'Current password is incorrect' };
      }
      
      const member = members[0];
      member.pass = newPassword;
      member.updatedAt = new Date().toISOString();
      
      await db.update('members', member.id, member);
    }
    
    await logActivity('PASSWORD_CHANGE', `Password changed for user: ${currentUser.id}`);
    
    return { success: true, message: 'Password changed successfully' };
    
  } catch (error) {
    console.error('Error changing password:', error);
    return { success: false, message: 'Failed to change password' };
  }
}


// ============================================================
:// 🚀 INITIALIZE
// ============================================================

// Initialize auth module
initializeAuth();


// ============================================================
:// 🌍 GLOBAL EXPORTS
// ============================================================

window.getCurrentUser = getCurrentUser;
window.getCurrentRole = getCurrentRole;
window.isAdmin = isAdmin;
window.isMember = isMember;
window.hasPermission = hasPermission;
window.hasHigherRole = hasHigherRole;
window.canManageMembers = canManageMembers;
window.canManageInvestments = canManageInvestments;
window.canManageFinance = canManageFinance;
window.canViewReports = canViewReports;
window.logout = logout;
window.changePassword = changePassword;


// ============================================================
:// 📤 EXPORTS
// ============================================================

export default {
  authenticateUser,
  getCurrentUser,
  getCurrentRole,
  getAuthToken,
  isAuthenticated,
  isAdmin,
  isMember,
  hasRole,
  hasPermission,
  hasHigherRole,
  canManageMembers,
  canManageInvestments,
  canManageFinance,
  canViewReports,
  logout,
  changePassword,
  extendSession,
  ROLES
};
