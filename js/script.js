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

  // A small 5-petal blossom, radiating from center — used for both falling
  // flowers and burst particles.
  function flowerSVG(petalColor, centerColor, petalCount){
    petalCount = petalCount || 5;
    const step = 360 / petalCount;
    let petals = '';
    for (let i = 0; i < petalCount; i++){
      petals += `<path d="M20 20 C13 17 13 7 20 2 C27 7 27 17 20 20 Z" fill="${petalColor}" opacity="0.95" transform="rotate(${i * step} 20 20)"/>`;
    }
    return `<svg width="100%" height="100%" viewBox="0 0 40 40">${petals}<circle cx="20" cy="20" r="4" fill="${centerColor}"/></svg>`;
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
     2c. AMBIENT GARDEN MUSIC (generated live, see js/ambient-music.js)
     ============================================================ */
  const musicToggle = document.getElementById('musicToggle');
  if (musicToggle && window.GardenAmbience){
    let playing = false;
    musicToggle.addEventListener('click', () => {
      playing = !playing;
      if (playing){
        window.GardenAmbience.start();
        musicToggle.classList.add('playing');
        musicToggle.textContent = '♫';
        musicToggle.setAttribute('aria-label', 'Pause garden music');
      } else {
        window.GardenAmbience.stop();
        musicToggle.classList.remove('playing');
        musicToggle.textContent = '♪';
        musicToggle.setAttribute('aria-label', 'Play garden music');
      }
    });
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
  const EVENT_DATE = new Date(2026, 8, 20, 10, 30, 0); // 20 Sept 2026, 10:30 AM

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

  const startDate = new Date(2026, 8, 20, 10, 30, 0);
  const endDate = new Date(2026, 8, 20, 15, 0, 0);
  const title = "Manish & Sriviveka's Wedding Reception";
  const details = "Morning Reception 10:30 AM onwards. Lunch (Veg & Non-Veg) 12:00 PM onwards.";
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

})();
