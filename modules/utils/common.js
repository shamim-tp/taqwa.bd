// ============================================================
// 🏢 IMS ERP V5 – Common Utility Functions
// Central Helper File (No Duplicate, Modular, Reusable)
// Fully Responsive & Optimized
// ============================================================



// ============================================================
// 🔔 TOAST NOTIFICATION SYSTEM (Enhanced)
// ============================================================

/**
 * Show modern toast message with auto-dismiss and manual close
 * @param {string} title - Toast Title
 * @param {string} message - Toast Message
 * @param {string} type - info | success | error | warning
 * @param {number} duration - Auto dismiss time in ms (default 3500)
 */
export function showToast(title, message, type = 'info', duration = 3500) {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;

  const toastId = 'toast_' + Date.now() + Math.random().toString(36).substr(2, 9);
  
  const toast = document.createElement('div');
  toast.id = toastId;
  toast.className = `toast ${type}`;

  // Icons based on type
  const icons = {
    success: '✅',
    error: '❌',
    warning: '⚠️',
    info: 'ℹ️'
  };

  toast.innerHTML = `
    <div style="display: flex; align-items: flex-start; gap: 12px;">
      <div style="font-size: 24px;">${icons[type] || 'ℹ️'}</div>
      <div style="flex: 1;">
        <div class="t1" style="font-weight: 700; margin-bottom: 4px;">${title}</div>
        <div class="t2" style="color: var(--text-secondary); font-size: 13px; margin-bottom: 4px;">${message}</div>
        <div class="t3" style="font-size: 11px; color: var(--text-muted);">${new Date().toLocaleString()}</div>
      </div>
      <button onclick="document.getElementById('${toastId}').remove()" 
              style="background: none; border: none; color: var(--text-muted); font-size: 18px; cursor: pointer; padding: 0 5px;">
        ✕
      </button>
    </div>
  `;

  wrap.appendChild(toast);

  // Auto remove after duration
  const timeout = setTimeout(() => {
    const toastEl = document.getElementById(toastId);
    if (toastEl) {
      toastEl.style.animation = 'fadeOut 0.3s ease';
      setTimeout(() => toastEl.remove(), 300);
    }
  }, duration);

  // Store timeout to clear on manual close
  toast.dataset.timeout = timeout;
}



// ============================================================
// 💰 MONEY & DATE FORMAT HELPERS (Enhanced)
// ============================================================

/**
 * Format number to Bangladeshi Taka with optional decimal
 * @param {number} amount - Amount to format
 * @param {boolean} showDecimal - Show decimal places (default false)
 */
export function formatMoney(amount, showDecimal = false) {
  const num = Number(amount || 0);
  if (showDecimal) {
    return '৳ ' + num.toFixed(2).toLocaleString('en-US');
  }
  return '৳ ' + num.toLocaleString('en-US');
}

/**
 * Format date (Short) - with timezone handling
 * @param {string|Date} dateString - Date to format
 * @param {string} format - 'short' | 'long' | 'full'
 */
