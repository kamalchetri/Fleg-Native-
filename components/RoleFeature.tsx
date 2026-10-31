import React,{useEffect,useState} from 'react';
import {View,Text,TextInput,Pressable,ActivityIndicator,Alert} from 'react-native';
import {MaterialCommunityIcons} from '@expo/vector-icons';
import {supabase} from '../lib/supabase';
import {AppScope,roleLabel} from '../lib/access';
import ScannerFeature from './ScannerFeature';

const colors={bg:'#050907',card:'#111B15',lime:'#92F716',line:'#243D2C',white:'#F7FAF6',muted:'#9AA99D',red:'#FF5964',amber:'#FDBA48'};
type Props={route:string,scope:AppScope,uid:string|null,onNavigate:(route:string)=>void};
type AnyRow=Record<string,any>;
function Txt({children,dim=false,big=false}: {children:React.ReactNode,dim?:boolean,big?:boolean}){return <Text style={{fontSize:big?22:13,fontWeight:big?'800':'400',color:dim?colors.muted:colors.white}}>{children}</Text>}
function Panel({children}:{children:React.ReactNode}){return <View style={{padding:15,backgroundColor:colors.card,borderWidth:1,borderColor:colors.line,borderRadius:17,gap:7,marginBottom:9}}>{children}</View>}
function Action({title,onPress,disabled=false}:{title:string,onPress:()=>void,disabled?:boolean}){return <Pressable disabled={disabled} onPress={onPress} style={{padding:13,borderRadius:12,backgroundColor:disabled?colors.line:colors.lime,marginTop:8,alignItems:'center'}}><Text style={{color:colors.bg,fontWeight:'800'}}>{title}</Text></Pressable>}
const asText=(v:any)=>v==null?'—':typeof v==='object'?JSON.stringify(v):String(v);
const date=(v:any)=>v?new Date(v).toLocaleDateString('en-IN',{day:'numeric',month:'short',year:'numeric'}):'Date pending';
export default function RoleFeature({route,scope,uid,onNavigate}:Props){
const [rows,setRows]=useState<AnyRow[]>([]);
const [extra,setExtra]=useState<AnyRow[]>([]);
const [loading,setLoading]=useState(false);
const [error,setError]=useState('');
const [search,setSearch]=useState('');
const [reload,setReload]=useState(0);
const [eventTitle,setEventTitle]=useState('');
const [eventSport,setEventSport]=useState('');
const [eventCity,setEventCity]=useState('');
const [saving,setSaving]=useState(false);
const [progress,setProgress]=useState<AnyRow|null>(null);
useEffect(()=>{
 let active=true;
 const load=async()=>{
  setRows([]);setExtra([]);setError('');setProgress(null);setLoading(true);
  try{
   let result:AnyRow[]=[],other:AnyRow[]=[];
   const get=async(req:any)=>{const {data,error}=await req;if(error)throw error;return (data||[]) as AnyRow[];};
   if(route==='discover'){
     result=await get(supabase.from('reg_forms').select('id,title,sport,venue_name,city,status,registration_closes_at,description').eq('status','open').eq('visibility','public').limit(30));
     other=await get(supabase.from('workshops').select('id,title,venue,event_date,registration_open,short_description').eq('publication_status','published').order('event_date',{ascending:false}).limit(30));
   }else if(route==='learn'){
     result=await get(supabase.from('workshops').select('id,title,venue,event_date,registration_open,short_description').eq('publication_status','published').limit(40));
   }else if(route==='community'){
     result=await get(supabase.from('leagues').select('id,tier,week_start').limit(20));
     other=await get(supabase.from('badges').select('id,name,description,tier').limit(30));
   }else if(route==='fitness'||route==='earn'){
     if(uid){
       const response=await supabase.from('player_progress').select('xp,level,coins,current_streak,longest_streak,ovr_rating,league_tier').eq('user_id',uid).maybeSingle();
       if(response.error)throw response.error;
       if(active)setProgress(response.data||null);
       if(route==='fitness')result=await get(supabase.from('user_quests').select('id,progress,completed,claimed,quest_date').eq('user_id',uid).limit(30));
       else result=await get(supabase.from('coin_transactions').select('id,delta,reason,created_at,balance_after').eq('user_id',uid).order('created_at',{ascending:false}).limit(30));
     }
   }else if(route==='certificates'){
     if(uid){
       const earned=await get(supabase.from('user_badges').select('badge_id,earned_at').eq('user_id',uid).limit(50));
       const badges=earned.length?await get(supabase.from('badges').select('id,name,description,tier').in('id',earned.map(x=>x.badge_id))):[];
       result=earned.map(e=>({...e,name:badges.find(b=>b.id===e.badge_id)?.name||'Earned Badge'}));
     }
   }else if(route==='registrations'||route==='idcard'){
     if(uid)result=await get(supabase.from('reg_submissions').select('id,reg_code,form_id,status,payment_status,created_at').eq('user_id',uid).order('created_at',{ascending:false}).limit(50));
   }else if(route==='athletes'||route==='search'){
     if(search.trim().length>=2){
       const safe=search.trim().replace(/[%_,]/g,'').slice(0,60);
       result=await get(supabase.from('entrants').select('id,display_name,tournament_id,status').eq('status','approved').ilike('display_name','%'+safe+'%').limit(25));
     }
   }else if(route==='medals'){
     result=await get(supabase.from('nspg_athlete_medals').select('id,medal,award_scope,approved_at,status').eq('status','approved').limit(200));
   }else if(route==='fixtures'){
     result=await get(supabase.from('matches').select('id,tournament_id,status,scheduled_at,score,court').order('scheduled_at',{ascending:true}).limit(65));
   }else if(route==='games'||route==='matchControl'){
     if(uid){
       result=await get(supabase.from('matches').select('id,tournament_id,status,scheduled_at,score,court,referee_id').eq('referee_id',uid).order('scheduled_at',{ascending:false}).limit(50));
       if(route==='games')other=await get(supabase.from('tournament_staff').select('tournament_id,staff_role').eq('user_id',uid).limit(100));
     }
   }else if(route==='organizer'||route==='createEvent'){
     if(uid){
       result=await get(supabase.from('tournaments').select('id,name,sport,status,starts_at,created_at').eq('organizer_id',uid).order('created_at',{ascending:false}).limit(50));
       other=await get(supabase.from('reg_forms').select('id,title,status,created_at').eq('organizer_id',uid).order('created_at',{ascending:false}).limit(50));
     }
   }else if(route==='review'){
     if(scope.role==='admin') result=await get(supabase.from('reg_submissions').select('id,form_id,status,payment_status,created_at').order('created_at',{ascending:false}).limit(70));
   }else if(route==='earnings'){
     if(uid)result=await get(supabase.from('payouts').select('id,reference,amount,status,cycle,scheduled_at,paid_at').eq('organizer_id',uid).order('created_at',{ascending:false}).limit(40));
   }else if(route==='statistics'){
     if(uid){
       result=await get(supabase.from('tournaments').select('id,name,status').eq('organizer_id',uid).limit(100));
       other=await get(supabase.from('payouts').select('id,amount,status').eq('organizer_id',uid).limit(100));
     }
   }
   if(active){setRows(result);setExtra(other);}
  }catch(e:any){if(active)setError(e?.message||'This information could not be retrieved with your current access.')}
  finally{if(active)setLoading(false)}
 };
 void load();
 return()=>{active=false};
},[route,uid,reload,search,scope.role]);
async function createDraft(){
 if(!uid||!(scope.organizerApproved||scope.role==='admin'||scope.staffRoles.includes('owner'))){Alert.alert('Not authorized','Only approved or authorized organizers can create events.');return}
 if(eventTitle.trim().length<3||eventSport.trim().length<2){Alert.alert('Missing details','Enter a tournament name and sport.');return}
 setSaving(true);
 try{
  const slug=(eventTitle.trim().toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'').slice(0,40)+'-'+Date.now().toString(36));
  const {error}=await supabase.from('tournaments').insert({name:eventTitle.trim(),sport:eventSport.trim(),city:eventCity.trim()||null,slug,organizer_id:uid,status:'draft',visibility:'private'});
  if(error)throw error;
  setEventTitle('');setEventSport('');setEventCity('');setReload(x=>x+1);
  Alert.alert('Draft saved','Your draft tournament was created in FLEG.');
 }catch(e:any){Alert.alert('Could not create event',e?.message||'Permission or validation failed.')}
 finally{setSaving(false)}
}
if(['accreditation','scanner','batch','scanResult','kiosk'].includes(route))return <ScannerFeature route={route} scope={scope} uid={uid} onNavigate={onNavigate}/>;
if(route==='athlete')return <Panel><Txt big>Athlete profile</Txt><Txt dim>Searchable public competition entries and verified personal athlete profiles require a supported identity link. The app will not show a synthetic ID or another person’s private record.</Txt><Action title="Search Public Participants" onPress={()=>onNavigate('search')}/></Panel>;
if(route==='createEvent')return <View style={{gap:12}}>
 <Txt big>Create Tournament Draft</Txt><Txt dim>Creates a real draft in your FLEG organizer account. Publishing and paid registration still use the approved organizer workflow.</Txt>
 {([['Tournament name',eventTitle,setEventTitle],['Sport',eventSport,setEventSport],['City',eventCity,setEventCity]] as [string,string,(x:string)=>void][]).map(([label,value,change])=><TextInput key={label} placeholder={label} placeholderTextColor={colors.muted} value={value} onChangeText={change} style={{backgroundColor:colors.card,padding:15,borderRadius:12,borderColor:colors.line,borderWidth:1,color:colors.white}}/>)}
 <Action title={saving?'Saving...':'Save Draft'} onPress={()=>{void createDraft()}} disabled={saving}/>
 <Txt big>My Tournaments</Txt>
 {rows.map(r=><Panel key={r.id}><Txt>{asText(r.name)}</Txt><Txt dim>{asText(r.status)}</Txt></Panel>)}
 </View>;
