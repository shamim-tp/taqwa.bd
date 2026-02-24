// modules/database/db.js
import { firebaseConfig, COLLECTIONS } from '../../firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { getFirestore, collection, doc, getDoc, setDoc, updateDoc, deleteDoc, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

let db;
let dbInitialized = false;

export async function initializeDatabase(type = 'firebase') {
  // Always initialize Firebase regardless of type parameter
  const app = initializeApp(firebaseConfig);
  db = getFirestore(app);
  dbInitialized = true;
  console.log('Firebase Database Initialized');
  return firebaseDb;
}

export function getDatabase() {
  if (!dbInitialized) {
    throw new Error('Database not initialized. Call initializeDatabase first.');
  }
  return firebaseDb;
}

export function getDatabaseType() {
  return 'firebase';
}

// Firebase Database Operations
const firebaseDb = {
  async save(collectionName, data, id = null) {
    const colRef = collection(db, collectionName);
    const docRef = id ? doc(db, collectionName, id) : doc(colRef);
    const dataToSave = {
      ...data,
      createdAt: data.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await setDoc(docRef, dataToSave);
    return { id: docRef.id, ...dataToSave };
  },

  async get(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    const docSnap = await getDoc(docRef);
    return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
  },

  async getAll(collectionName) {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async update(collectionName, id, data) {
    const docRef = doc(db, collectionName, id);
    const updateData = {
      ...data,
      updatedAt: new Date().toISOString()
    };
    await updateDoc(docRef, updateData);
    return { id, ...updateData };
  },

  async delete(collectionName, id) {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return id;
  },

  async query(collectionName, conditions = []) {
    let q = collection(db, collectionName);
    conditions.forEach(cond => {
      q = query(q, where(cond.field, cond.operator, cond.value));
    });
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  async backup() {
    // Simple backup implementation - get all collections
    const backup = {};
    for (const [key, colName] of Object.entries(COLLECTIONS)) {
      backup[colName] = await this.getAll(colName);
    }
    return backup;
  },

  async restore(backupData) {
    // Restore each collection
    for (const [colName, documents] of Object.entries(backupData)) {
      for (const doc of documents) {
        await this.save(colName, doc, doc.id);
      }
    }
    return true;
  }
};

// Common operations exported for convenience
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
  return await db.backup();
}

export async function restoreData(backup) {
  const db = getDatabase();
  return await db.restore(backup);
}
