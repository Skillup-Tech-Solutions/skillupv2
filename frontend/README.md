# SkillUp Frontend

A modern React + TypeScript + Vite application with PWA and native mobile app support via Capacitor.

## Tech Stack

- **React 18** with TypeScript
- **Vite** for fast development and building
- **Material-UI (MUI)** for UI components
- **TanStack Query** for data fetching
- **Capacitor** for native mobile apps (iOS & Android)
- **PWA** support with offline capabilities

---

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- For iOS: macOS with Xcode 15+
- For Android: Android Studio with SDK 34+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

---

## Capacitor (Native Mobile Apps)

Capacitor allows you to build native iOS and Android apps from your web code.

### Initial Setup

```bash
# Install Capacitor CLI globally (optional)
npm install -g @capacitor/cli

# Capacitor is already configured in this project
# The platforms are located in /android and /ios folders
```

### Building for Mobile

```bash
# 1. Build the web app first
npm run build

# 2. Sync web assets to native platforms
npx cap sync

# 3. Open in native IDE
npx cap open android   # Opens Android Studio
npx cap open ios       # Opens Xcode (macOS only)
```

### Android Development

```bash
# Sync and run on Android
npm run build
npx cap sync android
npx cap open android

# In Android Studio:
# 1. Wait for Gradle sync to complete
# 2. Select your device/emulator
# 3. Click Run (green play button)
```

#### Generating Signed APK/AAB

1. In Android Studio: **Build → Generate Signed Bundle/APK**
2. Create or use existing keystore
3. Select release build variant
4. Find output in `android/app/build/outputs/`

### iOS Development (macOS only)

```bash
# Sync and run on iOS
npm run build
npx cap sync ios
npx cap open ios

# In Xcode:
# 1. Select your team in Signing & Capabilities
# 2. Select your device/simulator
# 3. Click Run (play button)
```

### Live Reload During Development

For faster development with live reload on mobile:

```bash
# Start dev server with network access
npm run dev -- --host

# In capacitor.config.ts, temporarily set:
# server: {
#   url: 'http://YOUR_IP:5173',
#   cleartext: true
# }

# Then sync and run
npx cap sync
npx cap open android  # or ios
```

### Capacitor Configuration

The main configuration is in `capacitor.config.ts`:

```typescript
const config: CapacitorConfig = {
  appId: 'com.skillup.app',
  appName: 'SkillUp',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: '#020617'
    }
  }
};
```

### Useful Capacitor Commands

| Command | Description |
|---------|-------------|
| `npx cap sync` | Sync web assets and plugins to native projects |
| `npx cap copy` | Copy web assets only (faster, no plugin updates) |
| `npx cap open android` | Open Android Studio |
| `npx cap open ios` | Open Xcode |
| `npx cap run android` | Build and run on Android device |
| `npx cap run ios` | Build and run on iOS device |

---

## Environment Variables

Create a `.env` file in the frontend root:

```env
VITE_APP_BASE_URL=http://localhost:5000/api/
VITE_APP_BASE_URL_MAIN=http://localhost:5000/
```

---

## Build Commands

```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build locally
npm run lint     # Run ESLint
```

---

## Project Structure

```
frontend/
├── android/          # Android native project
├── ios/              # iOS native project
├── src/
│   ├── Auth/         # Authentication pages
│   ├── Components/   # Reusable components
│   ├── Pages/        # Page components
│   ├── Hooks/        # Custom React hooks
│   ├── Routes/       # Routing configuration
│   ├── services/     # API and auth services
│   └── utils/        # Utility functions
├── capacitor.config.ts
├── vite.config.ts
└── package.json
```

---

## PWA Support

The app includes full PWA support:
- Offline functionality
- Install prompts
- App-like experience on mobile web

The PWA configuration is in `vite.config.ts` using `vite-plugin-pwa`.

---

## Troubleshooting

### Capacitor Issues

**"Web assets not found"**
```bash
npm run build && npx cap sync
```

**"Plugin not found"**
```bash
npm install @capacitor/[plugin-name]
npx cap sync
```

**Android build fails**
- Update Android Studio and SDK tools
- Clean project: `cd android && ./gradlew clean`

**iOS signing issues**
- Open Xcode and configure your development team
- Check that bundle ID is unique
