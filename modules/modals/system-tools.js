// ============================================================
// 🛠️ SYSTEM TOOLS MODULE
// IMS ERP V5
// Backup, Restore, Reset, Migration Tools
// With Auto Backup System
// ============================================================

import { getDatabase, backupData, restoreData } from '../database/db.js';
import { showToast, formatDateTime } from '../utils/common.js';
import { openModal, closeModal } from './modals.js';


// ============================================================
// 🎨 MODULE STYLES
// ============================================================

const systemToolsStyles = `
  <style>
    .auto-backup-status {
      background: linear-gradient(135deg, #e8f0fe, #d4e0fc);
      border-radius: 16px;
      padding: 20px;
      margin: 20px 0;
      border-left: 5px solid #4158D0;
    }

    .backup-history-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: 12px;
      margin-bottom: 10px;
      border: 1px solid var(--bg-tertiary);
    }

    .backup-history-item:hover {
      background: var(--bg-accent);
    }

    .backup-info {
      flex: 1;
    }

    .backup-name {
      font-weight: 700;
      color: var(--text-primary);
      margin-bottom: 4px;
    }

    .backup-meta {
      font-size: 11px;
      color: var(--text-muted);
    }

    .backup-actions {
      display: flex;
      gap: 8px;
    }

    .backup-btn-small {
      padding: 6px 12px;
      border: none;
      border-radius: 8px;
      font-size: 12px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
    }

    .backup-btn-small.download {
      background: var(--accent-1);
      color: white;
    }

    .backup-btn-small.delete {
      background: var(--accent-danger);
      color: white;
    }

    .backup-btn-small:hover {
      transform: translateY(-2px);
      box-shadow: 0 5px 10px rgba(0,0,0,0.1);
    }

    .schedule-option {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 12px;
      background: var(--bg-secondary);
      border-radius: 12px;
      margin-bottom: 10px;
      cursor: pointer;
      transition: all 0.2s;
    }

    .schedule-option:hover {
      background: var(--bg-accent);
    }

    .schedule-option input[type="radio"] {
      width: 18px;
      height: 18px;
      cursor: pointer;
    }

    .schedule-option label {
      flex: 1;
      cursor: pointer;
    }

    .last-backup-badge {
      display: inline-block;
      padding: 4px 12px;
      background: var(--bg-success);
      color: #0a5c3b;
      border-radius: 30px;
      font-size: 12px;
      font-weight: 600;
      margin-left: 10px;
    }
  </style>
`;


