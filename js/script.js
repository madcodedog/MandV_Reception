(function(){
  "use strict";

  /* ============================================================
     1. FALLING PETALS
     ============================================================ */
  const petalField = document.getElementById('petal-field');

  const PETAL_COLORS = [
    ['#a9c3e0', '#f6e7c1'], // soft blue petals, warm center
    ['#c7b8e0', '#f6e7c1'], // lilac petals
    ['#dce6f5', '#f3d896'], // pale blue petals
    ['#7fa0cc', '#f6e7c1'], // deeper blue petals
    ['#ffffff', '#f3d896'], // white petals
  ];

  // A small blossom, radiating from center — used for both falling flowers
  // and burst particles. Each petal is gradient-shaded (light throat fading
  // into the petal color, like a real bloom), rotated with slight random
  // jitter for organic asymmetry, with a tiny stamen cluster at the center.
  let flowerUid = 0;
  function flowerSVG(petalColor, centerColor, petalCount){
    petalCount = petalCount || 5;
    const step = 360 / petalCount;
    const uid = 'fg' + (flowerUid++);

    let petals = '';
    for (let i = 0; i < petalCount; i++){
      const jitter = (Math.random() * 10 - 5).toFixed(1);
      petals += `<path d="M20 20 C15 18 12 10 15 4 C17 1 23 1 25 4 C28 10 25 18 20 20 Z" fill="url(#${uid})" opacity="0.96" transform="rotate(${(i * step + Number(jitter)).toFixed(1)} 20 20)"/>`;
    }

    let stamens = '';
    const stamenCount = petalCount <= 4 ? 3 : 4;
    for (let s = 0; s < stamenCount; s++){
      const angle = (360 / stamenCount) * s + 20;
      const rad = (angle * Math.PI) / 180;
      const sx = (20 + Math.cos(rad) * 2.6).toFixed(1);
      const sy = (20 + Math.sin(rad) * 2.6).toFixed(1);
      stamens += `<circle cx="${sx}" cy="${sy}" r="0.9" fill="#a8823a"/>`;
    }

    return `<svg width="100%" height="100%" viewBox="0 0 40 40">
      <defs><radialGradient id="${uid}" cx="50%" cy="88%" r="95%">
        <stop offset="0%" stop-color="${centerColor}" stop-opacity="0.95"/>
        <stop offset="45%" stop-color="${petalColor}"/>
        <stop offset="100%" stop-color="${petalColor}"/>
      </radialGradient></defs>
      ${petals}
      <circle cx="20" cy="20" r="2.6" fill="${centerColor}"/>
      ${stamens}
    </svg>`;
  }

  function spawnPetal(){
    if (document.hidden) return;
    const petal = document.createElement('div');
    petal.className = 'petal';

    const [petalColor, centerColor] = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    const size = 14 + Math.random() * 16;
    const startX = Math.random() * 100;
    const duration = 9 + Math.random() * 8;
    const drift = (Math.random() * 200 - 100).toFixed(0) + 'px';
    const spin = (Math.random() * 540 - 270).toFixed(0) + 'deg';
    const delay = Math.random() * 0.6;

    petal.style.left = startX + 'vw';
    petal.style.width = size + 'px';
    petal.style.height = size + 'px';
    petal.style.setProperty('--drift', drift);
    petal.style.setProperty('--spin', spin);
    petal.style.animation = `fall ${duration}s linear ${delay}s forwards`;
    petal.innerHTML = flowerSVG(petalColor, centerColor);

    petalField.appendChild(petal);
    setTimeout(() => petal.remove(), (duration + delay + 0.5) * 1000);
  }

  let petalTimer = setInterval(spawnPetal, 550);
  for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 180);

  /* ============================================================
     1b. TWINKLING FAIRY-LIGHT BLOSSOMS
     ============================================================ */
  const sparkField = document.getElementById('spark-field');
  const SPARK_COLORS = ['#a9c3e0', '#c7b8e0', '#ffffff', '#e9d9a8'];

  function spawnSpark(){
    if (document.hidden) return;
    const spark = document.createElement('div');
    spark.className = 'spark';

    const size = 9 + Math.random() * 10;
    const x = Math.random() * 100;
    const y = 5 + Math.random() * 90;
    const duration = 2.8 + Math.random() * 3.2;
    const color = SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)];

    spark.style.left = x + 'vw';
    spark.style.top = y + 'vh';
    spark.style.width = size + 'px';
    spark.style.height = size + 'px';
    spark.style.animation = `twinkle ${duration}s ease-in-out forwards`;
    spark.innerHTML = flowerSVG(color, '#fff8e2', 4);

    sparkField.appendChild(spark);
    setTimeout(() => spark.remove(), duration * 1000 + 200);
  }

  let sparkTimer = setInterval(spawnSpark, 420);
  for (let i = 0; i < 10; i++) setTimeout(spawnSpark, i * 140);

  /* ============================================================
     1b2. FIREFLIES — small glowing dots that wander and blink,
     same palette as the petals and fairy-light blossoms.
     ============================================================ */
  const fireflyField = document.getElementById('firefly-field');
  const FIREFLY_COLORS = [
    ['#fff8e2', '#f3d896'], // warm gold
    ['#eaf2fb', '#a9c3e0'], // soft blue
    ['#f4f0fb', '#c7b8e0'], // lilac
  ];

  function spawnFirefly(){
    if (document.hidden) return;
    const firefly = document.createElement('div');
    firefly.className = 'firefly';

    const [core, glow] = FIREFLY_COLORS[Math.floor(Math.random() * FIREFLY_COLORS.length)];
    const size = 5 + Math.random() * 6;
    const x = Math.random() * 100;
    const y = Math.random() * 100;
    const duration = 5 + Math.random() * 4;
    const fx = (Math.random() * 160 - 80).toFixed(0) + 'px';
    const fy = (Math.random() * 160 - 100).toFixed(0) + 'px';

    firefly.style.left = x + 'vw';
    firefly.style.top = y + 'vh';
    firefly.style.width = size + 'px';
    firefly.style.height = size + 'px';
    firefly.style.background = `radial-gradient(circle, ${core} 0%, ${glow} 55%, rgba(0,0,0,0) 75%)`;
    firefly.style.boxShadow = `0 0 ${size * 2}px ${size * 0.8}px ${glow}66`;
    firefly.style.setProperty('--fx', fx);
    firefly.style.setProperty('--fy', fy);
    firefly.style.animation = `fireflyDrift ${duration}s ease-in-out forwards`;

    fireflyField.appendChild(firefly);
    setTimeout(() => firefly.remove(), duration * 1000 + 200);
  }

  let fireflyTimer = setInterval(spawnFirefly, 650);
  for (let i = 0; i < 6; i++) setTimeout(spawnFirefly, i * 220);

  /* ============================================================
     1c. CLICK-TO-BLOOM BURST
     ============================================================ */
  function spawnBurst(x, y){
    const count = 8;
    for (let i = 0; i < count; i++){
      const el = document.createElement('div');
      el.className = 'burst-particle';

      const angle = (Math.PI * 2 * i) / count + Math.random() * 0.5;
      const dist = 36 + Math.random() * 54;
      const bx = (Math.cos(angle) * dist).toFixed(0) + 'px';
      const by = (Math.sin(angle) * dist).toFixed(0) + 'px';
      const size = 10 + Math.random() * 10;
      const [petalColor, centerColor] = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];

      el.style.left = x + 'px';
      el.style.top = y + 'px';
      el.style.width = size + 'px';
      el.style.height = size + 'px';
      el.style.setProperty('--bx', bx);
      el.style.setProperty('--by', by);
      el.style.animation = 'burst .9s cubic-bezier(.2,.8,.3,1) forwards';
      el.innerHTML = flowerSVG(petalColor, centerColor);

      petalField.appendChild(el);
      setTimeout(() => el.remove(), 950);
    }
  }

  /* ============================================================
     2. ENVELOPE INTRO
     ============================================================ */
  const envelope = document.getElementById('envelope');
  const envelopeScreen = document.getElementById('envelope-screen');
  const waxSeal = document.getElementById('waxSeal');
  const site = document.getElementById('site');
  let opened = false;

  function openInvitation(){
    if (opened) return;
    opened = true;
    envelope.classList.add('opening');
    startMusic(); // works if this was a real tap; browsers silently block it if triggered by the auto-open fallback timer below

    setTimeout(() => {
      envelopeScreen.classList.add('closed');
      site.classList.remove('hidden');
      document.body.style.overflow = 'auto';
      initScrollReveal();
    }, 950);

    setTimeout(() => {
      envelopeScreen.style.display = 'none';
    }, 1900);
  }

  waxSeal.addEventListener('click', openInvitation);
  envelope.addEventListener('click', openInvitation);
  document.body.style.overflow = 'hidden';

  // Guests who don't know to tap (or don't notice the hint) still see the
  // invitation — it opens itself after a few seconds either way.
  setTimeout(() => { if (!opened) openInvitation(); }, 4500);

  /* ============================================================
     2b. CLICK-TO-BLOOM (site-wide) + HERO PARALLAX
     ============================================================ */
  document.addEventListener('click', (e) => {
    if (!opened) return;
    if (e.target.closest('a, button, iframe')) return;
    spawnBurst(e.clientX, e.clientY);
  });

  const heroSection = document.querySelector('.hero');
  const garlandEl = document.querySelector('.garland');
  if (heroSection && garlandEl && window.matchMedia('(pointer: fine)').matches){
    heroSection.addEventListener('mousemove', (e) => {
      const rect = heroSection.getBoundingClientRect();
      const relX = (e.clientX - rect.left) / rect.width - 0.5;
      const relY = (e.clientY - rect.top) / rect.height - 0.5;
      garlandEl.style.transform = `translate(${(relX * 16).toFixed(1)}px, ${(relY * 10).toFixed(1)}px)`;
    });
    heroSection.addEventListener('mouseleave', () => {
      garlandEl.style.transform = 'translate(0,0)';
    });
  }

  /* ============================================================
     2c. BACKGROUND MUSIC — plays whatever file is at assets/music.mp3.
     Upload/replace that file directly on github.com any time; no code
     changes needed. The button stays hidden until a file is actually
     there.

     Browsers never allow audio to start with zero interaction on the
     page — clicking a link elsewhere to arrive here doesn't count, only
     an interaction with this page itself does. The closest thing to
     "plays as soon as they open the link": start it muted immediately
     (browsers do allow autoplay when muted), then unmute on the very
     first tap/click anywhere on the page — not just the envelope — so
     sound kicks in the instant they touch the screen at all.
     ============================================================ */
  const bgm = document.getElementById('bgm');
  const musicToggle = document.getElementById('musicToggle');

  if (bgm && musicToggle){
    bgm.addEventListener('loadedmetadata', () => {
      musicToggle.hidden = false;
      bgm.muted = true;
      bgm.play().catch(() => {}); // muted autoplay — allowed without a gesture
    }, { once: true });
    bgm.addEventListener('error', () => { musicToggle.hidden = true; }, true);
    bgm.load();

    function unmuteMusic(){
      if (!bgm.muted && !bgm.paused) return;
      bgm.muted = false;
      bgm.play().then(() => {
        musicToggle.classList.add('playing');
        musicToggle.textContent = '♫';
        musicToggle.setAttribute('aria-label', 'Pause music');
      }).catch(() => {});
    }

    ['click', 'touchstart', 'keydown'].forEach(evt => {
      document.addEventListener(evt, unmuteMusic, { once: true, capture: true });
    });

    musicToggle.addEventListener('click', () => {
      if (bgm.paused || bgm.muted){
        unmuteMusic();
      } else {
        bgm.pause();
        musicToggle.classList.remove('playing');
        musicToggle.textContent = '♪';
        musicToggle.setAttribute('aria-label', 'Play music');
      }
    });
  }

  function startMusic(){
    if (!bgm) return;
    bgm.muted = false;
    if (!bgm.paused && !bgm.muted) return;
    bgm.play().then(() => {
      if (musicToggle){
        musicToggle.classList.add('playing');
        musicToggle.textContent = '♫';
        musicToggle.setAttribute('aria-label', 'Pause music');
      }
    }).catch(() => {});
  }

  /* ============================================================
     3. SCROLL REVEAL
     ============================================================ */
  function initScrollReveal(){
    const items = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          const group = entry.target.parentElement;
          const siblings = group ? Array.from(group.children).filter(c => c.classList.contains('reveal')) : [entry.target];
          const stagger = siblings.length > 1 ? siblings.indexOf(entry.target) * 100 : 0;
          setTimeout(() => entry.target.classList.add('in-view'), stagger);
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    items.forEach(el => io.observe(el));
  }

  /* ============================================================
     4. COUNTDOWN
     ============================================================ */
  const EVENT_DATE = new Date(2026, 8, 20, 11, 0, 0); // 20 Sept 2026, 11:00 AM

  function updateCountdown(){
    const now = new Date();
    let diff = EVENT_DATE - now;
    if (diff < 0) diff = 0;

    const days = Math.floor(diff / 86400000);
    const hours = Math.floor((diff % 86400000) / 3600000);
    const mins = Math.floor((diff % 3600000) / 60000);
    const secs = Math.floor((diff % 60000) / 1000);

    const pad = n => String(n).padStart(2, '0');
    const dEl = document.getElementById('cd-days');
    const hEl = document.getElementById('cd-hours');
    const mEl = document.getElementById('cd-mins');
    const sEl = document.getElementById('cd-secs');
    if (dEl) dEl.textContent = pad(days);
    if (hEl) hEl.textContent = pad(hours);
    if (mEl) mEl.textContent = pad(mins);
    if (sEl) sEl.textContent = pad(secs);
  }
  updateCountdown();
  const secsBox = document.getElementById('cd-secs')?.closest('.cd-box');
  setInterval(() => {
    updateCountdown();
    if (secsBox){
      secsBox.classList.remove('tick');
      void secsBox.offsetWidth;
      secsBox.classList.add('tick');
    }
  }, 1000);

  /* ============================================================
     5. CALENDAR LINKS
     ============================================================ */
  function pad2(n){ return String(n).padStart(2, '0'); }
  function toICSDate(d){
    return d.getFullYear() + pad2(d.getMonth()+1) + pad2(d.getDate()) + 'T' + pad2(d.getHours()) + pad2(d.getMinutes()) + '00';
  }

  const startDate = new Date(2026, 8, 20, 11, 0, 0);
  const endDate = new Date(2026, 8, 20, 15, 0, 0);
  const title = "Manish & Sriviveka's Wedding Reception";
  const details = "Morning Reception 11:00 AM onwards. Lunch (Veg & Non-Veg) 12:00 PM onwards.";
  const location = "Srishti Vilasa, Kanakapura Road, Bengaluru";

  const gcalLink = document.getElementById('gcal-link');
  if (gcalLink){
    const gcalUrl = new URL('https://calendar.google.com/calendar/render');
    gcalUrl.searchParams.set('action', 'TEMPLATE');
    gcalUrl.searchParams.set('text', title);
    gcalUrl.searchParams.set('dates', `${toICSDate(startDate)}/${toICSDate(endDate)}`);
    gcalUrl.searchParams.set('details', details);
    gcalUrl.searchParams.set('location', location);
    gcalLink.href = gcalUrl.toString();
  }

  const icsLink = document.getElementById('ics-link');
  if (icsLink){
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Manish & Sriviveka//Wedding Reception//EN',
      'BEGIN:VEVENT',
      `UID:${Date.now()}@manish-sriviveka-wedding`,
      `DTSTAMP:${toICSDate(new Date())}Z`,
      `DTSTART:${toICSDate(startDate)}`,
      `DTEND:${toICSDate(endDate)}`,
      `SUMMARY:${title}`,
      `DESCRIPTION:${details}`,
      `LOCATION:${location}`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar' });
    icsLink.href = URL.createObjectURL(blob);
  }

  /* ============================================================
     6. SCROLL PROGRESS + BACK TO TOP
     ============================================================ */
  const scrollProgress = document.getElementById('scroll-progress');
  const backToTop = document.getElementById('backToTop');

  function updateScrollUI(){
    const doc = document.documentElement;
    const scrollTop = window.scrollY || doc.scrollTop;
    const maxScroll = doc.scrollHeight - doc.clientHeight;
    const pct = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;
    if (scrollProgress) scrollProgress.style.width = pct + '%';
    if (backToTop) backToTop.classList.toggle('visible', scrollTop > window.innerHeight * 0.8);
  }

  if (backToTop){
    backToTop.hidden = false; // visibility from here on is controlled by the .visible class (opacity/transform)
    backToTop.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.addEventListener('scroll', updateScrollUI, { passive: true });
  updateScrollUI();

  /* ============================================================
     7. 3D TILT ON DETAIL CARDS (desktop only)
     ============================================================ */
  if (window.matchMedia('(pointer: fine)').matches){
    document.querySelectorAll('.detail-card').forEach(card => {
      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const relX = (e.clientX - rect.left) / rect.width - 0.5;
        const relY = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform = `translateY(-6px) rotateX(${(-relY * 10).toFixed(1)}deg) rotateY(${(relX * 10).toFixed(1)}deg)`;
      });
      card.addEventListener('mouseleave', () => {
        card.style.transform = '';
      });
    });
  }

  /* ============================================================
     8. BLOOM BURST ON CTA BUTTON CLICKS
     ============================================================ */
  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      spawnBurst(e.clientX, e.clientY);
    });
  });

})();
