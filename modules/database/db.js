// Database Manager
import { initializeFirebase } from './firebase-db.js';
import { initializeSQL } from './sql-db.js';
import { initializeLocalStorage } from './localStorage-db.js';

let currentDB = null;
let dbType = 'local';

export async function initializeDatabase(type = 'local') {
  dbType = type;
  
  switch(type) {
    case 'firebase':
      currentDB = await initializeFirebase();
      break;
    case 'mysql':
    case 'postgresql':
      currentDB = await initializeSQL(type);
      break;
    case 'local':
    default:
      currentDB = initializeLocalStorage();
      break;
  }
  
  console.log(`Database initialized: ${type}`);
  return currentDB;
}

export function getDatabase() {
  if (!currentDB) {
    throw new Error('Database not initialized');
  }
  return currentDB;
}

export function getDatabaseType() {
  return dbType;
}

// Common Database Operations
export async function saveData(collection, data, id = null) {
  const db = getDatabase();
  return await db.save(collection, data, id);
}

export async function getData(collection, id) {
  const db = getDatabase();
  return await db.get(collection, id);
}

export async function getAllData(collection) {
  const db = getDatabase();
  return await db.getAll(collection);
}

export async function updateData(collection, id, data) {
  const db = getDatabase();
  return await db.update(collection, id, data);
}

export async function deleteData(collection, id) {
  const db = getDatabase();
  return await db.delete(collection, id);
}

export async function queryData(collection, conditions = []) {
  const db = getDatabase();
  return await db.query(collection, conditions);
}

export async function backupData() {
  const db = getDatabase();
  if (db.backup) {
    return await db.backup();
  }
  throw new Error('Backup not supported for this database');
}

export async function restoreData(backup) {
  const db = getDatabase();
  if (db.restore) {
    return await db.restore(backup);
  }
  throw new Error('Restore not supported for this database');
}