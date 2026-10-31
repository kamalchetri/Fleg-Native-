# FLEG Native frontend screen map

| Area | Routes | UI interactions |
|---|---|---|
| Entry | Splash, Onboarding | Explore, Continue, Guest preview |
| Authentication | Login, Signup, Forgot Password | Forms and preview navigation; no network |
| Main | Home, Discover, Live, My Games, Profile | Five-tab navigation, quick links |
| FLEG pillars | Fitness, Learn, Earn, Community | Training, learning, rewards, sports community |
| NSPG | Hub, Sports, Sport Detail, Districts, Medals, Fixtures | Discipline and district browse |
| Athletes | Search, Registrations, Athlete Detail, Digital ID | Tabbed profile, search, reference-only accreditation |
| Competition | Match Details, Match Control, Tournament | Sample scores and operator controls |
| Organizers | Organizer Hub, Create Event, Earnings, Review | Forms and management UI |
| Scanner | Accreditation, Single QR, Batch QR, Scan Result, Kiosk | Simulated camera, scan results, registration lookup |
| Personal | Notifications, Certificates, Statistics, Settings, Help | Informational UI, toggles |

## Navigation rules

- Main routes: Home, Discover, Live, My Games, Profile.
- Secondary route panels return through the Back icon (prototype stack).
- Real role gates, guards and authorization are not simulated as security controls.
- Sample QR views, IDs, payouts and medal tallies are **not authoritative**.

## Essential next step

Once a backend and existing UX contracts are available, decide which routes are public, which require sign-in, and which require organizer/admin privileges **before integrating data actions**. UI controls must never be treated as backend authorization.