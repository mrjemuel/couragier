import {configured,json,readLimitedJSON,validateApplication,brevoMessage,confirmationMessage,applicationDeliveryKey} from './application.mjs';

// No applicant data, tokens, provider response bodies or credentials are logged.
export function createApplicationHandler(fetcher = fetch, {allowedOrigins = null} = {}) {
  return async ({request,env})=>{
    if (request.method !== 'POST') return json({ok:false,code:'method_not_allowed'},405,{Allow:'POST'});
    const url = new URL(request.url);
    const origin = request.headers.get('origin');
    if (allowedOrigins ? !allowedOrigins.includes(origin) : origin !== url.origin) return json({ok:false,code:'forbidden'},403);
    if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json') return json({ok:false,code:'invalid_fields'},415);
    if (!configured(env)) return json({ok:false,code:'not_configured'},503);
    let application;
    try {application = validateApplication(await readLimitedJSON(request));}
    catch (error) {return json({ok:false,code:error.message === 'too_large' ? 'too_large' : error.message === 'verification_failed' ? 'verification_failed' : 'invalid_fields'},error.message === 'too_large' ? 413 : 400);}
    try {
      const verification = await fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
        method:'POST',headers:{'Content-Type':'application/json'},signal:AbortSignal.timeout(8000),
        body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:application.token,...(request.headers.get('CF-Connecting-IP') ? {remoteip:request.headers.get('CF-Connecting-IP')} : {})})
      });
      if (!verification.ok) return json({ok:false,code:'verification_unavailable'},503);
      const proof = await verification.json();
      if (proof.success !== true || proof.hostname !== new URL(origin).hostname || proof.action !== 'educator_application') return json({ok:false,code:'verification_failed'},400);
    } catch {return json({ok:false,code:'verification_unavailable'},503);}
    const deliveryKey = await applicationDeliveryKey(application);
    const deliver = async (message,key)=>{
      const response = await fetcher('https://api.brevo.com/v3/smtp/email',{
        method:'POST',headers:{'api-key':env.BREVO_API_KEY,Accept:'application/json','Content-Type':'application/json'},
        body:JSON.stringify({...message,headers:{idempotencyKey:key}}),signal:AbortSignal.timeout(10000)
      });
      const result = await response.json().catch(()=>({}));
      // A duplicate of this exact validated payload was already accepted (Brevo TTL: 15 minutes).
      if (result.code === 'duplicate_parameter' && /idempotency/i.test(result.message || '')) return true;
      if (!response.ok || typeof result.messageId !== 'string' || !result.messageId) throw Error('send_failed');
      return true;
    };
    try {await deliver(brevoMessage(application,env),`educator-${deliveryKey}`);}
    catch {return json({ok:false,code:'send_uncertain'},502);}
    // Only send a receipt after the full application is accepted by the email provider.
    // A receipt failure must not tell the applicant to resubmit an already accepted application.
    let confirmationQueued = false;
    try {confirmationQueued = await deliver(confirmationMessage(application,env),`receipt-${deliveryKey}`);} catch { /* Brevo logs expose delivery issues to the owner. */ }
    return json({ok:true,reference:application.submissionId,confirmationQueued},202);
  };
}
export const onRequest = createApplicationHandler();
