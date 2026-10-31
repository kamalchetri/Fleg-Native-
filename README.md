# FLEG Native — Complete Frontend UI/UX Preview

**Target repository:** https://github.com/kamalchetri/Fleg-Native-

This is a **standalone Expo React Native UI starter** for the FLEG Native application—independent of the separate scoring and scanner applications. It uses the real FLEG mark and lockup supplied for this conversation and the approved premium black/neon-lime interface direction. It can be reviewed without a backend, credentials, or access to live registrant data.

## Quick start

```bash
npm install
npx expo install --fix
npm start
```

Open using Expo Go or Android emulator. Screen navigation is local and intended for UI review. Tap **Explore FLEG**, then **Explore as guest** from onboarding, or use the demo sign-in button. **Authentication, scoring, scanner processing, attendance, earnings, and registrations are demonstration-only**. They do not write to any server.

## Included UI screens (42 routes)

Splash, onboarding, sign in, sign up, reset password, Home, Discover, Live Scores, My Games, Profile, Fitness, Learn, Earn, Community, NSPG Hub, Sports List, Sport Details, Athlete Search, Athlete Details (six information tabs), Districts, Medals, Fixtures, Match Details, Match Control, Event Details, Tournament Details, Create Event, Organizer Hub, Earnings, Registrations, Accreditation, Kiosk, QR Scanner, Batch Check-in, Scan Result, Notifications, Settings, Help, Digital ID, Statistics, Review Queue, Certificates.

Four primary app pillars (Fitness / Learn / Earn / Game) complement the FLEG sporting platform and its separate scanning workflows. Screens are examples, not claims that these modules exist in production. Data is mock-only, with a persistent **UI PREVIEW / SAMPLE DATA** banner on application screens.

## Brand & interaction

- Obsidian canvas `#050907`, surface `#111B15`, lime `#92F716`, restrained neon lighting.
- Correct FLEG emblem/lockup extracted from the original provided PNG.
- Rounded touch targets, high-contrast status colors (green, amber, red), primary five-item bottom navigation.
- App launcher icon and Android adaptive foreground in `assets/`.
- Handcrafted Android-friendly preview for app screens; no webviews.

## Repository and deployment status

The user-provided `kamalchetri/Fleg-Native-` repository was checked on **31 Oct 2026** and was **empty**, with no branches or commits. This package is therefore an **initial frontend starter**, not a patch to existing source. The GitHub repository was **not changed**. An initial repository commit is needed before branches and pull requests can be created.

This preview's Android application ID (`in.fleg.native.preview`) intentionally avoids any known existing FLEG package. Do not replace production identity, settings, auth, backend security or Expo Updates settings without first inspecting their authoritative configuration.

## Remaining production tasks

- Define the final API contract, role permissions and Supabase RLS-backed services for the new repo.
- Replace sample data with live queries and server-confirmed results. Do not expose sensitive personal data in public routes.
- Use actual QR camera SDK with token signature validation; implement duplicate prevention, per-user IN/OUT state, and transaction-level attendance writes on the backend.
- Integrate native Android back-button behavior, deep links, offline queue, synchronization conflict rules and guarded roles.
- Add loading/empty/error states, analytics consent, accessibility labels and localization where required.
- Test Android and iOS after installing Expo dependencies. TypeScript source was syntax checked; no APK build is claimed.

**No commits, deployment, APK build, database write, or changes to any other repository were performed.**