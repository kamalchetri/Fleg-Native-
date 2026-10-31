/**
 * FLEG Native navigation visibility. These rules improve UX, they do NOT authorize writes.
 * Supabase RLS and approved server endpoints remain the security boundary.
 */
export type AppRole = 'guest' | 'player' | 'organizer' | 'referee' | 'admin' | 'nspg_lead' | 'nspg_staff';
export type StaffRole = 'owner' | 'co_organizer' | 'referee' | 'scorekeeper';
export type AppScope = {
  role: AppRole;
  signedIn: boolean;
  organizerApproved: boolean;
  staffRoles: StaffRole[];
};
export const GUEST_SCOPE: AppScope = { role:'guest',signedIn:false,organizerApproved:false,staffRoles:[] };
const PUBLIC_ROUTES = new Set([
  'home','live','tournament','profile','discover','match','event','nspg','sports',
  'districts','fixtures','medals','fitness','learn','earn','community',
  'help','login','signup','forgot','splash','onboarding'
]);
const MEMBER_ROUTES = new Set([
  'profile','notifications','settings','athlete','search','idcard',
  'registrations','certificates'
]);
const ORGANIZER_ROUTES = new Set([
  'organizer','createEvent','earnings','statistics'
]);
const SCORER_ROUTES = new Set(['matchControl']);
const NSPG_ROUTES = new Set(['accreditation','scanner','batch','scanResult','kiosk']);
export function canAccessRoute(route:string, scope:AppScope):boolean {
  if(PUBLIC_ROUTES.has(route)) return true;
  if(!scope.signedIn) return false;
  if(MEMBER_ROUTES.has(route)) return true;
  const admin=scope.role==='admin';
  const organizer=admin||scope.role==='organizer'||scope.organizerApproved||scope.staffRoles.some(r=>r==='owner'||r==='co_organizer');
  const official=admin||organizer||scope.role==='referee'||scope.staffRoles.some(r=>r==='referee'||r==='scorekeeper');
  if(route==='review') return admin; // Existing form-submission policies permit admin review, not arbitrary organizer review.
  if(route==='games') return official;
  if(ORGANIZER_ROUTES.has(route)) return organizer;
  if(SCORER_ROUTES.has(route)) return official;
  if(NSPG_ROUTES.has(route)) return admin; // Scanner API verifies DB admin role; NSPG staff are not API-authorized.
  return false;
}
export function navigationForRole(scope:AppScope) {
  const items = [
    {route:'home',label:'Home',icon:'home-variant-outline'},
    {route:'live',label:'Scores',icon:'scoreboard-outline'},
    {route:'tournament',label:'Tournaments',icon:'trophy-outline'},
    {route:'profile',label:'Account',icon:'account-outline'},
  ];
  return items.filter(i=>canAccessRoute(i.route,scope) || i.route==='profile');
}
export function accountLinks(scope:AppScope) {
  const links = [
    {route:'profile',label:'My Profile',icon:'account-circle-outline'},
    {route:'registrations',label:'My Registrations',icon:'clipboard-account-outline'},
    {route:'idcard',label:'My Digital ID',icon:'card-account-details-outline'},
    {route:'notifications',label:'Notifications',icon:'bell-outline'},
    {route:'certificates',label:'Certificates',icon:'certificate-outline'},
    {route:'settings',label:'Settings',icon:'cog-outline'},
    {route:'organizer',label:'Organizer Hub',icon:'shield-check-outline'},
    {route:'games',label:'Assigned Games',icon:'trophy-outline'},
    {route:'matchControl',label:'Match Control',icon:'whistle-outline'},
    {route:'accreditation',label:'Accreditation',icon:'qrcode-scan'},
    {route:'statistics',label:'Statistics',icon:'chart-line'},
  ];
  return links.filter(l=>canAccessRoute(l.route,scope));
}
export function roleLabel(scope:AppScope){
  return scope.role==='nspg_lead'?'NSPG Lead':
    scope.role==='nspg_staff'?'NSPG Staff':
    scope.role[0].toUpperCase()+scope.role.slice(1);
}
