import { initializeApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyBkpeFLAThuXuQLYYK2YcbtT_wOkR_Y2Rw",
  authDomain: "fichas-app-cfd9c.firebaseapp.com",
  projectId: "fichas-app-cfd9c",
  storageBucket: "fichas-app-cfd9c.firebasestorage.app",
  messagingSenderId: "595473427898",
  appId: "1:595473427898:web:01cd655b122280b1144183",
};

const app = initializeApp(firebaseConfig);

export default app;