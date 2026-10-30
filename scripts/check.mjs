import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';import {serializeApplication,createApplicationMailto} from '../public/assets/js/application-email.mjs';
process.chdir(path.resolve(import.meta.dirname,'..'));
function files(p){return fs.readdirSync(p,{withFileTypes:true}).flatMap(d=>d.isDirectory()?files(path.join(p,d.name)):[path.join(p,d.name)])}
let pages=0,refs=0;
for(const output of ['dist','dist-learn'])for(const p of files(output)){const b=fs.readFileSync(p);assert(b.length>0,`Empty file ${p}`);if(!p.endsWith('.html'))continue;pages++;const s=b.toString();assert(!/assets\.zyrosite|hostinger|data:image/i.test(s),`Hosting dependency in ${p}`);assert.equal((s.match(/<h1\b/g)||[]).length,1,`Exactly one h1 in ${p}`);assert(s.includes('official wordmark couragier logo'),`Missing logo alt in ${p}`);assert(s.includes('/couragier_official_logo.ico'),`Missing favicon ${p}`);assert.equal((s.match(/class="language-switch"/g)||[]).length,1,`Shared switch ${p}`);if(output==='dist'&&!p.endsWith('404.html'))assert(s.includes('class="site-footer"'),`Missing shared footer ${p}`);
for(const m of s.matchAll(/(?:src|href)="(\/[^"#?]*)[^"]*"/g)){let target=m[1];if(target.startsWith('//'))continue;refs++;const dest=path.join(output,target);assert(fs.existsSync(dest)||fs.existsSync(path.join(dest,'index.html')),`Missing local reference ${target} in ${p}`)}
}
assert.equal(createHash('sha256').update(fs.readFileSync('public/assets/images/couragier_official_logo.svg')).digest('hex'),'d717707b5354d02c3aab455fc1e1e788a1a26c44f9be55907b8439d4f146663a','Original SVG unchanged');
const form=JSON.parse(fs.readFileSync('src/data/educator-form.json','utf8'));
assert.equal(form.fields.length,20);assert.equal(form.fields.reduce((n,f)=>n+f.options.length,0),65);
for(const lang of ['en','fr','ht']){
 const html=fs.readFileSync(`dist/${lang==='en'?'':lang+'/'}educator/index.html`,'utf8');
 for(const f of form.fields){assert(html.includes(`data-field="${f.id}"`));if(f.options.length)assert.equal((html.match(new RegExp(`name="${f.id}"`,'g'))||[]).length,f.options.length)}
 assert(html.includes('application-email.mjs'));assert(html.includes('action="https://api.couragier.com/educator/applications"'));
 const home=fs.readFileSync(`dist/${lang==='en'?'':lang+'/'}index.html`,'utf8');assert(!/href="https:\/\/shop.couragier.com[^"]*"[^>]*>[^<]* →/.test(home));
 const menu=home.match(/<nav id="site-menu"[^>]*>(.*?)<\/nav>/)[1];assert(!menu.includes('shop.couragier.com'));
}
const groups=form.fields.map(f=>({label:f.label,values:f.options.length?f.options.slice(0,2):['Tès avèk aksan & caractères\nSecond line']}));
const body=serializeApplication(groups,{lang:'ht',now:new Date('2026-10-29T12:00:00Z')});const mail=createApplicationMailto('hello@couragier.com','Aplikasyon — Éducateur',body);assert.equal(new URL(mail).searchParams.get('body'),body);assert.equal(new URL(mail).searchParams.get('subject'),'Aplikasyon — Éducateur');assert(body.includes('English\nFrançais'));for(const f of form.fields)assert(body.includes(f.label.replace(/\*$/,'')));
for(const lang of ['en','fr','ht']){
 const prefix=lang==='en'?'':lang+'/';const edu=fs.readFileSync(`dist/${prefix}educator/index.html`,'utf8');
 assert(edu.includes('data-recipient="partners@couragier.com"'));assert.equal((edu.match(/class="required-marker"/g)||[]).length,form.fields.filter(f=>f.required).length+1);
 for(const f of form.fields.filter(f=>!f.options.length)){assert(f.placeholder[lang]);assert(edu.includes(`placeholder="${f.placeholder[lang].replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#39;')}"`))}
 const review=fs.readFileSync(`dist/${prefix}write-a-review/index.html`,'utf8');assert(review.includes('mailto:feedback@couragier.com?'));assert(review.includes('couragier_lion_mascot_e_learning_companion_review_typing_working.webp'));
 const learn=fs.readFileSync(`dist-learn/${prefix}index.html`,'utf8');assert(learn.includes(`href="https://www.couragier.com/${prefix}" class="brand"`));
}
const client=fs.readFileSync('public/assets/js/site.js','utf8');assert(!client.includes('if(!getConsent())openPreferences()'));assert(!client.includes("fetch('/api/applications'"));
console.log(`PASS: ${pages} pages, ${refs} local references, 20 original form groups / 65 choices in 3 languages; complete Unicode email serialization; footer-only cookies, localized placeholders/red markers, feedback recipient and Learn logo targets.`);
