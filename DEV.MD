# SkillUp Project - Developer Guide (DEV.MD)

This document serves as the primary technical guide for the SkillUp development team. It covers setup, architecture, workflows, and production release processes for both Frontend (Web/Mobile) and Backend.

---

## 🏛 Project Architecture

SkillUp is a decoupled full-stack application:
- **Frontend**: A unified React/Vite/TypeScript application that serves as a Web App, PWA, and Native Mobile App (via Capacitor).
- **Backend**: A Node.js/Express REST API with MongoDB for data persistence and Socket.io for real-time features.

---

## 🛠 Technology Stack

### Backend
- **Framework**: Node.js / Express
- **Database**: MongoDB (Mongoose ODM)
- **Real-time**: Socket.io 4.x
- **Storage**: Backblaze B2 (Handled via backend proxy)
- **Email**: Mailjet
- **Security**: JWT, BcryptJS, Helmet, Express-Rate-Limit
- **Task Scheduling**: Node-cron

### Frontend & Mobile
- **Core**: React 19 / TypeScript / Vite
- **UI**: Material UI (MUI) 7, @phosphor-icons/react
- **Network**: Axios (with global interceptors for auth)
- **Data Fetching**: TanStack Query (React Query) 5
- **Mobile**: Capacitor 7 (Android/iOS support)
- **PWA**: vite-plugin-pwa (Offline support & Service Workers)

---

## 📡 Backend Development

### Setup
1. `cd backend`
2. `npm install`
3. Create `.env` from `.env.example` and fill in the values.
4. `npm run dev` (Starts server with `nodemon`)

### Docker
The backend includes a `Dockerfile` and `docker-compose.yml` for containerized environments.
```bash
docker-compose up --build
```

### Data Seeding
To initialize the database with an admin user:
```bash
npm run seed-data
```

### API Documentation
The project uses Swagger for API documentation. Accessible at:
- `http://localhost:5000/api-docs`

---

## 💻 Frontend & Mobile Development

### Setup
1. `cd frontend`
2. `npm install`
3. Create `.env` from `.env.example`.
4. `npm run dev` (Starts Vite dev server)

### Capacitor Mobile Workflow
Capacitor bridges the web app to native mobile code (Android Studio/Xcode).

```bash
# 1. Build web assets
npm run build

# 2. Sync web assets and plugins to native projects
npx cap sync

# 3. Open in native IDE
npx cap open android   # Opens Android Studio
npx cap open ios       # Opens Xcode
```

---

## ☁️ Storage System (B2 Proxy)

The application uses a hybrid storage approach for efficiency and reliability:
1. **Uploads**: Files are initially uploaded to the backend's `/uploads` directory.
2. **Persistence**: Files are synced to **Backblaze B2**.
3. **Retrieval**: The backend serves as a proxy. If a file is not found locally in `/uploads`, the server automatically fetches it from B2 and streams it to the client. This handles CORS issues and provides a seamless fallback.

---

## 📦 Versioning & Release Workflow

We use a centralized versioning system to ensure the Web, Android, and iOS versions remain in sync.

### 1. Semantic Versioning
Versions follow `MAJOR.MINOR.PATCH` (e.g., `1.2.3`).

### 2. Central Source of Truth
The `version` field in **`frontend/package.json`** is the master version.

### 3. Automated Sync Commands
**Always** use these commands to bump your version. They will automatically update `package.json`, Android's `build.gradle` (`versionCode` & `versionName`), and the frontend utility `src/utils/version.ts`.

```bash
cd frontend

# For Bug Fixes
npm run version:patch

# For New Features
npm run version:minor

# For Breaking Changes
npm run version:major

# To manually sync after editing package.json
npm run version:sync
```

---

## 🔔 Mobile Features (Native)

### Push Notifications
The app uses Firebase Cloud Messaging (FCM). 
- **Setup**: Requires `google-services.json` (Android) and `GoogleService-Info.plist` (iOS) in the respective native folders.
- **Service**: Logic is handled in `pushNotificationService.ts`.
- **Registration**: Device tokens are automatically registered with the backend upon login.

### Deep Linking
The app supports deep links (e.g., `skillup://student/dashboard`).
- **Handler**: `initDeepLinkHandler()` in `App.tsx` handles incoming URLs and navigates the React application accordingly.
- **Config**: Android intents are configured in `AndroidManifest.xml`.

---

## � PWA & Service Worker

The application is configured as a high-performance Progressive Web App:
- **Service Worker**: Managed by `vite-plugin-pwa`. It handles precaching of assets and provides a custom offline fallback.
- **Web Loader**: A native-like instant loader is implemented in `index.html` to improve perceived performance on web.
- **Dynamic Theme**: `index.html` contains a script that automatically applies specific theme classes (`portal-theme`) based on the URL hash, ensuring the UI remains premium even during initial hydration.

---

## �🎨 Premium AI Aesthetics Strategy

As an AI-driven team, we prioritize **Visual Excellence**:
- **Typography**: Strictly use modern fonts like `Chivo`, `Inter`, or `JetBrains Mono` for code-like elements.
- **Glassmorphism**: Use semi-transparent backgrounds with `backdrop-filter: blur()` for cards and overlays.
- **Micro-animations**: Implement subtle hover scales (e.g., `scale(1.02)`) and fade transitions for all state changes.
- **Color Palettes**: Avoid flat colors. Use rich dark themes (`#0f172a`, `#020617`) with vibrant accent highlights (`#3b82f6`, `#ef4444`).

---

## 🔧 Troubleshooting

- **CORS Errors**: Ensure the frontend origin is allowed in `backend/server.js`.
- **Chunk Load Errors**: Handled automatically in `main.tsx` via page reload, but occurs when new code is deployed and old assets are purged.
- **Capacitor Plugin Sync**: If you add a new capacitor plugin via npm, you **must** run `npx cap sync`.

---
