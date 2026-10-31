# FLEG Native — Android App

**Repository:** https://github.com/kamalchetri/Fleg-Native- (feature branch `feat/fleg-native-ui`)

This standalone Expo SDK 57 / React Native app uses FLEG's charcoal/lime design, **Home / Scores / Tournaments / Account** tab bar, and the existing **Fleg-web** Supabase project `zcubdqfzdbwtfcdsntoa` (not the restored backup). The preview opens **Home directly**, including for guests.

## Implemented Supabase integrations

- Persistent email/password authentication with Supabase Auth (sign in, sign up, password recovery email request, sign out).
- Top-right account button: guests see a login icon; signed-in users see their profile avatar if one is stored, otherwise a placeholder. Dropdown provides My Profile, current role (read from the protected `profiles` record), Settings, Password Recovery, Logout.
- Account screen: logged-in identity, editable full name, existing avatar URL, member navigation.
- Protected personal notifications: list and mark as read.
- Supabase-backed Home, Scores and Tournaments: lists are fetched through ordinary RLS-scoped queries; scores and tournaments can be refreshed, and the app polls updates every 45 seconds.
- Public match detail pages display actual score data. When a match references a participant not available under RLS, the UI uses a neutral placeholder.

**Security:** App only embeds the public *publishable* Supabase key; no service-role secret. Existing RLS policies, schemas, auth users and records are not modified. Role labels are informational; actual authorization is enforced by Supabase.

## Not yet production-functional

FLEG Native still includes UI-only previews for NSPG medal aggregates, district athlete search, attendance/QR single and batch scanning, scoring write actions, registration forms, certificate issuance, organizer financial workflows, and features under Fitness/Learn/Earn. These screens deliberately do not modify production data until the existing FLEG web business logic, RLS requirements, and backend routines are integrated and verified. Some original NSPG prototype content remains mock data and is marked as such. **Do not use the preview scanner for live entry or venue attendance.**

## Build and install

GitHub Actions workflow `.github/workflows/android-apk.yml` runs dependency install, TypeScript typecheck, Expo Android prebuild, Gradle release APK assembly and uploads a ZIP artifact containing `FLEG-Native-UI-Preview.apk`. Download the successful artifact from the Actions run and install on Android.

Local commands:

```sh
npm install
npm run typecheck
npx expo start
```

App package: `in.fleg.nativeapp.preview` — a test package name, not a production app identity.

## Architecture

- `App.tsx`: screens, navigation, auth state and RLS-backed data views.
- `lib/supabase.ts`: singleton Supabase Auth client with AsyncStorage session persistence and foreground token refresh.
- `assets/`: FLEG launcher icon, adaptive icon and branding.
- `SCREEN_MAP.md`: implemented vs preview screen coverage.

**Do not merge or deploy as a production application until the remaining workflows have been implemented, authorization audited and the APK tested on real devices.**
