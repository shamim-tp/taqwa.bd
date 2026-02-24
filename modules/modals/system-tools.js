import { getDatabase, backupData, restoreData } from '../database/db.js';
import { showToast } from '../utils/common.js';
import { openModal, closeModal } from './modals.js';

export function initializeModal() {
  const container = document.getElementById('modalsContainer');
  if (!container) return;
  const html = `
    <div class="modalWrap" id="modalSystemTools">
      <div class="modal">
        <div class="modalHead">
          <div><h2>System Tools</h2><p>Backup/Restore, Reset Demo Data, Export JSON</p></div>
          <button class="closeX">✕</button>
        </div>
        <div class="row row-2">
          <button class="btn primary" id="exportJSONBtn">Export Backup JSON</button>
          <button class="btn" id="importJSONBtn">Import Backup JSON</button>
          <button class="btn warn" id="resetDemoBtn">Reset Demo Data</button>
          <button class="btn danger" id="wipeAllBtn">Wipe All Data</button>
        </div>
        <div class="row row-2">
          <button class="btn" id="migrateToFirebaseBtn">Migrate to Firebase</button>
          <button class="btn" id="migrateToSQLBtn">Migrate to SQL</button>
        </div>
        <div class="hr"></div>
        <div class="hint">⚠️ Export JSON recommended every month.</div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML('beforeend', html);
  
  document.getElementById('exportJSONBtn')?.addEventListener('click', exportBackup);
  document.getElementById('importJSONBtn')?.addEventListener('click', importBackup);
  document.getElementById('resetDemoBtn')?.addEventListener('click', resetDemoData);
  document.getElementById('wipeAllBtn')?.addEventListener('click', wipeAllData);
  document.getElementById('migrateToFirebaseBtn')?.addEventListener('click', migrateToFirebase);
  document.getElementById('migrateToSQLBtn')?.addEventListener('click', migrateToSQL);
  document.querySelector('#modalSystemTools .closeX')?.addEventListener('click', () => closeModal('modalSystemTools'));
}

export function openSystemToolsModal() {
  openModal('modalSystemTools');
}

async function exportBackup() {
  try {
    const backup = await backupData();
    const blob = new Blob([backup], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `IMS_ERP_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Backup Exported', 'Backup file downloaded');
  } catch (error) {
    console.error(error);
    showToast('Error', 'Failed to export backup');
  }
}

async function importBackup() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (event) => {
      if (confirm('Restore backup? Current data will be replaced.')) {
        const success = await restoreData(event.target.result);
        if (success) {
          showToast('Success', 'Backup restored');
          setTimeout(() => window.location.reload(), 1000);
        } else {
          showToast('Error', 'Restore failed');
        }
      }
    };
    reader.readAsText(file);
  };
  input.click();
}

async function resetDemoData() {
  if (!confirm('Reset demo database? All current data will be lost.')) return;
  const db = getDatabase();
  if (db.resetDemo) {
    await db.resetDemo();
    showToast('Reset Done', 'Demo database loaded');
    setTimeout(() => window.location.reload(), 1000);
  } else {
    showToast('Error', 'Reset not supported');
  }
}

async function wipeAllData() {
  if (!confirm('⚠️ Delete all ERP data permanently?')) return;
  localStorage.clear();
  showToast('Deleted', 'All data wiped');
  setTimeout(() => window.location.reload(), 1000);
}

async function migrateToFirebase() {
  showToast('Info', 'Firebase migration requires Firebase project setup');
}

async function migrateToSQL() {
  showToast('Info', 'SQL migration requires backend server setup');
}