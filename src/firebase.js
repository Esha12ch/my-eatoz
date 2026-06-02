import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCKD5UHj-ZtFc1wfdUkKtRZP0QZ24f5Z54",
  authDomain: "eatoz-otp-app.firebaseapp.com",
  projectId: "eatoz-otp-app",
  storageBucket: "eatoz-otp-app.firebasestorage.app",
  messagingSenderId: "109880814430",
  appId: "1:109880814430:web:099e21d18744dcbcb23dcf",
  measurementId: "G-GPG44S0XVT"
};


const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);