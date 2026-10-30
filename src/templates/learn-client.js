  // Gentle reveal for content cards.
  const revealItems=document.querySelectorAll('.compare-card,.method-card,.review,.step,.resource');
  if('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches){
    revealItems.forEach(el=>el.classList.add('scroll-reveal'));
    const revealObserver=new IntersectionObserver(entries=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          revealObserver.unobserve(entry.target);
        }
      });
    },{threshold:.14});
    revealItems.forEach(el=>revealObserver.observe(el));
  }

  // Mobile reviews carousel pagination.
  const reviewsGrid=document.querySelector('.reviews-grid');
  const reviewCards=[...document.querySelectorAll('.reviews-grid .review')];
  const reviewDots=[...document.querySelectorAll('.review-dot')];

  function setActiveReviewDot(index){
    reviewDots.forEach((dot,i)=>dot.classList.toggle('active',i===index));
  }

  if(reviewsGrid && reviewCards.length && reviewDots.length){
    let reviewRaf=0;
    reviewsGrid.addEventListener('scroll',()=>{
      cancelAnimationFrame(reviewRaf);
      reviewRaf=requestAnimationFrame(()=>{
        const gridLeft=reviewsGrid.getBoundingClientRect().left;
        let nearest=0;
        let distance=Infinity;
        reviewCards.forEach((card,i)=>{
          const d=Math.abs(card.getBoundingClientRect().left-gridLeft);
          if(d<distance){distance=d;nearest=i}
        });
        setActiveReviewDot(nearest);
      });
    },{passive:true});

    reviewDots.forEach((dot,i)=>{
      dot.addEventListener('click',()=>{
        reviewCards[i]?.scrollIntoView({behavior:'smooth',block:'nearest',inline:'start'});
        setActiveReviewDot(i);
      });
    });
  }

  document.querySelectorAll('.faq button').forEach(button=>button.addEventListener('click',()=>{
    const item=button.closest('.faq');const wasOpen=item.classList.contains('open');
    document.querySelectorAll('.faq.open').forEach(openItem=>{openItem.classList.remove('open');const b=openItem.querySelector('button');b.setAttribute('aria-expanded','false');b.querySelector('span:last-child').textContent='+'});
    if(!wasOpen){item.classList.add('open');button.setAttribute('aria-expanded','true');button.querySelector('span:last-child').textContent='−'}
  }));
