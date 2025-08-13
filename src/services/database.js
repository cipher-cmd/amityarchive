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
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase.config';

const filesCollection = collection(db, 'files');

const getDocsFromSnapshot = (snapshot) => {
  const docs = [];
  snapshot.forEach((doc) => {
    docs.push({ id: doc.id, ...doc.data() });
  });
  return docs;
};

export const addFile = (fileData) => {
  return addDoc(filesCollection, {
    ...fileData,
    uploadedAt: serverTimestamp(),
  });
};

export const getFilesByField = async (fieldName, value) => {
  try {
    const q = query(filesCollection, where(fieldName, '==', value));
    const snapshot = await getDocs(q);
    return getDocsFromSnapshot(snapshot);
  } catch (error) {
    console.error(`Error getting files by ${fieldName}:`, error);
    return [];
  }
};

export const searchFiles = async (searchTerm) => {
  const searchTermLower = searchTerm.toLowerCase();
  const q = query(
    filesCollection,
    where('titleLowerCase', '>=', searchTermLower),
    where('titleLowerCase', '<=', searchTermLower + '\uf8ff')
  );
  const snapshot = await getDocs(q);
  return getDocsFromSnapshot(snapshot);
};

export const getRecentFiles = async (count = 10) => {
  const q = query(filesCollection, orderBy('uploadedAt', 'desc'), limit(count));
  const snapshot = await getDocs(q);
  return getDocsFromSnapshot(snapshot);
};

// This is the corrected delete function
export const deleteFile = async (fileId, fileName) => {
  // First, delete the record from the database
  await deleteDoc(doc(db, 'files', fileId));

  // If a fileName is provided, delete the file from cloud storage
  if (fileName && fileName !== 'default_file.png') {
    // We construct the correct path to the file in the 'files/' folder
    const fileRef = ref(storage, `files/${fileName}`);
    await deleteObject(fileRef);
  }
};

export const updateFile = async (fileId, newData) => {
  const fileRef = doc(db, 'files', fileId);
  return updateDoc(fileRef, newData);
};
