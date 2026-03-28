# Digital Commitment Vault

A web app to lock away distracting passwords/credentials behind time gates. Enforce digital discipline with daily unlock windows and optional 90-day master commitment. Built with motivational "Reasons of the Day" to support your focus journey.

## ✨ Features
- **Daily Password Vault**: Lock credentials for 24h+, accessible only in configurable daily windows (e.g., 8-9PM)
- **90-Day Master Lock**: Immutable commitment mode - no changes for 3 months once activated
- **Relapse Protection**: Motivational full-screen modal prevents premature access
- **Future Focus Dashboard**: 90-day countdown, daily focus tasks, 100+ categorized motivational reasons
- **Zen Dark Mode**: Minimalist, high-contrast UI with glassmorphism effects
- **Progressive Enhancement**: Works offline via localStorage, optional MongoDB backend sync
- **Single HTML File**: Embed anywhere, no build step

## 🛠 Tech Stack
- **Frontend**: React (UMD/CDN), Tailwind CSS, localStorage persistence
- **Backend** (optional): Node.js/Express/MongoDB for multi-device sync
- **Deployment Ready**: Static hosting or full-stack Vercel/Railway

## 🚀 Quick Start

### Frontend Only (No Setup)
1. Open `index.html` in any browser
2. Add passwords → Set unlock window → Lock away distractions
3. Test relapse modal, master lock, daily reasons

### Full Stack
```bash
# 1. Install dependencies
npm install

# 2. Copy env template
cp .env.example .env
# Edit .env: Add your MongoDB URI (local or Atlas)

# 3. Run development server
npm run dev
# or production: npm start

# 4. Open http://localhost:5000
```

### MongoDB Setup
**Local** (recommended for dev):
```bash
# Install MongoDB Community
# Mac: brew tap mongodb/brew && brew install mongodb-community
# Windows: Download from mongodb.com
mongod  # Run in separate terminal
```

**Cloud** (Atlas - free tier):
1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get connection string → paste in `.env`
3. Allow network access (0.0.0.0/0 for dev)

## 📱 Usage Flow
```
1. Enter password → Set daily unlock window (ex: 20:00-21:00)
2. Click "Lock Password" → 24h minimum lock
3. Outside window? → Relapse modal reminds your WHY
4. In window after 24h → Reveal password
5. Activate "Master Lock (90 days)" → Everything immutable
6. Dashboard: Daily focus + Reason of the Day motivation
```

## 🧪 Testing Features
- **24h Lock**: Edit localStorage `lockDate` to test unlock logic
- **Unlock Window**: Change system time or use specific times
- **Master Lock**: Activates countdown, blocks all changes
- **Reasons**: 5 categories, deterministic daily pick

## 🤝 Multi-User (Backend)
Uses `userId` param. Extend with JWT auth for production.

## 🔧 Customization
- **Window Times**: Per-password configurable
- **Lock Duration**: Base 24h (extendable)
- **Reasons**: Edit `REASONS` object in index.html
- **Styling**: Tailwind config at top of index.html

## 📁 Project Structure
```
.
├── index.html          # React SPA (works standalone)
├── server.js           # Express/MongoDB backend
├── package.json        # Node deps
├── .env.example        # Env template
├── .gitignore          # Git ignores
└── README.md           # This file
```

## 🚀 Deployment

**Frontend Only** (Vercel/Netlify/Github Pages):
```
Deploy index.html directly
```

**Full Stack**:
```
# Railway/Vercel/Render
Connect repo → Railway auto-detects Node
Env vars from .env → Railway dashboard
```

**Docker** (bonus):
```dockerfile
FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm ci --only=production
EXPOSE 5000
CMD ["npm", "start"]
```

## 🤖 API Endpoints
```
GET    /vault/:userId     → Load vault
POST   /vault/:userId     → Save vault
GET    /                  → Health check
```

## 📈 Future Enhancements
- [ ] JWT Authentication
- [ ] Password strength validation  
- [ ] Export/Import vaults
- [ ] PWA installable app
- [ ] Email reminders
- [ ] Analytics dashboard

## 🙏 Acknowledgments
Built for digital minimalists enforcing commitment through time-gated access and motivational psychology.

**Live Demo**: Open `index.html`  
**Issues?** Check browser console or MongoDB connection.

