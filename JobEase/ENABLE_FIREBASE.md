# How to Enable Firebase Authentication

## Current Status
Firebase authentication is currently **DISABLED** for testing purposes. The app now uses mock authentication that simulates login/signup without requiring Firebase.

## To Enable Firebase Authentication:

### 1. Get Your Firebase Config
Follow the `FIREBASE_SETUP.md` guide to get your Firebase configuration.

### 2. Update Firebase Config
Replace the placeholder values in `frontend/src/firebase/config.js` with your actual Firebase config.

### 3. Re-enable Firebase in AuthContext
In `frontend/src/contexts/AuthContext.js`, uncomment the Firebase imports and replace the mock functions:

```javascript
// Uncomment these lines:
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword, 
  signOut, 
  onAuthStateChanged,
  updateProfile
} from 'firebase/auth';
import { auth } from '../firebase/config';

// Replace the mock functions with real Firebase functions:
function signup(email, password, displayName) {
  return createUserWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      return updateProfile(userCredential.user, {
        displayName: displayName
      });
    });
}

function login(email, password) {
  return signInWithEmailAndPassword(auth, email, password);
}

function logout() {
  return signOut(auth);
}

// Add the useEffect for auth state:
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (user) => {
    setCurrentUser(user);
    setLoading(false);
  });
  return unsubscribe;
}, []);
```

### 4. Test Authentication
After making these changes, authentication will work with your Firebase project.

## Current Mock Authentication
- **Signup**: Creates a mock user account
- **Login**: Simulates successful login
- **Logout**: Clears the mock user session
- **All features work** without Firebase

This allows you to test the entire application while you set up Firebase properly.



