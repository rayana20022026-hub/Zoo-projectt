import { initializeApp } from 'firebase/app'
import { getAnalytics } from 'firebase/analytics'
import { browserLocalPersistence, initializeAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getFunctions } from 'firebase/functions'

const firebaseConfig = {
  apiKey: 'AIzaSyBHo7B2gg43S7oqn_C092F6vIHb_mcVkdY',
  authDomain: 'wildhaven-bishkek.firebaseapp.com',
  projectId: 'wildhaven-bishkek',
  storageBucket: 'wildhaven-bishkek.firebasestorage.app',
  messagingSenderId: '215699426454',
  appId: '1:215699426454:web:93c8f8f676172430d286b7',
  measurementId: 'G-VPVPV1Q2JF',
}

const app = initializeApp(firebaseConfig)

export const analytics = getAnalytics(app)
export const auth      = initializeAuth(app, { persistence: browserLocalPersistence })
export const db        = getFirestore(app)
export const functions = getFunctions(app)
