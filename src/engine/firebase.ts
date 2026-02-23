import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAO4uW3KnG2EN3OzfLiV_fmtJlVQOaO08A",
    authDomain: "monopoly-by-loricatus.firebaseapp.com",
    projectId: "monopoly-by-loricatus",
    storageBucket: "monopoly-by-loricatus.firebasestorage.app",
    messagingSenderId: "191005479497",
    appId: "1:191005479497:web:917fe3a0a7fe501905a598"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
