import schema from '../src/data/educator-form.json' with {type:'json'};
import {serializeApplication} from '../public/assets/js/application-email.mjs';

export const recipient = schema.recipient;
export const isEmail = value => typeof value === 'string' && value.length <= 254 && /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(value) && !/[\x00-\x1f\x7f]/.test(value);
export function configured(env) {
  return !!(env.BREVO_API_KEY && isEmail(env.BREVO_SENDER_EMAIL) && env.TURNSTILE_SITE_KEY && env.TURNSTILE_SECRET_KEY);
}
export function validateApplication(input) {
  if (!input || typeof input !== 'object' || Array.isArray(input) || !['en','fr','ht'].includes(input.lang)) throw Error('invalid_fields');
  if (typeof input.submissionId !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(input.submissionId)) throw Error('invalid_fields');
  if (typeof input.token !== 'string' || !input.token || input.token.length > 2048) throw Error('verification_failed');
  if (!input.answers || typeof input.answers !== 'object' || Array.isArray(input.answers)) throw Error('invalid_fields');
  const ids = new Set(schema.fields.map(f=>f.id));
  if (Object.keys(input.answers).some(id=>!ids.has(id))) throw Error('invalid_fields');
  const groups = schema.fields.map(f=>{
    const raw = input.answers[f.id];
    if (!Array.isArray(raw) || raw.some(v=>typeof v !== 'string')) throw Error('invalid_fields');
    const values = raw.map(v=>v.trim());
    if (f.options.length) {
      const allowed = f.options.map(o=>schema.translations[input.lang]?.[o] || o);
      if (values.length > allowed.length || new Set(values).size !== values.length || values.some(v=>!allowed.includes(v))) throw Error('invalid_fields');
      if (f.type === 'radio' && values.length > 1) throw Error('invalid_fields');
      if (f.required && (!values.length || (f.id === 'agreements' && values.length !== allowed.length))) throw Error('invalid_fields');
    } else {
      if (values.length !== 1 || values[0].length > (f.type === 'textarea' ? 4000 : f.id === 'email' ? 254 : 300)) throw Error('invalid_fields');
      if (f.required && !values[0]) throw Error('invalid_fields');
      if (f.type !== 'textarea' && /[\x00-\x1f\x7f]/.test(values[0])) throw Error('invalid_fields');
    }
    return {label:schema.translations[input.lang]?.[f.label] || f.label,values};
  });
  const email = input.answers.email[0].trim();
  if (!isEmail(email)) throw Error('invalid_fields');
  return {groups,email,name:[input.answers.first_name[0].trim(),input.answers.last_name[0].trim()].join(' '),lang:input.lang,submissionId:input.submissionId,token:input.token};
}
export function brevoMessage(application,env,now = new Date()) {
  return {
    sender:{email:env.BREVO_SENDER_EMAIL,name:'Couragier Educator Partnerships'},
    to:[{email:recipient,name:'Couragier Educator Partnerships'}],
    replyTo:{email:application.email,name:application.name.slice(0,70)},
    subject:`Couragier Educator Application — ${application.name.slice(0,180)}`,
    textContent:`Application reference: ${application.submissionId}\nWebsite language: ${application.lang}\n\n${serializeApplication(application.groups,{lang:application.lang,now})}`,
    tags:['educator-application'],
    headers:{idempotencyKey:application.submissionId}
  };
}
export function confirmationMessage(application,env) {
  const copy = {
    en:{subject:'We received your Couragier application',hello:'Hello',body:'Thank you for applying to become a Couragier educator. We have received your application. Our team will review it and contact you once a decision has been made.',note:'This email confirms receipt only. It does not mean your application has been accepted.',reference:'Application reference',questions:'If you have any questions, reply to this email.'},
    fr:{subject:'Nous avons reçu votre candidature Couragier',hello:'Bonjour',body:'Merci d’avoir proposé votre candidature pour devenir éducateur Couragier. Nous avons bien reçu votre candidature. Notre équipe l’examinera et vous contactera une fois sa décision prise.',note:'Cet email confirme uniquement la réception de votre candidature. Il ne constitue pas une acceptation.',reference:'Référence de candidature',questions:'Pour toute question, vous pouvez répondre à cet email.'},
    ht:{subject:'Nou resevwa aplikasyon Couragier ou a',hello:'Bonjou',body:'Mèsi paske ou aplike pou vin yon edikatè Couragier. Nou resevwa aplikasyon ou. Ekip nou an ap revize li epi kontakte ou lè nou pran yon desizyon.',note:'Email sa a konfime nou resevwa aplikasyon ou sèlman. Li pa vle di nou aksepte aplikasyon an.',reference:'Referans aplikasyon an',questions:'Si ou gen kesyon, ou ka reponn email sa a.'}
  }[application.lang];
  return {
    sender:{email:env.BREVO_SENDER_EMAIL,name:'Couragier Educator Partnerships'},
    to:[{email:application.email,name:application.name.slice(0,70)}],
    replyTo:{email:recipient,name:'Couragier Educator Partnerships'},
    subject:copy.subject,
    textContent:`${copy.hello} ${application.name},\n\n${copy.body}\n\n${copy.note}\n\n${copy.reference}: ${application.submissionId}\n\n${copy.questions}\n\nCouragier Educator Partnerships\n${recipient}`,
    tags:['educator-confirmation']
  };
}
export async function applicationDeliveryKey(application) {
  const bytes = new TextEncoder().encode(JSON.stringify({id:application.submissionId,lang:application.lang,email:application.email,name:application.name,groups:application.groups}));
  const digest = await crypto.subtle.digest('SHA-256',bytes);
  return Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
}
export function json(body,status = 200,extra = {}) {
  return new Response(JSON.stringify(body),{status,headers:{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','X-Content-Type-Options':'nosniff',...extra}});
}
export async function readLimitedJSON(request) {
  const max = 65536;
  if (Number(request.headers.get('content-length')) > max) throw Error('too_large');
  const reader = request.body?.getReader();
  if (!reader) throw Error('invalid_fields');
  const chunks = []; let size = 0;
  while (true) {
    const {value,done} = await reader.read(); if (done) break;
    size += value.byteLength;
    if (size > max) {await reader.cancel(); throw Error('too_large');}
    chunks.push(value);
  }
  const bytes = new Uint8Array(size);let offset = 0;
  for (const chunk of chunks) {bytes.set(chunk,offset);offset += chunk.byteLength;}
  try {return JSON.parse(new TextDecoder().decode(bytes));} catch {throw Error('invalid_fields');}
}
