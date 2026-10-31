# FLEG Native Route and Role Matrix

| Route / module | Guest | Signed-in member | Organizer (approved/owner) | Referee / scorer | Admin | Current backend status |
|---|---|---|---|---|---|---|
| Home | Yes | Yes | Yes | Yes | Yes | Real tournament and score feed |
| Scores / match details | Yes | Yes | Yes | Yes | Yes | Real score data |
| Tournaments | Yes | Yes | Yes | Yes | Yes | Real tournament data |
| NSPG / districts / sports | Yes | Yes | Yes | Yes | Yes | Official public Supabase RPC |
| Medals / fixtures | Yes | Yes | Yes | Yes | Yes | Approved medal records / RLS-visible fixtures |
| Discover / workshops | Yes | Yes | Yes | Yes | Yes | Published registration forms and workshops |
| Account / login | Login | Own | Own | Own | Own | Supabase Auth and protected profiles |
| Notifications / registration codes | No | Own | Own | Own | Own | User-scoped RLS queries |
| Progress / badges / coins | Public landing | Own | Own | Own | Own | Data-backed but not full coaching/payment product |
| Organizer dashboard | No | No | Yes | Only if assigned owner/co-organizer | Yes | Owned tournaments/forms |
| Create tournament | No | No | Yes, draft only | Only if organizer-authorized | Yes | Real draft insert with RLS |
| Organizer payout summary | No | No | Yes | Only if organizer-authorized | Yes | RLS-owned payout records |
| Assigned games / match control | No | No | Yes | Yes | Yes | Real assigned match data; scoring writes need existing server engine |
| Review submissions | No | No | No | No | Yes | Admin read-only through RLS |
| QR scanner / batch / accreditation / lookup | No | No | No | No | Yes | Real server-validated movement; admin-only Edge API |
| Certificates | No | Own | Own | Own | Own | Earned badges displayed; official PDF issuance pending |
| Fitness / Learn / Earn / Community | Landing | Partial | Partial | Partial | Partial | Progress, quests, coins, workshops, leagues and badges |

## Authorization notes

- DB-reported `profiles.role`, approved organizer status, and tournament staff assignments determine client navigation.
- Do not rely on client UI checks to authorize operations: Supabase RLS and the `fleg-scanner` Edge API perform server checks.
- On the server, `fleg-scanner` accepts **admin** accounts only; it validates registration eligibility, QR identity preview, duplicates, and IN/OUT. NSPG lead/staff cannot scan unless the backend is separately extended and reviewed.
- Unimplemented mutations never pretend success or present synthetic records as authoritative. Sport-specific scoring and payment processing require their existing server-side logic, and must not be rebuilt as unvalidated direct writes.
