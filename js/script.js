(function(){
  "use strict";

  /* ============================================================
     1. FALLING PETALS
     ============================================================ */
  const petalField = document.getElementById('petal-field');

  const PETAL_COLORS = [
    ['#eaf2fb', '#a9c3e0'], // soft blue
    ['#f4f0fb', '#c7b8e0'], // lilac
    ['#ffffff', '#dce6f5'], // white
    ['#f3f7fd', '#7fa0cc'], // deeper blue
  ];

  function petalSVG(c1, c2){
    return `<svg width="18" height="18" viewBox="0 0 32 32">
      <path d="M16 2 C24 2 30 10 30 16 C30 24 24 30 16 30 C8 30 2 24 2 16 C2 10 8 2 16 2 Z"
        fill="${c2}" opacity="0.9"/>
      <path d="M16 6 C21 6 26 11 26 16 C26 21 21 26 16 26 C11 26 6 21 6 16 C6 11 11 6 16 6 Z"
        fill="${c1}"/>
    </svg>`;
  }

  function spawnPetal(){
    if (document.hidden) return;
    const petal = document.createElement('div');
    petal.className = 'petal';

    const [c1, c2] = PETAL_COLORS[Math.floor(Math.random() * PETAL_COLORS.length)];
    const size = 10 + Math.random() * 14;
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
    petal.innerHTML = petalSVG(c1, c2);

    petalField.appendChild(petal);
    setTimeout(() => petal.remove(), (duration + delay + 0.5) * 1000);
  }

  let petalTimer = setInterval(spawnPetal, 550);
  for (let i = 0; i < 6; i++) setTimeout(spawnPetal, i * 180);

  /* ============================================================
     1b. TWINKLING FAIRY LIGHTS
     ============================================================ */
  const sparkField = document.getElementById('spark-field');

  function spawnSpark(){
    if (document.hidden) return;
    const spark = document.createElement('div');
    spark.className = 'spark';

    const size = 4 + Math.random() * 7;
    const x = Math.random() * 100;
    const y = 5 + Math.random() * 90;
    const duration = 2.8 + Math.random() * 3.2;

    spark.style.left = x + 'vw';
    spark.style.top = y + 'vh';
    spark.style.width = size + 'px';
    spark.style.height = size + 'px';
    spark.style.boxShadow = `0 0 ${size * 2.5}px ${size * 0.9}px rgba(243,216,150,0.35)`;
    spark.style.animation = `twinkle ${duration}s ease-in-out forwards`;

    sparkField.appendChild(spark);
    setTimeout(() => spark.remove(), duration * 1000 + 200);
  }

  let sparkTimer = setInterval(spawnSpark, 420);
  for (let i = 0; i < 10; i++) setTimeout(spawnSpark, i * 140);

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
     3. SCROLL REVEAL
     ============================================================ */
  function initScrollReveal(){
    const items = document.querySelectorAll('.reveal');
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting){
          entry.target.classList.add('in-view');
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
  setInterval(updateCountdown, 1000);

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
