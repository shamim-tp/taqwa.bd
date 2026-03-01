// ============================================================
// 👁️ VIEWER MODAL MODULE
// IMS ERP V5
// Universal Content Viewer with Zoom & Download Features
// Fully Responsive - Mobile & PC Optimized
// ============================================================

import { openModal, closeModal } from './modals.js';
import { downloadBase64Image, formatDateTime } from '../utils/common.js';


// ============================================================
// 🎨 VIEWER STYLES
// ============================================================

const viewerStyles = `
  <style>
    /* Viewer Container */
    .viewer-container {
      padding: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      height: 100%;
    }

    /* Viewer Toolbar */
    .viewer-toolbar {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 15px 20px;
      background: linear-gradient(135deg, #f8fafc, #ffffff);
      border-bottom: 1px solid var(--bg-tertiary, #e2e8f0);
      flex-wrap: wrap;
      gap: 10px;
    }

    .viewer-toolbar-left {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .viewer-toolbar-right {
      display: flex;
      align-items: center;
      gap: 10px;
      flex-wrap: wrap;
    }

    .viewer-tool-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 12px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.3s ease;
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: var(--bg-secondary, #f8fafc);
      color: var(--text-primary, #1e293b);
      border: 1px solid var(--bg-tertiary, #e2e8f0);
    }

    .viewer-tool-btn:hover {
      background: var(--bg-accent, #eef2ff);
      transform: translateY(-2px);
      box-shadow: 0 5px 15px rgba(0,0,0,0.1);
    }

    .viewer-tool-btn:active {
      transform: translateY(0);
    }

    .viewer-tool-btn.primary {
      background: linear-gradient(135deg, #4158D0, #C850C0);
      color: white;
      border: none;
    }

    .viewer-tool-btn.success {
      background: linear-gradient(135deg, #11998e, #38ef7d);
      color: white;
      border: none;
    }

    .viewer-tool-btn.warning {
      background: linear-gradient(135deg, #f2994a, #f2c94c);
      color: white;
      border: none;
    }

    /* Zoom Controls */
    .zoom-controls {
      display: flex;
      align-items: center;
      gap: 5px;
      background: var(--bg-secondary, #f8fafc);
      border-radius: 30px;
      padding: 4px;
      border: 1px solid var(--bg-tertiary, #e2e8f0);
    }

    .zoom-btn {
      width: 36px;
      height: 36px;
      border: none;
      border-radius: 30px;
      background: white;
      color: var(--text-primary, #1e293b);
      font-size: 18px;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .zoom-btn:hover {
      background: var(--accent-1, #4158D0);
      color: white;
    }

    .zoom-level {
      min-width: 60px;
      text-align: center;
      font-weight: 600;
      color: var(--text-primary, #1e293b);
      font-size: 14px;
    }

    /* Viewer Content Area */
    .viewer-content {
      flex: 1;
      padding: 25px;
      overflow-y: auto;
      background: var(--bg-secondary, #f8fafc);
      min-height: 300px;
      max-height: 60vh;
      transition: all 0.3s ease;
    }

    /* Image Viewer */
    .image-viewer {
      text-align: center;
      transition: transform 0.3s ease;
    }

    .image-viewer img {
      max-width: 100%;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
      border: 2px solid white;
      transition: all 0.3s ease;
      cursor: zoom-in;
    }

    .image-viewer img.zoomed {
      cursor: zoom-out;
      transform: scale(var(--zoom-level, 1.5));
    }

    /* PDF Viewer */
    .pdf-viewer {
      width: 100%;
      height: 600px;
      border: none;
      border-radius: 16px;
      box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    }

    /* Text Viewer */
    .text-viewer {
      background: white;
      padding: 25px;
      border-radius: 16px;
      box-shadow: 0 5px 20px rgba(0,0,0,0.05);
      font-family: monospace;
      white-space: pre-wrap;
      word-wrap: break-word;
      border: 1px solid var(--bg-tertiary, #e2e8f0);
      max-height: 500px;
      overflow-y: auto;
    }

    /* Table Viewer */
    .table-viewer {
      width: 100%;
      border-collapse: collapse;
      background: white;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 5px 20px rgba(0,0,0,0.05);
    }

    .table-viewer th {
      background: var(--bg-secondary, #f8fafc);
      padding: 15px;
      text-align: left;
      font-weight: 700;
      color: var(--text-primary, #1e293b);
      border-bottom: 2px solid var(--bg-tertiary, #e2e8f0);
    }

    .table-viewer td {
      padding: 12px 15px;
      border-bottom: 1px solid var(--bg-tertiary, #e2e8f0);
    }

    .table-viewer tr:last-child td {
      border-bottom: none;
    }

    .table-viewer tr:hover {
      background: var(--bg-accent, #eef2ff);
    }

    /* Metadata Panel */
    .viewer-metadata {
      padding: 15px 20px;
      background: var(--bg-primary, #ffffff);
      border-top: 1px solid var(--bg-tertiary, #e2e8f0);
      font-size: 12px;
      color: var(--text-muted, #64748b);
      display: flex;
      gap: 20px;
      flex-wrap: wrap;
    }

    .metadata-item {
      display: flex;
      align-items: center;
      gap: 5px;
    }

    .metadata-label {
      font-weight: 600;
      color: var(--text-primary, #1e293b);
    }

    /* Mobile Optimizations */
    @media (max-width: 640px) {
      .viewer-toolbar {
        flex-direction: column;
        align-items: stretch;
      }

      .viewer-toolbar-left,
      .viewer-toolbar-right {
        justify-content: center;
      }

      .viewer-tool-btn {
        padding: 6px 12px;
        font-size: 12px;
      }

      .zoom-controls {
        width: 100%;
        justify-content: center;
      }

      .viewer-content {
        padding: 15px;
        max-height: 50vh;
      }

      .viewer-metadata {
        flex-direction: column;
        gap: 8px;
      }

      .pdf-viewer {
        height: 400px;
      }
    }

    /* Touch Device Optimizations */
    @media (hover: none) and (pointer: coarse) {
      .viewer-tool-btn:active {
        transform: scale(0.95);
      }

      .image-viewer img {
        cursor: default;
      }
    }

    /* Fullscreen Mode */
    .viewer-content.fullscreen {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      z-index: 100000;
      max-height: 100vh;
      background: rgba(0,0,0,0.9);
      padding: 40px;
    }

    .viewer-content.fullscreen img {
      max-height: 90vh;
      border: none;
      box-shadow: none;
    }

    /* Loading State */
    .viewer-loading {
      text-align: center;
      padding: 40px;
    }

    .viewer-spinner {
      width: 40px;
      height: 40px;
      border: 4px solid var(--bg-tertiary, #e2e8f0);
      border-top: 4px solid #4158D0;
      border-radius: 50%;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
`;


