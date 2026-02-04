# Firebase Setup Guide for JobEase

## 🔥 Quick Firebase Setup

### Step 1: Create Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" or "Add project"
3. Enter project name: `jobease` (or any name you prefer)
4. Enable Google Analytics (optional)
5. Click "Create project"

### Step 2: Enable Authentication
1. In your Firebase project, click on "Authentication" in the left sidebar
2. Click "Get started"
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider
5. Click "Save"

### Step 3: Get Your Firebase Config
1. In your Firebase project, click on the gear icon (⚙️) next to "Project Overview"
2. Select "Project settings"
3. Scroll down to "Your apps" section
4. Click "Add app" and select the web icon (</>)
5. Register your app with a nickname (e.g., "JobEase Web")
6. Copy the Firebase configuration object

### Step 4: Update Your Config
Replace the placeholder values in `frontend/src/firebase/config.js` with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...", // Your actual API key
  authDomain: "jobease-xxxxx.firebaseapp.com", // Your actual domain
  projectId: "jobease-xxxxx", // Your actual project ID
  storageBucket: "jobease-xxxxx.appspot.com", // Your actual storage bucket
  messagingSenderId: "123456789012", // Your actual sender ID
  appId: "1:123456789012:web:abcdefghijklmnop" // Your actual app ID
};
```

### Step 5: Test the Setup
1. Save the file
2. Restart your development server
3. Try creating an account - it should work now!

## 🔧 Troubleshooting

### Common Issues:
- **API Key Error**: Make sure you copied the correct API key from Firebase Console
- **Domain Error**: Ensure the authDomain matches your Firebase project
- **Project ID Error**: Double-check the projectId is correct

### Example Firebase Config:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSyBvOkBw7qE8Fz2D1h3I4j5K6L7M8N9O0P1Q",
  authDomain: "jobease-demo.firebaseapp.com",
  projectId: "jobease-demo",
  storageBucket: "jobease-demo.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdefghijklmnopqrstuvwxyz"
};
```

## ✅ Verification
After updating the config, you should be able to:
- Create new accounts
- Sign in with existing accounts
- Access the dashboard
- Start interviews

If you're still getting errors, check the browser console for more detailed error messages.



