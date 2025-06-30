import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  doc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase.config';

// Add a new file to the database
export const addFile = async (fileData) => {
  try {
    const docRef = await addDoc(collection(db, 'files'), {
      ...fileData,
      uploadedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('Error adding file:', error);
    throw error;
  }
};

// Get files by subject
export const getFilesBySubject = async (subject) => {
  try {
    const q = query(
      collection(db, 'files'),
      where('subject', '==', subject),
      orderBy('uploadedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
    });
    return files;
  } catch (error) {
    console.error('Error getting files by subject:', error);
    throw error;
  }
};

// Get files by domain
export const getFilesByDomain = async (domain) => {
  try {
    const q = query(
      collection(db, 'files'),
      where('domain', '==', domain),
      orderBy('uploadedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
    });
    return files;
  } catch (error) {
    console.error('Error getting files by domain:', error);
    throw error;
  }
};

// Get files by year
export const getFilesByYear = async (year) => {
  try {
    const q = query(
      collection(db, 'files'),
      where('year', '==', year),
      orderBy('uploadedAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
    });
    return files;
  } catch (error) {
    console.error('Error getting files by year:', error);
    throw error;
  }
};

// Update the searchFiles function
export const searchFiles = async (searchTerm) => {
  try {
    const searchTermLower = searchTerm.toLowerCase();
    const q = query(
      collection(db, 'files'),
      where('titleLowerCase', '>=', searchTermLower),
      where('titleLowerCase', '<=', searchTermLower + '\uf8ff')
    );
    const querySnapshot = await getDocs(q);
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
    });
    return files;
  } catch (error) {
    console.error('Error searching files:', error);
    throw error;
  }
};

// Get recent files
export const getRecentFiles = async (limit = 10) => {
  try {
    const q = query(collection(db, 'files'), orderBy('uploadedAt', 'desc'));
    const querySnapshot = await getDocs(q);
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
    });
    return files.slice(0, limit);
  } catch (error) {
    console.error('Error getting recent files:', error);
    throw error;
  }
};

// Add this function to delete files
export const deleteFile = async (fileId, downloadUrl) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, 'files', fileId));

    // Delete from Storage
    if (downloadUrl) {
      const fileRef = ref(storage, downloadUrl);
      await deleteObject(fileRef);
    }

    return true;
  } catch (error) {
    console.error('Error deleting file:', error);
    throw error;
  }
};
