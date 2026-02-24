// Firebase Database Implementation
export async function initializeFirebase() {
  try {
    const firebaseConfig = {
    apiKey: "AIzaSyDrLvyex6ui6dbKqsX697PplrmZvr-6Hag",
    authDomain: "taqwa-property-41353.firebaseapp.com",
    databaseURL: "https://taqwa-property-41353-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "taqwa-property-41353",
    storageBucket: "taqwa-property-41353.firebasestorage.app",
    messagingSenderId: "287655809647",
    appId: "1:287655809647:web:598c88721282d8ae9b739a",
    measurementId: "G-7WTLSZ99TV"
    };

    const { initializeApp } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-app.js');
    const { 
      getFirestore, collection, doc, setDoc, getDoc, updateDoc, deleteDoc, 
      query, where, getDocs, addDoc 
    } = await import('https://www.gstatic.com/firebasejs/9.6.0/firebase-firestore.js');

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    return {
      save: async (collectionName, data, id = null) => {
        try {
          let docRef;
          if (id) {
            docRef = doc(db, collectionName, id);
            await setDoc(docRef, { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
          } else {
            docRef = await addDoc(collection(db, collectionName), { ...data, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });
            id = docRef.id;
          }
          return id;
        } catch (error) {
          console.error('Firebase save error:', error);
          throw error;
        }
      },
      
      get: async (collectionName, id) => {
        try {
          const docRef = doc(db, collectionName, id);
          const snap = await getDoc(docRef);
          return snap.exists() ? { id: snap.id, ...snap.data() } : null;
        } catch (error) {
          console.error('Firebase get error:', error);
          throw error;
        }
      },
      
      getAll: async (collectionName) => {
        try {
          const snap = await getDocs(collection(db, collectionName));
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error('Firebase getAll error:', error);
          throw error;
        }
      },
      
      update: async (collectionName, id, data) => {
        try {
          const docRef = doc(db, collectionName, id);
          await updateDoc(docRef, { ...data, updatedAt: new Date().toISOString() });
          return true;
        } catch (error) {
          console.error('Firebase update error:', error);
          throw error;
        }
      },
      
      delete: async (collectionName, id) => {
        try {
          await deleteDoc(doc(db, collectionName, id));
          return true;
        } catch (error) {
          console.error('Firebase delete error:', error);
          throw error;
        }
      },
      
      query: async (collectionName, conditions = []) => {
        try {
          let q = collection(db, collectionName);
          conditions.forEach(cond => {
            q = query(q, where(cond.field, cond.operator, cond.value));
          });
          const snap = await getDocs(q);
          return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        } catch (error) {
          console.error('Firebase query error:', error);
          throw error;
        }
      },
      
      backup: async () => {
        // Firebase backup - get all collections
        const collections = ['admins','members','deposits','investments','expenses','sales','profitDistributions','notices','resignations','activityLogs'];
        const backup = {};
        for (const coll of collections) {
          backup[coll] = await this.getAll(coll);
        }
        return JSON.stringify(backup, null, 2);
      },
      
      restore: async (backupData) => {
        try {
          const data = JSON.parse(backupData);
          for (const [coll, items] of Object.entries(data)) {
            for (const item of items) {
              await this.save(coll, item, item.id);
            }
          }
          return true;
        } catch (error) {
          console.error('Firebase restore error:', error);
          return false;
        }
      }
    };
  } catch (error) {
    console.error('Firebase initialization failed:', error);
    throw error;
  }
}