// ============================================================
// 🏗️ INITIALIZE MODAL
// ============================================================

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;

  // Add styles
  const styleEl = document.createElement('style');
  styleEl.textContent = viewerStyles;
  document.head.appendChild(styleEl);

  const html = `
    <div class="modalWrap" id="modalViewer">
      <div class="modal large">
        <div class="modalHead">
          <div>
            <h2 id="viewerTitle">Viewer</h2>
            <p id="viewerSub">Details Preview</p>
          </div>
          <button class="closeX">✕</button>
        </div>

        <!-- Viewer Toolbar -->
        <div class="viewer-toolbar" id="viewerToolbar" style="display: none;">
          <div class="viewer-toolbar-left">
            <button class="viewer-tool-btn" id="viewerDownloadBtn">
              <span>⬇️</span> Download
            </button>
            <button class="viewer-tool-btn" id="viewerPrintBtn">
              <span>🖨️</span> Print
            </button>
            <button class="viewer-tool-btn" id="viewerCopyBtn">
              <span>📋</span> Copy
            </button>
          </div>
          <div class="viewer-toolbar-right">
            <div class="zoom-controls" id="zoomControls" style="display: none;">
              <button class="zoom-btn" id="zoomOut">−</button>
              <span class="zoom-level" id="zoomLevel">100%</span>
              <button class="zoom-btn" id="zoomIn">+</button>
              <button class="zoom-btn" id="zoomReset">↺</button>
            </div>
            <button class="viewer-tool-btn" id="viewerFullscreenBtn">
              <span>⛶</span> Fullscreen
            </button>
          </div>
        </div>

        <!-- Viewer Content -->
        <div id="viewerBody" class="viewer-content"></div>

        <!-- Metadata Panel -->
        <div class="viewer-metadata" id="viewerMetadata" style="display: none;">
          <div class="metadata-item">
            <span class="metadata-label">Type:</span>
            <span id="viewerType">-</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Size:</span>
            <span id="viewerSize">-</span>
          </div>
          <div class="metadata-item">
            <span class="metadata-label">Modified:</span>
            <span id="viewerModified">-</span>
          </div>
        </div>
      </div>
    </div>
  `;

  container.insertAdjacentHTML('beforeend', html);

  // Close button
  document.querySelector('#modalViewer .closeX')?.addEventListener('click', () => closeModal('modalViewer'));

  // Toolbar buttons
  document.getElementById('viewerDownloadBtn')?.addEventListener('click', downloadCurrentContent);
  document.getElementById('viewerPrintBtn')?.addEventListener('click', printCurrentContent);
  document.getElementById('viewerCopyBtn')?.addEventListener('click', copyCurrentContent);
  document.getElementById('viewerFullscreenBtn')?.addEventListener('click', toggleFullscreen);
  
  // Zoom controls
  document.getElementById('zoomIn')?.addEventListener('click', () => zoomContent('in'));
  document.getElementById('zoomOut')?.addEventListener('click', () => zoomContent('out'));
  document.getElementById('zoomReset')?.addEventListener('click', () => zoomContent('reset'));

  // Keyboard shortcuts
  document.addEventListener('keydown', (e) => {
    if (document.getElementById('modalViewer').style.display === 'flex') {
      if (e.key === '+' || e.key === '=') {
        e.preventDefault();
        zoomContent('in');
      } else if (e.key === '-' || e.key === '_') {
        e.preventDefault();
        zoomContent('out');
      } else if (e.key === '0') {
        e.preventDefault();
        zoomContent('reset');
      } else if (e.key === 'f' || e.key === 'F') {
        e.preventDefault();
        toggleFullscreen();
      }
    }
  });
}


