/**
 * RETRO AUDIO SYNTHESIZER (Web Audio API)
 * Zero external MP3/WAV dependencies. Authentic 8-bit chiptune sound generation.
 * Built for Roll & Row Retro Arcade - Viswajeet Studio
 */
class RetroAudioEngine {
  constructor() {
    this.ctx = null;
    this.enabled = localStorage.getItem('retro_sfx_enabled') !== 'false';
    this.hasUnlocked = false;
  }

  init() {
    if (this.ctx) return;
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
        if (this.ctx.state === 'suspended') {
          this.ctx.resume();
        }
        this.hasUnlocked = true;
      }
    } catch (e) {
      console.warn('AudioContext unavailable:', e);
    }
  }

  toggle() {
    this.enabled = !this.enabled;
    localStorage.setItem('retro_sfx_enabled', this.enabled ? 'true' : 'false');
    if (this.enabled) {
      this.init();
      this.playCoin();
    }
    return this.enabled;
  }

  _makeOsc(type = 'square') {
    if (!this.enabled) return null;
    this.init();
    if (!this.ctx) return null;
    if (this.ctx.state === 'suspended') this.ctx.resume();
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = type;
    osc.connect(gain);
    gain.connect(this.ctx.destination);
    return { osc, gain, t0: this.ctx.currentTime };
  }

  // Classic Arcade Insert Coin Chime
  playCoin() {
    const node = this._makeOsc('square');
    if (!node) return;
    const { osc, gain, t0 } = node;

    osc.frequency.setValueAtTime(987.77, t0); // B5
    osc.frequency.setValueAtTime(1318.51, t0 + 0.08); // E6

    gain.gain.setValueAtTime(0.18, t0);
    gain.gain.setValueAtTime(0.18, t0 + 0.08);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.35);

    osc.start(t0);
    osc.stop(t0 + 0.36);
  }

  // Laser Blip / Button Click
  playClick() {
    const node = this._makeOsc('triangle');
    if (!node) return;
    const { osc, gain, t0 } = node;

    osc.frequency.setValueAtTime(800, t0);
    osc.frequency.exponentialRampToValueAtTime(220, t0 + 0.06);

    gain.gain.setValueAtTime(0.15, t0);
    gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.06);

    osc.start(t0);
    osc.stop(t0 + 0.07);
  }

  // Soft Menu Navigation Tick
  playHover() {
    const node = this._makeOsc('sine');
    if (!node) return;
    const { osc, gain, t0 } = node;

    osc.frequency.setValueAtTime(1400, t0);
    gain.gain.setValueAtTime(0.03, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.025);

    osc.start(t0);
    osc.stop(t0 + 0.03);
  }

  // Game Start / Power-up Arpeggio
  playStart() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const notes = [330, 392, 494, 659]; // E minor chord

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const startT = t0 + idx * 0.06;
      gain.gain.setValueAtTime(0.12, startT);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.12);

      osc.start(startT);
      osc.stop(startT + 0.13);
    });
  }

  // Victory / High Score Fanfare
  playWin() {
    if (!this.enabled) return;
    this.init();
    if (!this.ctx) return;
    const t0 = this.ctx.currentTime;
    const notes = [440, 554, 659, 880]; // A major

    notes.forEach((freq, idx) => {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.value = freq;
      osc.connect(gain);
      gain.connect(this.ctx.destination);

      const startT = t0 + idx * 0.08;
      gain.gain.setValueAtTime(0.2, startT);
      gain.gain.exponentialRampToValueAtTime(0.0001, startT + 0.2);

      osc.start(startT);
      osc.stop(startT + 0.22);
    });
  }

  // Game Over Descending Tone
  playGameOver() {
    const node = this._makeOsc('sawtooth');
    if (!node) return;
    const { osc, gain, t0 } = node;

    osc.frequency.setValueAtTime(320, t0);
    osc.frequency.exponentialRampToValueAtTime(90, t0 + 0.4);

    gain.gain.setValueAtTime(0.16, t0);
    gain.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.42);

    osc.start(t0);
    osc.stop(t0 + 0.43);
  }
}

// Global Sound Instance
window.retroAudio = new RetroAudioEngine();

// First interaction auto-unlocker
['click', 'keydown', 'touchstart'].forEach(evt => {
  window.addEventListener(evt, () => window.retroAudio.init(), { once: true });
});
