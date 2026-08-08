/*
 * Original Indian-classical-flavored music — synthesized entirely in the
 * browser with the Web Audio API. No audio files, no samples, no
 * copyrighted material: every tone here is generated from scratch.
 *
 *  - A tanpura-style drone on Sa (tonic) and Pa (fifth)
 *  - A melodic hook in Raag Bhoopali (Sa Re Ga Pa Dha — a joyful
 *    pentatonic raga traditionally used for auspicious occasions),
 *    played with a sitar-like plucked/glided tone
 *  - A tabla-style dha/tin rhythmic pulse
 */
(function(){
  "use strict";

  // Raag Bhoopali: Sa Re Ga Pa Dha, across two octaves (Sa4 = 261.63Hz)
  const SCALE = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33, 659.25, 783.99, 880.00];
  const SA = SCALE[0];
  const PA = SCALE[3];

  // A rising-and-resolving 8-note phrase (scale degree indices into SCALE)
  const MELODY = [0, 2, 3, 5, 4, 3, 2, 0];
  const MELODY_STEP_SECONDS = 0.52;

  const TABLA_PATTERN = ['dha', 'tin', 'dha', 'tin', 'tin', 'dha', 'tin', 'dha'];
  const TABLA_STEP_SECONDS = 0.21;

  const DRONE_PATTERN = [PA, SA, SA, SA];
  const DRONE_STEP_SECONDS = 1.7;

  let audioCtx = null;
  let masterGain = null;
  let reverbNode = null;
  let dryGain = null;
  let noiseBuffer = null;
  let running = false;
  let melodyTimer = null;
  let tablaTimer = null;
  let droneTimer = null;
  let melodyStep = 0;
  let tablaStep = 0;
  let droneStep = 0;
  let lastMelodyFreq = null;

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

  function makeNoiseBuffer(ctx, seconds){
    const length = Math.floor(ctx.sampleRate * seconds);
    const buffer = ctx.createBuffer(1, length, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return buffer;
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
    reverbNode.buffer = makeImpulseResponse(audioCtx, 1.6, 3.0);
    const reverbSend = audioCtx.createGain();
    reverbSend.gain.value = 0.24;
    reverbNode.connect(reverbSend);
    reverbSend.connect(masterGain);

    dryGain = audioCtx.createGain();
    dryGain.gain.value = 0.6;
    dryGain.connect(masterGain);

    noiseBuffer = makeNoiseBuffer(audioCtx, 0.2);
  }

  // Tanpura-style pluck: a resonant, slowly decaying tone on Sa or Pa.
  function playDroneNote(freq){
    const now = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    osc.type = 'sawtooth';
    osc.frequency.value = freq;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'lowpass';
    filter.frequency.value = 900;
    filter.Q.value = 2.2;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.07, now + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.001, now + DRONE_STEP_SECONDS * 2.1);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(reverbNode);
    gain.connect(dryGain);

    osc.start(now);
    osc.stop(now + DRONE_STEP_SECONDS * 2.2);
  }

  function playDrone(){
    if (!running) return;
    playDroneNote(DRONE_PATTERN[droneStep % DRONE_PATTERN.length]);
    droneStep++;
    droneTimer = setTimeout(playDrone, DRONE_STEP_SECONDS * 1000);
  }

  // Tabla-style hits: a pitched "dha" thump, a bright "tin" tick.
  function playTablaHit(type){
    const now = audioCtx.currentTime;

    if (type === 'dha'){
      const osc = audioCtx.createOscillator();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(150, now);
      osc.frequency.exponentialRampToValueAtTime(85, now + 0.09);

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

      osc.connect(gain);
      gain.connect(dryGain);
      gain.connect(reverbNode);
      osc.start(now);
      osc.stop(now + 0.25);
    } else {
      const source = audioCtx.createBufferSource();
      source.buffer = noiseBuffer;

      const filter = audioCtx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 4200;
      filter.Q.value = 1.4;

      const gain = audioCtx.createGain();
      gain.gain.setValueAtTime(0.16, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      source.connect(filter);
      filter.connect(gain);
      gain.connect(dryGain);
      source.start(now);
      source.stop(now + 0.08);
    }
  }

  function playTabla(){
    if (!running) return;
    playTablaHit(TABLA_PATTERN[tablaStep % TABLA_PATTERN.length]);
    tablaStep++;
    tablaTimer = setTimeout(playTabla, TABLA_STEP_SECONDS * 1000);
  }

  // Sitar-like plucked melody note, with a soft glide (meend) from the
  // previous pitch for an authentic ornamented feel.
  function playMelodyNote(freq, pan){
    const now = audioCtx.currentTime;
    const noteLength = MELODY_STEP_SECONDS * 1.75; // legato — notes overlap into the next

    // Breathy bansuri-style tone: sine core + a soft triangle overtone,
    // gentle vibrato, slow attack, and a touch of breath noise on entry.
    const core = audioCtx.createOscillator();
    core.type = 'sine';
    const overtone = audioCtx.createOscillator();
    overtone.type = 'triangle';

    if (lastMelodyFreq){
      [core, overtone].forEach((o, i) => {
        const target = i === 0 ? freq : freq * 2;
        const start = i === 0 ? lastMelodyFreq : lastMelodyFreq * 2;
        o.frequency.setValueAtTime(start, now);
        o.frequency.linearRampToValueAtTime(target, now + 0.14);
      });
    } else {
      core.frequency.setValueAtTime(freq, now);
      overtone.frequency.setValueAtTime(freq * 2, now);
    }
    lastMelodyFreq = freq;

    const vibrato = audioCtx.createOscillator();
    vibrato.frequency.value = 5;
    const vibratoGain = audioCtx.createGain();
    vibratoGain.gain.value = freq * 0.006;
    vibrato.connect(vibratoGain);
    vibratoGain.connect(core.frequency);
    vibratoGain.connect(overtone.frequency);

    const overtoneGain = audioCtx.createGain();
    overtoneGain.gain.value = 0.18;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.16, now + 0.09);
    gain.gain.setValueAtTime(0.16, now + noteLength * 0.55);
    gain.gain.linearRampToValueAtTime(0.0001, now + noteLength);

    // Breath chiff at note onset
    const breath = audioCtx.createBufferSource();
    breath.buffer = noiseBuffer;
    const breathFilter = audioCtx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.value = freq * 2;
    breathFilter.Q.value = 1.2;
    const breathGain = audioCtx.createGain();
    breathGain.gain.setValueAtTime(0.05, now);
    breathGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    const panner = audioCtx.createStereoPanner ? audioCtx.createStereoPanner() : null;
    core.connect(gain);
    overtone.connect(overtoneGain);
    overtoneGain.connect(gain);
    breath.connect(breathFilter);
    breathFilter.connect(breathGain);

    if (panner){
      panner.pan.value = pan;
      gain.connect(panner);
      breathGain.connect(panner);
      panner.connect(reverbNode);
      panner.connect(dryGain);
    } else {
      gain.connect(reverbNode);
      gain.connect(dryGain);
      breathGain.connect(dryGain);
    }

    core.start(now);
    overtone.start(now);
    vibrato.start(now);
    breath.start(now);
    core.stop(now + noteLength + 0.05);
    overtone.stop(now + noteLength + 0.05);
    vibrato.stop(now + noteLength + 0.05);
    breath.stop(now + 0.15);
  }

  function playMelody(){
    if (!running) return;
    const degree = MELODY[melodyStep % MELODY.length];
    const pan = (melodyStep % MELODY.length) / MELODY.length * 1.0 - 0.5;
    playMelodyNote(SCALE[degree], pan);
    melodyStep++;
    melodyTimer = setTimeout(playMelody, MELODY_STEP_SECONDS * 1000);
  }

  function start(){
    ensureContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    running = true;
    melodyStep = 0;
    tablaStep = 0;
    droneStep = 0;
    lastMelodyFreq = null;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0.75, now + 1);
    playDrone();
    setTimeout(() => { if (running) playTabla(); }, 300);
    setTimeout(() => { if (running) playMelody(); }, 600);
  }

  function stop(){
    running = false;
    if (melodyTimer) clearTimeout(melodyTimer);
    if (tablaTimer) clearTimeout(tablaTimer);
    if (droneTimer) clearTimeout(droneTimer);
    if (audioCtx && masterGain){
      const now = audioCtx.currentTime;
      masterGain.gain.cancelScheduledValues(now);
      masterGain.gain.setValueAtTime(masterGain.gain.value, now);
      masterGain.gain.linearRampToValueAtTime(0, now + 1);
    }
  }

  window.GardenAmbience = { start, stop };
})();