// ============================================================
// 📊 VIEWER STATE
// ============================================================

let currentContent = {
  type: 'text',
  data: null,
  filename: 'download',
  metadata: {}
};

let zoomLevel = 100;
let isFullscreen = false;


// ============================================================
// 🚪 OPEN VIEWER MODAL
// ============================================================

export function openViewerModal(title, subtitle, content, options = {}) {
  const titleEl = document.getElementById('viewerTitle');
  const subEl = document.getElementById('viewerSub');
  const bodyEl = document.getElementById('viewerBody');
  const toolbar = document.getElementById('viewerToolbar');
  const metadata = document.getElementById('viewerMetadata');
  const zoomControls = document.getElementById('zoomControls');

  // Set title and subtitle
  if (titleEl) titleEl.textContent = title || 'Viewer';
  if (subEl) subEl.textContent = subtitle || 'Details Preview';

  // Store current content
  currentContent = {
    type: options.type || detectContentType(content),
    data: content,
    filename: options.filename || 'download',
    metadata: options.metadata || {}
  };

  // Set content
  if (bodyEl) {
    if (currentContent.type === 'image') {
      bodyEl.innerHTML = `<div class="image-viewer">${content}</div>`;
      toolbar.style.display = 'flex';
      zoomControls.style.display = 'flex';
      resetZoom();
    } else if (currentContent.type === 'pdf') {
      bodyEl.innerHTML = content;
      toolbar.style.display = 'flex';
      zoomControls.style.display = 'none';
    } else if (currentContent.type === 'table') {
      bodyEl.innerHTML = `<div class="table-responsive">${content}</div>`;
      toolbar.style.display = 'flex';
      zoomControls.style.display = 'none';
    } else {
      bodyEl.innerHTML = `<div class="text-viewer">${content}</div>`;
      toolbar.style.display = 'flex';
      zoomControls.style.display = 'none';
    }
  }

  // Set metadata
  if (metadata) {
    document.getElementById('viewerType').textContent = currentContent.type.toUpperCase();
    document.getElementById('viewerSize').textContent = currentContent.metadata.size || calculateContentSize(content);
    document.getElementById('viewerModified').textContent = currentContent.metadata.modified || formatDateTime(new Date());
    metadata.style.display = 'flex';
  }

  // Open modal
  openModal('modalViewer');
}


// ============================================================
// 🔍 DETECT CONTENT TYPE
// ============================================================

function detectContentType(content) {
  if (!content) return 'text';

  // Check if it's an image
  if (typeof content === 'string') {
    if (content.startsWith('<img') || content.includes('src=')) {
      return 'image';
    }
    if (content.startsWith('<table') || content.includes('<table')) {
      return 'table';
    }
    if (content.startsWith('<iframe') || content.includes('application/pdf')) {
      return 'pdf';
    }
    if (content.startsWith('data:image') || content.startsWith('blob:')) {
      return 'image';
    }
  }

  return 'text';
}