const heading:Record<string,string>={discover:'Discover Events & Workshops',games:'My Assigned Matches',fitness:'My Fitness & Activity',learn:'Sports Workshops',earn:'My Rewards & Coins',community:'Sports Community',certificates:'My Badges & Certificates',registrations:'My Registrations',idcard:'My Registration IDs',athletes:'Search Public Participants',search:'Find Athletes',medals:'Approved NSPG Medals',fixtures:'Fixtures',matchControl:'My Assigned Match Control',organizer:'My Organizer Dashboard',review:'Registration Review',earnings:'My Payouts',statistics:'Organizer Statistics'};
return <View style={{gap:12}}>
 <Txt big>{heading[route]||'FLEG'}</Txt>
 <Txt dim>{uid?'Signed in as '+roleLabel(scope):'Public information • Login for personalized features'}</Txt>
 {['search','athletes'].includes(route)&&<TextInput value={search} onChangeText={setSearch} placeholder="Search approved athlete name" placeholderTextColor={colors.muted} style={{color:colors.white,backgroundColor:colors.card,borderRadius:12,padding:14,borderWidth:1,borderColor:colors.line}}/>}
 <Pressable onPress={()=>setReload(r=>r+1)} style={{alignSelf:'flex-end',padding:8}}><Txt>↻ Refresh from Supabase</Txt></Pressable>
 {loading&&<ActivityIndicator size="large" color={colors.lime}/>}
 {!!error&&<Panel><Txt>{error}</Txt><Txt dim>The existing Supabase RLS rules may restrict access to this data.</Txt></Panel>}
 {(route==='fitness'||route==='earn')&&<Panel><Txt big>{progress?'Level '+asText(progress.level):'No activity recorded yet'}</Txt>{progress&&<><Txt>XP: {asText(progress.xp)} • Coins: {asText(progress.coins)}</Txt><Txt dim>Streak: {asText(progress.current_streak)} • League: {asText(progress.league_tier)}</Txt></>}</Panel>}
 {route==='statistics'&&<Panel><Txt big>{rows.length} tournaments</Txt><Txt>Recorded payouts: {extra.length}</Txt><Txt dim>Only your RLS-visible organizer records are counted.</Txt></Panel>}
 {route==='medals'&&<Panel><Txt>Approved medal awards: {rows.length}</Txt><Txt dim>{rows.length===200?'Showing first 200 records (not full totals)':'Based only on publicly approved medal records.'}</Txt></Panel>}
 {!loading&&rows.length===0&&!error&&<Panel><Txt dim>{['search','athletes'].includes(route)&&search.trim().length<2?'Enter at least two characters to search.':'No records are currently available for your account and permissions.'}</Txt></Panel>}
 {rows.map((r,i)=><Panel key={r.id||String(i)}>
   <Txt>{asText(r.title||r.name||r.display_name||r.reg_code||r.reference||r.medal||r.status||r.id)}</Txt>
   {r.sport&&<Txt dim>{asText(r.sport)}</Txt>}
   {r.venue_name&&<Txt dim>Venue: {asText(r.venue_name)}</Txt>}
   {r.venue&&<Txt dim>{asText(r.venue)}</Txt>}
   {r.staff_role&&<Txt dim>Role: {asText(r.staff_role)}</Txt>}
   {r.status&&<Txt dim>Status: {asText(r.status)}</Txt>}
   {r.payment_status&&<Txt dim>Payment: {asText(r.payment_status)}</Txt>}
   {r.registration_open!=null&&<Txt dim>{r.registration_open?'Registration open':'Registration closed'}</Txt>}
   {r.amount!=null&&<Txt dim>Amount: ₹{Number(r.amount)/100}</Txt>}
   {r.delta!=null&&<Txt dim>Coins: {r.delta>0?'+':''}{r.delta} • {asText(r.reason)}</Txt>}
   {r.earned_at&&<Txt dim>Earned: {date(r.earned_at)}</Txt>}
   {r.scheduled_at&&<Txt dim>{date(r.scheduled_at)} • {asText(r.court)}</Txt>}
   {r.created_at&&<Txt dim>{date(r.created_at)}</Txt>}
   {r.event_date&&<Txt dim>{date(r.event_date)}</Txt>}
   {r.short_description&&<Txt dim>{asText(r.short_description)}</Txt>}
   {r.reg_code&&<Txt dim>Registration ID: {asText(r.reg_code)} (QR verification requires the official FLEG card)</Txt>}
 </Panel>)}
 {extra.length>0&&<><Txt big>{route==='discover'?'Published Workshops':route==='community'?'Available Badges':route==='games'?'Assigned Tournament Roles':route==='organizer'?'My Registration Forms':route==='statistics'?'Payout Records':'Additional Records'}</Txt>{extra.map((r,i)=><Panel key={r.id||String(i)}><Txt>{asText(r.title||r.name||r.tournament_id||r.tier||r.id)}</Txt><Txt dim>{asText(r.status||r.staff_role||r.description||r.amount||r.event_date||'Available')}</Txt></Panel>)}</>}
 {route==='organizer'&&<Action title="Create Tournament Draft" onPress={()=>onNavigate('createEvent')}/>}
 {route==='matchControl'&&<Panel><Txt dim>Match scores are displayed from the live backend. The native client will not bypass server-side scoring rules or RLS to write results.</Txt></Panel>}
 {route==='idcard'&&<Panel><Txt dim>The registration identifiers above are live. Downloadable QR accreditation cards must be issued through FLEG’s existing secure credential workflow.</Txt></Panel>}
 {route==='review'&&scope.role!=='admin'&&<Panel><Txt dim>The current database policies allow registration review records only to administrators. Organizer approvals require an authorized server workflow.</Txt></Panel>}
 </View>;
}
