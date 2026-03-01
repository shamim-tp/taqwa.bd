// ============================================================
// 🎯 MODALS MODULE
// IMS ERP V5
// Central Modal Management System
// Fully Responsive - Mobile & PC Optimized
// ============================================================


// ============================================================
// 🎨 MODAL STYLES (Added dynamically)
// ============================================================

const modalStyles = `
  <style>
    /* Modal Container */
    .modalWrap {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7);
      backdrop-filter: blur(8px);
      display: none;
      align-items: center;
      justify-content: center;
      z-index: 99999;
      padding: clamp(15px, 4vw, 30px);
      animation: modalFadeIn 0.3s ease;
    }

    @keyframes modalFadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }

    /* Modal Content */
    .modal {
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border-radius: clamp(20px, 4vw, 30px);
      box-shadow: 0 30px 60px rgba(0, 0, 0, 0.4);
      width: min(1000px, 100%);
      max-height: 90vh;
      overflow-y: auto;
      overflow-x: hidden;
      position: relative;
      animation: modalSlideIn 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 1px solid rgba(255, 255, 255, 0.1);
    }

    @keyframes modalSlideIn {
      from {
        opacity: 0;
        transform: translateY(50px) scale(0.95);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    /* Modal Header */
    .modalHead {
      padding: clamp(18px, 3vw, 25px);
      border-bottom: 1px solid var(--bg-tertiary, #e2e8f0);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 20px;
      background: linear-gradient(135deg, #f8fafc, #ffffff);
      position: sticky;
      top: 0;
      z-index: 10;
    }

    .modalHead h2 {
      margin: 0;
      color: var(--text-primary, #1e293b);
      font-size: clamp(18px, 3vw, 24px);
      font-weight: 800;
      letter-spacing: -0.5px;
    }

    .modalHead p {
      margin: 8px 0 0;
      color: var(--text-secondary, #334155);
      font-size: clamp(12px, 2vw, 14px);
    }

    /* Close Button */
    .closeX {
      padding: 12px 18px;
      border: none;
      background: var(--bg-tertiary, #f1f5f9);
      color: var(--text-primary, #1e293b);
      border-radius: 16px;
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.3s ease;
      min-width: 50px;
      text-align: center;
      border: 1px solid rgba(0,0,0,0.05);
    }

    .closeX:hover {
      background: var(--accent-danger, #ef4444);
      color: white;
      transform: rotate(90deg);
    }

    .closeX:active {
      transform: scale(0.95);
    }

    /* Modal Body */
    .modalBody {
      padding: clamp(18px, 3vw, 25px);
    }

    /* Mobile Optimizations */
    @media (max-width: 640px) {
      .modal {
        max-height: 85vh;
      }

      .modalHead {
        flex-direction: column;
        align-items: stretch;
      }

      .closeX {
        align-self: flex-end;
        padding: 10px 15px;
        font-size: 16px;
      }

      .modalBody {
        padding: 15px;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .closeX:active {
        transform: scale(0.95);
        background: var(--accent-danger, #ef4444);
        color: white;
      }
    }

    /* Modal Sizes */
    .modal.small {
      max-width: 400px;
    }

    .modal.medium {
      max-width: 600px;
    }

    .modal.large {
      max-width: 800px;
    }

    .modal.xlarge {
      max-width: 1000px;
    }

    .modal.full {
      max-width: 1200px;
    }

    /* Modal Footer */
    .modalFooter {
      padding: clamp(15px, 2.5vw, 20px);
      border-top: 1px solid var(--bg-tertiary, #e2e8f0);
      background: linear-gradient(135deg, #f8fafc, #ffffff);
      display: flex;
      justify-content: flex-end;
      gap: 15px;
      flex-wrap: wrap;
      position: sticky;
      bottom: 0;
      z-index: 10;
    }

    .modalFooter .btn {
      padding: 12px 25px;
      border-radius: 12px;
      font-weight: 600;
      font-size: 14px;
      cursor: pointer;
      transition: all 0.3s;
      border: none;
    }

    .modalFooter .btn-primary {
      background: linear-gradient(135deg, #4158D0, #C850C0);
      color: white;
    }

    .modalFooter .btn-secondary {
      background: var(--bg-tertiary, #f1f5f9);
      color: var(--text-primary, #1e293b);
    }

    .modalFooter .btn-danger {
      background: linear-gradient(135deg, #eb5757, #f2994a);
      color: white;
    }

    /* Loading State */
    .modal-loading {
      text-align: center;
      padding: 40px;
    }

    .modal-spinner {
      width: 50px;
      height: 50px;
      border: 4px solid var(--bg-tertiary, #f1f5f9);
      border-top: 4px solid #4158D0;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    /* Modal Transition Classes */
    .modal-enter {
      animation: modalSlideIn 0.3s ease;
    }

    .modal-exit {
      animation: modalFadeOut 0.3s ease;
    }

    @keyframes modalFadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-20px); }
    }
  </style>
`;


