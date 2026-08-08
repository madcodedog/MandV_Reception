/*
 * Original generative ambient soundscape — synthesized entirely in the
 * browser with the Web Audio API. No audio files, no samples, no
 * copyrighted material: every tone here is generated from scratch.
 * A soft drone pad plus randomized pentatonic bell tones, so it never
 * repeats the same way twice.
 */
(function(){
  "use strict";

  const PENTATONIC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
  const DRONE_CHORD = [130.81, 164.81, 196.00]; // C3, E3, G3

  let audioCtx = null;
  let masterGain = null;
  let reverbNode = null;
  let dryGain = null;
  let padNodes = [];
  let running = false;
  let melodyTimer = null;

  function makeImpulseResponse(ctx, seconds, decay){
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++){
      const data = impulse.getChannelData(ch);
      for (let i = 0; i < length; i++){
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
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
    reverbNode.buffer = makeImpulseResponse(audioCtx, 3.2, 2.5);
    reverbNode.connect(masterGain);

    dryGain = audioCtx.createGain();
    dryGain.gain.value = 0.35;
    dryGain.connect(masterGain);
  }

  function startPad(){
    const now = audioCtx.currentTime;
    DRONE_CHORD.forEach((freq, i) => {
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.value = freq;

      const lfo = audioCtx.createOscillator();
      lfo.frequency.value = 0.04 + i * 0.015;
      const lfoGain = audioCtx.createGain();
      lfoGain.gain.value = 0.02;
      lfo.connect(lfoGain);

      const gain = audioCtx.createGain();
      gain.gain.value = 0.05;
      lfoGain.connect(gain.gain);

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 900;

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(reverbNode);
      gain.connect(dryGain);

      osc.start(now);
      lfo.start(now);
      padNodes.push(osc, lfo);
    });
  }

  function stopPad(){
    padNodes.forEach(n => { try { n.stop(); } catch(e){} });
    padNodes = [];
  }

  function playBell(){
    if (!running) return;
    const freq = PENTATONIC[Math.floor(Math.random() * PENTATONIC.length)];
    const now = audioCtx.currentTime;

    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const shimmer = audioCtx.createOscillator();
    shimmer.type = 'sine';
    shimmer.frequency.value = freq * 2;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.14, now + 0.04);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 2.3);

    const shimmerGain = audioCtx.createGain();
    shimmerGain.gain.setValueAtTime(0, now);
    shimmerGain.gain.linearRampToValueAtTime(0.035, now + 0.04);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0005, now + 1.5);

    const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    if (panner) panner.pan.value = Math.random() * 1.6 - 0.8;

    osc.connect(gain);
    shimmer.connect(shimmerGain);

    [gain, shimmerGain].forEach(g => {
      if (panner){ g.connect(panner); } else { g.connect(reverbNode); g.connect(dryGain); }
    });
    if (panner){
      panner.connect(reverbNode);
      panner.connect(dryGain);
    }

    osc.start(now);
    shimmer.start(now);
    osc.stop(now + 2.4);
    shimmer.stop(now + 1.6);

    melodyTimer = setTimeout(playBell, 1800 + Math.random() * 2600);
  }

  function start(){
    ensureContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    running = true;
    startPad();
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0.5, now + 1.5);
    playBell();
  }

  function stop(){
    running = false;
    if (melodyTimer) clearTimeout(melodyTimer);
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
