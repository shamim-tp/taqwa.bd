// ============================================================
// ⚡ QUICK ADD MODAL MODULE
// IMS ERP V5
// Quick actions for adding various items
// Fully Responsive - Mobile & PC Optimized
// ============================================================

import { openModal, closeModal } from './modals.js';
import { navigateTo } from '../auth/session.js';
import { showToast } from '../utils/common.js';


// ============================================================
// 🎨 QUICK ADD STYLES
// ============================================================

const quickAddStyles = `
  <style>
    /* Quick Add Container */
    .quick-add-container {
      padding: 0;
      overflow: hidden;
    }

    /* Quick Actions Grid */
    .quick-actions-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
      gap: 15px;
      padding: 20px;
    }

    /* Quick Action Card */
    .quick-action-card {
      background: linear-gradient(135deg, #ffffff, #f8fafc);
      border-radius: 20px;
      padding: 25px 15px;
      text-align: center;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
      border: 2px solid var(--bg-tertiary, #e2e8f0);
      position: relative;
      overflow: hidden;
    }

    .quick-action-card:hover {
      transform: translateY(-8px) scale(1.02);
      box-shadow: 0 20px 40px rgba(0,0,0,0.1);
      border-color: transparent;
    }

    .quick-action-card::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 5px;
      background: linear-gradient(90deg, #4158D0, #C850C0);
      transform: scaleX(0);
      transition: transform 0.3s ease;
    }

    .quick-action-card:hover::before {
      transform: scaleX(1);
    }

    .quick-action-card.member {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
    }

    .quick-action-card.investment {
      background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
      color: white;
    }

    .quick-action-card.expense {
      background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
      color: white;
    }

    .quick-action-card.notice {
      background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
      color: white;
    }

    .quick-action-card.deposit {
      background: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
      color: white;
    }

    .quick-action-card.profit {
      background: linear-gradient(135deg, #30cfd0 0%, #330867 100%);
      color: white;
    }

    .quick-action-icon {
      font-size: 48px;
      margin-bottom: 15px;
      filter: drop-shadow(0 5px 10px rgba(0,0,0,0.1));
    }

    .quick-action-title {
      font-size: 18px;
      font-weight: 700;
      margin-bottom: 8px;
    }

    .quick-action-desc {
      font-size: 12px;
      opacity: 0.8;
      line-height: 1.4;
    }

    /* Role Badge */
    .role-badge {
      position: absolute;
      top: 10px;
      right: 10px;
      padding: 4px 8px;
      border-radius: 20px;
      font-size: 10px;
      font-weight: 700;
      background: rgba(255,255,255,0.2);
      color: white;
    }

    /* Admin Only Section */
    .admin-only {
      background: linear-gradient(135deg, #fff3cd, #ffeeba);
      border-radius: 16px;
      padding: 15px 20px;
      margin: 0 20px 20px;
      display: flex;
      align-items: center;
      gap: 15px;
      border-left: 5px solid #f39c12;
    }

    .admin-only-icon {
      font-size: 32px;
    }

    .admin-only-text {
      flex: 1;
    }

    .admin-only-title {
      font-weight: 700;
      color: #856404;
      margin-bottom: 4px;
    }

    .admin-only-desc {
      font-size: 12px;
      color: #856404;
    }

    /* Recent Actions */
    .recent-actions {
      padding: 20px;
      border-top: 1px solid var(--bg-tertiary, #e2e8f0);
      background: var(--bg-secondary, #f8fafc);
    }

    .recent-title {
      font-size: 14px;
      font-weight: 700;
      color: var(--text-primary, #1e293b);
      margin-bottom: 15px;
      display: flex;
      align-items: center;
      gap: 8px;
    }

    .recent-list {
      display: flex;
      gap: 10px;
      overflow-x: auto;
      padding-bottom: 10px;
      -webkit-overflow-scrolling: touch;
    }

    .recent-item {
      background: white;
      padding: 10px 15px;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      border: 1px solid var(--bg-tertiary, #e2e8f0);
      white-space: nowrap;
      cursor: pointer;
      transition: all 0.2s;
    }

    .recent-item:hover {
      background: var(--accent-1, #4158D0);
      color: white;
      border-color: transparent;
    }

    .recent-item:active {
      transform: scale(0.95);
    }

    /* Search Box */
    .quick-search {
      padding: 0 20px 20px;
    }

    .quick-search-input {
      width: 100%;
      padding: 15px 20px;
      border: 2px solid var(--bg-tertiary, #e2e8f0);
      border-radius: 50px;
      font-size: 14px;
      transition: all 0.3s;
      background: var(--bg-primary, #ffffff);
    }

    .quick-search-input:focus {
      border-color: #4158D0;
      outline: none;
      box-shadow: 0 0 0 4px rgba(65,88,208,0.1);
    }

    .quick-search-input::placeholder {
      color: var(--text-muted, #64748b);
    }

    /* Category Tabs */
    .category-tabs {
      display: flex;
      gap: 10px;
      padding: 0 20px 20px;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
    }

    .category-tab {
      padding: 8px 20px;
      border: 2px solid var(--bg-tertiary, #e2e8f0);
      border-radius: 30px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      white-space: nowrap;
      background: white;
      color: var(--text-primary, #1e293b);
    }

    .category-tab.active {
      background: linear-gradient(135deg, #4158D0, #C850C0);
      color: white;
      border-color: transparent;
    }

    .category-tab:hover {
      background: var(--bg-accent, #eef2ff);
    }

    /* Mobile Optimizations */
    @media (max-width: 640px) {
      .quick-actions-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 10px;
        padding: 15px;
      }

      .quick-action-card {
        padding: 20px 10px;
      }

      .quick-action-icon {
        font-size: 36px;
      }

      .quick-action-title {
        font-size: 14px;
      }

      .quick-action-desc {
        font-size: 10px;
      }

      .admin-only {
        flex-direction: column;
        text-align: center;
        margin: 0 15px 15px;
      }

      .recent-list {
        gap: 8px;
      }

      .recent-item {
        padding: 8px 12px;
        font-size: 11px;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .quick-action-card:active {
        transform: scale(0.95);
      }

      .recent-item:active {
        transform: scale(0.95);
      }
    }

    /* Animation */
    @keyframes cardPulse {
      0% { transform: scale(1); }
      50% { transform: scale(1.02); }
      100% { transform: scale(1); }
    }

    .quick-action-card.new {
      animation: cardPulse 2s infinite;
    }
  </style>
`;


