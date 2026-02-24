import { initializeApp } from 'firebase/app';
import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirestore, doc, setDoc } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyAO4uW3KnG2EN3OzfLiV_fmtJlVQOaO08A",
    authDomain: "monopoly-by-loricatus.firebaseapp.com",
    projectId: "monopoly-by-loricatus",
    storageBucket: "monopoly-by-loricatus.firebasestorage.app",
    messagingSenderId: "191005479497",
    appId: "1:191005479497:web:917fe3a0a7fe501905a598"
};

async function test() {
    console.log("Initializing app...");
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log("Signing in...");
    const userCred = await signInAnonymously(auth);
    console.log("Signed in as:", userCred.user.uid);

    console.log("Writing to Firestore...");
    try {
        const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 5000));
        await Promise.race([
            setDoc(doc(db, 'games', 'test_doc'), { test: true, hostId: userCred.user.uid }),
            timeout
        ]);
        console.log("Write successful!");
    } catch (e) {
        console.error("Write failed:", e);
    }
    process.exit(0);
}

test();
