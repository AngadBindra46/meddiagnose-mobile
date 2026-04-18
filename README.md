# meddiagnose-mobile

Expo React Native mobile app for the MedDiagnose platform. Patients can describe symptoms, upload medical reports, and receive AI-powered diagnoses.

## Tech Stack

- **Framework**: Expo SDK 55 + React Native 0.83
- **Navigation**: Expo Router (file-based)
- **State**: Zustand
- **HTTP**: Axios
- **Health Data**: Apple HealthKit integration (`@kingstinct/react-native-healthkit`)
- **Languages**: TypeScript

## Quick Start

```bash
# 1. Install dependencies
npm install

# 2. Start development server
npx expo start

# 3. Run on device/simulator
npx expo start --ios      # iOS Simulator
npx expo start --android  # Android Emulator
```

## Build with EAS

```bash
# Install EAS CLI
npm install -g eas-cli

# Configure (update app.json with your EAS project ID)
eas build:configure

# Build for iOS
eas build --platform ios

# Build for Android
eas build --platform android
```

## Screens

| Screen | File | Description |
|--------|------|-------------|
| Home | `app/index.tsx` | Landing / main screen |
| Chat | `app/chat.tsx` | AI diagnosis chat interface |
| Disclaimer | `app/disclaimer.tsx` | Medical disclaimer |
| Privacy Policy | `app/privacy-policy.tsx` | Privacy policy |
| Terms of Service | `app/terms-of-service.tsx` | Terms of service |

## Features

- Symptom input with AI-powered diagnosis
- Medical report upload (camera, gallery, documents)
- Chat-based interface for diagnosis interaction
- Apple HealthKit sync (steps, heart rate, sleep)
- Multi-language support (English, Spanish, Hindi)
- Push notifications for diagnosis results

## Configuration

Edit `app.json` to configure:
- `expo.extra.eas.projectId` -- Your EAS project ID
- `expo.owner` -- Your Expo account username
- API base URL is configured in the app's environment/constants

## Permissions

**iOS**: Camera, Photo Library, HealthKit (read/write)
**Android**: Camera, External Storage, Vibrate, Boot Receiver, Exact Alarm, Audio Recording

## Related Repos

- [meddiagnose-api](https://github.com/AngadBindra46/meddiagnose-api) -- Backend API
- [meddiagnose-web](https://github.com/AngadBindra46/meddiagnose-web) -- Web dashboard
