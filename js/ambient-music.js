/*
 * Original music — synthesized entirely in the browser with the Web
 * Audio API. No audio files, no samples, no copyrighted material:
 * every tone here is generated from scratch. A repeating romantic
 * melodic hook over a warm I-V-vi-IV pad, with a soft rhythmic pulse
 * underneath so it moves rather than drifts.
 */
(function(){
  "use strict";

  // C4 through E5
  const SCALE = [261.63, 293.66, 329.63, 349.23, 392.00, 440.00, 493.88, 523.25, 587.33, 659.25];
  // A simple rising-and-resolving 8-note hook (scale degree indices into SCALE)
  const MELODY = [0, 2, 4, 7, 5, 4, 2, 0];
  // I - V - vi - IV in C major, each as a pad bass note
  const CHORDS = [130.81, 196.00, 220.00, 174.61]; // C3, G3, A3, F3

  const NOTE_SECONDS = 0.32;   // melody tempo
  const PULSE_EVERY = 2;       // soft bass pulse every 2 melody notes

  let audioCtx = null;
  let masterGain = null;
  let reverbNode = null;
  let dryGain = null;
  let padOsc = null;
  let padGain = null;
  let running = false;
  let melodyTimer = null;
  let chordIndex = 0;
  let melodyStep = 0;

  function makeImpulseResponse(ctx, seconds, decay){
    const rate = ctx.sampleRate;
    const length = Math.floor(rate * seconds);
    const impulse = ctx.createBuffer(2, length, rate);
    for (let ch = 0; ch < 2; ch++){
      const data = impulse.getChannelData(ch);
      let prev = 0;
      for (let i = 0; i < length; i++){
        const raw = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
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

    const compressor = audioCtx.createDynamicsCompressor();
    compressor.threshold.value = -18;
    compressor.ratio.value = 3;
    compressor.attack.value = 0.01;
    compressor.release.value = 0.25;
    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);

    reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = makeImpulseResponse(audioCtx, 1.3, 3.2);
    const reverbSend = audioCtx.createGain();
    reverbSend.gain.value = 0.2;
    reverbNode.connect(reverbSend);
    reverbSend.connect(masterGain);

    dryGain = audioCtx.createGain();
    dryGain.gain.value = 0.7;
    dryGain.connect(masterGain);
  }

  // Warm unison pad: two detuned filtered saws under the melody.
  function startPad(){
    const now = audioCtx.currentTime;
    padOsc = [audioCtx.createOscillator(), audioCtx.createOscillator()];
    padGain = audioCtx.createGain();
    padGain.gain.value = 0.1;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 750;
    filter.Q.value = 0.7;

    padOsc[0].type = 'sawtooth';
    padOsc[1].type = 'sawtooth';
    padOsc[0].frequency.value = CHORDS[0];
    padOsc[1].frequency.value = CHORDS[0];
    padOsc[0].detune.value = -6;
    padOsc[1].detune.value = 6;

    padOsc.forEach(o => { o.connect(filter); o.start(now); });
    filter.connect(padGain);
    padGain.connect(reverbNode);
    padGain.connect(dryGain);
  }

  function stopPad(){
    if (padOsc) padOsc.forEach(o => { try { o.stop(); } catch(e){} });
    padOsc = null;
  }

  // A plucked, warm note: filtered sawtooth body + a soft octave-up triangle for sparkle.
  function playNote(freq, startGain, releaseSeconds, pan){
    const now = audioCtx.currentTime;

    const body = audioCtx.createOscillator();
    body.type = 'sawtooth';
    body.frequency.value = freq;
    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 2200;
    filter.Q.value = 0.5;

    const shimmer = audioCtx.createOscillator();
    shimmer.type = 'triangle';
    shimmer.frequency.value = freq * 2;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(startGain, now + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.001, now + releaseSeconds);

    const shimmerGain = audioCtx.createGain();
    shimmerGain.gain.setValueAtTime(0, now);
    shimmerGain.gain.linearRampToValueAtTime(startGain * 0.22, now + 0.015);
    shimmerGain.gain.exponentialRampToValueAtTime(0.0005, now + releaseSeconds * 0.7);

    const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;

    body.connect(filter);
    filter.connect(gain);
    shimmer.connect(shimmerGain);

    [gain, shimmerGain].forEach(g => {
      if (panner){ g.connect(panner); } else { g.connect(reverbNode); g.connect(dryGain); }
    });
    if (panner){
      panner.pan.value = pan;
      panner.connect(reverbNode);
      panner.connect(dryGain);
    }

    body.start(now);
    shimmer.start(now);
    body.stop(now + releaseSeconds + 0.1);
    shimmer.stop(now + releaseSeconds + 0.1);
  }

  // Soft low pulse on the current chord's root, for gentle rhythmic motion.
  function playPulse(freq){
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sine';
    osc.frequency.value = freq;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.18, now + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

    osc.connect(gain);
    gain.connect(dryGain);
    osc.start(now);
    osc.stop(now + 0.5);
  }

  function playMelody(){
    if (!running) return;

    if (melodyStep === 0){
      chordIndex = (chordIndex + 1) % CHORDS.length;
      const now = audioCtx.currentTime;
      if (padOsc){
        padOsc[0].frequency.setTargetAtTime(CHORDS[chordIndex], now, 0.4);
        padOsc[1].frequency.setTargetAtTime(CHORDS[chordIndex], now, 0.4);
      }
    }

    const degree = MELODY[melodyStep % MELODY.length];
    const freq = SCALE[degree];
    const pan = (melodyStep % MELODY.length) / MELODY.length * 1.2 - 0.6;
    playNote(freq, 0.16, 0.85, pan);

    if (melodyStep % PULSE_EVERY === 0){
      playPulse(CHORDS[chordIndex] / 2);
    }

    melodyStep = (melodyStep + 1) % MELODY.length;
    melodyTimer = setTimeout(playMelody, NOTE_SECONDS * 1000);
  }

  function start(){
    ensureContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    running = true;
    chordIndex = 0;
    melodyStep = 0;
    startPad();
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0.7, now + 1);
    playMelody();
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