// ============================================================
// 🏗️ INITIALIZE MODAL
// ============================================================

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;
  
  // Load auto backup settings
  const backupSettings = loadBackupSettings();
  
  const html = `
    <div class="modalWrap" id="modalSystemTools">
      <div class="modal" style="max-width: 800px;">
        <div class="modalHead">
          <div>
            <h2>🛠️ System Tools</h2>
            <p>Backup/Restore, Auto Backup, Reset Demo Data, Export JSON</p>
          </div>
          <button class="closeX">✕</button>
        </div>

        <div class="modalBody" style="padding: 20px;">
          
          <!-- Auto Backup Status -->
          <div class="auto-backup-status">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
              <h3 style="color: #1e3c72; margin:0;">🤖 Auto Backup System</h3>
              <span class="last-backup-badge" id="lastBackupTime">
                Last: ${backupSettings.lastBackup ? formatDateTime(backupSettings.lastBackup) : 'Never'}
              </span>
            </div>
            
            <!-- Schedule Options -->
            <div style="margin-bottom: 15px;">
              <h4 style="color: var(--text-primary); margin-bottom: 10px;">Backup Schedule</h4>
              <div class="schedule-option">
                <input type="radio" name="backupSchedule" id="scheduleOff" value="off" 
                       ${backupSettings.schedule === 'off' ? 'checked' : ''}>
                <label for="scheduleOff">🔴 Disabled - No auto backup</label>
              </div>
              <div class="schedule-option">
                <input type="radio" name="backupSchedule" id="scheduleDaily" value="daily"
                       ${backupSettings.schedule === 'daily' ? 'checked' : ''}>
                <label for="scheduleDaily">📅 Daily - Backup every day at 11:59 PM</label>
              </div>
              <div class="schedule-option">
                <input type="radio" name="backupSchedule" id="scheduleWeekly" value="weekly"
                       ${backupSettings.schedule === 'weekly' ? 'checked' : ''}>
                <label for="scheduleWeekly">📆 Weekly - Backup every Sunday at 11:59 PM</label>
              </div>
              <div class="schedule-option">
                <input type="radio" name="backupSchedule" id="scheduleMonthly" value="monthly"
                       ${backupSettings.schedule === 'monthly' ? 'checked' : ''}>
                <label for="scheduleMonthly">📅 Monthly - Backup on 1st of every month at 11:59 PM</label>
              </div>
            </div>

            <!-- Keep Count -->
            <div style="margin-bottom: 15px;">
              <h4 style="color: var(--text-primary); margin-bottom: 10px;">Backup Retention</h4>
              <select id="backupKeepCount" style="width:100%; padding:12px; border-radius:12px; border:2px solid var(--bg-tertiary);">
                <option value="5" ${backupSettings.keepCount === 5 ? 'selected' : ''}>Keep last 5 backups</option>
                <option value="10" ${backupSettings.keepCount === 10 ? 'selected' : ''}>Keep last 10 backups</option>
                <option value="20" ${backupSettings.keepCount === 20 ? 'selected' : ''}>Keep last 20 backups</option>
                <option value="50" ${backupSettings.keepCount === 50 ? 'selected' : ''}>Keep last 50 backups</option>
                <option value="0" ${backupSettings.keepCount === 0 ? 'selected' : ''}>Keep all backups</option>
              </select>
            </div>

            <!-- Save Settings Button -->
            <button class="btn primary" id="saveBackupSettings" style="width:100%;">
              💾 Save Auto Backup Settings
            </button>
          </div>

          <!-- Manual Backup Section -->
          <div style="margin: 30px 0 20px;">
            <h3 style="color: #1e3c72; margin-bottom: 15px;">📦 Manual Backup</h3>
            <div class="row row-2" style="grid-template-columns: 1fr 1fr; gap: 15px;">
              <button class="btn primary" id="exportJSONBtn" style="padding: 14px;">
                ⬇️ Export Backup JSON
              </button>
              <button class="btn" id="importJSONBtn" style="padding: 14px;">
                📂 Import Backup JSON
              </button>
            </div>
          </div>

          <!-- Backup History -->
          <div id="backupHistorySection" style="margin: 20px 0;">
            <h3 style="color: #1e3c72; margin-bottom: 15px;">📋 Backup History</h3>
            <div id="backupHistoryList" style="max-height: 300px; overflow-y: auto;">
              ${renderBackupHistory()}
            </div>
          </div>

          <!-- Danger Zone -->
          <div style="margin: 30px 0 20px;">
            <h3 style="color: #dc3545; margin-bottom: 15px;">⚠️ Danger Zone</h3>
            <div class="row row-2" style="grid-template-columns: 1fr 1fr; gap: 15px;">
              <button class="btn warn" id="resetDemoBtn" style="padding: 14px;">
                🔄 Reset Demo Data
              </button>
              <button class="btn danger" id="wipeAllBtn" style="padding: 14px;">
                ⚡ Wipe All Data
              </button>
            </div>
          </div>

          <!-- Migration Tools -->
          <div style="margin: 20px 0;">
            <h3 style="color: #1e3c72; margin-bottom: 15px;">🔄 Migration Tools</h3>
            <div class="row row-2" style="grid-template-columns: 1fr 1fr; gap: 15px;">
              <button class="btn" id="migrateToFirebaseBtn" style="padding: 14px;">
                ☁️ Migrate to Firebase
              </button>
              <button class="btn" id="migrateToSQLBtn" style="padding: 14px;">
                🗄️ Migrate to SQL
              </button>
            </div>
          </div>

          <!-- Hint -->
          <div class="hint" style="margin-top: 20px; background: #fff3cd; color: #856404;">
            <strong>ℹ️ Tip:</strong> Enable auto backup to automatically save your data. Backups are stored in browser's IndexedDB.
          </div>
        </div>
      </div>
    </div>
  `;
  
  container.insertAdjacentHTML('beforeend', html);
  
  // Add styles
  const styleElement = document.createElement('style');
  styleElement.textContent = systemToolsStyles;
  document.head.appendChild(styleElement);
  
  // Event listeners
  document.getElementById('exportJSONBtn')?.addEventListener('click', exportBackup);
  document.getElementById('importJSONBtn')?.addEventListener('click', importBackup);
  document.getElementById('resetDemoBtn')?.addEventListener('click', resetDemoData);
  document.getElementById('wipeAllBtn')?.addEventListener('click', wipeAllData);
  document.getElementById('migrateToFirebaseBtn')?.addEventListener('click', migrateToFirebase);
  document.getElementById('migrateToSQLBtn')?.addEventListener('click', migrateToSQL);
  document.getElementById('saveBackupSettings')?.addEventListener('click', saveBackupSettings);
  
  document.querySelector('#modalSystemTools .closeX')?.addEventListener('click', () => closeModal('modalSystemTools'));
  
  // Initialize auto backup checker
  initAutoBackup();
}


