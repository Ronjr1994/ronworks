
(function(){
  const menuBtn = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.nav-links');
  if(menuBtn && nav){
    menuBtn.addEventListener('click', ()=>{
      const open = nav.classList.toggle('open');
      menuBtn.setAttribute('aria-expanded', String(open));
    });
    nav.querySelectorAll('a').forEach(a=>a.addEventListener('click', ()=>nav.classList.remove('open')));
  }

  document.querySelectorAll('.filter-btn').forEach(btn=>{
    btn.addEventListener('click', ()=>{
      const label = btn.textContent.trim();
      document.querySelectorAll('.filter-btn').forEach(b=>b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.tool-card').forEach(card=>{
        const cats = (card.dataset.categories || '').split(',').map(s=>s.trim()).filter(Boolean);
        const show = label === 'All Tools' || cats.includes(label);
        card.style.display = show ? '' : 'none';
      });
    });
  });

  document.querySelectorAll('.experience-item').forEach(item=>{
    const header = item.querySelector('.experience-header');
    const details = item.querySelector('.experience-details');
    const expandBtn = item.querySelector('.expand-btn');
    if(!header || !details) return;
    const apply = () => {
      const expanded = item.classList.contains('expanded');
      details.style.display = expanded ? 'block' : 'none';
      if(expandBtn){
        expandBtn.setAttribute('aria-expanded', String(expanded));
        expandBtn.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
      }
    };
    apply();
    header.addEventListener('click', ()=>{ item.classList.toggle('expanded'); apply(); });
  });

  // smooth scroll for local anchors
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click', e=>{
    const id = a.getAttribute('href');
    if(id.length>1){
      const target = document.querySelector(id);
      if(target){
        e.preventDefault();
        target.scrollIntoView({behavior:'smooth', block:'start'});
      }
    }
  }));

  // simple active nav highlight on scroll
  const links = [...document.querySelectorAll('.nav-link')];
  const sections = links.map(l => document.querySelector(l.getAttribute('href'))).filter(Boolean);
  const setActive = () => {
    let current = sections[0];
    for(const sec of sections){ if(window.scrollY + 120 >= sec.offsetTop) current = sec; }
    links.forEach(l => l.classList.toggle('active', l.getAttribute('href') === '#'+current.id));
  };
  setActive();
  window.addEventListener('scroll', setActive, {passive:true});

  // project video modal for Profit Pulse
  const videoThumb = document.querySelector('.video-thumbnail');
  if(videoThumb){
    const modal = document.createElement('div');
    modal.className = 'project-video-modal';
    modal.innerHTML = '<div class="project-video-backdrop"></div><div class="project-video-shell"><button class="project-video-close" aria-label="Close">×</button><video controls playsinline src="./assets/media/profit-pulse.mp4"></video></div>';
    document.body.appendChild(modal);
    const close = ()=> modal.classList.remove('open');
    videoThumb.addEventListener('click', ()=> modal.classList.add('open'));
    modal.querySelector('.project-video-backdrop').addEventListener('click', close);
    modal.querySelector('.project-video-close').addEventListener('click', close);
  }
})();