// ============================================================
// 📦 MODAL STORAGE
// ============================================================

const modalInstances = new Map();
let modalCounter = 0;


// ============================================================
// 🚀 LOAD ALL MODAL MODULES
// ============================================================

export function loadModalModules() {
  let container = document.getElementById('modalsContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'modalsContainer';
    document.body.appendChild(container);
  }

  // Add modal styles
  const styleEl = document.createElement('style');
  styleEl.textContent = modalStyles;
  document.head.appendChild(styleEl);

  // Load all modal modules
  const modals = [
    'quick-add',
    'system-tools',
    'viewer',
    'deposit-confirm',
    'mr-receipt',
    'company-info',
    'member-profile',
    'investment-details'
  ];

  modals.forEach(modalName => {
    loadModal(modalName);
  });

  setupGlobalModalHandlers();
  
  console.log('✅ Modal modules loaded successfully');
}


// ============================================================
// 📥 LOAD SINGLE MODAL MODULE
// ============================================================

async function loadModal(modalName) {
  try {
    const module = await import(`./${modalName}.js`);
    
    if (module.initializeModal) {
      module.initializeModal();
      modalInstances.set(modalName, {
        name: modalName,
        initialized: true,
        module: module
      });
      console.log(`✅ Modal loaded: ${modalName}`);
    } else {
      console.warn(`⚠️ Modal ${modalName} has no initializeModal function`);
    }
    
  } catch (error) {
    console.error(`❌ Error loading ${modalName} modal:`, error);
    
    // Create fallback modal for missing modules
    createFallbackModal(modalName);
  }
}


// ============================================================
// 🎯 CREATE FALLBACK MODAL
// ============================================================

function createFallbackModal(modalName) {
  const container = document.getElementById('modalsContainer');
  if (!container) return;

  const modalId = `modal${modalName.split('-').map(word => 
    word.charAt(0).toUpperCase() + word.slice(1)
  ).join('')}`;

  const html = `
    <div class="modalWrap" id="${modalId}">
      <div class="modal small">
        <div class="modalHead">
          <div>
            <h2>${modalName.replace('-', ' ').toUpperCase()}</h2>
            <p>Module under development</p>
          </div>
          <button class="closeX">✕</button>
        </div>
        <div class="modalBody" style="text-align: center; padding: 40px;">
          <div style="font-size: 64px; margin-bottom: 20px;">🚧</div>
          <h3 style="color: var(--text-primary); margin-bottom: 10px;">Coming Soon</h3>
          <p style="color: var(--text-secondary);">This feature is under development.</p>
        </div>
        <div class="modalFooter">
          <button class="btn btn-secondary" onclick="closeModal('${modalId}')">Close</button>
        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);
  
  // Add close button listener
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.querySelector('.closeX')?.addEventListener('click', () => closeModal(modalId));
  }
}


// ============================================================
// 🌍 GLOBAL MODAL HANDLERS
// ============================================================

function setupGlobalModalHandlers() {
  // Close on overlay click
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modalWrap')) {
      const modalId = e.target.id;
      if (modalId) {
        closeModal(modalId);
      }
    }
  });

  // Close on Escape key
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const openModals = document.querySelectorAll('.modalWrap[style*="display: flex"]');
      openModals.forEach(modal => {
        if (modal.id) {
          closeModal(modal.id);
        }
      });
    }
  });

  // Handle modal open events
  document.addEventListener('modalopen', (e) => {
    const { modalId, data } = e.detail;
    console.log(`Modal opened: ${modalId}`, data);
    
    // Trigger any modal-specific handlers
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.dispatchEvent(new CustomEvent('modal:opened', { detail: { data } }));
    }
  });

  // Handle modal close events
  document.addEventListener('modalclose', (e) => {
    const { modalId } = e.detail;
    console.log(`Modal closed: ${modalId}`);
    
    // Trigger any modal-specific cleanup
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.dispatchEvent(new CustomEvent('modal:closed'));
    }
  });

  // Prevent body scroll when modal is open
  const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
      if (mutation.attributeName === 'style') {
        const modal = mutation.target;
        if (modal.style.display === 'flex') {
          document.body.style.overflow = 'hidden';
        } else {
          // Check if any other modals are open
          const openModals = document.querySelectorAll('.modalWrap[style*="display: flex"]');
          if (openModals.length === 0) {
            document.body.style.overflow = '';
          }
        }
      }
    });
  });

  // Observe all modals
  document.querySelectorAll('.modalWrap').forEach(modal => {
    observer.observe(modal, { attributes: true });
  });
}


// ============================================================
// 🚪 OPEN MODAL
// ============================================================

export function openModal(modalId, data = null, options = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal not found: ${modalId}`);
    return false;
  }

  // Set modal size if specified
  if (options.size) {
    const modalContent = modal.querySelector('.modal');
    if (modalContent) {
      modalContent.className = `modal ${options.size}`;
    }
  }

  // Show modal with animation
  modal.style.display = 'flex';
  modal.classList.add('modal-enter');
  
  setTimeout(() => {
    modal.classList.remove('modal-enter');
  }, 300);

  // Trigger event
  const event = new CustomEvent('modalopen', { 
    detail: { modalId, data, options } 
  });
  document.dispatchEvent(event);

  return true;
}


