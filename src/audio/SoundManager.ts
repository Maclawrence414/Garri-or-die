/**
 * Web Audio API Sound Synthesizer & Voice Line Engine
 * Generates custom Afrobeat arcade percussions and comedic sound effects
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private musicPlaying: boolean = false;
  private musicInterval: number | null = null;
  private masterGain: GainNode | null = null;
  private musicGain: GainNode | null = null;

  private voiceQuips = {
    start: [
      "Oya make we soak this garri!",
      "Garri is a lifesaver o!",
      "Hunger don dey wire my body!",
      "No let even one grain fall!"
    ],
    hit: [
      "E sweet die!",
      "Opor!",
      "Sweet cassava!",
      "Oshey!",
      "Correct garri!",
      "Aje butter level!",
      "Life don come back!"
    ],
    combo: [
      "Chomp master!",
      "Odogwu eater!",
      "Double groundnut combo!",
      "Senior man!"
    ],
    miss: [
      "Chineke meee!",
      "Ah ah! My garri o!",
      "Wetin be this?!",
      "Egbami! Dis boy wan waste food!",
      "My groundnut don fall!"
    ],
    gameOver: [
      "I don cast! Hunger don win...",
      "Rest in peace to my belly...",
      "Tell my mama say garri failed me...",
      "Omo, the spoon betray me!"
    ]
  };

  constructor() {
    // AudioContext is initialized on first user interaction
  }

  private initContext() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
      this.masterGain = this.ctx.createGain();
      this.masterGain.gain.setValueAtTime(0.8, this.ctx.currentTime);
      this.masterGain.connect(this.ctx.destination);

      this.musicGain = this.ctx.createGain();
      this.musicGain.gain.setValueAtTime(0.25, this.ctx.currentTime);
      this.musicGain.connect(this.masterGain);
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMuted(muted: boolean) {
    this.isMuted = muted;
    if (this.masterGain && this.ctx) {
      this.masterGain.gain.setValueAtTime(muted ? 0 : 0.8, this.ctx.currentTime);
    }
  }

  public getIsMuted(): boolean {
    return this.isMuted;
  }

  // Play satisfying bite / chomp crunch sound
  public playChomp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    
    // Slurp / scoop low sweep
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(320, t + 0.08);
    osc.frequency.exponentialRampToValueAtTime(80, t + 0.18);

    oscGain.gain.setValueAtTime(0.3, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.2);

    // Crunch noise burst (cassava & roasted groundnut crunch)
    this.playNoiseCrunch(t + 0.05, 0.14, 0.45);
    // Double crunch
    this.playNoiseCrunch(t + 0.14, 0.12, 0.35);

    // Cheerful chime
    const bell = this.ctx.createOscillator();
    const bellGain = this.ctx.createGain();
    bell.type = 'sine';
    bell.frequency.setValueAtTime(587.33, t + 0.08); // D5
    bell.frequency.setValueAtTime(880, t + 0.16); // A5
    bellGain.gain.setValueAtTime(0.25, t + 0.08);
    bellGain.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
    bell.connect(bellGain);
    bellGain.connect(this.masterGain);
    bell.start(t + 0.08);
    bell.stop(t + 0.36);
  }

  private playNoiseCrunch(time: number, duration: number, volume: number) {
    if (!this.ctx || !this.masterGain) return;
    const bufferSize = this.ctx.sampleRate * duration;
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const output = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = this.ctx.createBufferSource();
    whiteNoise.buffer = buffer;

    const filter = this.ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1800, time);
    filter.Q.setValueAtTime(2.5, time);

    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.01, time + duration);

    whiteNoise.connect(filter);
    filter.connect(gain);
    gain.connect(this.masterGain);

    whiteNoise.start(time);
    whiteNoise.stop(time + duration);
  }

  // Miss / Splat sound
  public playMiss() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;

    // Disappointed slide whistle downward
    const osc = this.ctx.createOscillator();
    const oscGain = this.ctx.createGain();
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(440, t);
    osc.frequency.exponentialRampToValueAtTime(110, t + 0.35);

    oscGain.gain.setValueAtTime(0.35, t);
    oscGain.gain.exponentialRampToValueAtTime(0.01, t + 0.35);

    osc.connect(oscGain);
    oscGain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.36);

    // Wet splat noise (garri hitting the table)
    this.playNoiseCrunch(t + 0.02, 0.22, 0.5);

    // Comic "bonk"
    const bonk = this.ctx.createOscillator();
    const bonkGain = this.ctx.createGain();
    bonk.type = 'sine';
    bonk.frequency.setValueAtTime(220, t + 0.1);
    bonk.frequency.exponentialRampToValueAtTime(60, t + 0.28);
    bonkGain.gain.setValueAtTime(0.4, t + 0.1);
    bonkGain.gain.exponentialRampToValueAtTime(0.01, t + 0.28);
    bonk.connect(bonkGain);
    bonkGain.connect(this.masterGain);
    bonk.start(t + 0.1);
    bonk.stop(t + 0.3);
  }

  // Strike sound (one of three misses)
  public playStrike() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(180, t);
    osc.frequency.setValueAtTime(90, t + 0.12);
    gain.gain.setValueAtTime(0.4, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.4);
  }

  // Game over collapse sound (dramatic comic tumble & crash)
  public playGameOver() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    // Sad brass chord
    [130.81, 155.56, 196.00].forEach((freq) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(freq, t);
      osc.frequency.exponentialRampToValueAtTime(freq * 0.7, t + 1.2);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 1.3);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t);
      osc.stop(t + 1.3);
    });

    // Thud / Table collapse bang
    const thud = this.ctx.createOscillator();
    const thudGain = this.ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(150, t + 0.3);
    thud.frequency.exponentialRampToValueAtTime(35, t + 0.9);
    thudGain.gain.setValueAtTime(0.6, t + 0.3);
    thudGain.gain.exponentialRampToValueAtTime(0.01, t + 1.0);
    thud.connect(thudGain);
    thudGain.connect(this.masterGain);
    thud.start(t + 0.3);
    thud.stop(t + 1.0);
  }

  // Spoon scoop sound
  public playScoop() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(260, t);
    osc.frequency.exponentialRampToValueAtTime(420, t + 0.12);
    gain.gain.setValueAtTime(0.2, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
    osc.connect(gain);
    gain.connect(this.masterGain);
    osc.start(t);
    osc.stop(t + 0.16);
  }

  // Level Up fan-fare
  public playLevelUp() {
    if (this.isMuted) return;
    this.initContext();
    if (!this.ctx || !this.masterGain) return;

    const notes = [261.63, 329.63, 392.00, 523.25]; // C E G C
    const t = this.ctx.currentTime;
    notes.forEach((freq, idx) => {
      if (!this.ctx || !this.masterGain) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, t + idx * 0.08);
      gain.gain.setValueAtTime(0.25, t + idx * 0.08);
      gain.gain.exponentialRampToValueAtTime(0.01, t + idx * 0.08 + 0.25);
      osc.connect(gain);
      gain.connect(this.masterGain);
      osc.start(t + idx * 0.08);
      osc.stop(t + idx * 0.08 + 0.26);
    });
  }

  // Afrobeat background percussion groove
  public startAfrobeatMusic() {
    if (this.musicPlaying) return;
    this.initContext();
    this.musicPlaying = true;

    let step = 0;
    const bpm = 112;
    const stepTime = (60 / bpm) / 4; // 16th notes

    this.musicInterval = window.setInterval(() => {
      if (!this.musicPlaying || this.isMuted || !this.ctx || !this.musicGain) return;
      const t = this.ctx.currentTime;

      // Kick on 1 and 3 (steps 0, 8)
      if (step === 0 || step === 8) {
        const kick = this.ctx.createOscillator();
        const kickGain = this.ctx.createGain();
        kick.type = 'sine';
        kick.frequency.setValueAtTime(120, t);
        kick.frequency.exponentialRampToValueAtTime(45, t + 0.12);
        kickGain.gain.setValueAtTime(0.4, t);
        kickGain.gain.exponentialRampToValueAtTime(0.01, t + 0.15);
        kick.connect(kickGain);
        kickGain.connect(this.musicGain);
        kick.start(t);
        kick.stop(t + 0.16);
      }

      // Afrobeat Shekere / Shaker on offbeats
      if (step % 2 === 1) {
        this.playShaker(t, 0.08, 0.08);
      }

      // Rimshot / Woodblock on syncopated Afrobeat pattern (steps 4, 10, 14)
      if (step === 4 || step === 10 || step === 14) {
        const rim = this.ctx.createOscillator();
        const rimGain = this.ctx.createGain();
        rim.type = 'triangle';
        rim.frequency.setValueAtTime(800, t);
        rimGain.gain.setValueAtTime(0.2, t);
        rimGain.gain.exponentialRampToValueAtTime(0.01, t + 0.06);
        rim.connect(rimGain);
        rimGain.connect(this.musicGain);
        rim.start(t);
        rim.stop(t + 0.07);
      }

      // Funky bass note on steps 0, 6, 10, 12
      if (step === 0 || step === 6 || step === 10 || step === 12) {
        const bass = this.ctx.createOscillator();
        const bassGain = this.ctx.createGain();
        bass.type = 'sawtooth';
        const freqs = [73.42, 82.41, 65.41, 73.42]; // D2, E2, C2, D2
        const f = freqs[Math.floor(step / 4) % freqs.length];
        bass.frequency.setValueAtTime(f, t);
        bassGain.gain.setValueAtTime(0.18, t);
        bassGain.gain.exponentialRampToValueAtTime(0.01, t + 0.18);
        bass.connect(bassGain);
        bassGain.connect(this.musicGain);
        bass.start(t);
        bass.stop(t + 0.2);
      }

      step = (step + 1) % 16;
    }, stepTime * 1000);
  }

  private playShaker(time: number, duration: number, volume: number) {
    if (!this.ctx || !this.musicGain) return;
    const bufferSize = Math.floor(this.ctx.sampleRate * duration);
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    const filter = this.ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.setValueAtTime(4500, time);
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(volume, time);
    gain.gain.exponentialRampToValueAtTime(0.001, time + duration);
    noise.connect(filter);
    filter.connect(gain);
    gain.connect(this.musicGain);
    noise.start(time);
    noise.stop(time + duration);
  }

  public stopAfrobeatMusic() {
    this.musicPlaying = false;
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
  }

  public getRandomQuip(type: keyof typeof this.voiceQuips): string {
    const list = this.voiceQuips[type];
    return list[Math.floor(Math.random() * list.length)];
  }

  // Speak Pidgin voice line with Web Speech API if supported
  public speak(text: string) {
    if (this.isMuted) return;
    if ('speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 1.15;
        utterance.pitch = 1.1;
        // Try to pick an expressive english voice
        const voices = window.speechSynthesis.getVoices();
        const ngVoice = voices.find(v => v.lang.includes('en-NG') || v.lang.includes('en-ZA') || v.lang.includes('en-GB'));
        if (ngVoice) {
          utterance.voice = ngVoice;
        }
        window.speechSynthesis.speak(utterance);
      } catch {
        // Fallback silently if speech synthesis is blocked
      }
    }
  }
}

export const soundManager = new SoundManager();
