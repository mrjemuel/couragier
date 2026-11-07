(()=>{'use strict';
const lang=document.documentElement.lang;
try{localStorage.setItem('cg-home-language',lang)}catch{}
const menu=document.getElementById('site-menu'),toggle=document.querySelector('.menu-toggle');
const desktopMenu = matchMedia('(min-width: 1050px)');
function closeMenu() {
  if (!menu || !toggle) return;
  menu.hidden = !desktopMenu.matches;
  toggle.setAttribute('aria-expanded', 'false');
}
desktopMenu.addEventListener('change', closeMenu);
closeMenu();
toggle?.addEventListener('click',()=>{menu.hidden=!menu.hidden;toggle.setAttribute('aria-expanded',String(!menu.hidden))});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();document.querySelector('.cookie-panel')?.remove()}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});
document.querySelectorAll('.cg-faq').forEach(faq => {
  function setExpanded(question, expanded) {
    question.setAttribute('aria-expanded', String(expanded));
    document.getElementById(question.getAttribute('aria-controls')).hidden = !expanded;
    question.querySelector('span').textContent = expanded ? '−' : '+';
  }
  faq.querySelectorAll('.cg-faq-q').forEach(question => {
    question.addEventListener('click', () => {
      const previous = faq.querySelector('.cg-faq-q[aria-expanded="true"]');
      if (previous) setExpanded(previous, false);
      if (previous !== question) setExpanded(question, true);
    });
  });
});
const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
const counters = document.querySelectorAll('[data-count]');
if (!reduced && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver(entries => {
    for (const { target, isIntersecting, intersectionRatio } of entries) {
      if (!isIntersecting || intersectionRatio < 0.4) continue;
      observer.unobserve(target);
      const end = Number(target.dataset.count);
      const decimals = Number(target.dataset.decimals || 0);
      const start = performance.now();
      const tick = now => {
        const progress = Math.min(1, (now - start) / 1250);
        const value = end * (1 - (1 - progress) ** 2);
        target.textContent = value.toFixed(decimals);
        if (progress < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    }
  }, { threshold: 0.4 });
  counters.forEach(counter => {
    counter.textContent = (0).toFixed(Number(counter.dataset.decimals || 0));
    observer.observe(counter);
  });
}
const track=document.querySelector('.cg-review-track'),dots=[...document.querySelectorAll('.cg-review-dots button')];if(track){track.addEventListener('scroll',()=>{const i=Math.round(track.scrollLeft/Math.max(1,track.children[0].getBoundingClientRect().width+14));dots.forEach((d,n)=>d.classList.toggle('active',n===i))},{passive:true});dots.forEach((d,i)=>d.addEventListener('click',()=>track.children[i].scrollIntoView({behavior:reduced?'instant':'smooth',block:'nearest',inline:'start'})))}
// No optional tracking is installed. Consent is a local preference, not a promise to control unrelated subdomains.
const ct={en:{title:'Your privacy choices',text:'This site uses local storage for your language and privacy choices. Optional analytics and marketing are off by default.',reject:'Reject optional',accept:'Accept optional',save:'Save choices',analytics:'Analytics',marketing:'Marketing',necessary:'Necessary preferences are always active.'},fr:{title:'Vos choix de confidentialité',text:'Ce site conserve vos choix de langue et de confidentialité localement. Les statistiques et le marketing optionnels sont désactivés par défaut.',reject:'Refuser les options',accept:'Accepter les options',save:'Enregistrer',analytics:'Statistiques',marketing:'Marketing',necessary:'Les préférences nécessaires restent actives.'},ht:{title:'Chwa konfidansyalite ou',text:'Sit sa a konsève chwa lang ak konfidansyalite ou nan navigatè a. Estatistik ak maketing opsyonèl dezaktive pa defo.',reject:'Refize opsyonèl yo',accept:'Aksepte opsyonèl yo',save:'Anrejistre chwa yo',analytics:'Estatistik',marketing:'Maketing',necessary:'Preferans ki nesesè yo toujou aktif.'}}[lang]||{};
function getConsent(){try{return JSON.parse(localStorage.getItem('cg-consent-v1'))}catch{return null}}
function saveConsent(analytics,marketing){const value={necessary:true,analytics:!!analytics,marketing:!!marketing,updatedAt:new Date().toISOString()};if(navigator.globalPrivacyControl)value.marketing=false;try{localStorage.setItem('cg-consent-v1',JSON.stringify(value))}catch{}document.querySelector('.cookie-panel')?.remove();window.dispatchEvent(new CustomEvent('couragier:consent',{detail:value}))}
function openPreferences(){document.querySelector('.cookie-panel')?.remove();const prior=getConsent()||{};const box=document.createElement('section');box.className='cookie-panel';box.setAttribute('role','region');box.setAttribute('aria-label',ct.title);box.innerHTML=`<h2>${ct.title}</h2><p>${ct.text}</p><p>${ct.necessary}</p><div class="cookie-options"><label><input type="checkbox" name="analytics" ${prior.analytics?'checked':''}>${ct.analytics}</label><label><input type="checkbox" name="marketing" ${prior.marketing&&!navigator.globalPrivacyControl?'checked':''} ${navigator.globalPrivacyControl?'disabled':''}>${ct.marketing}</label></div><div class="cookie-actions"><button data-reject>${ct.reject}</button><button data-save>${ct.save}</button><button class="accept" data-accept>${ct.accept}</button></div>`;document.body.append(box);box.querySelector('[data-reject]').onclick=()=>saveConsent(false,false);box.querySelector('[data-accept]').onclick=()=>saveConsent(true,true);box.querySelector('[data-save]').onclick=()=>saveConsent(box.querySelector('[name=analytics]').checked,box.querySelector('[name=marketing]').checked)}
document.querySelectorAll('[data-cookie-settings]').forEach(b=>b.addEventListener('click',openPreferences));if(navigator.globalPrivacyControl)saveConsent(!!getConsent()?.analytics,false);
})();
