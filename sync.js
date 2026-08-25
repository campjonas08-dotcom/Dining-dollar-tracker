/* =========================================================
   CROSS-DEVICE SYNC (Firebase Auth + Firestore)
   Loaded as an ES module, so it runs independently of the classic
   <script> that drives the rest of the app. Communicates back to it
   via window custom events (dd-auth-changed, dd-remote-update) rather
   than direct function calls, since module scripts are deferred and
   may finish loading after the main script has already run — events
   registered early will still catch anything dispatched later.

   Falls back to a no-op, fully offline-local mode when firebase-config.js
   still has its placeholder values, so the app works unmodified for
   anyone who hasn't set up a Firebase project.
   ========================================================= */

import { firebaseConfig } from './firebase-config.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js';
import {
  getAuth, onAuthStateChanged,
  createUserWithEmailAndPassword, signInWithEmailAndPassword,
  signOut, sendPasswordResetEmail
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js';
import {
  getFirestore, doc, setDoc, getDoc, onSnapshot
} from 'https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js';

const isConfigured = !!(firebaseConfig && firebaseConfig.apiKey && !String(firebaseConfig.apiKey).startsWith('YOUR_'));

let app = null, auth = null, db = null;
let unsubscribeSnapshot = null;

if(isConfigured){
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app);

  onAuthStateChanged(auth, (user) => {
    if(unsubscribeSnapshot){ unsubscribeSnapshot(); unsubscribeSnapshot = null; }

    window.dispatchEvent(new CustomEvent('dd-auth-changed', { detail: { user } }));

    if(user){
      const ref = doc(db, 'users', user.uid);
      unsubscribeSnapshot = onSnapshot(ref, (snap) => {
        window.dispatchEvent(new CustomEvent('dd-remote-update', {
          detail: { data: snap.exists() ? snap.data() : null }
        }));
      }, (err) => {
        console.error('Sync listener error:', err);
      });
    }
  });
}

async function signUp(email, password){
  if(!isConfigured) throw { code:'not-configured' };
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  return cred.user;
}

async function signIn(email, password){
  if(!isConfigured) throw { code:'not-configured' };
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

async function signOutUser(){
  if(!isConfigured) return;
  await signOut(auth);
}

async function resetPassword(email){
  if(!isConfigured) throw { code:'not-configured' };
  await sendPasswordResetEmail(auth, email);
}

async function pushConfig(configObj){
  if(!isConfigured || !auth.currentUser) return;
  const ref = doc(db, 'users', auth.currentUser.uid);
  await setDoc(ref, configObj);
}

async function fetchConfig(){
  if(!isConfigured || !auth.currentUser) return null;
  const ref = doc(db, 'users', auth.currentUser.uid);
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

function currentUser(){
  return isConfigured && auth ? auth.currentUser : null;
}

window.DDSync = {
  isConfigured,
  signUp, signIn, signOut: signOutUser, resetPassword,
  pushConfig, fetchConfig, currentUser
};

window.dispatchEvent(new CustomEvent('dd-sync-ready', { detail: { isConfigured } }));