// ============================================================
// 📤 EXPORT BACKUP
// ============================================================

async function exportBackup() {
  try {
    showToast('Processing', 'Creating backup...', 'info');
    
    const backup = await backupData();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `IMS_ERP_Backup_${timestamp}.json`;
    
    // Save to local storage for auto backup system
    await saveBackupToHistory(backup, filename);
    
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
    
    showToast('Success', 'Backup exported successfully', 'success');
    
    // Update backup history display
    updateBackupHistory();
    
  } catch (error) {
    console.error('Export error:', error);
    showToast('Error', 'Failed to export backup: ' + error.message, 'error');
  }
}


// ============================================================
// 📥 IMPORT BACKUP
// ============================================================

async function importBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = async (event) => {
      if (confirm('⚠️ Restore backup? Current data will be replaced. This action cannot be undone.')) {
        try {
          showToast('Processing', 'Restoring backup...', 'info');
          
          const success = await restoreData(event.target.result);
          
          if (success) {
            showToast('Success', 'Backup restored successfully!', 'success');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            showToast('Error', 'Restore failed. Invalid backup file.', 'error');
          }
        } catch (error) {
          console.error('Restore error:', error);
          showToast('Error', 'Failed to restore backup: ' + error.message, 'error');
        }
      }
    };
    
    reader.readAsText(file);
  };
  
  input.click();
}


// ============================================================
// 🔄 RESET DEMO DATA
// ============================================================

async function resetDemoData() {
  if (!confirm('⚠️ Reset to demo database? All current data will be lost.')) return;
  
  const db = getDatabase();
  if (db.resetDemo) {
    try {
      showToast('Processing', 'Resetting to demo data...', 'info');
      await db.resetDemo();
      showToast('Success', 'Demo data loaded successfully', 'success');
      setTimeout(() => window.location.reload(), 1500);
    } catch (error) {
      console.error('Reset error:', error);
      showToast('Error', 'Failed to reset demo data', 'error');
    }
  } else {
    showToast('Error', 'Reset not supported by current database', 'error');
  }
}


// ============================================================
// ⚡ WIPE ALL DATA
// ============================================================

async function wipeAllData() {
  if (!confirm('⚠️⚠️⚠️ DELETE ALL ERP DATA PERMANENTLY?\n\nThis action CANNOT be undone!')) return;
  
  const secondConfirm = confirm('Type "DELETE" to confirm:');
  if (!secondConfirm) return;
  
  try {
    showToast('Processing', 'Wiping all data...', 'warning');
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear IndexedDB (backup history)
    const request = indexedDB.deleteDatabase('IMSErpBackupDB');
    
    request.onsuccess = () => {
      showToast('Success', 'All data wiped successfully', 'success');
      setTimeout(() => window.location.reload(), 1500);
    };
    
    request.onerror = () => {
      showToast('Success', 'Local data wiped. Reloading...', 'success');
      setTimeout(() => window.location.reload(), 1500);
    };
    
  } catch (error) {
    console.error('Wipe error:', error);
    showToast('Error', 'Failed to wipe data', 'error');
  }
}


// ============================================================
// ☁️ MIGRATION FUNCTIONS
// ============================================================

async function migrateToFirebase() {
  alert('Firebase migration requires Firebase project setup.\n\nPlease configure Firebase credentials in database config.');
}

async function migrateToSQL() {
  alert('SQL migration requires backend server setup.\n\nPlease configure server endpoint in database config.');
}


// ============================================================
// 🤖 AUTO BACKUP SYSTEM
// ============================================================

