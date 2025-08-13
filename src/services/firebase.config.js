import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { getAuth } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

const firebaseConfig = {
  apiKey: 'AIzaSyDjC3_rRfP05rkEVDFSE2CICw7W86MwPrA',
  authDomain: 'amityarchive1.firebaseapp.com',
  projectId: 'amityarchive1',
  storageBucket: 'amityarchive1.appspot.com', // Corrected this to .appspot.com which is standard
  messagingSenderId: '909940968104',
  appId: '1:909940968104:web:77743c03cfa26de755d09d',
  measurementId: 'G-H9CZ6NFZQH',
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);
export const storage = getStorage(app);
export const auth = getAuth(app);
export const analytics = getAnalytics(app);

// This line is crucial and was likely missing.
export default app;
