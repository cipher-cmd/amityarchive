import React, { useState, useEffect } from 'react';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase.config';

const FirebaseTest = () => {
  const [testData, setTestData] = useState([]);
  const [loading, setLoading] = useState(false);

  const addTestFile = async () => {
    setLoading(true);
    try {
      await addDoc(collection(db, 'files'), {
        title: 'Test File',
        subject: 'Computer Science/IT',
        domain: 'ASET',
        year: '2024',
        uploadedAt: new Date(),
      });
      alert('Test file added successfully!');
      fetchTestData();
    } catch (error) {
      console.error('Error adding test file:', error);
      alert('Error adding test file');
    } finally {
      setLoading(false);
    }
  };

  const fetchTestData = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'files'));
      const files = [];
      querySnapshot.forEach((doc) => {
        files.push({ id: doc.id, ...doc.data() });
      });
      setTestData(files);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchTestData();
  }, []);

  return (
    <div style={{ padding: '20px', border: '1px solid #ccc', margin: '20px' }}>
      <h3>Firebase Connection Test</h3>
      <button onClick={addTestFile} disabled={loading}>
        {loading ? 'Adding...' : 'Add Test File'}
      </button>
      <h4>Files in Database:</h4>
      {testData.length === 0 ? (
        <p>No files found. Click "Add Test File" to create one.</p>
      ) : (
        <ul>
          {testData.map((file) => (
            <li key={file.id}>
              {file.title} - {file.subject} ({file.year})
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default FirebaseTest;
