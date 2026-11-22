// Procedural sound effects with WebAudio — no audio files needed.
// Every effect is a short oscillator envelope; all calls are guarded so a
// browser without audio never breaks the game.

export class SoundBank {
  constructor() {
    this.ctx = null;
    this.enabled = true;
  }

  ensure() {
    if (this.ctx) return;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (AC) this.ctx = new AC();
    } catch (e) {
      this.ctx = null;
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  blip(freq, dur, type, vol, when = 0) {
    if (!this.enabled) return;
    this.ensure();
    if (!this.ctx) return;
    try {
      const t0 = this.ctx.currentTime + when;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, t0);
      gain.gain.setValueAtTime(vol, t0);
      gain.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
      osc.connect(gain).connect(this.ctx.destination);
      osc.start(t0);
      osc.stop(t0 + dur + 0.02);
    } catch (e) {
      /* audio is decoration — never fatal */
    }
  }

  pickup() {
    this.blip(880, 0.12, 'sine', 0.16);
    this.blip(1320, 0.18, 'sine', 0.14, 0.09);
  }

  crack() {
    this.blip(220, 0.1, 'square', 0.08);
    this.blip(330, 0.1, 'square', 0.08, 0.08);
    this.blip(440, 0.14, 'square', 0.08, 0.16);
  }

  smoke() {
    this.blip(180, 0.35, 'sawtooth', 0.06);
  }

  spotted() {
    this.blip(620, 0.16, 'square', 0.12);
    this.blip(520, 0.2, 'square', 0.12, 0.14);
  }

  caught() {
    this.blip(160, 0.5, 'sawtooth', 0.16);
    this.blip(110, 0.6, 'sawtooth', 0.16, 0.2);
  }

  levelClear() {
    this.blip(523, 0.12, 'triangle', 0.14);
    this.blip(659, 0.12, 'triangle', 0.14, 0.1);
    this.blip(784, 0.22, 'triangle', 0.14, 0.2);
  }

  win() {
    [523, 659, 784, 1047].forEach((f, i) => this.blip(f, 0.22, 'triangle', 0.14, i * 0.13));
  }
}
