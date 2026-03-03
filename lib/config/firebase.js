// src/lib/firebase.js
import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"

const firebaseConfig = {
  apiKey: 'AIzaSyDRS6VhEfmpNY2XI9Y42q48xGVBq326dsA',
  authDomain: 'affordabledatagh.firebaseapp.com',
  projectId: 'affordabledatagh',
  storageBucket: 'affordabledatagh.firebasestorage.app',
  messagingSenderId:'118496575657',
  appId:'1:118496575657:web:6ee0cdeecc692c6d9a69b8',
  measurementId: 'G-Z22KZVVJBZ',
}

const app = initializeApp(firebaseConfig)

export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()

export default app