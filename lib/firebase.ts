import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// आपकी Firebase सेटिंग्स अब पूरी तरह सही हैं
const firebaseConfig = {
  apiKey: "AIzaSyAPeq4R2ennNB4LqWtkRkEaxJSsHK3f5pI",
  authDomain: "planning-with-ai-3a301.firebaseapp.com",
  projectId: "planning-with-ai-3a301",
  storageBucket: "planning-with-ai-3a301.firebasestorage.app",
  messagingSenderId: "554029153890",
  appId: "1:554029153890:web:f1217ed1d7f2c18b7f1b3b"
};

// ऐप को चालू करना
const app = initializeApp(firebaseConfig);

// इन चीज़ों को बाहर इस्तेमाल करने के लिए Export करना
export const auth = getAuth(app); 
export const db = getFirestore(app); 
export default app;
