# Dharmayuga - Life OS

A spiritual wellness application combining meditation tracking, enemy-of-the-day challenges, and Bhagavad Gita wisdom.

## Project Structure

```
dharmayuga/
├── backend/          # Node.js/Express backend API
├── life-os/          # Ionic/Angular frontend application
└── README.md
```

## Features

- 🧘 Meditation tracking with streak management
- 📖 Daily Bhagavad Gita shlokas
- ⚔️ Enemy-of-the-day challenges (Kama, Krodha, Lobha, Moha, Mada, Matsarya)
- 📊 Analytics and insights
- 📝 Journal with AI-powered prompts
- 🔥 Streak tracking and gamification

## Tech Stack

### Backend
- Node.js
- Express.js
- Firebase Admin SDK
- Firestore Database
- Google Gemini AI

### Frontend
- Ionic Framework
- Angular
- TypeScript
- SCSS

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore
- Google Gemini API key

### Backend Setup

1. Navigate to backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=3000
GEMINI_API_KEY=your_gemini_api_key
```

4. Add Firebase service account key:
   - Download `serviceAccountKey.json` from Firebase Console
   - Place it in the `backend/` directory

5. Run the backend:
```bash
npm start
```

The backend will run on `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:
```bash
cd life-os
```

2. Install dependencies:
```bash
npm install
```

3. Update environment configuration:
   - Edit `src/environments/environment.ts` with your Firebase config

4. Run the development server:
```bash
ionic serve
```

The app will open at `http://localhost:8100`

## API Endpoints

### User Routes
- `POST /api/users` - Create user
- `GET /api/users/:userId` - Get user details
- `PUT /api/users/:userId` - Update user

### Meditation Routes
- `POST /api/meditation/start` - Start meditation session
- `POST /api/meditation/complete` - Complete meditation session
- `GET /api/meditation/history/:userId` - Get meditation history

### Shloka Routes
- `GET /api/shlokas/daily/:userId` - Get daily shloka
- `GET /api/shlokas/random` - Get random shloka

### Enemy Routes
- `GET /api/enemy-of-day/:userId` - Get enemy of the day
- `POST /api/enemy-analytics/checkin` - Submit enemy check-in

### Analytics Routes
- `GET /api/analytics/:userId` - Get user analytics
- `GET /api/insights/:userId` - Get personalized insights

## Firebase Collections

- `users` - User profiles and settings
- `meditations` - Meditation session records
- `shlokas` - Bhagavad Gita verses
- `enemyCheckIns` - Daily enemy challenge check-ins
- `journalEntries` - User journal entries

## Development

### Running Tests
```bash
# Backend
cd backend
npm test

# Frontend
cd life-os
npm test
```

### Building for Production

#### Backend
```bash
cd backend
npm run build
```

#### Frontend
```bash
cd life-os
ionic build --prod
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Bhagavad Gita verses and translations
- Firebase for backend infrastructure
- Google Gemini AI for intelligent insights
- Ionic Framework for cross-platform development