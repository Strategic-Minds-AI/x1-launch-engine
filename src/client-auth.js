/* WLE: existing customer workspace account adapter.
 * No session tokens or privileged Supabase credentials in browser code.
 * In ordinary previews the backend returns NOT_CONFIGURED, leaving only
 * the original synthetic data demo. When staging Auth is approved, the
 * server validates active X1 tenant membership before enabling this UI.
 */
(()=>{
'use strict';
const root=document.getElementById('accountGate');
const form=document.getElementById('accountLoginForm');
const error=document.getElementById('accountLoginError');
const button=document.getElementById('accountLoginButton');
const frame=document.getElementById('creativeFrame');
const nav=document.querySelector('.top-actions');
const badge=nav.querySelector('.pill');
let available=[],selected='',authenticated=false;
const uuid=s=>typeof s==='string'&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(s);
async function request(path,options={}){
 const response=await fetch(path,{
  credentials:'same-origin',cache:'no-store',
  ...options,signal:AbortSignal.timeout(10000)
 });
 let data={};try{data=await response.json()}catch{}
 return {status:response.status,data};
}
function loginView(message='',disabled=false){
 authenticated=false;selected='';available=[];
 document.body.classList.add('signin-required');
 root.hidden=false;
 error.textContent=message;
 form.hidden=disabled;
 badge.textContent='ACCOUNT PROTECTED';
}
function sendTenant(){
 if(!authenticated||!selected||!frame.contentWindow)return;
 frame.contentWindow.postMessage({type:'wle-client-tenant-authorized',tenant_id:selected},location.origin);
}
const accountSelect=document.createElement('select');
accountSelect.className='account-tenant';
accountSelect.setAttribute('aria-label','Choose an authorized business');
accountSelect.hidden=true;
accountSelect.addEventListener('change',()=>{selected=uuid(accountSelect.value)?accountSelect.value:'';sendTenant()});
nav.insertBefore(accountSelect,badge);
const logout=document.createElement('button');
logout.type='button';logout.textContent='Sign out';logout.className='account-signout';logout.hidden=true;
nav.insertBefore(logout,badge);
logout.addEventListener('click',async()=>{
 logout.disabled=true;
 try{await request('/api/client/logout',{method:'POST',headers:{'Content-Type':'application/json'},body:'{}'})}catch{}
 logout.disabled=false;logout.hidden=true;accountSelect.hidden=true;
 loginView('Signed out of this browser. Sign in to continue.');
});
frame.addEventListener('load',sendTenant);
function signedIn(data){
 const values=Array.isArray(data.tenantMemberships)?data.tenantMemberships.filter(x=>uuid(x.tenant_id)):[];
 if(!values.length){loginView('No active customer account is attached to this login.');return}
 authenticated=true;available=values;selected=values.length===1?values[0].tenant_id:'';
 root.hidden=true;document.body.classList.remove('signin-required');
 badge.textContent='STAGING ACCOUNT';
 logout.hidden=false;
 accountSelect.replaceChildren();
 if(values.length>1){
  const option=document.createElement('option');option.value='';option.textContent='Choose your business';
  accountSelect.append(option);
 }
 for(const membership of values){
  const option=document.createElement('option');option.value=membership.tenant_id;
  option.textContent='Business '+membership.tenant_id.slice(0,8);
  accountSelect.append(option);
 }
 accountSelect.value=selected;
 accountSelect.hidden=values.length<=1;
 const note=document.querySelector('.creative-warning');
 if(note)note.textContent='Signed-in staging account. Brand details can be saved only when you explicitly press Save. Photo uploads remain local to this device.';
 // Reuse approved navigation, design and existing creative editor.
 sendTenant();
}
form.addEventListener('submit',async e=>{
 e.preventDefault();error.textContent='';button.disabled=true;
 const email=document.getElementById('accountEmail').value.trim();
 const passwordInput=document.getElementById('accountPassword');
 const password=passwordInput.value;
 passwordInput.value='';
 try{
  const r=await request('/api/client/login',{method:'POST',
    headers:{'Content-Type':'application/json'},body:JSON.stringify({email,password})});
  if(r.status===200&&r.data.authenticated){
   const checked=await request('/api/client/session');
   if(checked.status===200&&checked.data.authenticated){signedIn(checked.data);return}
  }
  error.textContent=r.status===429?'Too many attempts. Please try again later.':
    r.status===403?'Your customer account has not been activated yet.':
    'Sign-in failed. Check your credentials or contact support.';
 }catch{error.textContent='Authentication is unavailable. Please try again.'}
 finally{button.disabled=false}
});
(async()=>{
 try{
  const res=await request('/api/client/session');
  if(res.status===503&&res.data.code==='STAGING_CUSTOMER_AUTH_NOT_CONFIGURED'){
   // Read-only demonstration: no account operations or customer data.
   return;
  }
  if(res.status===200&&res.data.authenticated){signedIn(res.data);return}
  if(res.status===401){loginView();return}
  loginView('Account service is temporarily unavailable. Please try again later.',true);
 }catch{
  loginView('Cannot verify the account service right now. Please try again later.',true);
 }
})();
})();