// ============================================================
// 📏 CALCULATE CONTENT SIZE
// ============================================================

function calculateContentSize(content) {
  if (!content) return '0 KB';
  
  const size = new Blob([content]).size;
  
  if (size < 1024) return size + ' B';
  if (size < 1024 * 1024) return (size / 1024).toFixed(1) + ' KB';
  return (size / (1024 * 1024)).toFixed(1) + ' MB';
}


// ============================================================
// 🔍 ZOOM CONTROLS
// ============================================================

function zoomContent(action) {
  const viewerBody = document.getElementById('viewerBody');
  const zoomLevelEl = document.getElementById('zoomLevel');
  
  if (!viewerBody) return;

  if (action === 'in') {
    zoomLevel = Math.min(zoomLevel + 25, 300);
  } else if (action === 'out') {
    zoomLevel = Math.max(zoomLevel - 25, 50);
  } else if (action === 'reset') {
    zoomLevel = 100;
  }

  if (zoomLevelEl) {
    zoomLevelEl.textContent = zoomLevel + '%';
  }

  // Apply zoom to images
  const images = viewerBody.querySelectorAll('img');
  images.forEach(img => {
    img.style.transform = `scale(${zoomLevel / 100})`;
    img.style.transformOrigin = 'center';
  });

  // Apply zoom to text viewer
  const textViewer = viewerBody.querySelector('.text-viewer');
  if (textViewer) {
    textViewer.style.fontSize = (14 * zoomLevel / 100) + 'px';
  }
}

function resetZoom() {
  zoomLevel = 100;
  const zoomLevelEl = document.getElementById('zoomLevel');
  if (zoomLevelEl) zoomLevelEl.textContent = '100%';
  zoomContent('reset');
}


// ============================================================
// ⛶ FULLSCREEN TOGGLE
// ============================================================

function toggleFullscreen() {
  const viewerBody = document.getElementById('viewerBody');
  const fullscreenBtn = document.getElementById('viewerFullscreenBtn');
  
  if (!viewerBody) return;

  isFullscreen = !isFullscreen;

  if (isFullscreen) {
    viewerBody.classList.add('fullscreen');
    fullscreenBtn.innerHTML = '<span>✕</span> Exit';
    fullscreenBtn.classList.add('warning');
  } else {
    viewerBody.classList.remove('fullscreen');
    fullscreenBtn.innerHTML = '<span>⛶</span> Fullscreen';
    fullscreenBtn.classList.remove('warning');
  }
}


// ============================================================
// ⬇️ DOWNLOAD CONTENT
// ============================================================

function downloadCurrentContent() {
  const { type, data, filename } = currentContent;

  try {
    if (type === 'image') {
      // Extract image src
      const imgMatch = data.match(/src="([^"]+)"/);
      if (imgMatch && imgMatch[1]) {
        downloadBase64Image(imgMatch[1], filename + '.png');
      }
    } else if (type === 'pdf') {
      // For PDF, we need to handle differently
      showToast('Info', 'PDF download not supported directly', 'info');
    } else {
      // Download as text file
      const blob = new Blob([data], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename + '.txt';
      a.click();
      URL.revokeObjectURL(url);
    }

    showToast('Success', 'File downloaded', 'success');
  } catch (error) {
    console.error('Download error:', error);
    showToast('Error', 'Failed to download', 'error');
  }
}


// ============================================================
// 🖨️ PRINT CONTENT
// ============================================================

function printCurrentContent() {
  const { data } = currentContent;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    showToast('Error', 'Please allow pop-ups', 'error');
    return;
  }

  printWindow.document.write(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Print</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 20px; }
        img { max-width: 100%; }
        table { border-collapse: collapse; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background: #f8f9fa; }
      </style>
    </head>
    <body>
      ${data}
    </body>
    </html>
  `);

  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
}


// ============================================================
// 📋 COPY CONTENT
// ============================================================

async function copyCurrentContent() {
  const { data } = currentContent;

  try {
    // Remove HTML tags for plain text copy
    const text = data.replace(/<[^>]*>/g, '');
    await navigator.clipboard.writeText(text);
    showToast('Success', 'Copied to clipboard', 'success');
  } catch (error) {
    console.error('Copy error:', error);
    showToast('Error', 'Failed to copy', 'error');
  }
}


// ============================================================
// 📤 EXPORTS
// ============================================================

export default {
  initializeModal,
  openViewerModal
};
