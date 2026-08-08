/*
 * Original devotional/romantic flute theme — synthesized entirely in the
 * browser with the Web Audio API. No audio files, no samples, no
 * copyrighted material: every tone here is generated from scratch.
 *
 *  - A tanpura-style drone on Sa (tonic) and Pa (fifth)
 *  - A soulful bansuri (flute) melody in Raag Yaman — an evening raga
 *    with a yearning, romantic quality, in the spirit of a Krishna-Radha
 *    themed flute piece — phrased with varied note lengths and meend
 *    (glides) rather than a mechanical loop
 */
(function(){
  "use strict";

  // Raag Yaman: Sa Re Ga Ma# Pa Dha Ni (Sa4 = 261.63Hz)
  const SCALE = [261.63, 293.66, 329.63, 369.99, 392.00, 440.00, 493.88, 523.25, 587.33];
  const SA = SCALE[0];
  const PA = SCALE[4];

  const BEAT_SECONDS = 0.46;
  // An expressive rising-and-resolving phrase: [scale degree, length in beats]
  const PHRASE = [
    [0, 1.5], [2, 1], [3, 0.5], [4, 1.5], [5, 1], [6, 0.5],
    [7, 2], [6, 0.5], [5, 0.5], [4, 1], [2, 1], [0, 2.5],
  ];

  const DRONE_PATTERN = [PA, SA, SA, SA];
  const DRONE_STEP_SECONDS = 1.9;

  let audioCtx = null;
  let masterGain = null;
  let reverbNode = null;
  let dryGain = null;
  let noiseBuffer = null;
  let running = false;
  let melodyTimer = null;
  let droneTimer = null;
  let phraseIndex = 0;
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
    compressor.threshold.value = -20;
    compressor.ratio.value = 2.5;
    compressor.attack.value = 0.02;
    compressor.release.value = 0.3;
    masterGain.connect(compressor);
    compressor.connect(audioCtx.destination);

    reverbNode = audioCtx.createConvolver();
    reverbNode.buffer = makeImpulseResponse(audioCtx, 2.0, 2.6);
    const reverbSend = audioCtx.createGain();
    reverbSend.gain.value = 0.28;
    reverbNode.connect(reverbSend);
    reverbSend.connect(masterGain);

    dryGain = audioCtx.createGain();
    dryGain.gain.value = 0.55;
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
    filter.frequency.value = 850;
    filter.Q.value = 2.0;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.055, now + 0.06);
    gain.gain.exponentialRampToValueAtTime(0.001, now + DRONE_STEP_SECONDS * 2.2);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(reverbNode);
    gain.connect(dryGain);

    osc.start(now);
    osc.stop(now + DRONE_STEP_SECONDS * 2.3);
  }

  function playDrone(){
    if (!running) return;
    playDroneNote(DRONE_PATTERN[droneStep % DRONE_PATTERN.length]);
    droneStep++;
    droneTimer = setTimeout(playDrone, DRONE_STEP_SECONDS * 1000);
  }

  // Soulful bansuri note: sine core + soft triangle overtone, gentle
  // vibrato that grows in after onset, slow attack, a breath chiff, and
  // a meend (glide) in from the previous pitch.
  function playFluteNote(freq, beats, pan){
    const now = audioCtx.currentTime;
    const noteLength = BEAT_SECONDS * beats;
    const glideTime = Math.min(0.18, noteLength * 0.3);

    const core = audioCtx.createOscillator();
    core.type = 'sine';
    const overtone = audioCtx.createOscillator();
    overtone.type = 'triangle';

    if (lastMelodyFreq){
      core.frequency.setValueAtTime(lastMelodyFreq, now);
      core.frequency.linearRampToValueAtTime(freq, now + glideTime);
      overtone.frequency.setValueAtTime(lastMelodyFreq * 2, now);
      overtone.frequency.linearRampToValueAtTime(freq * 2, now + glideTime);
    } else {
      core.frequency.setValueAtTime(freq, now);
      overtone.frequency.setValueAtTime(freq * 2, now);
    }
    lastMelodyFreq = freq;

    const vibrato = audioCtx.createOscillator();
    vibrato.frequency.value = 5.2;
    const vibratoGain = audioCtx.createGain();
    vibratoGain.gain.setValueAtTime(0, now);
    vibratoGain.gain.linearRampToValueAtTime(freq * 0.008, now + Math.min(0.5, noteLength * 0.5));
    vibrato.connect(vibratoGain);
    vibratoGain.connect(core.frequency);
    vibratoGain.connect(overtone.frequency);

    const overtoneGain = audioCtx.createGain();
    overtoneGain.gain.value = 0.16;

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0, now);
    gain.gain.linearRampToValueAtTime(0.15, now + 0.11);
    gain.gain.setValueAtTime(0.15, now + Math.max(0.11, noteLength * 0.6));
    gain.gain.linearRampToValueAtTime(0.0001, now + noteLength);

    const breath = audioCtx.createBufferSource();
    breath.buffer = noiseBuffer;
    const breathFilter = audioCtx.createBiquadFilter();
    breathFilter.type = 'bandpass';
    breathFilter.frequency.value = freq * 2;
    breathFilter.Q.value = 1.1;
    const breathGain = audioCtx.createGain();
    breathGain.gain.setValueAtTime(0.045, now);
    breathGain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

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
    breath.stop(now + 0.16);
  }

  function playPhrase(){
    if (!running) return;
    const [degree, beats] = PHRASE[phraseIndex % PHRASE.length];
    const pan = ((phraseIndex % PHRASE.length) / PHRASE.length) * 0.8 - 0.4;
    playFluteNote(SCALE[degree], beats, pan);
    phraseIndex++;
    melodyTimer = setTimeout(playPhrase, BEAT_SECONDS * beats * 1000);
  }

  function start(){
    ensureContext();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    running = true;
    phraseIndex = 0;
    droneStep = 0;
    lastMelodyFreq = null;
    const now = audioCtx.currentTime;
    masterGain.gain.cancelScheduledValues(now);
    masterGain.gain.setValueAtTime(masterGain.gain.value, now);
    masterGain.gain.linearRampToValueAtTime(0.8, now + 1.2);
    playDrone();
    setTimeout(() => { if (running) playPhrase(); }, 500);
  }

  function stop(){
    running = false;
    if (melodyTimer) clearTimeout(melodyTimer);
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