// ============================================================
// 🔒 CLOSE MODAL
// ============================================================

export function closeModal(modalId, options = {}) {
  const modal = document.getElementById(modalId);
  if (!modal) {
    console.error(`Modal not found: ${modalId}`);
    return false;
  }

  // Add exit animation
  modal.classList.add('modal-exit');
  
  setTimeout(() => {
    modal.style.display = 'none';
    modal.classList.remove('modal-exit');
    
    // Trigger event
    const event = new CustomEvent('modalclose', { 
      detail: { modalId, options } 
    });
    document.dispatchEvent(event);
    
  }, options.noAnimation ? 0 : 300);

  return true;
}


// ============================================================
// 🔄 CLOSE ALL MODALS
// ============================================================

export function closeAllModals() {
  const modals = document.querySelectorAll('.modalWrap[style*="display: flex"]');
  modals.forEach(modal => {
    if (modal.id) {
      closeModal(modal.id);
    }
  });
}


// ============================================================
// 📊 GET MODAL STATE
// ============================================================

export function isModalOpen(modalId) {
  const modal = document.getElementById(modalId);
  return modal ? modal.style.display === 'flex' : false;
}

export function getOpenModals() {
  const modals = document.querySelectorAll('.modalWrap[style*="display: flex"]');
  return Array.from(modals).map(modal => modal.id);
}


// ============================================================
// 🔧 MODAL UTILITIES
// ============================================================

/**
 * Create a dynamic modal
 * @param {string} title - Modal title
 * @param {string} content - Modal content HTML
 * @param {Object} options - Modal options
 * @returns {string} Modal ID
 */
export function createModal(title, content, options = {}) {
  const container = document.getElementById('modalsContainer');
  if (!container) return null;

  const modalId = `dynamicModal_${++modalCounter}`;
  const size = options.size || 'medium';
  const showFooter = options.showFooter !== false;
  const footerButtons = options.footerButtons || [];

  const footerHTML = showFooter ? `
    <div class="modalFooter">
      ${footerButtons.map(btn => `
        <button class="btn btn-${btn.type || 'secondary'}" 
                onclick="${btn.onClick || 'closeModal(\'' + modalId + '\')'}">
          ${btn.label}
        </button>
      `).join('')}
      <button class="btn btn-secondary" onclick="closeModal('${modalId}')">Close</button>
    </div>
  ` : '';

  const html = `
    <div class="modalWrap" id="${modalId}">
      <div class="modal ${size}">
        <div class="modalHead">
          <div>
            <h2>${title}</h2>
            ${options.subtitle ? `<p>${options.subtitle}</p>` : ''}
          </div>
          <button class="closeX">✕</button>
        </div>
        <div class="modalBody">
          ${content}
        </div>
        ${footerHTML}
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);

  // Add close button listener
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.querySelector('.closeX')?.addEventListener('click', () => closeModal(modalId));
  }

  return modalId;
}


// ============================================================
// 🗑️ REMOVE MODAL
// ============================================================

export function removeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.remove();
    return true;
  }
  return false;
}


// ============================================================
// 🎯 MODAL EVENTS
// ============================================================

export function onModalOpen(modalId, callback) {
  document.addEventListener('modalopen', (e) => {
    if (e.detail.modalId === modalId) {
      callback(e.detail.data);
    }
  });
}

export function onModalClose(modalId, callback) {
  document.addEventListener('modalclose', (e) => {
    if (e.detail.modalId === modalId) {
      callback();
    }
  });
}


// ============================================================
// 📱 MOBILE-SPECIFIC FUNCTIONS
// ============================================================

export function maximizeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    const modalContent = modal.querySelector('.modal');
    if (modalContent) {
      modalContent.classList.add('full');
    }
  }
}

export function restoreModalSize(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    const modalContent = modal.querySelector('.modal');
    if (modalContent) {
      modalContent.classList.remove('full', 'large', 'xlarge');
      modalContent.classList.add('medium');
    }
  }
}


// ============================================================
// 🌍 GLOBAL EXPORTS
// ============================================================

window.openModal = openModal;
window.closeModal = closeModal;
window.closeAllModals = closeAllModals;
window.isModalOpen = isModalOpen;
window.getOpenModals = getOpenModals;
window.createModal = createModal;
window.removeModal = removeModal;


// ============================================================
// 📤 EXPORTS
// ============================================================

export default {
  loadModalModules,
  openModal,
  closeModal,
  closeAllModals,
  isModalOpen,
  getOpenModals,
  createModal,
  removeModal,
  onModalOpen,
  onModalClose,
  maximizeModal,
  restoreModalSize
};
