import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  startAfter,
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

// Get files with pagination
export const getFilesPaginated = async (pageSize = 10, lastDoc = null) => {
  try {
    let q = query(
      collection(db, 'files'),
      orderBy('uploadedAt', 'desc'),
      limit(pageSize)
    );

    if (lastDoc) {
      q = query(
        collection(db, 'files'),
        orderBy('uploadedAt', 'desc'),
        startAfter(lastDoc),
        limit(pageSize)
      );
    }

    const querySnapshot = await getDocs(q);
    const files = [];
    let lastVisible = null;

    querySnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
      lastVisible = doc;
    });

    return { files, lastVisible, hasMore: files.length === pageSize };
  } catch (error) {
    console.error('Error getting paginated files:', error);
    throw error;
  }
};

// Get files by subject with better error handling
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
    // Fallback to simple query without orderBy
    try {
      const q = query(collection(db, 'files'), where('subject', '==', subject));
      const querySnapshot = await getDocs(q);
      const files = [];
      querySnapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() });
      });
      return files;
    } catch (fallbackError) {
      console.error('Error with fallback query:', fallbackError);
      throw fallbackError;
    }
  }
};

// Get files by domain with better error handling
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
    try {
      const q = query(collection(db, 'files'), where('domain', '==', domain));
      const querySnapshot = await getDocs(q);
      const files = [];
      querySnapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() });
      });
      return files;
    } catch (fallbackError) {
      console.error('Error with fallback query:', fallbackError);
      throw fallbackError;
    }
  }
};

// Get files by year with better error handling
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
    try {
      const q = query(collection(db, 'files'), where('year', '==', year));
      const querySnapshot = await getDocs(q);
      const files = [];
      querySnapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() });
      });
      return files;
    } catch (fallbackError) {
      console.error('Error with fallback query:', fallbackError);
      throw fallbackError;
    }
  }
};

// Enhanced search with case-insensitive support
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
export const getRecentFiles = async (limitCount = 10) => {
  try {
    const q = query(
      collection(db, 'files'),
      orderBy('uploadedAt', 'desc'),
      limit(limitCount)
    );
    const querySnapshot = await getDocs(q);
    const files = [];
    querySnapshot.forEach((doc) => {
      files.push({ id: doc.id, ...doc.data() });
    });
    return files;
  } catch (error) {
    console.error('Error getting recent files:', error);
    throw error;
  }
};

// Delete file with retry mechanism
export const deleteFile = async (fileId, downloadUrl, retries = 3) => {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      // Delete from Firestore
      await deleteDoc(doc(db, 'files', fileId));

      // Delete from Storage if downloadUrl exists
      if (downloadUrl) {
        const fileRef = ref(storage, downloadUrl);
        await deleteObject(fileRef);
      }

      return true;
    } catch (error) {
      console.error(`Delete attempt ${attempt} failed:`, error);
      if (attempt === retries) {
        throw error;
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
    }
  }
};

// Get total file count
export const getTotalFileCount = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'files'));
    return querySnapshot.size;
  } catch (error) {
    console.error('Error getting total file count:', error);
    throw error;
  }
};
