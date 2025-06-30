import { doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase.config';

// Delete file from both Firestore and Storage
export const deleteFile = async (fileId, fileName) => {
  try {
    // Remove from database
    const fileDocRef = doc(db, 'files', fileId);
    await deleteDoc(fileDocRef);

    // Remove from storage
    const fileRef = ref(storage, `files/${fileName}`);
    await deleteObject(fileRef);
  } catch (error) {
    console.error('Delete failed:', error);
    throw error;
  }
};
