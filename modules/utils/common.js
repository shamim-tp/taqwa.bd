// ============================================================
// 🏢 IMS ERP V5 – Common Utility Functions
// Central Helper File (No Duplicate, Modular, Reusable)
// ============================================================



// ============================================================
// 🔔 TOAST NOTIFICATION SYSTEM
// ============================================================

/**
 * Show modern toast message
 * @param {string} title - Toast Title
 * @param {string} message - Toast Message
 * @param {string} type - info | success | error | warning
 */
export function showToast(title, message, type = 'info') {
  const wrap = document.getElementById('toastWrap');
  if (!wrap) return;

  const div = document.createElement('div');
  div.className = `toast ${type}`;

  div.innerHTML = `
    <div class="t1">${title}</div>
    <div class="t2">${message}</div>
    <div class="t3">${new Date().toLocaleString()}</div>
  `;

  wrap.appendChild(div);

  // Auto remove after 3.5 seconds
  setTimeout(() => div.remove(), 3500);
}



// ============================================================
// 💰 MONEY & DATE FORMAT HELPERS
// ============================================================

/**
 * Format number to Bangladeshi Taka
 */
export function formatMoney(amount) {
  const num = Number(amount || 0);
  return '৳ ' + num.toLocaleString('en-US');
}

/**
 * Format date (Short)
 */
export function formatDate(dateString) {
  if (!dateString) return 'N/A';

  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

/**
 * Format date & time
 */
export function formatDateTime(dateString) {
  if (!dateString) return 'N/A';

  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}



// ============================================================
// 📂 FILE & IMAGE UTILITIES
// ============================================================

/**
 * Convert file to Base64
 */
export async function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    if (!file) {
      resolve('');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}



/**
 * Compress image before saving
 * @param {File} file
 * @param {number} maxWidth
 * @param {number} quality
 */
export async function compressImage(file, maxWidth = 800, quality = 0.7) {
  return new Promise((resolve) => {

    const reader = new FileReader();
    const img = new Image();

    reader.onload = (e) => img.src = e.target.result;

    img.onload = () => {

      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      let width = img.width;
      let height = img.height;

      // Resize if needed
      if (width > maxWidth) {
        const scale = maxWidth / width;
        width = maxWidth;
        height = height * scale;
      }

      canvas.width = width;
      canvas.height = height;

      ctx.drawImage(img, 0, 0, width, height);

      const compressedBase64 = canvas.toDataURL('image/jpeg', quality);

      resolve(compressedBase64);
    };

    reader.readAsDataURL(file);
  });
}



// ============================================================
// 🆔 ID & DATE KEY GENERATORS
// ============================================================

/**
 * Generate Unique ID
 * Format: PREFIX-YYYY-000001
 */
export function generateId(prefix, existingItems = []) {

  const year = new Date().getFullYear();
  let maxNum = 0;

  existingItems.forEach(item => {
    if (item.id && item.id.startsWith(`${prefix}-${year}`)) {

      const parts = item.id.split('-');

      if (parts.length >= 3) {
        const num = parseInt(parts[2], 10) || 0;
        if (num > maxNum) maxNum = num;
      }
    }
  });

  const nextNum = String(maxNum + 1).padStart(6, '0');

  return `${prefix}-${year}-${nextNum}`;
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



// ============================================================
// 🔢 NUMBER TO WORDS (BD Format)
// ============================================================

export function numberToWords(num) {

  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen',
    'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty',
    'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  if (num === 0) return 'Zero';

  let words = '';

  if (num >= 10000000) {
    words += numberToWords(Math.floor(num / 10000000)) + ' Crore ';
    num %= 10000000;
  }

  if (num >= 100000) {
    words += numberToWords(Math.floor(num / 100000)) + ' Lakh ';
    num %= 100000;
  }

  if (num >= 1000) {
    words += numberToWords(Math.floor(num / 1000)) + ' Thousand ';
    num %= 1000;
  }

  if (num >= 100) {
    words += numberToWords(Math.floor(num / 100)) + ' Hundred ';
    num %= 100;
  }

  if (num > 0) {
    if (words !== '') words += 'and ';

    if (num < 10) words += ones[num];
    else if (num < 20) words += teens[num - 10];
    else {
      words += tens[Math.floor(num / 10)];
      if (num % 10 > 0) words += ' ' + ones[num % 10];
    }
  }

  return words.trim();
}



// ============================================================
// ✅ VALIDATION HELPERS
// ============================================================

export function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

export function validatePhone(phone) {
  const re = /^\+?[1-9]\d{9,14}$/;
  return re.test(phone);
}



// ============================================================
// 🇧🇩 BANGLADESH SPECIFIC DATA
// ============================================================

export const BANGLADESH_DISTRICTS = [
  "Dhaka", "Chattogram", "Khulna", "Rajshahi", "Barishal",
  "Sylhet", "Rangpur", "Mymensingh", "Comilla",
  "Narayanganj", "Gazipur", "Cox's Bazar"
];

export const BANGLADESH_BANKS = [
 "NRB Bank", "Sonali Bank", "Janata Bank", "Agrani Bank", "Rupali Bank",
  "Islami Bank Bangladesh", "Dutch-Bangla Bank",
  "BRAC Bank", "City Bank", "Eastern Bank", "Standard Bank"
];

export const occupationList = [
  "Business", "Service", "Government", "Private Sector",
  "Self-Employed", "Student", "Retired", "Unemployed"
];

export const bloodGroupList = [
  "A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"
];



// ============================================================
// 🌍 GLOBAL WINDOW EXPORTS (For Inline HTML usage)
// ============================================================

window.formatMoney = formatMoney;
window.formatDate = formatDate;        // ⚠ FIXED (আগে ভুল ছিল)
window.formatDateTime = formatDateTime;
window.generateId = generateId;
window.getFullYearKey = getFullYearKey;
window.getMonthKey = getMonthKey;
window.getMonthName = getMonthName;
window.numberToWords = numberToWords;
window.fileToBase64 = fileToBase64;
window.showToast = showToast;
