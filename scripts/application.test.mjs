import {test} from 'node:test';
import assert from 'node:assert/strict';
import schema from '../src/data/educator-form.json' with {type:'json'};
import {validateApplication,brevoMessage,confirmationMessage,applicationDeliveryKey} from '../server/application.mjs';
import {createApplicationHandler} from '../server/submit.mjs';
import {formConfig as config} from '../server/educator-worker.mjs';
import {createSubmissionId} from '../public/assets/js/application-email.mjs';
import {createEducatorWorker} from '../cloudflare/couragier-educator.mjs';
import gateway from '../cloudflare/couragier-api.mjs';

const env={BREVO_API_KEY:'test-secret-never-live',BREVO_SENDER_EMAIL:'partners@couragier.com',TURNSTILE_SITE_KEY:'public-test-key',TURNSTILE_SECRET_KEY:'test-private-key'};
function payload(lang='en') {
 const translate=x=>schema.translations[lang]?.[x]||x;
 const answers=Object.fromEntries(schema.fields.map(f=>[f.id,f.options.length ? (f.type==='radio'?f.options.slice(0,1):f.options).map(translate) : [f.id==='email'?'applicant@example.test':f.id==='first_name'?'Élodie':f.id==='last_name'?'Tès':'A detailed response — avèk aksan & caractères.']]));
 return {lang,answers,token:'test-token',submissionId:'8f51070b-b278-41e4-853c-4245f6088834'};
}
const request=(body,options={})=>new Request('https://www.couragier.com/api/applications',{method:'POST',headers:{origin:'https://www.couragier.com','content-type':'application/json',...options.headers},body:typeof body==='string'?body:JSON.stringify(body),...options});
const proof={success:true,hostname:'www.couragier.com',action:'educator_application'};
const mock=(steps,calls=[])=>async (url,options)=>{calls.push({url,options});const step=steps.shift();assert(step,'Unexpected network call');if(step instanceof Error)throw step;return Response.json(step.body??step,{status:step.status??200});};
test('submission references work on HTTPS and HTTP local previews with secure randomness',()=>{
 assert.match(createSubmissionId(),/^[0-9a-f-]{36}$/);
 assert.match(createSubmissionId({getRandomValues:crypto.getRandomValues.bind(crypto)}),/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
});

test('every original field and selected choice reaches the owner in all three languages',async()=>{
 for(const lang of ['en','fr','ht']){
  const p=payload(lang),a=validateApplication(p),message=brevoMessage(a,env,new Date('2026-10-30T00:00:00Z'));
  assert.equal(a.groups.length,20);assert.equal(a.groups.filter(g=>g.values.length>1).length,schema.fields.filter(f=>f.type==='checkbox').length);
  for(const f of schema.fields)for(const value of p.answers[f.id])assert(message.textContent.includes(value));
  assert.equal(message.to[0].email,'partners@couragier.com');assert.equal(message.replyTo.email,'applicant@example.test');
  const receipt=confirmationMessage(a,env);assert.equal(receipt.to[0].email,'applicant@example.test');assert.equal(receipt.replyTo.email,'partners@couragier.com');
  assert(!receipt.textContent.includes('A detailed response'));assert(receipt.textContent.includes(a.submissionId));
 }
});
test('server rejects missing required answers, invalid choices, incomplete agreements and email header injection',()=>{
 for(const mutate of [p=>p.answers.first_name=[''],p=>p.answers.profile=['forged'],p=>p.answers.agreements.pop(),p=>p.answers.preferred_languages=[],p=>p.answers.email=['a@example.com\r\nBcc: bad@example.com'],p=>p.answers.message=['x'.repeat(4001)],p=>p.answers.profile.push(p.answers.profile[0]),p=>p.answers.recipient=['attacker@example.com'],p=>p.answers.first_name=[{}]]){
  const p=payload();mutate(p);assert.throws(()=>validateApplication(p));
 }
});
test('idempotency key binds the complete validated answers and survives retry',async()=>{
 const a=validateApplication(payload());assert.equal(await applicationDeliveryKey(a),await applicationDeliveryKey(validateApplication(payload())));
 const p=payload();p.answers.message=['Changed response'];assert.notEqual(await applicationDeliveryKey(a),await applicationDeliveryKey(validateApplication(p)));
});
test('config exposes only the public site key and fails closed without secrets',async()=>{
 const r=config({request:new Request('https://www.couragier.com/api/form-config'),env});assert.deepEqual(await r.json(),{ok:true,siteKey:env.TURNSTILE_SITE_KEY});assert.equal(r.headers.get('cache-control'),'no-store');
 assert.equal(config({request:new Request('https://www.couragier.com/api/form-config'),env:{}}).status,503);
});
test('only same-origin JSON POSTs can submit; large or invalid bodies do not call providers',async()=>{
 const handler=createApplicationHandler(()=>{throw Error('must not call provider');});
 assert.equal((await handler({request:new Request('https://www.couragier.com/api/applications'),env})).status,405);
 assert.equal((await handler({request:request(payload(),{headers:{origin:'https://other.test','content-type':'application/json'}}),env})).status,403);
 assert.equal((await handler({request:request('{'),env})).status,400);
 assert.equal((await handler({request:request('x'.repeat(65537)),env})).status,413);
 assert.equal((await handler({request:request(payload()),env:{}})).status,503);
});
test('Turnstile failure, hostname mismatch or action mismatch prevents both emails',async()=>{
 for(const body of [{success:false},{...proof,hostname:'other.test'},{...proof,action:'other'}]){
  const calls=[],handler=createApplicationHandler(mock([body],calls));
  const r=await handler({request:request(payload()),env});assert.equal(r.status,400);assert.equal(calls.length,1);
 }
});
test('successful application queues the owner email then a pending-review receipt, without exposing secrets',async()=>{
 const calls=[],handler=createApplicationHandler(mock([proof,{messageId:'owner-id'},{messageId:'receipt-id'}],calls));
 const r=await handler({request:request(payload('ht')),env});assert.equal(r.status,202);
 const result=await r.json();assert.equal(result.ok,true);assert.equal(result.confirmationQueued,true);assert(!JSON.stringify(result).includes(env.BREVO_API_KEY));
 const owner=JSON.parse(calls[1].options.body),receipt=JSON.parse(calls[2].options.body);
 assert.equal(owner.to[0].email,'partners@couragier.com');assert.equal(receipt.to[0].email,'applicant@example.test');assert(receipt.textContent.includes('pa vle di nou aksepte'));assert(receipt.textContent.includes('revize'));
 assert.notEqual(owner.headers.idempotencyKey,receipt.headers.idempotencyKey);assert.equal(calls[1].options.headers['api-key'],env.BREVO_API_KEY);
});
test('owner failure cannot send a misleading confirmation',async()=>{
 const calls=[],handler=createApplicationHandler(mock([proof,{status:401,body:{message:'private-provider-detail'}}],calls));
 const r=await handler({request:request(payload()),env});assert.equal(r.status,502);assert.equal(calls.length,2);assert(!(await r.text()).includes('private-provider-detail'));
});
test('receipt failure leaves an already accepted application successful, avoiding duplicate applications',async()=>{
 const handler=createApplicationHandler(mock([proof,{messageId:'owner-id'},new Error('timeout')]));
 const r=await handler({request:request(payload()),env});assert.equal(r.status,202);const result=await r.json();assert.equal(result.ok,true);assert.equal(result.confirmationQueued,false);
});
test('provider timeout or malformed acceptance does not claim success',async()=>{
 for(const response of [new Error('timeout'),{unexpected:'no message ID'}]){
  const handler=createApplicationHandler(mock([proof,response]));const r=await handler({request:request(payload()),env});assert.equal(r.status,502);assert.equal((await r.json()).ok,false);
 }
});
test('an idempotent retry can finish the receipt after prior acceptance',async()=>{
 const handler=createApplicationHandler(mock([proof,{status:400,body:{code:'duplicate_parameter',message:'Email for the idempotency key has already been processed'}},{messageId:'receipt-id'}]));
 const r=await handler({request:request(payload()),env});assert.equal(r.status,202);assert.equal((await r.json()).confirmationQueued,true);
});
test('independent Worker handles cross-origin requests through EDUCATOR_SERVICE and preserves other services',async()=>{
 const calls=[];
 const educator=createEducatorWorker(mock([proof,{messageId:'owner-id'},{messageId:'receipt-id'}],calls));
 const fail=()=>{throw Error('Must not invoke an existing service');};
 const bindings={EDUCATOR_SERVICE:{fetch:r=>educator.fetch(r,env)},WEBINAR_SERVICE:{fetch:fail},MONCASH_SERVICE:{fetch:fail},WHOP_SERVICE:{fetch:fail}};
 const req=new Request('https://api.couragier.com/educator/applications',{method:'POST',headers:{Origin:'https://www.couragier.com','Content-Type':'application/json'},body:JSON.stringify(payload())});
 const response=await gateway.fetch(req,bindings);assert.equal(response.status,202);assert.equal(response.headers.get('access-control-allow-origin'),'https://www.couragier.com');assert.equal((await response.json()).confirmationQueued,true);assert.equal(calls.length,3);
 for(const [route,binding] of [['/webinar/register','WEBINAR_SERVICE'],['/payments/moncash/create','MONCASH_SERVICE'],['/whop/webhook','WHOP_SERVICE']]){
  const r=new Request('https://api.couragier.com'+route,{method:'POST',body:'synthetic'});
  const result=await gateway.fetch(r,{...bindings,[binding]:{fetch:original=>{assert.equal(original,r);return new Response(binding);}}});assert.equal(await result.text(),binding);
 }
});
test('standalone Worker allows only the website origins, returns CORS on errors, and validates preflight',async()=>{
 const worker=createEducatorWorker(()=>{throw Error('No provider calls allowed');});
 const get=(origin)=>new Request('https://api.couragier.com/educator/form-config',{headers:{Origin:origin}});
 for(const origin of ['https://couragier.com','https://www.couragier.com']){
  const r=await worker.fetch(get(origin),env);assert.equal(r.status,200);assert.equal(r.headers.get('access-control-allow-origin'),origin);assert.equal((await r.json()).siteKey,env.TURNSTILE_SITE_KEY);
 }
 assert.equal((await worker.fetch(get('https://attacker.test'),env)).status,403);
 const error=await worker.fetch(get('https://couragier.com'),{});assert.equal(error.status,503);assert.equal(error.headers.get('access-control-allow-origin'),'https://couragier.com');
 const options=new Request('https://api.couragier.com/educator/applications',{method:'OPTIONS',headers:{Origin:'https://couragier.com','Access-Control-Request-Method':'POST','Access-Control-Request-Headers':'content-type'}});assert.equal((await worker.fetch(options,env)).status,204);
 const health=await worker.fetch(new Request('https://couragier-educator.example.workers.dev/health'),{});assert.deepEqual(await health.json(),{ok:true,service:'Couragier Educator',configured:false});
});
