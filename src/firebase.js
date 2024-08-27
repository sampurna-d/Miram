import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
    apiKey: "AIzaSyDij_1BrwKQgFUQ7o-Lbgsu3GfbcSncI4U",
    authDomain: "cupid-s-arrow-f6d0d.firebaseapp.com",
    projectId: "cupid-s-arrow-f6d0d",
    storageBucket: "cupid-s-arrow-f6d0d.appspot.com",
    messagingSenderId: "668710379392",
    appId: "1:668710379392:web:d85fef41c2ef03d34aab65",
    measurementId: "G-CJ9JSS45H4"
  };

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);