export function formatDate(dateString, format = 'short') {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const options = {
    short: { year: 'numeric', month: 'short', day: 'numeric' },
    long: { year: 'numeric', month: 'long', day: 'numeric' },
    full: { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
  };

  return date.toLocaleDateString('en-US', options[format] || options.short);
}

/**
 * Format date & time with multiple formats
 * @param {string|Date} dateString - Date to format
 * @param {string} format - 'short' | 'long' | 'full'
 */
export function formatDateTime(dateString, format = 'short') {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const options = {
    short: {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    },
    long: {
      year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    },
    full: {
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
      hour: '2-digit', minute: '2-digit', second: '2-digit'
    }
  };

  return date.toLocaleString('en-US', options[format] || options.short);
}

/**
 * Get relative time (e.g., "2 hours ago", "yesterday")
 * @param {string|Date} dateString - Date to compare
 */
export function getRelativeTime(dateString) {
  if (!dateString) return 'N/A';

  const date = new Date(dateString);
  if (isNaN(date.getTime())) return 'Invalid Date';

  const now = new Date();
  const diffMs = now - date;
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
  if (diffDay === 1) return 'yesterday';
  if (diffDay < 7) return `${diffDay} days ago`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} week${Math.floor(diffDay / 7) > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
}



// ============================================================
// 📂 FILE & IMAGE UTILITIES (Enhanced)
// ============================================================

/**
 * Convert file to Base64 with error handling
 * @param {File} file - File to convert
 * @returns {Promise<string>} Base64 string
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    // Check file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      reject(new Error('File size exceeds 5MB limit'));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Compress image before saving with advanced options
 * @param {File} file - Image file
 * @param {Object} options - Compression options
 * @param {number} options.maxWidth - Max width (default 800)
 * @param {number} options.maxHeight - Max height (default 800)
 * @param {number} options.quality - Image quality 0-1 (default 0.7)
 * @param {string} options.format - Output format 'jpeg' | 'png' (default 'jpeg')
 * @returns {Promise<string>} Compressed base64 image
 */
export async function compressImage(file, options = {}) {
  const {
    maxWidth = 800,
    maxHeight = 800,
    quality = 0.7,
    format = 'jpeg'
  } = options;

  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    // Check if it's an image
    if (!file.type.startsWith('image/')) {
      reject(new Error('File is not an image'));
      return;
    }

    const reader = new FileReader();
    const img = new Image();

    reader.onload = (e) => {
      img.src = e.target.result;
    };

    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let width = img.width;
      let height = img.height;

      // Calculate new dimensions while maintaining aspect ratio
      if (width > maxWidth) {
        height = (height * maxWidth) / width;
        width = maxWidth;
      }
      if (height > maxHeight) {
        width = (width * maxHeight) / height;
        height = maxHeight;
      }

      canvas.width = Math.round(width);
      canvas.height = Math.round(height);

      // Draw and compress
      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      const mimeType = format === 'png' ? 'image/png' : 'image/jpeg';
      const compressedBase64 = canvas.toDataURL(mimeType, quality);

      // Check compressed size
      const compressedSize = Math.round((compressedBase64.length * 3) / 4);
      if (compressedSize > 1024 * 1024) { // > 1MB
        console.warn('Compressed image size:', compressedSize, 'bytes');
      }

      resolve(compressedBase64);
    };

    img.onerror = () => reject(new Error('Failed to load image'));
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

/**
 * Get image dimensions
 * @param {string} base64String - Base64 image
 * @returns {Promise<{width: number, height: number}>}
 */
export async function getImageDimensions(base64String) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve({ width: img.width, height: img.height });
    img.onerror = reject;
    img.src = base64String;
  });
}

/**
 * Download base64 image as file
 * @param {string} base64String - Base64 image data
 * @param {string} filename - Download filename
 */
