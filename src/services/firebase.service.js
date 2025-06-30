import { doc, deleteDoc } from 'firebase/firestore';
import { ref, deleteObject } from 'firebase/storage';
import { db, storage } from './firebase.config'; // Adjust the import path if necessary

// Function to delete file from Firestore and Firebase Storage
export const deleteFile = async (fileId, fileName) => {
  try {
    // Delete file metadata from Firestore
    const fileDocRef = doc(db, 'files', fileId);
    await deleteDoc(fileDocRef);
    console.log('File metadata deleted from Firestore');

    // Delete the actual file from Firebase Storage
    const fileRef = ref(storage, `files/${fileName}`);
    await deleteObject(fileRef);
    console.log('File deleted from Firebase Storage');
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
