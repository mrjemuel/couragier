export function serializeApplication(groups,{lang='en',now=new Date()}={}){
 const head={en:'Couragier Educator Application',fr:'Candidature — Éducateur Couragier',ht:'Aplikasyon — Edikatè Couragier'}[lang]||'Couragier Educator Application';
 const empty={en:'Not provided',fr:'Non renseigné',ht:'Pa bay'}[lang]||'Not provided';
 return `${head}\n${now.toISOString()}\n${'='.repeat(44)}\n\n`+groups.map(({label,values})=>`${label.replace(/\*$/,'').trim()}\n${values.length?values.map(x=>String(x).trim()).filter(Boolean).join('\n')||empty:empty}`).join('\n\n');
}
export function createApplicationMailto(recipient,subject,body){return `mailto:${recipient}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;}
export function createSubmissionId(source = globalThis.crypto){
 if(typeof source.randomUUID==='function')return source.randomUUID();
 const bytes=source.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=[...bytes].map(b=>b.toString(16).padStart(2,'0')).join('');return `${hex.slice(0,8)}-${hex.slice(8,12)}-${hex.slice(12,16)}-${hex.slice(16,20)}-${hex.slice(20)}`;
}
if(typeof document!=='undefined'){
 const form=document.querySelector('.application-form');if(form){
 const lang=document.documentElement.lang;
 const w={
 en:{choose:'Please select at least one option.',sending:'Submitting your application…',receipt:'A confirmation email is on its way. Please check your inbox and spam folder.',receiptDelayed:'Your application is submitted, but we could not confirm the confirmation email. You do not need to apply again.',success:'Thank you! Your application has been submitted. Reference: ',verification:'Please complete the security check and try again.',unavailable:'Applications are temporarily unavailable. Please contact partners@couragier.com.',failed:'We could not confirm your submission. Your answers are still here. Please try again, or contact partners@couragier.com and include this reference: ',copied:'All answers copied.',copyFailed:'Select and copy the text below.'},
 fr:{choose:'Sélectionnez au moins une option.',sending:'Envoi de votre candidature…',receipt:'Un email de confirmation est en cours d’envoi. Vérifiez votre boîte de réception et vos courriers indésirables.',receiptDelayed:'Votre candidature est transmise, mais l’envoi de l’email de confirmation n’a pas pu être confirmé. Il est inutile de postuler à nouveau.',success:'Merci ! Votre candidature a été transmise. Référence : ',verification:'Veuillez effectuer la vérification de sécurité et réessayer.',unavailable:'Les candidatures sont momentanément indisponibles. Contactez partners@couragier.com.',failed:'Nous ne pouvons pas confirmer l’envoi. Vos réponses sont conservées sur cette page. Réessayez ou contactez partners@couragier.com en indiquant cette référence : ',copied:'Toutes les réponses ont été copiées.',copyFailed:'Sélectionnez et copiez le texte ci-dessous.'},
 ht:{choose:'Chwazi omwen yon opsyon.',sending:'N ap soumèt aplikasyon ou…',receipt:'Yon email konfimasyon sou wout pou ou. Tcheke inbox ou ak dosye spam lan.',receiptDelayed:'Aplikasyon ou soumèt, men nou pa ka konfime email konfimasyon an pase. Ou pa bezwen aplike ankò.',success:'Mèsi! Aplikasyon ou soumèt. Referans: ',verification:'Tanpri fè verifikasyon sekirite a epi eseye ankò.',unavailable:'Nou pa ka resevwa aplikasyon pou kounye a. Tanpri kontakte partners@couragier.com.',failed:'Nou pa ka konfime aplikasyon an pase. Repons ou yo toujou sou paj la. Eseye ankò oswa kontakte partners@couragier.com ak referans sa a: ',copied:'Tout repons yo kopye.',copyFailed:'Seleksyone epi kopye tèks ki anba a.'}
 }[lang]||{};
 const status=form.querySelector('.form-status'),draft=form.querySelector('.application-draft'),text=draft.querySelector('textarea'),button=form.querySelector('button[type=submit]');
 let widget=null,busy=false,sending=false,submitted=false,pending=null,lastAnswers='',submissionId='';
 const show=(message,error=false)=>{status.textContent=message;status.setAttribute('role',error?'alert':'status');status.tabIndex=-1;};
 const clearGroup=group=>{group.querySelector('.group-error').textContent='';group.removeAttribute('aria-invalid');};
 const unlock=()=>{busy=false;sending=false;button.disabled=submitted;form.removeAttribute('aria-busy');};
 const fail=(message)=>{unlock();show(message,true);if(text.value)draft.hidden=false;};
 form.querySelectorAll('[data-required-group]').forEach(group=>group.addEventListener('change',()=>clearGroup(group)));
 async function send(token){
  if(!busy||sending||!pending)return;sending=true;
  try{
   const response=await fetch('https://api.couragier.com/educator/applications',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({...pending,token}),signal:AbortSignal.timeout(35000)});
   const result=await response.json();
   if(!response.ok||result.ok!==true){
    if(result.code==='not_configured')throw Error('unavailable');
    if(['verification_failed','verification_unavailable'].includes(result.code))throw Error('verification');
    throw Error('send');
   }
   submitted=true;draft.hidden=true;show(w.success+result.reference+' '+(result.confirmationQueued?w.receipt:w.receiptDelayed));status.focus();
  }catch(error){fail(error.message==='unavailable'?w.unavailable:error.message==='verification'?w.verification:w.failed+submissionId);}
  finally{unlock();if(widget!==null)window.turnstile.reset(widget);}
 }
 form.addEventListener('submit',e=>{
  e.preventDefault();if(busy||submitted||widget===null||!form.reportValidity())return;
  let firstInvalid=null;form.querySelectorAll('[data-required-group]').forEach(group=>{clearGroup(group);if(!group.querySelector('input:checked')){group.querySelector('.group-error').textContent=w.choose;group.setAttribute('aria-invalid','true');firstInvalid||=group;}});
  if(firstInvalid){firstInvalid.querySelector('input').focus();return;}
  const data=new FormData(form),groups=[...form.querySelectorAll('[data-field]')].map(g=>({label:g.dataset.emailLabel,values:data.getAll(g.dataset.field)}));
  const answers=Object.fromEntries([...form.querySelectorAll('[data-field]')].map(g=>[g.dataset.field,data.getAll(g.dataset.field)]));
  const fingerprint=JSON.stringify({lang,answers});if(fingerprint!==lastAnswers){submissionId=createSubmissionId();lastAnswers=fingerprint;}
  pending={lang,answers,submissionId};text.value=serializeApplication(groups,{lang});
  busy=true;button.disabled=true;form.setAttribute('aria-busy','true');show(w.sending);
  try{window.turnstile.reset(widget);window.turnstile.execute(widget);}catch{fail(w.verification);}
 });
 form.querySelector('[data-copy-application]').addEventListener('click',async()=>{try{await navigator.clipboard.writeText(text.value);show(w.copied);}catch{text.focus();text.select();show(w.copyFailed);}});
 form.querySelector('[data-download-application]').addEventListener('click',()=>{const blob=new Blob([text.value],{type:'text/plain;charset=utf-8'}),a=document.createElement('a'),url=URL.createObjectURL(blob);a.href=url;a.download='couragier-educator-application.txt';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);});
 async function initialize(){
  try{
   const response=await fetch('https://api.couragier.com/educator/form-config',{cache:'no-store',signal:AbortSignal.timeout(10000)}),config=await response.json();
   if(!response.ok||!config.ok||typeof config.siteKey!=='string')throw Error('unavailable');
   if(!window.turnstile)await new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;
    const timeout=setTimeout(()=>reject(Error('unavailable')),15000);script.onload=()=>{clearTimeout(timeout);resolve();};script.onerror=()=>{clearTimeout(timeout);reject(Error('unavailable'));};document.head.append(script);
   });
   widget=window.turnstile.render(form.querySelector('[data-application-verification]'),{sitekey:config.siteKey,action:'educator_application',execution:'execute',appearance:'interaction-only',size:'flexible',language:lang==='ht'?'en':lang,callback:send,'error-callback':()=>{if(!sending)fail(w.verification);return true;},'expired-callback':()=>{if(busy&&!sending)fail(w.verification);},'timeout-callback':()=>{if(!sending)fail(w.verification);}});
   button.disabled=false;
  }catch{show(w.unavailable,true);button.disabled=true;}
 }
 initialize();
 }}
