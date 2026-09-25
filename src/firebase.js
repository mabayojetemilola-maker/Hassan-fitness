import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyC7KGgRRPwDUDJuC7m3vsLBdQu0P_jckMk",
  authDomain: "hassan-fitness-hub.firebaseapp.com",
  projectId: "hassan-fitness-hub",
  storageBucket: "hassan-fitness-hub.firebasestorage.app",
  messagingSenderId: "1053109150100",
  appId: "1:1053109150100:web:74db778a9bd2299acb2f81",
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
                          
