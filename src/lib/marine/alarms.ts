export const ALARM_THRESHOLDS = [500, 300, 150] as const;
export type AlarmThreshold = (typeof ALARM_THRESHOLDS)[number];

const HYSTERESIS_FACTOR = 1.2;

type ThresholdState = {
  armed: boolean;
};

export class ShoreAlarms {
  private audioContext: AudioContext | null = null;
  private states: Record<AlarmThreshold, ThresholdState> = {
    500: { armed: true },
    300: { armed: true },
    150: { armed: true },
  };

  ensureAudio(): void {
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
      void this.audioContext.resume();
    }
  }

  update(distanceM: number | null): void {
    if (distanceM == null) return;

    for (const threshold of ALARM_THRESHOLDS) {
      const state = this.states[threshold];
      const resetAbove = threshold * HYSTERESIS_FACTOR;

      if (!state.armed && distanceM >= resetAbove) {
        state.armed = true;
      }

      if (state.armed && distanceM <= threshold) {
        this.trigger(threshold);
        state.armed = false;
      }
    }
  }

  private trigger(threshold: AlarmThreshold): void {
    this.playBeep(threshold);

    if (typeof navigator !== "undefined" && navigator.vibrate) {
      const pattern =
        threshold === 500
          ? [200]
          : threshold === 300
            ? [150, 100, 150]
            : [100, 80, 100, 80, 200];
      navigator.vibrate(pattern);
    }
  }

  private playBeep(threshold: AlarmThreshold): void {
    const ctx = this.audioContext;
    if (!ctx) return;

    const now = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.connect(gain);
    gain.connect(ctx.destination);

    if (threshold === 500) {
      osc.frequency.value = 440;
      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
    } else if (threshold === 300) {
      osc.frequency.value = 660;
      for (let i = 0; i < 2; i += 1) {
        const t = now + i * 0.35;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.35, t + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);
      }
      osc.start(now);
      osc.stop(now + 0.7);
    } else {
      osc.frequency.value = 880;
      osc.type = "square";
      for (let i = 0; i < 3; i += 1) {
        const t = now + i * 0.22;
        gain.gain.setValueAtTime(0.001, t);
        gain.gain.linearRampToValueAtTime(0.4, t + 0.015);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.15);
      }
      osc.start(now);
      osc.stop(now + 0.7);
    }
  }
}
