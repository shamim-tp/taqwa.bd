import { openModal, closeModal } from './modals.js';

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;
  const html = `
    <div class="modalWrap" id="modalDepositConfirm">
      <div class="modal">
        <div class="modalHead">
          <div><h2>Confirm Deposit Submission</h2><p>Please verify your deposit information before submitting</p></div>
          <button class="closeX">✕</button>
        </div>
        <div id="depositConfirmContent"></div>
        <div class="hr"></div>
        <div class="row row-2">
          <button class="btn" id="cancelDepositConfirmBtn">Cancel</button>
          <button class="btn success" id="confirmDepositBtn">Confirm & Submit</button>
        </div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
  
  document.querySelector('#modalDepositConfirm .closeX')?.addEventListener('click', () => closeModal('modalDepositConfirm'));
  document.getElementById('cancelDepositConfirmBtn')?.addEventListener('click', () => closeModal('modalDepositConfirm'));
}

export function openDepositConfirmModal(content, onConfirm) {
  document.getElementById('depositConfirmContent').innerHTML = content;
  const confirmBtn = document.getElementById('confirmDepositBtn');
  // Remove previous listeners
  const newBtn = confirmBtn.cloneNode(true);
  confirmBtn.parentNode.replaceChild(newBtn, confirmBtn);
  newBtn.addEventListener('click', async () => {
    await onConfirm();
    closeModal('modalDepositConfirm');
  });
  openModal('modalDepositConfirm');
}