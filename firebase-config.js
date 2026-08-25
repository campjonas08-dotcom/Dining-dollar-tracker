/* Cross-device sync configuration.
   Fill this in with your own Firebase project's web-app config:
     Firebase console → Project settings → General → "Your apps" →
     Web app → SDK setup and configuration → Config.
   These values are safe to expose client-side — they identify your
   project, they don't grant access on their own. Firestore Security
   Rules (set in the Firebase console, not this file) are what actually
   protect each user's data. See SYNC_SETUP.md for the full walkthrough. */
export const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT_ID.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId: "YOUR_APP_ID"
};
