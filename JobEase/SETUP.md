# JobEase Setup Guide

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm
- Firebase account (for authentication)

### 1. Install Dependencies

```bash
# Install root dependencies
npm install

# Install frontend dependencies
cd frontend
npm install

# Install backend dependencies
cd ../backend
npm install
```

### 2. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication (Email/Password)
4. Get your Firebase config
5. Update `frontend/src/firebase/config.js` with your config:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-app-id"
};
```

### 3. Start the Application

```bash
# From the root directory
npm start
```

This will start:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 🎯 Features Implemented

### ✅ Completed Features

1. **Professional Homepage**
   - Modern dark theme with gradient backgrounds
   - Feature cards with hover effects
   - Statistics section
   - Responsive design

2. **Authentication System**
   - Firebase Authentication integration
   - Login and Signup pages
   - Protected routes
   - User session management

3. **Dashboard**
   - Interview type selection (Technical/Behavioral/Mixed)
   - User profile display
   - Logout functionality

4. **Interview Room**
   - Resume upload (PDF only)
   - Skills extraction from resume
   - Real-time question generation
   - Speech-to-text functionality
   - Text-to-speech for AI questions
   - Conversation history display

5. **Backend API**
   - Resume processing endpoint
   - Question generation endpoint
   - Audio processing endpoint
   - File upload handling

### 🔄 In Progress

1. **TinyLlama Integration**
   - Backend ready for model integration
   - Placeholder functions with fallbacks
   - Integration guide provided

## 🛠️ Technical Stack

### Frontend
- React 18
- React Router DOM
- Firebase Authentication
- CSS3 with modern features
- Web Speech API

### Backend
- Node.js
- Express.js
- Multer (file uploads)
- CORS
- PDF processing ready

## 📁 Project Structure

```
JobEase/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── HomePage.js
│   │   │   ├── Login.js
│   │   │   ├── Signup.js
│   │   │   ├── Dashboard.js
│   │   │   └── InterviewRoom.js
│   │   ├── contexts/
│   │   │   └── AuthContext.js
│   │   └── firebase/
│   │       └── config.js
├── backend/
│   ├── server.js
│   └── tinyllama-integration.md
└── README.md
```

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
TINYLLAMA_ENDPOINT=http://localhost:8000/generate
TINYLLAMA_API_KEY=your_api_key_here
```

### Firebase Configuration

Update the Firebase config in `frontend/src/firebase/config.js` with your project details.

## 🎨 Customization

### Styling
- All styles are in component-specific CSS files
- Uses CSS custom properties for easy theming
- Responsive design with mobile-first approach

### Adding New Features
- New components go in `frontend/src/components/`
- API endpoints go in `backend/server.js`
- Update routing in `frontend/src/App.js`

## 🐛 Troubleshooting

### Common Issues

1. **Firebase Authentication not working**
   - Check Firebase config
   - Ensure Authentication is enabled in Firebase Console
   - Check browser console for errors

2. **File upload not working**
   - Ensure backend is running on port 5000
   - Check file size limits
   - Verify PDF file format

3. **Speech recognition not working**
   - Ensure HTTPS or localhost
   - Check microphone permissions
   - Verify browser support

### Development Tips

- Use `npm run dev` for development with auto-reload
- Check browser console for frontend errors
- Check terminal for backend errors
- Use browser dev tools for debugging

## 🚀 Deployment

### Frontend (Vercel/Netlify)
1. Build the frontend: `cd frontend && npm run build`
2. Deploy the `build` folder
3. Update API endpoints to production URLs

### Backend (Heroku/Railway)
1. Add `"engines": {"node": "14.x"}` to package.json
2. Add `"start": "node server.js"` to scripts
3. Deploy with your chosen platform

## 📝 Next Steps

1. Integrate your TinyLlama model
2. Add more interview types
3. Implement user progress tracking
4. Add interview analytics
5. Enhance AI feedback system

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is open source and available under the MIT License.