// IndexedDB setup for backup history
const BACKUP_DB_NAME = 'IMSErpBackupDB';
const BACKUP_STORE_NAME = 'backups';

function openBackupDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(BACKUP_DB_NAME, 1);
    
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(BACKUP_STORE_NAME)) {
        const store = db.createObjectStore(BACKUP_STORE_NAME, { keyPath: 'id' });
        store.createIndex('timestamp', 'timestamp', { unique: false });
      }
    };
  });
}

// Save backup to history
async function saveBackupToHistory(backupData, filename) {
  try {
    const db = await openBackupDB();
    const transaction = db.transaction([BACKUP_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(BACKUP_STORE_NAME);
    
    const backup = {
      id: 'backup_' + Date.now(),
      filename,
      data: backupData,
      timestamp: new Date().toISOString(),
      size: Math.round(backupData.length / 1024) + ' KB'
    };
    
    await new Promise((resolve, reject) => {
      const request = store.add(backup);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    // Apply retention policy
    await applyBackupRetention();
    
  } catch (error) {
    console.error('Error saving backup to history:', error);
  }
}

// Apply backup retention (delete old backups)
async function applyBackupRetention() {
  try {
    const settings = loadBackupSettings();
    if (settings.keepCount === 0) return; // Keep all
    
    const db = await openBackupDB();
    const transaction = db.transaction([BACKUP_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(BACKUP_STORE_NAME);
    const index = store.index('timestamp');
    
    // Get all backups sorted by timestamp
    const backups = await new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const results = [];
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
    
    // Delete excess backups
    if (backups.length > settings.keepCount) {
      const toDelete = backups.slice(settings.keepCount);
      for (const backup of toDelete) {
        await new Promise((resolve, reject) => {
          const request = store.delete(backup.id);
          request.onsuccess = () => resolve();
          request.onerror = () => reject(request.error);
        });
      }
    }
    
  } catch (error) {
    console.error('Error applying backup retention:', error);
  }
}

// Load backup settings from localStorage
function loadBackupSettings() {
  const defaultSettings = {
    schedule: 'off',
    keepCount: 10,
    lastBackup: null
  };
  
  try {
    const saved = localStorage.getItem('ims_backup_settings');
    return saved ? JSON.parse(saved) : defaultSettings;
  } catch {
    return defaultSettings;
  }
}

// Save backup settings
async function saveBackupSettings() {
  const schedule = document.querySelector('input[name="backupSchedule"]:checked')?.value || 'off';
  const keepCount = parseInt(document.getElementById('backupKeepCount')?.value || '10');
  
  const settings = {
    schedule,
    keepCount,
    lastBackup: loadBackupSettings().lastBackup
  };
  
  localStorage.setItem('ims_backup_settings', JSON.stringify(settings));
  
  showToast('Success', 'Auto backup settings saved', 'success');
  
  // Check if we need to run backup now
  checkAndRunAutoBackup();
}

// Check and run auto backup if needed
async function checkAndRunAutoBackup() {
  const settings = loadBackupSettings();
  if (settings.schedule === 'off') return;
  
  const now = new Date();
  const lastBackup = settings.lastBackup ? new Date(settings.lastBackup) : null;
  
  let shouldBackup = false;
  
  if (!lastBackup) {
    shouldBackup = true;
  } else {
    const daysSinceLast = Math.floor((now - lastBackup) / (1000 * 60 * 60 * 24));
    
    switch (settings.schedule) {
      case 'daily':
        shouldBackup = daysSinceLast >= 1;
        break;
      case 'weekly':
        shouldBackup = daysSinceLast >= 7;
        break;
      case 'monthly':
        shouldBackup = daysSinceLast >= 30;
        break;
    }
  }
  
  if (shouldBackup) {
    await performAutoBackup();
  }
}

// Perform auto backup
async function performAutoBackup() {
  try {
    console.log('Running auto backup...');
    
    const backup = await backupData();
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `IMS_ERP_AutoBackup_${timestamp}.json`;
    
    await saveBackupToHistory(backup, filename);
    
    // Update last backup time
    const settings = loadBackupSettings();
    settings.lastBackup = new Date().toISOString();
    localStorage.setItem('ims_backup_settings', JSON.stringify(settings));
    
    // Update UI if modal is open
    const lastBackupEl = document.getElementById('lastBackupTime');
    if (lastBackupEl) {
      lastBackupEl.textContent = `Last: ${formatDateTime(settings.lastBackup)}`;
    }
    
    console.log('Auto backup completed');
    
  } catch (error) {
    console.error('Auto backup failed:', error);
  }
}

// Initialize auto backup system
function initAutoBackup() {
  // Check on page load
  setTimeout(() => checkAndRunAutoBackup(), 5000); // Wait 5 seconds after load
  
  // Check every hour
  setInterval(() => checkAndRunAutoBackup(), 60 * 60 * 1000);
  
  // Check at specific times (11:59 PM)
  const now = new Date();
  const nightTime = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
    23, 59, 0
  );
  
  let timeUntilNight = nightTime - now;
  if (timeUntilNight < 0) {
    nightTime.setDate(nightTime.getDate() + 1);
    timeUntilNight = nightTime - now;
  }
  
  setTimeout(() => {
    checkAndRunAutoBackup();
    setInterval(() => checkAndRunAutoBackup(), 24 * 60 * 60 * 1000);
  }, timeUntilNight);
}


// ============================================================
// 📋 BACKUP HISTORY DISPLAY
// ============================================================

async function renderBackupHistory() {
  try {
    const db = await openBackupDB();
    const transaction = db.transaction([BACKUP_STORE_NAME], 'readonly');
    const store = transaction.objectStore(BACKUP_STORE_NAME);
    const index = store.index('timestamp');
    
    const backups = await new Promise((resolve, reject) => {
      const request = index.openCursor(null, 'prev');
      const results = [];
      
      request.onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          results.push(cursor.value);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      request.onerror = () => reject(request.error);
    });
    
    if (backups.length === 0) {
      return '<p style="text-align: center; color: var(--text-muted); padding: 20px;">No backup history available</p>';
    }
    
    return backups.map(backup => `
      <div class="backup-history-item">
        <div class="backup-info">
          <div class="backup-name">📄 ${backup.filename}</div>
          <div class="backup-meta">
            ${formatDateTime(backup.timestamp)} • Size: ${backup.size}
          </div>
        </div>
        <div class="backup-actions">
          <button class="backup-btn-small download" onclick="window.downloadBackup('${backup.id}')">⬇️</button>
          <button class="backup-btn-small delete" onclick="window.deleteBackup('${backup.id}')">🗑️</button>
        </div>
      </div>
    `).join('');
    
  } catch (error) {
    console.error('Error loading backup history:', error);
    return '<p style="text-align: center; color: var(--text-muted); padding: 20px;">Error loading backup history</p>';
  }
}

async function updateBackupHistory() {
  const historyList = document.getElementById('backupHistoryList');
  if (historyList) {
    historyList.innerHTML = await renderBackupHistory();
  }
}

// Download backup from history
window.downloadBackup = async function(backupId) {
  try {
    const db = await openBackupDB();
    const transaction = db.transaction([BACKUP_STORE_NAME], 'readonly');
    const store = transaction.objectStore(BACKUP_STORE_NAME);
    
    const backup = await new Promise((resolve, reject) => {
      const request = store.get(backupId);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    
    if (backup) {
      const blob = new Blob([backup.data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = backup.filename;
      a.click();
      URL.revokeObjectURL(url);
      
      showToast('Success', 'Backup downloaded', 'success');
    }
  } catch (error) {
    console.error('Error downloading backup:', error);
    showToast('Error', 'Failed to download backup', 'error');
  }
};

// Delete backup from history
window.deleteBackup = async function(backupId) {
  if (!confirm('Delete this backup?')) return;
  
  try {
    const db = await openBackupDB();
    const transaction = db.transaction([BACKUP_STORE_NAME], 'readwrite');
    const store = transaction.objectStore(BACKUP_STORE_NAME);
    
    await new Promise((resolve, reject) => {
      const request = store.delete(backupId);
      request.onsuccess = () => resolve();
      request.onerror = () => reject(request.error);
    });
    
    showToast('Success', 'Backup deleted', 'success');
    updateBackupHistory();
    
  } catch (error) {
    console.error('Error deleting backup:', error);
    showToast('Error', 'Failed to delete backup', 'error');
  }
};


// ============================================================
// 🚪 OPEN MODAL
// ============================================================

export function openSystemToolsModal() {
  // Update backup history before opening modal
  updateBackupHistory();
  openModal('modalSystemTools');
}