export function downloadBase64Image(base64String, filename) {
  if (!base64String) {
    showToast('Error', 'No image data found', 'error');
    return;
  }

  try {
    const link = document.createElement('a');
    link.href = base64String;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    showToast('Success', 'Image downloaded successfully', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showToast('Error', 'Failed to download image', 'error');
  }
}



// ============================================================
// 🆔 ID & DATE KEY GENERATORS (Enhanced)
// ============================================================

/**
 * Generate Unique ID with multiple formats
 * Format: PREFIX-YYYY-000001 or PREFIX-YYYYMMDD-000001
 * @param {string} prefix - ID prefix (e.g., 'DP', 'FM')
 * @param {Array} existingItems - Existing items for duplicate check
 * @param {Object} options - Additional options
 * @param {boolean} options.includeDate - Include date in ID
 * @param {number} options.padding - Number of digits (default 6)
 */
export function generateId(prefix, existingItems = [], options = {}) {
  const { includeDate = false, padding = 6 } = options;

  const year = new Date().getFullYear();
  const month = String(new Date().getMonth() + 1).padStart(2, '0');
  const day = String(new Date().getDate()).padStart(2, '0');
  
  let basePrefix = prefix;
  if (includeDate) {
    basePrefix = `${prefix}-${year}${month}${day}`;
  } else {
    basePrefix = `${prefix}-${year}`;
  }

  let maxNum = 0;

  existingItems.forEach(item => {
    if (item.id && item.id.startsWith(basePrefix)) {
      const parts = item.id.split('-');
      const num = parseInt(parts[parts.length - 1], 10) || 0;
      if (num > maxNum) maxNum = num;
    }
  });

  const nextNum = String(maxNum + 1).padStart(padding, '0');
  return `${basePrefix}-${nextNum}`;
}

/**
 * Generate random ID (for temporary use)
 * @param {number} length - ID length (default 8)
 */
export function generateRandomId(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * Get Current Year Key (YYYY)
 */
export function getFullYearKey(date = new Date()) {
  return String(date.getFullYear());
}

/**
 * Get Month Key (YYYY-MM)
 */
export function getMonthKey(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Get Month Name (1 = January)
 */
export function getMonthName(monthIndex) {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months[monthIndex - 1] || '';
}

/**
 * Get financial year (e.g., "2025-26")
 * @param {Date} date - Date to get financial year for
 */
export function getFinancialYear(date = new Date()) {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  
  // Financial year in Bangladesh: July to June
  if (month >= 7) {
    return `${year}-${String(year + 1).slice(2)}`;
  } else {
    return `${year - 1}-${String(year).slice(2)}`;
  }
}



// ============================================================
// 🔢 NUMBER TO WORDS (BD Format - Enhanced)
// ============================================================

/**
 * Convert number to words (Bangladesh format)
 * Supports up to 99 crore
 * @param {number} num - Number to convert
 * @returns {string} Number in words
 */
export function numberToWords(num) {
  if (num === 0) return 'Zero';
  if (!num) return '';

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  let words = '';
  let originalNum = num;

  // Handle crore (10000000)
  if (num >= 10000000) {
    const crore = Math.floor(num / 10000000);
    words += numberToWords(crore) + ' Crore ';
    num %= 10000000;
  }

  // Handle lakh (100000)
  if (num >= 100000) {
    const lakh = Math.floor(num / 100000);
    words += numberToWords(lakh) + ' Lakh ';
    num %= 100000;
  }

  // Handle thousand (1000)
  if (num >= 1000) {
    const thousand = Math.floor(num / 1000);
    words += numberToWords(thousand) + ' Thousand ';
    num %= 1000;
  }

  // Handle hundred (100)
  if (num >= 100) {
    const hundred = Math.floor(num / 100);
    words += numberToWords(hundred) + ' Hundred ';
    num %= 100;
  }

  // Handle remaining
  if (num > 0) {
    if (words !== '') words += 'and ';

    if (num < 10) words += ones[num];
    else if (num < 20) words += teens[num - 10];
    else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) words += ' ' + ones[num % 10];
    }
  }

  // Clean up extra spaces
  return words.replace(/\s+/g, ' ').trim() + ' Taka Only';
}

/**
 * Convert number to words (short version, no currency)
 */
export function numberToWordsShort(num) {
  const full = numberToWords(num);
  return full.replace(' Taka Only', '');
}



// ============================================================
// ✅ VALIDATION HELPERS (Enhanced)
// ============================================================

/**
 * Validate email address
 * @param {string} email - Email to validate
 * @returns {boolean} Valid or not
 */
export function validateEmail(email) {
  if (!email) return false;
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

/**
 * Validate phone number (Bangladesh format)
 * @param {string} phone - Phone to validate
 * @returns {boolean} Valid or not
 */
export function validatePhone(phone) {
  if (!phone) return false;
  // Bangladesh phone: +8801XXXXXXXXX or 01XXXXXXXXX
  const re = /^(?:\+88|88)?01[3-9]\d{8}$/;
  return re.test(phone.replace(/\s/g, ''));
}

/**
 * Validate NID number
 * @param {string} nid - NID to validate
 * @returns {boolean} Valid or not
 */
export function validateNID(nid) {
  if (!nid) return false;
  // Bangladesh NID: 10 or 17 digits
  const re = /^\d{10}$|^\d{17}$/;
  return re.test(nid);
}

/**
 * Validate date
 * @param {string} dateString - Date to validate
 * @returns {boolean} Valid or not
 */
export function isValidDate(dateString) {
  if (!dateString) return false;
  const date = new Date(dateString);
  return date instanceof Date && !isNaN(date);
}

/**
 * Check if string is empty or only whitespace
 */
export function isEmpty(str) {
  return !str || str.trim().length === 0;
}



// ============================================================
// 🎨 COLOR & STYLE HELPERS
// ============================================================

/**
 * Get status color based on status
 * @param {string} status - Status string
 * @returns {string} Color code or class
 */
export function getStatusColor(status) {
  const colors = {
    'APPROVED': '#28a745',
    'ACTIVE': '#28a745',
    'PENDING': '#ffc107',
    'REJECTED': '#dc3545',
    'DEACTIVE': '#6c757d',
    'RESIGNED': '#dc3545',
    'COMPLETED': '#17a2b8'
  };
  return colors[status] || '#6c757d';
}

/**
 * Get status class for styling
 * @param {string} status - Status string
 * @returns {string} CSS class
 */
export function getStatusClass(status) {
  const classes = {
    'APPROVED': 'st-approved',
    'ACTIVE': 'st-approved',
    'PENDING': 'st-pending',
    'REJECTED': 'st-rejected',
    'DEACTIVE': 'st-rejected',
    'RESIGNED': 'st-rejected',
    'COMPLETED': 'st-success'
  };
  return classes[status] || '';
}



// ============================================================
// 📊 DATA PROCESSING HELPERS
// ============================================================

/**
 * Group array by key
 * @param {Array} array - Array to group
 * @param {string} key - Key to group by
 * @returns {Object} Grouped object
 */
export function groupBy(array, key) {
  return array.reduce((result, item) => {
    const groupKey = item[key];
    if (!result[groupKey]) {
      result[groupKey] = [];
    }
    result[groupKey].push(item);
    return result;
  }, {});
}

/**
 * Sort array by date field
 * @param {Array} array - Array to sort
 * @param {string} dateField - Date field name
 * @param {boolean} ascending - Sort order
 */
export function sortByDate(array, dateField = 'createdAt', ascending = false) {
  return [...array].sort((a, b) => {
    const dateA = new Date(a[dateField] || 0);
    const dateB = new Date(b[dateField] || 0);
    return ascending ? dateA - dateB : dateB - dateA;
  });
}

/**
 * Calculate sum of array field
 * @param {Array} array - Array to sum
 * @param {string} field - Field name
 */
export function sumField(array, field) {
  return array.reduce((sum, item) => sum + Number(item[field] || 0), 0);
}

/**
 * Get unique values from array field
 * @param {Array} array - Array to process
 * @param {string} field - Field name
 */
export function uniqueValues(array, field) {
  return [...new Set(array.map(item => item[field]))];
}



// ============================================================
// 🇧🇩 BANGLADESH SPECIFIC DATA (Enhanced)
// ============================================================

export const BANGLADESH_DIVISIONS = [
  "Dhaka", "Chattogram", "Rajshahi", "Khulna", "Barishal",
  "Sylhet", "Rangpur", "Mymensingh"
];

export const BANGLADESH_DISTRICTS = {
  Dhaka: ["Dhaka", "Gazipur", "Narayanganj", "Tangail", "Manikganj", "Munshiganj"],
  Chattogram: ["Chattogram", "Cox's Bazar", "Comilla", "Noakhali", "Feni", "Rangamati"],
  Rajshahi: ["Rajshahi", "Bogra", "Pabna", "Natore", "Sirajganj"],
  Khulna: ["Khulna", "Jessore", "Satkhira", "Bagerhat", "Jhenaidah"],
  Barishal: ["Barishal", "Patuakhali", "Bhola", "Pirojpur"],
  Sylhet: ["Sylhet", "Moulvibazar", "Habiganj", "Sunamganj"],
  Rangpur: ["Rangpur", "Dinajpur", "Kurigram", "Nilphamari", "Lalmonirhat"],
  Mymensingh: ["Mymensingh", "Netrokona", "Jamalpur", "Sherpur"]
};

export const BANGLADESH_BANKS = [
  "NRB Bank", "Sonali Bank", "Janata Bank", "Agrani Bank", "Rupali Bank",
  "Islami Bank Bangladesh", "Dutch-Bangla Bank", "BRAC Bank", "City Bank",
  "Eastern Bank", "Standard Bank", "Pubali Bank", "Uttara Bank",
  "AB Bank", "Mercantile Bank", "Prime Bank", "Southeast Bank"
];

export const OCCUPATIONS = [
  "Business", "Service", "Government", "Private Sector",
  "Self-Employed", "Student", "Retired", "Homemaker", "Unemployed"
];

export const BLOOD_GROUPS = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];

export const GENDERS = ["Male", "Female", "Other"];

export const MARITAL_STATUS = ["Single", "Married", "Divorced", "Widowed"];

export const MEMBER_TYPES = [
  { value: "FOUNDER", label: "Founder Member (FM)" },
  { value: "REFERENCE", label: "Reference Member (RM)" }
];

export const INVESTMENT_STATUS = [
  { value: "PENDING", label: "Pending", color: "#ffc107" },
  { value: "ACTIVE", label: "Active", color: "#28a745" },
  { value: "COMPLETED", label: "Completed", color: "#17a2b8" },
  { value: "REJECTED", label: "Rejected", color: "#dc3545" }
];



// ============================================================
// 🔧 MISC UTILITIES
// ============================================================

/**
 * Debounce function to limit function calls
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in ms
 */
export function debounce(func, wait = 300) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function to limit execution rate
 * @param {Function} func - Function to throttle
 * @param {number} limit - Limit in ms
 */
export function throttle(func, limit = 300) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 */
export async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showToast('Success', 'Copied to clipboard!', 'success');
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    showToast('Error', 'Failed to copy to clipboard', 'error');
    return false;
  }
}

