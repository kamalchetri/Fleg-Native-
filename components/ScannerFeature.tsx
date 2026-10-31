import React,{useState,useEffect} from 'react';
import {View,Text,TextInput,Image,Pressable,ActivityIndicator,Switch,Alert} from 'react-native';
import {CameraView,useCameraPermissions} from 'expo-camera';
import {randomUUID} from 'expo-crypto';
import {supabase} from '../lib/supabase';
import type {AppScope} from '../lib/access';
const color={bg:'#050907',card:'#111B15',line:'#24442B',lime:'#92F716',white:'#F6FAF5',muted:'#9BAF9F',red:'#FF5964',amber:'#FDBA48'};
const CODE=/^[A-Z][A-Z0-9]{1,8}-[A-Z0-9]{1,14}$/;
function normalized(input:unknown):string|null{
 if(typeof input!=='string')return null;
 let text=input.trim().toUpperCase();
 if(CODE.test(text))return text;
 // Only extract a verified registration-code value from a QR URL; never trust arbitrary URLs.
 try{const u=new URL(input.trim());const raw=u.searchParams.get('code')||u.searchParams.get('reg_code')||u.searchParams.get('registrationId');if(raw&&CODE.test(raw.toUpperCase()))return raw.toUpperCase()}catch{}
 return null;
}
function X({children,dim=false,large=false}:{children:React.ReactNode,dim?:boolean,large?:boolean}){return <Text style={{color:dim?color.muted:color.white,fontSize:large?22:13,fontWeight:large?'800':'400'}}>{children}</Text>}
function Surface({children}:{children:React.ReactNode}){return <View style={{padding:16,borderRadius:16,borderColor:color.line,borderWidth:1,backgroundColor:color.card,gap:8}}>{children}</View>}
function Button({text,onPress,disabled=false,secondary=false}:{text:string,onPress:()=>void,disabled?:boolean,secondary?:boolean}){return <Pressable disabled={disabled} accessibilityRole="button" style={{minHeight:45,borderRadius:12,alignItems:'center',justifyContent:'center',padding:10,backgroundColor:disabled?color.line:secondary?color.card:color.lime,borderColor:color.line,borderWidth:secondary?1:0}} onPress={onPress}><Text style={{fontWeight:'800',color:secondary?color.white:color.bg}}>{text}</Text></Pressable>}
type Item={code:string;outcome?:string;eligible?:boolean;registration?:{full_name?:string;reg_code?:string;status?:string};name?:string;discipline?:string;current?:any;reason?:string};
type Props={route:string,scope:AppScope,uid:string|null,onNavigate:(route:string)=>void};
export default function ScannerFeature({route,scope,uid,onNavigate}:Props){
 const [permission,requestPermission]=useCameraPermissions();
 const [apiReady,setApiReady]=useState(false);
 const [busy,setBusy]=useState(false);
 const [error,setError]=useState('');
 const [raw,setRaw]=useState('');
 const [active,setActive]=useState(false);
 const [single,setSingle]=useState<Item|null>(null);
 const [profile,setProfile]=useState<any>(null);
 const [codes,setCodes]=useState<string[]>([]);
 const [previews,setPreviews]=useState<Item[]>([]);
 const [results,setResults]=useState<any[]>([]);
 const [attested,setAttested]=useState(false);
 const [direction,setDirection]=useState<'IN'|'OUT'>('IN');
 const [report,setReport]=useState<any>(null);
 const batch=route==='batch';
 const lookup=route==='kiosk';
 const overview=route==='accreditation';
 const allowed=Boolean(uid&&scope.role==='admin');
 useEffect(()=>{setRaw('');setSingle(null);setProfile(null);setCodes([]);setPreviews([]);setResults([]);setActive(false);setAttested(false);setError('')},[route]);
 useEffect(()=>{let mounted=true;if(!allowed){setApiReady(false);return;}
 supabase.functions.invoke('fleg-scanner',{body:{action:'ping'}}).then(({data,error})=>{if(!mounted)return;setApiReady(!error&&data?.ok===true);if(error||data?.error)setError(data?.error||error?.message||'Scanner access unavailable')});
 return()=>{mounted=false}
 },[allowed]);
 async function invoke(action:string, payload:Record<string,unknown>={}):Promise<any>{
  const {data,error}=await supabase.functions.invoke('fleg-scanner',{body:{action,...payload}});
  if(error)throw Error((data as any)?.error||error.message||'Secure scanner request failed');
  if(data?.error)throw Error(data.error);
  return data;
 }
 async function preview(c:string){
  setBusy(true);setError('');setSingle(null);setAttested(false);setResults([]);setActive(false);
  try{const data=await invoke('preview',{codes:[c]});const item=(data.results||[])[0] as Item;setSingle(item||{code:c,outcome:'INVALID'});setRaw(c)}
  catch(e:any){setError(e?.message||'Verification failed')}
  finally{setBusy(false)}
 }
 async function showProfile(c:string){
  setBusy(true);setError('');setProfile(null);
  try{const data=await invoke('profile',{code:c});setProfile(data.profile)}
  catch(e:any){setError(e?.message||'Profile not available')}
  finally{setBusy(false)}
 }
 function addCode(c:string){
  setError('');setResults([]);setAttested(false);setActive(false);
  setCodes(items=>{
   if(items.includes(c)){setError('Duplicate QR in this batch.');return items;}
   if(items.length>=10){setError('Maximum 10 unique codes per batch.');return items;}
   setPreviews([]);return [...items,c];
  });
 }
 async function verifyBatch(){
  if(!codes.length){setError('Add at least one valid code.');return}
  setBusy(true);setError('');setAttested(false);
  try{const data=await invoke('preview',{codes});setPreviews(data.results||[])}
  catch(e:any){setError(e?.message||'Batch preview failed')}
  finally{setBusy(false)}
 }
 async function move(){
  const items=batch?previews:single?[single]:[];
  if(!items.length||!attested){setError('Preview and confirm participant identity before recording attendance.');return;}
  if(items.some(x=>x.outcome!=='MATCHED'||!x.eligible)){setError('An invalid or ineligible registration is included. Remove or resolve it first.');return;}
  setBusy(true);setError('');
  try{const data=await invoke('batch',{attested:true,direction,scanner:batch?'multi':'single',items:items.map(x=>({code:x.code,requestId:randomUUID()}))});setResults(data.results||[]);setActive(false);setAttested(false)}
  catch(e:any){setError(e?.message||'Attendance request failed')}
  finally{setBusy(false)}
 }
 async function loadReport(){
  setBusy(true);setError('');
  try{const {data,error}=await supabase.functions.invoke('qr-mobile',{body:{action:'dailyReport'}});if(error||data?.error)throw Error(data?.error||error?.message);setReport(data?.report??null)}
  catch(e:any){setError(e?.message||'Report unavailable')}
  finally{setBusy(false)}
 }
 if(!allowed)return <Surface><X large>Admin-only scanner</X><X dim>The backend verifies the administrator role on every request. Your current account has no live scanner privileges.</X></Surface>;
 return <View style={{gap:12}}>
 <X large>{overview?'Accreditation Dashboard':batch?'Multi-QR Batch Check-in':lookup?'Registrant Profile Lookup':'QR Check-in / Check-out'}</X>
 <X dim>Connected to FLEG secure event scanner. All attendance writes are validated and recorded server-side.</X>
 {!apiReady&&<Surface><X dim>Verifying administrator access…</X><Button text="Retry connection" onPress={()=>{setError('');void invoke('ping').then(d=>setApiReady(d?.ok===true)).catch(e=>setError(e.message))}}/></Surface>}
 {Boolean(error)&&<Surface><Text style={{color:color.red}}>{error}</Text></Surface>}
 {overview?<><Surface><X>Live NSPG 2026 accreditation activity</X><Button text={busy?'Loading...':'Load Daily Report'} disabled={busy||!apiReady} onPress={()=>{void loadReport()}}/>{report&&<X dim>{JSON.stringify(report,null,2).slice(0,2600)}</X>}</Surface><Button text="Single Scanner" onPress={()=>onNavigate('scanner')}/><Button text="Batch Scanner" secondary onPress={()=>onNavigate('batch')}/><Button text="Registrant Lookup" secondary onPress={()=>onNavigate('kiosk')}/></>:
 <>
 <View style={{flexDirection:'row',alignItems:'center',gap:12}}><Button text="IN" secondary={direction!=='IN'} onPress={()=>{setDirection('IN');setAttested(false)}}/><Button text="OUT" secondary={direction!=='OUT'} onPress={()=>{setDirection('OUT');setAttested(false)}}/></View>
 {['scanner','batch','scanResult'].includes(route)&&<>
   {active&&permission?.granted?<View style={{height:285,overflow:'hidden',borderRadius:17,borderWidth:2,borderColor:color.lime}}><CameraView facing="back" style={{flex:1}} barcodeScannerSettings={{barcodeTypes:['qr']}} onBarcodeScanned={({data})=>{if(busy)return;const c=normalized(data);if(!c){setActive(false);setError('This QR does not contain a valid FLEG registration code.');return;}if(batch)addCode(c);else void preview(c);}}/></View>:null}
   <Button text={active?'Close Camera':'Open QR Camera'} secondary onPress={()=>{if(active){setActive(false);return;}if(permission?.granted){setActive(true);return;}void requestPermission().then(p=>{if(p.granted)setActive(true);else setError('Camera permission is required for QR scanning.')})}}/>
 </>}
 <Surface><X>{lookup?'Registration ID':'Manual registration code'}</X><TextInput value={raw} onChangeText={setRaw} autoCapitalize="characters" autoCorrect={false} placeholder="e.g. NOA-2407" placeholderTextColor={color.muted} style={{color:color.white,padding:13,borderWidth:1,borderColor:color.line,borderRadius:12}}/><Button disabled={!apiReady||busy} text={lookup?'Open Verified Profile':batch?'Add to Batch':'Verify Code'} onPress={()=>{const c=normalized(raw);if(!c){setError('Enter a valid FLEG registration code.');return;}setRaw('');if(lookup)void showProfile(c);else if(batch)addCode(c);else void preview(c)}}/></Surface>
 {lookup&&profile&&<Surface><X large>{String(profile.name||'Registrant')}</X><X>{String(profile.code||'')}</X><X dim>{String(profile.discipline||'')} • {String(profile.registrationStatus||'')}</X>{profile.photoUrl&&<Image source={{uri:profile.photoUrl}} style={{height:125,width:125,borderRadius:12}}/>}<X dim>Presence: {String(profile.current?.attendance||'Unknown')}</X><X dim>Last IN: {String(profile.current?.lastIn||'—')}</X><X dim>Last OUT: {String(profile.current?.lastOut||'—')}</X><X dim>Movement history: {profile.movements?.length||0} • Visits: {profile.visits?.length||0} • Medals: {profile.medals?.length||0} • Certificates: {profile.certificates?.length||0}</X></Surface>}
 {batch&&<Surface><X>Batch: {codes.length}/10</X>{codes.map(c=><Pressable key={c} onPress={()=>{setCodes(v=>v.filter(x=>x!==c));setPreviews([]);setAttested(false)}}><X>{c}   × Remove</X></Pressable>)}<Button text={busy?'Verifying…':'Verify All'} disabled={busy||!apiReady||!codes.length} onPress={()=>{void verifyBatch()}}/></Surface>}
 {(batch?previews:single?[single]:[]).map((p,i)=><Surface key={p.code||i}><X large>{p.code}</X><X>{String(p.registration?.full_name||p.name||p.outcome||'Not found')}</X><X dim>{String(p.discipline||'')}</X><Text style={{color:p.eligible?color.lime:color.red,fontWeight:'800'}}>{p.outcome} • {p.eligible?'Eligible':'Not eligible'}</Text><X dim>Current status: {String(p.current?.status||p.current?.attendance||'Unknown')}</X></Surface>)}
 {!lookup&&(batch?previews.length>0:single?.outcome==='MATCHED')&&<Surface><View style={{flexDirection:'row',alignItems:'center',justifyContent:'space-between'}}><X>Identity checked and verified in person</X><Switch value={attested} onValueChange={setAttested} trackColor={{true:color.lime,false:color.line}}/></View><X dim>Only confirm after physically checking the person and the registration. A matched code alone does not guarantee entry.</X><Button text={busy?'Recording…':'Record '+direction} disabled={!attested||busy||(batch?previews:single?[single]:[]).some(p=>!p.eligible||p.outcome!=='MATCHED')} onPress={()=>{Alert.alert('Confirm '+direction,'Record this attendance action in FLEG for '+(batch?codes.length+' people':'this participant')+'?', [{text:'Cancel',style:'cancel'},{text:'Confirm',onPress:()=>{void move()}}])}}/></Surface>}
 {results.length>0&&<Surface><X large>Server Results</X>{results.map((r,i)=><View key={String(i)} style={{gap:3,paddingVertical:7,borderBottomColor:color.line,borderBottomWidth:1}}><X>{String(r.code||'Registrant')}</X><Text style={{color:['OK','SUCCESS','CHECKED_IN','CHECKED_OUT','IN','OUT'].includes(String(r.outcome||'').toUpperCase())?color.lime:color.amber}}>{String(r.outcome||r.status||r.reason||'Response received')}</Text></View>)}<Button text="Next Scan" onPress={()=>{setCodes([]);setPreviews([]);setSingle(null);setResults([]);setAttested(false);setActive(true)}}/></Surface>}
 {busy&&<ActivityIndicator size="large" color={color.lime}/>}
 </>
 }
 </View>;
}
