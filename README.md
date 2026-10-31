# FLEG Native — Role-Aware Android App

**GitHub:** https://github.com/kamalchetri/Fleg-Native- • Work branch `feat/fleg-native-ui`  
**Backend:** Existing Fleg-web Supabase project `zcubdqfzdbwtfcdsntoa`. The restored backup is not used.

## Runtime

- **Launches directly to Home**, including for guests.
- Bottom tabs: **Home / Scores / Tournaments / Account** on every normal screen.
- Guest top-right profile icon opens Login. Signed-in accounts show the stored avatar (when present) and account menu: My Profile, verified role, Settings, Password Recovery, Logout.
- Login, signup, session persistence, password reset request and logout are powered by Supabase Auth.
- Screens are filtered using `profiles.role`, approval from `organizer_profiles`, and role memberships from `tournament_staff`. A route guard blocks unauthorized screens. **Supabase RLS and server-side authorization remain the security boundary**.

## Implemented Supabase features

- Real tournament and match feeds, fixtures, results, event details, refresher and score polling (subject to RLS).
- Personal profile and profile name edit, notification history and marking notifications read.
- Published workshop discovery, public event forms, approved entrant search, NSPG official programme (15 sports / 17 districts).
- Logged-in registrations and registration codes, player progress/XP/coins/quests, public league/badges, earned badges, organizer tournaments and forms, payout list, admin registration reviews (read-only).
- Approved organizers (or otherwise database-authorized users) can **create actual draft tournaments**, with server RLS enforcement.
- Publicly approved NSPG medal records (no invented rankings).
- **Admin-only QR camera scanner** via existing `fleg-scanner` and `qr-mobile` Supabase Edge Functions: lookup/preview, validated single and batch IN/OUT, explicit participant identity attestation, backend idempotency, signed photo profile lookup, attendance history, daily report. Camera uses Expo SDK 57 modules.

## Important limitations — not production complete

The frontend currently **does not** implement end-to-end sport-specific scoring edits, automated paid registrations / payment verification, all organizer admin operations, public full athlete biographies, certified PDF downloads, or complete Fitness / Learn / Earn business workflows. The existing FLEG server contracts must be reused or extended for these actions. Some personal achievements are only available as badges. The current server Edge Function authorizes scanner operations to **admin accounts only**; NSPG staff are not given mobile scanner privileges by the frontend.

**Do not merge or label this fully functional** until these operations, user-role tests, registration/payment flows and device scans are validated.

## Developer

```sh
npm install
npm run typecheck
npx expo start
```

Android build workflow: `.github/workflows/android-apk.yml`. On success, the run has a downloadable APK artifact. Android application package currently `in.fleg.nativeapp.preview`.

Only the publishable Supabase key is shipped in the client. The backend secret key and administrator database access are not exposed in the APK. The existing database, policies, and Edge Functions are not modified by this branch.