/**
 * Generate random color
 */
export function randomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

/**
 * Safe JSON parse
 * @param {string} str - JSON string
 * @param {any} fallback - Fallback value
 */
export function safeJSONParse(str, fallback = null) {
  try {
    return JSON.parse(str);
  } catch {
    return fallback;
  }
}

/**
 * Get URL parameters
 */
export function getUrlParams() {
  const params = new URLSearchParams(window.location.search);
  const result = {};
  for (const [key, value] of params) {
    result[key] = value;
  }
  return result;
}



// ============================================================
// 🌍 GLOBAL WINDOW EXPORTS (For Inline HTML usage)
// ============================================================

window.formatMoney = formatMoney;
window.formatDate = formatDate;
window.formatDateTime = formatDateTime;
window.getRelativeTime = getRelativeTime;
window.generateId = generateId;
window.generateRandomId = generateRandomId;
window.getFullYearKey = getFullYearKey;
window.getMonthKey = getMonthKey;
window.getMonthName = getMonthName;
window.getFinancialYear = getFinancialYear;
window.numberToWords = numberToWords;
window.numberToWordsShort = numberToWordsShort;
window.fileToBase64 = fileToBase64;
window.compressImage = compressImage;
window.downloadBase64Image = downloadBase64Image;
window.validateEmail = validateEmail;
window.validatePhone = validatePhone;
window.validateNID = validateNID;
window.isValidDate = isValidDate;
window.isEmpty = isEmpty;
window.getStatusColor = getStatusColor;
window.getStatusClass = getStatusClass;
window.groupBy = groupBy;
window.sortByDate = sortByDate;
window.sumField = sumField;
window.uniqueValues = uniqueValues;
window.debounce = debounce;
window.throttle = throttle;
window.copyToClipboard = copyToClipboard;
window.randomColor = randomColor;
window.safeJSONParse = safeJSONParse;
window.getUrlParams = getUrlParams;
window.showToast = showToast;

// Bangladesh data
window.BANGLADESH_DIVISIONS = BANGLADESH_DIVISIONS;
window.BANGLADESH_DISTRICTS = BANGLADESH_DISTRICTS;
window.BANGLADESH_BANKS = BANGLADESH_BANKS;
window.OCCUPATIONS = OCCUPATIONS;
window.BLOOD_GROUPS = BLOOD_GROUPS;
window.GENDERS = GENDERS;
window.MARITAL_STATUS = MARITAL_STATUS;
window.MEMBER_TYPES = MEMBER_TYPES;
window.INVESTMENT_STATUS = INVESTMENT_STATUS;
