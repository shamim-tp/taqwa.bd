import { openModal, closeModal } from './modals.js';

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;
  const html = `
    <div class="modalWrap" id="modalViewer">
      <div class="modal">
        <div class="modalHead">
          <div><h2 id="viewerTitle">Viewer</h2><p id="viewerSub">Details Preview</p></div>
          <button class="closeX">✕</button>
        </div>
        <div id="viewerBody"></div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
  document.querySelector('#modalViewer .closeX')?.addEventListener('click', () => closeModal('modalViewer'));
}

export function openViewerModal(title, subtitle, content) {
  const titleEl = document.getElementById('viewerTitle');
  const subEl = document.getElementById('viewerSub');
  const bodyEl = document.getElementById('viewerBody');
  if (titleEl) titleEl.textContent = title;
  if (subEl) subEl.textContent = subtitle;
  if (bodyEl) bodyEl.innerHTML = content;
  openModal('modalViewer');
}