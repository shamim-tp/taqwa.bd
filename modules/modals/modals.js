export function loadModalModules() {
  let container = document.getElementById('modalsContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'modalsContainer';
    document.body.appendChild(container);
  }
  loadModal('quick-add');
  loadModal('system-tools');
  loadModal('viewer');
  loadModal('deposit-confirm');
  loadModal('mr-receipt');
  loadModal('company-info');
  setupGlobalModalHandlers();
}

async function loadModal(modalName) {
  try {
    const module = await import(`./${modalName}.js`);
    if (module.initializeModal) module.initializeModal();
  } catch (error) {
    console.error(`Error loading ${modalName} modal:`, error);
  }
}

function setupGlobalModalHandlers() {
  document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modalWrap')) {
      closeModal(e.target.id);
    }
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modalWrap[style*="display: flex"]').forEach(modal => closeModal(modal.id));
    }
  });
}

export function openModal(modalId, data = null) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'flex';
    const event = new CustomEvent('modalopen', { detail: { modalId, data } });
    document.dispatchEvent(event);
  }
}

export function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.style.display = 'none';
    const event = new CustomEvent('modalclose', { detail: { modalId } });
    document.dispatchEvent(event);
  }
}

window.openModal = openModal;
window.closeModal = closeModal;