// ============================================================
// 📦 ACTION DEFINITIONS
// ============================================================

const ACTIONS = {
  // Admin Actions
  admin: [
    {
      id: 'addMember',
      title: 'Add Member',
      desc: 'Create new member profile',
      icon: '👥',
      color: 'member',
      page: 'admin_members',
      role: 'admin'
    },
    {
      id: 'addInvestment',
      title: 'Add Investment',
      desc: 'Create new investment project',
      icon: '📈',
      color: 'investment',
      page: 'admin_investments',
      role: 'admin'
    },
    {
      id: 'addExpense',
      title: 'Add Expense',
      desc: 'Record new expense',
      icon: '💸',
      color: 'expense',
      page: 'admin_expenses',
      role: 'admin'
    },
    {
      id: 'sendNotice',
      title: 'Send Notice',
      desc: 'Broadcast system notice',
      icon: '📢',
      color: 'notice',
      page: 'admin_notices',
      role: 'admin'
    },
    {
      id: 'addDeposit',
      title: 'Add Deposit',
      desc: 'Record member deposit',
      icon: '💰',
      color: 'deposit',
      page: 'admin_deposits',
      role: 'admin'
    },
    {
      id: 'distributeProfit',
      title: 'Distribute Profit',
      desc: 'Distribute profit to members',
      icon: '🎯',
      color: 'profit',
      page: 'admin_profit',
      role: 'admin'
    }
  ],

  // Member Actions
  member: [
    {
      id: 'submitDeposit',
      title: 'Submit Deposit',
      desc: 'Submit monthly deposit',
      icon: '💰',
      color: 'deposit',
      page: 'member_deposit',
      role: 'member'
    },
    {
      id: 'viewHistory',
      title: 'Deposit History',
      desc: 'View your deposit history',
      icon: '📜',
      color: 'notice',
      page: 'member_deposit_history',
      role: 'member'
    },
    {
      id: 'updateProfile',
      title: 'Update Profile',
      desc: 'Edit your profile',
      icon: '👤',
      color: 'member',
      page: 'member_profile',
      role: 'member'
    },
    {
      id: 'viewProfit',
      title: 'My Profit',
      desc: 'View profit earnings',
      icon: '💰',
      color: 'profit',
      page: 'member_profit',
      role: 'member'
    },
    {
      id: 'viewInvestments',
      title: 'Investments',
      desc: 'View company investments',
      icon: '📈',
      color: 'investment',
      page: 'member_investments',
      role: 'member'
    },
    {
      id: 'viewNotices',
      title: 'Notices',
      desc: 'View system notices',
      icon: '📢',
      color: 'notice',
      page: 'member_notices',
      role: 'member'
    }
  ]
};


