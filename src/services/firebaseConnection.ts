// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDIhv2zUQZuzgd8CuS66SkbZnKFRiuwp5U",
  authDomain: "tarefasplus-f9969.firebaseapp.com",
  projectId: "tarefasplus-f9969",
  storageBucket: "tarefasplus-f9969.appspot.com",
  messagingSenderId: "547287314703",
  appId: "1:547287314703:web:944cf36da0fd7c3169ce7a",
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const db = getFirestore(firebaseApp);

export { db };
