export type NotificationSoundType =
  | "new-art"
  | "change-request"
  | "art-approved"
  | "urgent";

export interface NotificationSoundEvent {
  type: NotificationSoundType;
  notificationId: string;
  designer?: string;
}

const NOTIFICATION_SOUNDS_ENABLED_KEY = "notificationSoundsEnabled";
const PLAYED_NOTIFICATION_SOUNDS_KEY = "playedNotificationSounds";
const MAX_SAVED_NOTIFICATIONS = 500;

const defaultSoundPaths: Record<NotificationSoundType, string> = {
  "new-art": "/sounds/new-art.mp3",
  "change-request": "/sounds/change-request.mp3",
  "art-approved": "/sounds/art-approved.mp3",
  urgent: "/sounds/urgent.mp3",
};

// Futuramente, basta configurar um arquivo por designer e tipo aqui — sem alterar quem dispara os sons.
const designerSoundPaths: Partial<
  Record<string, Partial<Record<NotificationSoundType, string>>>
> = {};

let audioContext: AudioContext | undefined;

function getAudioContext() {
  if (typeof window === "undefined") return undefined;
  audioContext ??= new AudioContext();
  return audioContext;
}

function playFallbackTone(type: NotificationSoundType) {
  const context = getAudioContext();
  if (!context) return;

  const frequencies: Record<NotificationSoundType, number> = {
    "new-art": 660,
    "change-request": 440,
    "art-approved": 880,
    urgent: 740,
  };
  const oscillator = context.createOscillator();
  const gain = context.createGain();

  oscillator.frequency.value = frequencies[type];
  oscillator.type = type === "urgent" ? "square" : "sine";
  gain.gain.setValueAtTime(0.0001, context.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.09, context.currentTime + 0.02);
  gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 0.26);
  oscillator.connect(gain);
  gain.connect(context.destination);
  oscillator.start();
  oscillator.stop(context.currentTime + 0.28);
}

function normalizarDesigner(designer?: string) {
  return designer
    ?.normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function getPlayedNotificationIds(): string[] {
  if (typeof window === "undefined") return [];

  try {
    const saved = localStorage.getItem(PLAYED_NOTIFICATION_SOUNDS_KEY);
    const parsed: unknown = saved ? JSON.parse(saved) : [];
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string") : [];
  } catch {
    return [];
  }
}

function savePlayedNotificationId(notificationId: string) {
  const ids = getPlayedNotificationIds();
  if (ids.includes(notificationId)) return false;

  localStorage.setItem(
    PLAYED_NOTIFICATION_SOUNDS_KEY,
    JSON.stringify([...ids, notificationId].slice(-MAX_SAVED_NOTIFICATIONS))
  );
  return true;
}

function getSoundPath(type: NotificationSoundType, designer?: string) {
  const designerKey = normalizarDesigner(designer);
  return (designerKey && designerSoundPaths[designerKey]?.[type]) || defaultSoundPaths[type];
}

export function areNotificationSoundsEnabled() {
  if (typeof window === "undefined") return true;
  return localStorage.getItem(NOTIFICATION_SOUNDS_ENABLED_KEY) !== "false";
}

export function setNotificationSoundsEnabled(enabled: boolean) {
  if (typeof window === "undefined") return;
  localStorage.setItem(NOTIFICATION_SOUNDS_ENABLED_KEY, String(enabled));
}

export function primeNotificationSounds() {
  if (typeof window === "undefined" || !areNotificationSoundsEnabled()) return;

  void getAudioContext()?.resume().catch(() => undefined);
  const audio = new Audio(defaultSoundPaths["new-art"]);
  audio.muted = true;
  void audio.play().then(() => {
    audio.pause();
    audio.currentTime = 0;
  }).catch(() => undefined);
}

export function playNotificationSound({ type, notificationId, designer }: NotificationSoundEvent) {
  if (typeof window === "undefined" || !areNotificationSoundsEnabled()) return;
  if (!savePlayedNotificationId(notificationId)) return;

  const audio = new Audio(getSoundPath(type, designer));
  audio.preload = "auto";
  let fallbackPlayed = false;
  const playFallbackOnce = () => {
    if (fallbackPlayed) return;
    fallbackPlayed = true;
    playFallbackTone(type);
  };

  audio.addEventListener("error", playFallbackOnce, { once: true });
  void audio.play().catch(playFallbackOnce);
}