// ============================================================
// 🏗️ INITIALIZE MODAL
// ============================================================

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;

  // Add styles
  const styleEl = document.createElement('style');
  styleEl.textContent = quickAddStyles;
  document.head.appendChild(styleEl);

  const currentUser = window.SESSION?.user || { role: 'admin' };
  const isAdmin = currentUser.role === 'Admin';

  const html = `
    <div class="modalWrap" id="modalQuickAdd">
      <div class="modal medium">
        <div class="modalHead">
          <div>
            <h2>⚡ Quick Actions</h2>
            <p>Quickly add or access different modules</p>
          </div>
          <button class="closeX">✕</button>
        </div>

        <!-- Role-based message -->
        ${!isAdmin ? `
          <div class="admin-only">
            <div class="admin-only-icon">ℹ️</div>
            <div class="admin-only-text">
              <div class="admin-only-title">Member Quick Actions</div>
              <div class="admin-only-desc">You have access to member-specific actions only</div>
            </div>
          </div>
        ` : ''}

        <!-- Search Box -->
        <div class="quick-search">
          <input type="text" class="quick-search-input" id="quickSearch" 
                 placeholder="🔍 Search actions..." autocomplete="off">
        </div>

        <!-- Category Tabs (Admin only) -->
        ${isAdmin ? `
          <div class="category-tabs" id="categoryTabs">
            <button class="category-tab active" data-category="all">All</button>
            <button class="category-tab" data-category="member">Members</button>
            <button class="category-tab" data-category="investment">Investments</button>
            <button class="category-tab" data-category="expense">Expenses</button>
            <button class="category-tab" data-category="notice">Notices</button>
            <button class="category-tab" data-category="deposit">Deposits</button>
            <button class="category-tab" data-category="profit">Profit</button>
          </div>
        ` : ''}

        <!-- Actions Grid -->
        <div class="quick-actions-grid" id="quickActionsGrid">
          ${generateActionCards(isAdmin)}
        </div>

        <!-- Recent Actions -->
        <div class="recent-actions">
          <div class="recent-title">
            <span>⏱️</span> Recent Actions
          </div>
          <div class="recent-list" id="recentActionsList">
            ${renderRecentActions()}
          </div>
        </div>

        <!-- Hint -->
        <div class="hint" style="margin: 0 20px 20px;">
          <strong>💡 Tip:</strong> Click on any action to quickly navigate. Recent actions are saved for quick access.
        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);

  // Close button
  document.querySelector('#modalQuickAdd .closeX')?.addEventListener('click', () => closeModal('modalQuickAdd'));

  // Action buttons
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.getAttribute('data-action');
      const page = this.getAttribute('data-page');
      
      closeModal('modalQuickAdd');
      
      if (page) {
        // Save to recent actions
        saveRecentAction(action, this.querySelector('.quick-action-title')?.textContent || action);
        navigateTo(page);
      }
    });
  });

  // Search functionality
  const searchInput = document.getElementById('quickSearch');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      filterActions(e.target.value.toLowerCase());
    });
  }

  // Category tabs (Admin only)
  if (isAdmin) {
    document.querySelectorAll('.category-tab').forEach(tab => {
      tab.addEventListener('click', function() {
        document.querySelectorAll('.category-tab').forEach(t => t.classList.remove('active'));
        this.classList.add('active');
        filterByCategory(this.dataset.category);
      });
    });
  }

  // Recent actions click handlers
  document.querySelectorAll('.recent-item').forEach(item => {
    item.addEventListener('click', function() {
      const action = this.dataset.action;
      const page = this.dataset.page;
      if (page) {
        closeModal('modalQuickAdd');
        navigateTo(page);
      }
    });
  });
}


// ============================================================
// 🃏 GENERATE ACTION CARDS
// ============================================================

function generateActionCards(isAdmin) {
  const actions = isAdmin ? ACTIONS.admin : ACTIONS.member;
  
  return actions.map(action => `
    <div class="quick-action-card ${action.color}" 
         data-action="${action.id}"
         data-page="${action.page}"
         data-category="${action.id.replace('add', '').toLowerCase()}"
         data-role="${action.role}"
         data-search="${action.title} ${action.desc}">
      <div class="quick-action-icon">${action.icon}</div>
      <div class="quick-action-title">${action.title}</div>
      <div class="quick-action-desc">${action.desc}</div>
      <div class="role-badge">${action.role === 'admin' ? '👑' : '👤'}</div>
    </div>
  `).join('');
}


// ============================================================
// 🔍 FILTER ACTIONS BY SEARCH
// ============================================================

function filterActions(searchTerm) {
  const cards = document.querySelectorAll('.quick-action-card');
  
  cards.forEach(card => {
    const searchText = card.dataset.search || '';
    if (searchText.toLowerCase().includes(searchTerm) || searchTerm === '') {
      card.style.display = '';
    } else {
      card.style.display = 'none';
    }
  });
}


// ============================================================
// 🏷️ FILTER BY CATEGORY
// ============================================================

function filterByCategory(category) {
  const cards = document.querySelectorAll('.quick-action-card');
  
  cards.forEach(card => {
    if (category === 'all') {
      card.style.display = '';
    } else {
      const cardCategory = card.dataset.category;
      if (cardCategory && cardCategory.includes(category)) {
        card.style.display = '';
      } else {
        card.style.display = 'none';
      }
    }
  });
}


// ============================================================
// ⏱️ RECENT ACTIONS
// ============================================================

const RECENT_ACTIONS_KEY = 'ims_quick_add_recent';

function saveRecentAction(actionId, actionName) {
  try {
    let recent = JSON.parse(localStorage.getItem(RECENT_ACTIONS_KEY) || '[]');
    
    // Remove if already exists
    recent = recent.filter(a => a.id !== actionId);
    
    // Add to beginning
    recent.unshift({ id: actionId, name: actionName, timestamp: Date.now() });
    
    // Keep only last 10
    recent = recent.slice(0, 10);
    
    localStorage.setItem(RECENT_ACTIONS_KEY, JSON.stringify(recent));
    
    // Update UI if modal is open
    updateRecentActionsList();
  } catch (error) {
    console.error('Error saving recent action:', error);
  }
}

function renderRecentActions() {
  try {
    const recent = JSON.parse(localStorage.getItem(RECENT_ACTIONS_KEY) || '[]');
    
    if (recent.length === 0) {
      return '<div style="color: var(--text-muted); padding: 10px;">No recent actions</div>';
    }
    
    return recent.map(action => {
      // Find action details
      let page = '';
      const allActions = [...ACTIONS.admin, ...ACTIONS.member];
      const found = allActions.find(a => a.id === action.id);
      if (found) page = found.page;
      
      return `
        <div class="recent-item" data-action="${action.id}" data-page="${page}">
          ${action.name}
        </div>
      `;
    }).join('');
  } catch (error) {
    console.error('Error rendering recent actions:', error);
    return '<div style="color: var(--text-muted); padding: 10px;">Error loading recent actions</div>';
  }
}

function updateRecentActionsList() {
  const list = document.getElementById('recentActionsList');
  if (list) {
    list.innerHTML = renderRecentActions();
    
    // Re-attach click handlers
    list.querySelectorAll('.recent-item').forEach(item => {
      item.addEventListener('click', function() {
        const action = this.dataset.action;
        const page = this.dataset.page;
        if (page) {
          closeModal('modalQuickAdd');
          navigateTo(page);
        }
      });
    });
  }
}


// ============================================================
// 🚪 OPEN QUICK ADD MODAL
// ============================================================

export function openQuickAddModal() {
  // Check user role and show appropriate message
  const currentUser = window.SESSION?.user;
  const isAdmin = currentUser?.role === 'Admin';
  
  if (!isAdmin) {
    showToast('Info', 'Member Quick Actions', 'info');
  }
  
  openModal('modalQuickAdd');
}


// ============================================================
// 📤 EXPORTS
// ============================================================

export default {
  initializeModal,
  openQuickAddModal
};
