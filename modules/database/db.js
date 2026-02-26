// modules/database/db.js
import { firebaseConfig, COLLECTIONS } from '../../firebase-config.js';
import { initializeApp, getApps } from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where 
} from 'https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js';

// Firestore অনুমোদিত অপারেটর
const VALID_OPERATORS = [
  '<', '<=', '==', '!=', '>=', '>', 
  'array-contains', 'array-contains-any', 'in', 'not-in'
];

let db = null;
let dbInitialized = false;

// Firebase Database Operations (এখনই ডিফাইন করা হয়েছে, কিন্তু db পরে সেট হবে)
const firebaseDb = {
  async save(collectionName, data, id = null) {
    try {
      const colRef = collection(db, collectionName);
      const docRef = id ? doc(db, collectionName, id) : doc(colRef);
      const dataToSave = {
        ...data,
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      await setDoc(docRef, dataToSave);
      return { id: docRef.id, ...dataToSave };
    } catch (error) {
      console.error('Firestore save error:', error);
      throw new Error(`Failed to save to ${collectionName}: ${error.message}`);
    }
  },

  async get(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null;
    } catch (error) {
      console.error('Firestore get error:', error);
      throw new Error(`Failed to get document ${id} from ${collectionName}: ${error.message}`);
    }
  },

  async getAll(collectionName) {
    try {
      const colRef = collection(db, collectionName);
      const snapshot = await getDocs(colRef);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Firestore getAll error:', error);
      throw new Error(`Failed to get all from ${collectionName}: ${error.message}`);
    }
  },

  async update(collectionName, id, data) {
    try {
      const docRef = doc(db, collectionName, id);
      const updateData = {
        ...data,
        updatedAt: new Date().toISOString()
      };
      await updateDoc(docRef, updateData);
      return { id, ...updateData };
    } catch (error) {
      console.error('Firestore update error:', error);
      throw new Error(`Failed to update document ${id} in ${collectionName}: ${error.message}`);
    }
  },

  async delete(collectionName, id) {
    try {
      const docRef = doc(db, collectionName, id);
      await deleteDoc(docRef);
      return id;
    } catch (error) {
      console.error('Firestore delete error:', error);
      throw new Error(`Failed to delete document ${id} from ${collectionName}: ${error.message}`);
    }
  },

  async query(collectionName, conditions = []) {
    try {
      let q = collection(db, collectionName);
      conditions.forEach(cond => {
        // অপারেটর বৈধতা যাচাই
        if (!VALID_OPERATORS.includes(cond.operator)) {
          throw new Error(`Invalid operator "${cond.operator}". Allowed operators: ${VALID_OPERATORS.join(', ')}`);
        }
        q = query(q, where(cond.field, cond.operator, cond.value));
      });
      const snapshot = await getDocs(q);
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Firestore query error:', error);
      throw new Error(`Failed to query ${collectionName}: ${error.message}`);
    }
  },

  async backup() {
    try {
      const backup = {};
      for (const [key, colName] of Object.entries(COLLECTIONS)) {
        backup[colName] = await this.getAll(colName);
      }
      return backup;
    } catch (error) {
      console.error('Firestore backup error:', error);
      throw new Error(`Backup failed: ${error.message}`);
    }
  },

  async restore(backupData) {
    try {
      for (const [colName, documents] of Object.entries(backupData)) {
        for (const doc of documents) {
          await this.save(colName, doc, doc.id);
        }
      }
      return true;
    } catch (error) {
      console.error('Firestore restore error:', error);
      throw new Error(`Restore failed: ${error.message}`);
    }
  }
};

/**
 * Firebase ডাটাবেস আরম্ভ করে
 * @param {string} type - (উপেক্ষিত) সর্বদা Firebase ব্যবহার হয়
 */
export async function initializeDatabase(type = 'firebase') {
  // যদি আগে থেকেই অ্যাপ আরম্ভ করা থাকে, তাহলে পুনরায় আরম্ভ না করে শুধু Firestore instance দিন
  if (getApps().length === 0) {
    initializeApp(firebaseConfig);
  }
  db = getFirestore();
  dbInitialized = true;
  console.log('Firebase Database Initialized');
  return firebaseDb; // এখন firebaseDb আগেই ডিফাইন করা আছে
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
