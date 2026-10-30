import {configured,json} from './application.mjs';
import {createApplicationHandler} from './submit.mjs';

const educatorOrigins = ['https://couragier.com','https://www.couragier.com'];
export function formConfig({request,env}) {
  if(request.method !== 'GET') return json({ok:false,code:'method_not_allowed'},405,{Allow:'GET'});
  if(!configured(env)) return json({ok:false,code:'not_configured'},503);
  return json({ok:true,siteKey:env.TURNSTILE_SITE_KEY});
}
export function createEducatorWorker(fetcher = fetch) {
  const submit = createApplicationHandler(fetcher,{allowedOrigins:educatorOrigins});
  return {
    async fetch(request,env) {
      const path = new URL(request.url).pathname;
      if ((path === '/' || path === '/health') && request.method === 'GET') {
        return json({ok:true,service:'Couragier Educator',configured:configured(env)});
      }
      if (!['/educator/applications','/educator/form-config'].includes(path)) return json({ok:false,code:'not_found'},404);
      const origin = request.headers.get('origin');
      if (!educatorOrigins.includes(origin)) return json({ok:false,code:'forbidden'},403);
      const cors = {'Access-Control-Allow-Origin':origin,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Vary':'Origin'};
      if(request.method === 'OPTIONS') {
        const method = request.headers.get('Access-Control-Request-Method');
        const headers = (request.headers.get('Access-Control-Request-Headers') || '').split(',').map(h=>h.trim().toLowerCase()).filter(Boolean);
        const expectedMethod = path.endsWith('/applications') ? 'POST' : 'GET';
        if(method !== expectedMethod || headers.some(h=>h !== 'content-type')) return json({ok:false,code:'forbidden'},403,cors);
        return new Response(null,{status:204,headers:{...cors,'Access-Control-Max-Age':'600','Cache-Control':'no-store'}});
      }
      try {
        const response = path.endsWith('/form-config') ? formConfig({request,env}) : await submit({request,env});
        const headers = new Headers(response.headers);for(const [key,value] of Object.entries(cors))headers.set(key,value);
        return new Response(response.body,{status:response.status,headers});
      } catch {return json({ok:false,code:'temporarily_unavailable'},503,cors);}
    }
  };
}
export default createEducatorWorker();
