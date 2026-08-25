# Setting up cross-device sync

The app can sync your budgets and history across devices using
[Firebase](https://firebase.google.com/) (Google's free-tier backend).
Nobody's balance data leaves your device until you set this up and sign in —
until then, everything stays local exactly like before.

This takes about 5 minutes and doesn't require a credit card.

## 1. Create a Firebase project

1. Go to [console.firebase.google.com](https://console.firebase.google.com/) and sign in with any Google account.
2. Click **Add project**, give it any name (e.g. "dining-dollars"), and finish the wizard. You can decline Google Analytics — it isn't needed.

## 2. Turn on Email/Password sign-in

1. In the left sidebar, go to **Build → Authentication**.
2. Click **Get started**, then choose **Email/Password** from the provider list.
3. Toggle it **Enabled** and click **Save**.

## 3. Create a Firestore database

1. In the left sidebar, go to **Build → Firestore Database**.
2. Click **Create database**. Pick any region close to you.
3. Choose **Start in production mode** (not test mode).

## 4. Lock the database down to each user's own data

1. Still in Firestore, click the **Rules** tab.
2. Replace the contents with exactly this, then click **Publish**:

   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

   This makes sure a signed-in user can only ever read or write their *own*
   document — nobody else's data is reachable, even though the app's
   Firebase config itself isn't a secret (see below).

## 5. Register a web app and get your config

1. Go to **Project settings** (the gear icon near the top of the sidebar).
2. Under **Your apps**, click the **`</>`** (web) icon to register a new web app. Any nickname is fine. You don't need Firebase Hosting.
3. Firebase will show a config object that looks like:

   ```js
   const firebaseConfig = {
     apiKey: "AIzaSy...",
     authDomain: "dining-dollars-xxxxx.firebaseapp.com",
     projectId: "dining-dollars-xxxxx",
     storageBucket: "dining-dollars-xxxxx.appspot.com",
     messagingSenderId: "123456789012",
     appId: "1:123456789012:web:abcdef1234567890"
   };
   ```

4. Copy those six values into **`firebase-config.js`** in this repo, replacing the `YOUR_...` placeholders.

That's it — once `firebase-config.js` has real values (and the change is
deployed), the **Settings → Account & Sync** section will show a real
sign-in form instead of "Cross-device sync isn't set up for this build yet,"
and creating an account there will start syncing that device's budgets to
your Firebase project. Signing in with the same account on another device
pulls that data down (or lets you choose which copy to keep, if both
devices already have their own data).

## Notes on data & privacy

- Your budgets, purchase history, and account email are stored in your own
  Firebase project — not sent anywhere else.
- The free "Spark" plan's Firestore quota (1 GiB storage, 50K reads/20K
  writes per day) is far more than a personal budget tracker will ever use.
- The `firebaseConfig` values are safe to commit/expose publicly; they
  identify the project, not a secret credential. The Firestore rules above
  are what actually enforce access control.
