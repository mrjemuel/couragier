
    (()=>{
      const reviews=[
        {id:1,name:'Élodie N.',language:'francais',plan:'startup',image:'/assets/images/couragier_review_1.webp'},
        {id:2,name:'Thomas V.',language:'francais',plan:'growth',image:'/assets/images/couragier_review_2.webp'},
        {id:3,name:'Camelia R.',language:'francais',plan:'essentials',image:'/assets/images/couragier_review_3.webp'},
        {id:4,name:'Lucas B.',language:'francais',plan:'growth',image:'/assets/images/couragier_review_4.webp'},
        {id:5,name:'Sophie M.',language:'francais',plan:'essentials',image:'/assets/images/couragier_review_5.webp'},
        {id:6,name:'David L.',language:'francais',plan:'startup',image:'/assets/images/couragier_review_6.webp'},
        {id:7,name:'Amélie G.',language:'francais',plan:'essentials',image:'/assets/images/couragier_review_7.webp'},
        {id:8,name:'Vanessa D.',language:'kreyol',plan:'startup',image:'/assets/images/couragier_review_8.webp'},
        {id:9,name:'Ricardo M.',language:'kreyol',plan:'growth',image:'/assets/images/couragier_review_9.webp'},
        {id:10,name:'Nadia P.',language:'kreyol',plan:'essentials',image:'/assets/images/couragier_review_10.webp'},
        {id:11,name:'Stanley J.',language:'kreyol',plan:'growth',image:'/assets/images/couragier_review_11.webp'},
        {id:12,name:'Emily R.',language:'english',plan:'startup',image:'/assets/images/couragier_review_12.webp'},
        {id:13,name:'Michelle D.',language:'english',plan:'growth',image:'/assets/images/couragier_review_13.webp'},
        {id:14,name:'Jessica L.',language:'english',plan:'startup',image:'/assets/images/couragier_review_14.webp'},
        {id:15,name:'Daniel P.',language:'english',plan:'essentials',image:'/assets/images/couragier_review_15.webp'}
      ];
      const planNames={startup:'Startup Kit',essentials:'Essentials Kit',growth:'Growth Kit'};
      const grid=document.querySelector('#grid'),language=document.querySelector('#language'),count=document.querySelector('#count'),empty=document.querySelector('#empty'),previous=document.querySelector('#previous'),next=document.querySelector('#next'),pageStatus=document.querySelector('#page-status'),reset=document.querySelector('#reset'),chips=[...document.querySelectorAll('.chip')];
      const writeReviewButton=document.querySelector('#write-review-cta');
      let selectedPlan='all',selectedLanguage='all',currentPage=1;
      let heightFrame=0;
      function syncEmbedHeight(){}
      const filtered=()=>reviews.filter(r=>(selectedPlan==='all'||r.plan===selectedPlan)&&(selectedLanguage==='all'||r.language===selectedLanguage));
      function card(r,i){return `<article class="card" style="animation-delay:${Math.min(i*45,250)}ms"><img src="${r.image}" alt="Learner review from ${r.name}" loading="lazy" decoding="async"><footer class="meta"><span class="verified"><span class="check" aria-hidden="true">✓</span>Learner</span><span class="plan">${planNames[r.plan]}</span></footer></article>`}
      const pageSize=()=>window.innerWidth<=620?1:window.innerWidth<=900?2:3;
      function render(){const all=filtered(),size=pageSize(),totalPages=Math.max(1,Math.ceil(all.length/size));currentPage=Math.min(currentPage,totalPages);const start=(currentPage-1)*size,shown=all.slice(start,start+size);grid.innerHTML=shown.map(card).join('');grid.style.display=all.length?'grid':'none';empty.classList.toggle('show',!all.length);count.textContent=all.length?`Showing ${start+1}–${start+shown.length} of ${all.length} reviews`:'No matching reviews';pageStatus.textContent=all.length?`Page ${currentPage} of ${totalPages}`:'Page 0 of 0';previous.disabled=!all.length||currentPage===1;next.disabled=!all.length||currentPage===totalPages;grid.querySelectorAll('img').forEach(img=>{if(!img.complete)img.addEventListener('load',syncEmbedHeight,{once:true})});syncEmbedHeight();setTimeout(syncEmbedHeight,120);setTimeout(syncEmbedHeight,500)}
      chips.forEach(chip=>chip.addEventListener('click',()=>{selectedPlan=chip.dataset.plan;currentPage=1;chips.forEach(c=>{const active=c===chip;c.classList.toggle('active',active);c.setAttribute('aria-pressed',String(active))});render()}));
      language.addEventListener('change',()=>{selectedLanguage=language.value;currentPage=1;render()});
      previous.addEventListener('click',()=>{if(currentPage>1){currentPage--;render();grid.scrollIntoView({behavior:'smooth',block:'nearest'})}});
      next.addEventListener('click',()=>{const pages=Math.ceil(filtered().length/pageSize());if(currentPage<pages){currentPage++;render();grid.scrollIntoView({behavior:'smooth',block:'nearest'})}});
      reset.addEventListener('click',()=>{selectedPlan='all';selectedLanguage='all';language.value='all';currentPage=1;chips.forEach(c=>{const active=c.dataset.plan==='all';c.classList.toggle('active',active);c.setAttribute('aria-pressed',String(active))});render()});
      writeReviewButton.addEventListener('click',event=>{
        event.preventDefault();
        const reviewURL=writeReviewButton.href;
        const opened=window.open(reviewURL,'_blank','noopener,noreferrer');
        if(!opened){
          try{window.top.location.assign(reviewURL)}catch(error){window.location.assign(reviewURL)}
        }
      });
      if('ResizeObserver' in window){new ResizeObserver(syncEmbedHeight).observe(document.body)}
      window.addEventListener('load',syncEmbedHeight);
      let resizeTimer;
      window.addEventListener('resize',()=>{clearTimeout(resizeTimer);resizeTimer=setTimeout(()=>{currentPage=1;render()},120)});
      render();
    })();
  