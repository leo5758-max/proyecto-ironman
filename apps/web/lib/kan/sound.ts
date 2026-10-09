"use client";

import { useSyncExternalStore } from "react";

/**
 * Motor de sonido "personalidad JARVIS" del rediseño inmersivo — todos los
 * cues se sintetizan en tiempo real con osciladores (Web Audio API), sin
 * archivos de audio ni librerías nuevas (mismo criterio de "CSS/JS puro"
 * que ya rigió las animaciones del hamburguesa). La preferencia on/off usa
 * el mismo patrón pub-sub de `localStorage` que `ThemeAccentPicker.tsx`
 * (ver `lib/kan/theme.ts`) — puramente visual/local, nunca se persiste en
 * Supabase.
 */
export const KAN_SOUND_STORAGE_KEY = "kan:sound";

let listeners: Array<() => void> = [];

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getServerSnapshot(): boolean {
  return true;
}

function getClientSnapshot(): boolean {
  try {
    return window.localStorage.getItem(KAN_SOUND_STORAGE_KEY) !== "off";
  } catch {
    return true;
  }
}

/** Sonido activado por defecto ("off" explícito lo apaga) — mismo criterio opt-out que el resto de las preferencias de identidad. */
export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return getClientSnapshot();
}

export function setSoundEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(KAN_SOUND_STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Sin storage no se puede recordar la preferencia — el toggle sigue funcionando en esta sesión.
  }
  listeners.forEach((listener) => listener());
}

/** Para `SoundToggle.tsx` — reactivo entre las dos instancias del toggle (esquina de /inicio + Configuración). */
export function useSoundEnabled(): { enabled: boolean; toggle: () => void } {
  const enabled = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);
  return { enabled, toggle: () => setSoundEnabled(!enabled) };
}

// --- Motor de síntesis ---

let audioContext: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined" || typeof AudioContext === "undefined") return null;
  if (!audioContext) audioContext = new AudioContext();
  if (audioContext.state === "suspended") void audioContext.resume();
  return audioContext;
}

interface ToneSpec {
  type: OscillatorType;
  /** Hz al empezar el tono. */
  startFreq: number;
  /** Hz al terminar — si se omite, el tono se mantiene fijo (sin barrido). */
  endFreq?: number;
  /** Duración en segundos. */
  duration: number;
  /** Offset en segundos desde el inicio del cue — para encadenar/superponer tonos dentro de un mismo cue. */
  delay?: number;
  /** Volumen pico (0–1) antes del decay — cues más "grandes" (wake, display) usan valores más altos. */
  peakGain?: number;
}

// Envelope corto (attack lineal + decay exponencial) en cada tono — evita el
// "click" de arrancar/cortar una onda en amplitud != 0, mismo motivo por el
// que cualquier synth hace fade in/out en vez de un gate seco.
function playTone(ctx: AudioContext, master: GainNode, spec: ToneSpec): void {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = spec.type;

  const start = ctx.currentTime + (spec.delay ?? 0);
  const end = start + spec.duration;
  osc.frequency.setValueAtTime(spec.startFreq, start);
  if (spec.endFreq !== undefined) osc.frequency.exponentialRampToValueAtTime(Math.max(spec.endFreq, 1), end);

  const peak = spec.peakGain ?? 0.15;
  gain.gain.setValueAtTime(0.0001, start);
  gain.gain.linearRampToValueAtTime(peak, start + Math.min(0.02, spec.duration / 4));
  gain.gain.exponentialRampToValueAtTime(0.0001, end);

  osc.connect(gain);
  gain.connect(master);
  osc.start(start);
  osc.stop(end + 0.02);
}

// Punto único de mute: si el sonido está apagado no se crea ni un nodo —
// no solo se "silencia", directamente no hay costo de audio.
function playCue(specs: ToneSpec[]): void {
  if (!isSoundEnabled()) return;
  const ctx = getAudioContext();
  if (!ctx) return;
  const master = ctx.createGain();
  master.connect(ctx.destination);
  specs.forEach((spec) => playTone(ctx, master, spec));
}

/** Abrir el menú hamburguesa — barrido ascendente ("whoosh"). */
export function playMenuOpen(): void {
  playCue([{ type: "sine", startFreq: 320, endFreq: 880, duration: 0.22, peakGain: 0.14 }]);
}

/** Cerrar el menú hamburguesa — barrido descendente. */
export function playMenuClose(): void {
  playCue([{ type: "sine", startFreq: 780, endFreq: 260, duration: 0.2, peakGain: 0.12 }]);
}

/** Tocar un ícono del arco — clic corto y seco. */
export function playSectionSelect(): void {
  playCue([{ type: "square", startFreq: 900, endFreq: 900, duration: 0.045, peakGain: 0.1 }]);
}

/** Se monta un `SectionOverlay` — chirrido de dos tonos ascendentes. */
export function playSectionOpen(): void {
  playCue([
    { type: "triangle", startFreq: 500, endFreq: 1100, duration: 0.16, peakGain: 0.13 },
    { type: "triangle", startFreq: 1100, endFreq: 1600, duration: 0.12, delay: 0.1, peakGain: 0.08 },
  ]);
}

/** Se cierra un `SectionOverlay` — un tono descendente. */
export function playSectionClose(): void {
  playCue([{ type: "triangle", startFreq: 900, endFreq: 380, duration: 0.16, peakGain: 0.12 }]);
}

/** `JARVISDisplay` pasa de "transition" a "active" — el cue más grande, tipo "power-up". */
export function playDisplayActivate(): void {
  playCue([
    { type: "sawtooth", startFreq: 110, endFreq: 660, duration: 0.5, peakGain: 0.09 },
    { type: "sine", startFreq: 220, endFreq: 1320, duration: 0.5, delay: 0.05, peakGain: 0.07 },
  ]);
}

/** El wake word ("KAN") activa el micrófono — el sonido más "JARVIS" de todos. */
export function playWake(): void {
  playCue([
    { type: "sine", startFreq: 440, endFreq: 660, duration: 0.14, peakGain: 0.16 },
    { type: "sine", startFreq: 660, endFreq: 990, duration: 0.16, delay: 0.12, peakGain: 0.14 },
  ]);
}

/** Empieza a grabar (botón de mic manual). */
export function playListenStart(): void {
  playCue([{ type: "sine", startFreq: 500, endFreq: 900, duration: 0.14, peakGain: 0.14 }]);
}

/** Termina de grabar. */
export function playListenStop(): void {
  playCue([{ type: "sine", startFreq: 900, endFreq: 500, duration: 0.14, peakGain: 0.12 }]);
}

/** Se envía un mensaje — un tick grave único, no un loop (evita cansar en respuestas largas). */
export function playThink(): void {
  playCue([{ type: "sine", startFreq: 220, endFreq: 180, duration: 0.09, peakGain: 0.1 }]);
}

/** Llega la respuesta de KAN — chime de confirmación de dos tonos. */
export function playMessageReceive(): void {
  playCue([
    { type: "sine", startFreq: 660, duration: 0.09, peakGain: 0.13 },
    { type: "sine", startFreq: 880, duration: 0.14, delay: 0.09, peakGain: 0.13 },
  ]);
}

/** Aparece un error — dos tonos graves descendentes. */
export function playError(): void {
  playCue([
    { type: "square", startFreq: 220, endFreq: 160, duration: 0.12, peakGain: 0.1 },
    { type: "square", startFreq: 180, endFreq: 120, duration: 0.16, delay: 0.14, peakGain: 0.1 },
  ]);
}
