// Simple accessible carousel for the hero
(function(){
  const carousel = document.getElementById('heroCarousel');
  if(!carousel) return;

  const track = carousel.querySelector('.carousel-track');
  const slides = Array.from(carousel.querySelectorAll('.carousel-slide'));
  const prevBtn = carousel.querySelector('.carousel-btn.prev');
  const nextBtn = carousel.querySelector('.carousel-btn.next');
  const indicators = Array.from(carousel.querySelectorAll('.indicator'));
  let current = 0;
  let interval = null;
  const AUTOPLAY_MS = 5000;

  function goTo(idx){
    idx = (idx + slides.length) % slides.length;
    slides.forEach((s,i)=>{
      const hidden = i!==idx;
      s.setAttribute('aria-hidden', hidden? 'true' : 'false');
      s.style.display = hidden? 'none' : 'block';
    });
    indicators.forEach((btn,i)=>{
      btn.setAttribute('aria-selected', i===idx? 'true' : 'false');
    });
    current = idx;
  }

  function next(){ goTo(current+1); }
  function prev(){ goTo(current-1); }

  function start(){
    stop();
    interval = setInterval(next, AUTOPLAY_MS);
  }
  function stop(){ if(interval){ clearInterval(interval); interval=null } }

  // Init
  goTo(0);
  start();

  // Events
  nextBtn.addEventListener('click', ()=>{ next(); start(); });
  prevBtn.addEventListener('click', ()=>{ prev(); start(); });

  indicators.forEach((btn, i)=>{
    btn.addEventListener('click', ()=>{ goTo(i); start(); });
  });

  carousel.addEventListener('mouseenter', stop);
  carousel.addEventListener('mouseleave', start);

  carousel.addEventListener('focusin', stop);
  carousel.addEventListener('focusout', start);

  // keyboard
  carousel.addEventListener('keydown', (e)=>{
    if(e.key === 'ArrowRight') { next(); start(); }
    if(e.key === 'ArrowLeft') { prev(); start(); }
  });

  // make carousel focusable for keyboard
  carousel.tabIndex = 0;
})();
