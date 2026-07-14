// Web Audio API Synthesizer for Cinematic Luxury Reveal Sound
export const playCinematicRevealSound = () => {
  try {
    // 1. Initialize AudioContext
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();

    // Ensure state is running
    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const now = ctx.currentTime;

    // ─── EFFECTS CHAIN: REVERB / DELAY ──────────────────────────────────────
    const delay = ctx.createDelay(1.5);
    const feedback = ctx.createGain();
    const delayFilter = ctx.createBiquadFilter();

    delay.delayTime.setValueAtTime(0.35, now);
    feedback.gain.setValueAtTime(0.4, now); // Sweet decay tail
    delayFilter.type = 'highpass';
    delayFilter.frequency.setValueAtTime(800, now);

    // Wire up delay feedback loop
    delay.connect(delayFilter);
    delayFilter.connect(feedback);
    feedback.connect(delay);

    // Connect to destination
    const masterGain = ctx.createGain();
    masterGain.gain.setValueAtTime(0.0, now);
    // Smooth master fade in
    masterGain.gain.linearRampToValueAtTime(0.45, now + 0.1);
    masterGain.gain.exponentialRampToValueAtTime(0.001, now + 3.8); // Fade out by end of intro
    masterGain.connect(ctx.destination);

    delay.connect(masterGain);

    // ─── SOUND 1: CINEMATIC LOW SUB-BASS RUMBLE ────────────────────────────────
    const subOsc = ctx.createOscillator();
    const subOsc2 = ctx.createOscillator();
    const subGain = ctx.createGain();
    const subFilter = ctx.createBiquadFilter();

    subOsc.type = 'sawtooth';
    subOsc.frequency.setValueAtTime(45, now); // Low F#
    subOsc.frequency.exponentialRampToValueAtTime(82.4, now + 2.2); // Glide up to E

    subOsc2.type = 'triangle';
    subOsc2.frequency.setValueAtTime(45.5, now); // Detuned for chorus thickness
    subOsc2.frequency.exponentialRampToValueAtTime(82.9, now + 2.2);

    subGain.gain.setValueAtTime(0.0, now);
    subGain.gain.linearRampToValueAtTime(0.6, now + 0.8);
    subGain.gain.exponentialRampToValueAtTime(0.001, now + 2.5); // Warm fade

    subFilter.type = 'lowpass';
    subFilter.frequency.setValueAtTime(100, now);
    subFilter.frequency.exponentialRampToValueAtTime(250, now + 1.8);

    // Connect sub bass
    subOsc.connect(subFilter);
    subOsc2.connect(subFilter);
    subFilter.connect(subGain);
    subGain.connect(masterGain);

    subOsc.start(now);
    subOsc2.start(now);
    subOsc.stop(now + 2.8);
    subOsc2.stop(now + 2.8);

    // ─── SOUND 2: GOLDEN LUXURY CHIMES & SPARKLE (MINOR 9th CHORD) ────────────
    const frequencies = [261.63, 329.63, 392.00, 493.88, 587.33]; // Cmaj9 chord notes
    const chimeFilter = ctx.createBiquadFilter();
    chimeFilter.type = 'bandpass';
    chimeFilter.frequency.setValueAtTime(1200, now);
    chimeFilter.Q.setValueAtTime(1.5, now);
    chimeFilter.connect(masterGain);

    frequencies.forEach((freq, index) => {
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();

      osc.type = index % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + 0.8 + index * 0.08); // Arpeggiated entry

      oscGain.gain.setValueAtTime(0, now);
      // Wait for arpeggio start, fade in quickly
      oscGain.gain.setValueAtTime(0, now + 0.8 + index * 0.08);
      oscGain.gain.linearRampToValueAtTime(0.2, now + 0.9 + index * 0.08);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 2.8 + index * 0.1);

      osc.connect(chimeFilter);
      chimeFilter.connect(oscGain);
      oscGain.connect(masterGain);
      // Connect chime note to delay unit for expansive space
      oscGain.connect(delay);

      osc.start(now);
      osc.stop(now + 3.8);
    });

  } catch (error) {
    console.warn('Web Audio synthesis not supported or blocked by browser context.', error);
  }
};
