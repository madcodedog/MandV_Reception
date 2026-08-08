/*
 * Original ambient music — synthesized entirely in the browser with the
 * Web Audio API. No audio files, no samples, no copyrighted material:
 * every tone here is generated from scratch. A warm pad following a
 * gentle four-chord progression, with a soft music-box-style melody
 * arpeggiating on top.
 */
(function(){
  "use strict";

  // C — Am — F — G, each chord as [bass, ...arpeggio notes]
  const PROGRESSION = [
    { bass: 130.81, arp: [261.63, 329.63, 392.00, 493.88] }, // Cmaj7
    { bass: 220.00, arp: [220.00, 261.63, 329.63, 392.00] }, // Am7
    { bass: 174.61, arp: [174.61, 220.00, 261.63, 329.63] }, // Fmaj7
    { bass: 196.00, arp: [196.00, 246.94, 293.66, 440.00] }, // G(add9)
  ];
  const CHORD_SECONDS = 6.5;

  let audioCtx = null;
  let masterGain = null;
  let reverbNode = null;
  let dryGain = null;
  let padOsc = null;
  let padGain = null;
  let running = false;
  let melodyTimer = null;
  let chordTimer = null;
  let chordIndex = 0;
  let arpStep = 0;

  // A short, smoothed reverb (filtered decaying noise) — gentle room tone
  // rather than a cavernous, hissy tail.
  function makeImpulseResponse(ctx, seconds, decay){
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++){
      const data = impulse.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < length; i++){
        const raw = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
        // simple one-pole smoothing to soften the noise into something warmer
        prev = prev * 0.7 + raw * 0.3;
        data[i] = prev;
      }
    }
    return impulse;
  }

  function ensureContext(){
    if (audioCtx) return;
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0;
    masterGain.connect(audioCtx.destination);

    reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = makeImpulseResponse(audioCtx, 1.4, 3.2);
    const reverbSend = audioCtx.createGain();
    reverbSend.gain.value = 0.22;
    reverbNode.connect(reverbSend);
    reverbSend.connect(masterGain);

    dryGain = audioCtx.createGain();
    dryGain.gain.value = 0.55;
    dryGain.connect(masterGain);
  }

  function startPad(){
    const now = audioCtx.currentTime;

    padOsc = [audioCtx.createOscillator(), audioCtx.createOscillator()];
    padGain = audioCtx.createGain();
    padGain.gain.value = 0.09;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 1000;

    padOsc[0].type = 'sine';
    padOsc[1].type = 'sine';
    padOsc[0].frequency.value = PROGRESSION[0].bass;
    padOsc[1].frequency.value = PROGRESSION[0].bass * 1.5; // a fifth above, for warmth
    padOsc[1].detune.value = 4;

    padOsc.forEach(o => { o.connect(filter); o.start(now); });
    filter.connect(padGain);
    padGain.connect(reverbNode);
    padGain.connect(dryGain);
  }

  function stopPad(){
    if (padOsc) padOsc.forEach(o => { try { o.stop(); } catch(e){} });
    padOsc = null;
  }

  function advanceChord(){
    if (!running) return;
    chordIndex = (chordIndex + 1) % PROGRESSION.length;
    const chord = PROGRESSION[chordIndex];
    const now = audioCtx.currentTime;
    if (padOsc){
      padOsc[0].frequency.setTargetAtTime(chord.bass, now, 1.2);
      padOsc[1].frequency.setTargetAtTime(chord.bass * 1.5, now, 1.2);
    }
    chordTimer = setTimeout(advanceChord, CHORD_SECONDS * 1000);
  }

  function playNote(freq, startGain, releaseSeconds, pan){
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'triangle';
    osc.frequency.value = freq;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(startGain, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + releaseSeconds);

    const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    osc.connect(gain);
    if (panner){
      panner.pan.value = pan;
      gain.connect(panner);
      panner.connect(reverbNode);
      panner.connect(dryGain);
    } else {
      gain.connect(reverbNode);
      gain.connect(dryGain);
    }

    osc.start(now);
    osc.stop(now + releaseSeconds + 0.1);
  }

  function playMelody(){
    if (!running) return;
    const chord = PROGRESSION[chordIndex];
    const note = chord.arp[arpStep % chord.arp.length];
    const octaveUp = arpStep % 8 === 3; // occasional gentle sparkle
    playNote(note, 0.11, 1.7, (arpStep % chord.arp.length) / chord.arp.length * 1.2 - 0.6);
    if (octaveUp) playNote(note * 2, 0.04, 1.1, 0.3);
    arpStep++;

    const humanize = (Math.random() * 90 - 45);
    melodyTimer = setTimeout(playMelody, 480 + humanize);
  }

  function start(){
    ensureContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    running = true;
    chordIndex = 0;
    arpStep = 0;
    startPad();
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0.6, now + 1.5);
    chordTimer = setTimeout(advanceChord, CHORD_SECONDS * 1000);
    playMelody();
  }

  function stop(){
    running = false;
    if (melodyTimer) clearTimeout(melodyTimer);
    if (chordTimer) clearTimeout(chordTimer);
    if (audioCtx && masterGain){
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0, now + 1);
    }
    setTimeout(stopPad, 1100);
  }

  window.GardenAmbience = { start, stop };
})();
