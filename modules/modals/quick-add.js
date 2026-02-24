import { openModal, closeModal } from './modals.js';
import { navigateTo } from '../auth/session.js';

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;
  const html = `
    <div class="modalWrap" id="modalQuickAdd">
      <div class="modal">
        <div class="modalHead">
          <div><h2>Quick Add</h2><p>Quick actions: Add Member, Add Investment, Add Expense, Send Notice</p></div>
          <button class="closeX">✕</button>
        </div>
        <div class="row row-2">
          <button class="btn success" data-action="addMember">➕ Add Member</button>
          <button class="btn success" data-action="addInvestment">➕ Add Investment</button>
          <button class="btn warn" data-action="addExpense">➕ Add Expense</button>
          <button class="btn primary" data-action="sendNotice">📢 Send Notice</button>
        </div>
        <div class="hr"></div>
        <div class="hint">Quick Add is available for Admin role only.</div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
  
  document.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', function() {
      const action = this.getAttribute('data-action');
      closeModal('modalQuickAdd');
      if (action === 'addMember') navigateTo('admin_members');
      if (action === 'addInvestment') navigateTo('admin_investments');
      if (action === 'addExpense') navigateTo('admin_expenses');
      if (action === 'sendNotice') navigateTo('admin_notices');
    });
  });
  document.querySelector('#modalQuickAdd .closeX')?.addEventListener('click', () => closeModal('modalQuickAdd'));
}

export function openQuickAddModal() {
  openModal('modalQuickAdd');
}