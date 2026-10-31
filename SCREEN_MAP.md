# FLEG Native screen map (31 Oct 2026)

| Screen / feature | Status | Data |
|---|---|---|
| Home | Supabase-backed | Recent public tournaments and matches; refresh |
| Scores | Supabase-backed | Live/complete match data + participant names as permitted by RLS; automatic polling |
| Tournaments | Supabase-backed | RLS-visible tournament records and selected tournament details |
| Account | Supabase-backed | Current Supabase Auth user and protected profile; edit name |
| Header account menu | Implemented | Guest sign-in icon; signed-in avatar + role/profile/settings/recovery/logout |
| Authentication | Implemented | Supabase Auth email-password sign in, sign up, recovery request, sign out |
| Notifications | Supabase-backed | Own notifications, mark as read |
| Fitness / Learn / Earn / Community | UI preview | Placeholder |
| NSPG details, registration, athlete/medal views | UI preview | Synthetic values |
| Scanner / Batch / Check-in / Kiosk | UI preview — NO LIVE SCANS | Simulated controls only |
| Scoring controls | UI preview — NO LIVE WRITE | Sample buttons; doesn't submit scores |
| Organizer, earnings, payout, event creation | UI preview — NO LIVE WRITE | Synthetic figures; no transaction |
| Settings | Partial | Local UI preferences, routes to recovery/logout |

## Navigation

Bottom bar: **Home • Scores • Tournaments • Account**. App opens directly on Home without requiring authentication. Header account icon opens Login for guests; avatar and dropdown for authenticated users.

**Important:** UI navigation and role labels do not grant privileges. Production write actions must reuse FLEG web's authorized server workflows and existing Supabase RLS policies. Never include service-role secrets in the app.
