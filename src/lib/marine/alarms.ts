export const ALARM_THRESHOLDS = [500, 300] as const;
export type AlarmThreshold = (typeof ALARM_THRESHOLDS)[number];

const HYSTERESIS_FACTOR = 1.2;
const DANGER_SPEED_KMH = 10;

type ThresholdState = {
  /** Waiting for distance to cross back above the reset band before it can fire again. */
  armed: boolean;
  /** Distance is inside the zone but the beep hasn't actually played yet (context was suspended). */
  pendingAudio: boolean;
};

const ALL_CLEAR_ZONE_M = 300;

export class ShoreAlarms {
  private audioContext: AudioContext | null = null;
  private states: Record<AlarmThreshold, ThresholdState> = {
    500: { armed: true, pendingAudio: false },
    300: { armed: true, pendingAudio: false },
  };
  /** Tracks whether we were inside the 300 m zone, to detect the outward crossing. */
  private wasInDangerZone = false;
  private allClearPending = false;

  /** Creates the AudioContext if needed and tries to resume it. Call from a user gesture. */
  async ensureAudio(): Promise<void> {
    if (typeof window === "undefined") return;

    if (!this.audioContext) {
      const Ctx =
        window.AudioContext ||
        (window as Window & { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext;
      if (Ctx) {
        this.audioContext = new Ctx();
      }
    }

    if (this.audioContext?.state === "suspended") {
      try {
        await this.audioContext.resume();
      } catch {
        // Still locked (no user gesture yet); a later call will retry.
      }
    }
  }

  isAudioRunning(): boolean {
    return this.audioContext?.state === "running";
  }

  /** Clears armed/pending state, e.g. before starting a fresh test-mode run. */
  reset(): void {
    this.states[500] = { armed: true, pendingAudio: false };
    this.states[300] = { armed: true, pendingAudio: false };
    this.wasInDangerZone = false;
    this.allClearPending = false;
  }

  update(distanceM: number | null, speedKmh: number | null): void {
    if (distanceM == null) return;

    // Chime "c'est bon, tu peux accélérer" dès qu'on ressort de la zone des 300 m,
    // quelle que soit la vitesse (pas de marge anti-rebond : c'est un aller simple).
    const inDangerZone = distanceM <= ALL_CLEAR_ZONE_M;
    if (inDangerZone) {
      this.allClearPending = false;
    } else if (this.wasInDangerZone || this.allClearPending) {
      this.allClearPending = !this.playAllClear();
    }
    this.wasInDangerZone = inDangerZone;

    for (const threshold of ALARM_THRESHOLDS) {
      if (threshold === 300 && (speedKmh == null || speedKmh <= DANGER_SPEED_KMH)) {
        continue;
      }

      const state = this.states[threshold];
      const resetAbove = threshold * HYSTERESIS_FACTOR;
      const inZone = distanceM <= threshold;

      if (!inZone) {
        if (distanceM >= resetAbove) {
          state.armed = true;
          state.pendingAudio = false;
        }
        continue;
      }

      if (state.armed) {
        state.armed = false;
        this.vibrate(threshold);
        state.pendingAudio = !this.playBeep(threshold);
      } else if (state.pendingAudio) {
        // Retry now that the AudioContext may have been unlocked by a tap.
        state.pendingAudio = !this.playBeep(threshold);
      }
    }
  }

  private vibrate(threshold: AlarmThreshold): void {
    if (typeof navigator !== "undefined" && navigator.vibrate) {
      const pattern =
        threshold === 500 ? [100, 100, 100] : [150, 100, 150, 100, 200];
      navigator.vibrate(pattern);
    }
  }

  /** Returns true if the beep was actually scheduled (context running). */
  private playBeep(threshold: AlarmThreshold): boolean {
    const ctx = this.audioContext;
    if (!ctx) return false;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    if (ctx.state !== "running") return false;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (threshold === 500) {
      // "Bip-bip" : deux bips courts, pour un signal distinct de l'alarme 300 m.
      osc.frequency.value = 440;
      const beepDuration = 0.12;
      const gap = 0.1;
      for (let i = 0; i < 2; i += 1) {
        const t = now + i * (beepDuration + gap);
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(1, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + beepDuration);
      }
      osc.start(now);
      osc.stop(now + 2 * beepDuration + gap);
    } else {
      osc.frequency.value = 880;
      osc.type = "square";
      for (let i = 0; i < 3; i += 1) {
        const t = now + i * 0.22;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(1, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      }
      osc.start(now);
      osc.stop(now + 0.7);
    }

    return true;
  }

  /** Petit chime enjoué joué en sortant de la zone des 300 m : "c'est bon, fonce". */
  private playAllClear(): boolean {
    const ctx = this.audioContext;
    if (!ctx) return false;
    if (ctx.state === "suspended") {
      void ctx.resume();
    }
    if (ctx.state !== "running") return false;

    const now = ctx.currentTime;
    const notes = [523.25, 659.25]; // do5, mi5 : "bip-bip" ascendant et léger
    const noteDuration = 0.11;
    const gap = 0.04;

    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = freq;
      osc.type = "sine";

      const t = now + i * (noteDuration + gap);
      gain.gain.setValueAtTime(0.001, t);
      gain.gain.linearRampToValueAtTime(0.5, t + 0.012);
      gain.gain.exponentialRampToValueAtTime(0.001, t + noteDuration);
      osc.start(t);
      osc.stop(t + noteDuration + 0.02);
    });

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      navigator.vibrate([60]);
    }

    return true;
  }
}
