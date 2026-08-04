"use client"

// Shared client-side settings store (localStorage-backed).
// Single source of truth for Settings page + Profile page prefs + all live UI
// wiring (poll interval, density, sensitivity, notifications). There is no
// dedicated settings table in the backend, so persistence lives in localStorage
// by design. When a real settings API/table is added, swap these helpers.

export type ViewMode = "compact" | "expanded"

export interface UserSettings {
  // Flash-crash critical threshold (%) — stored as negative (e.g. -2.0).
  criticalThreshold: number
  // Aggressive polling: poll the live feed every 10s instead of 30s.
  aggressivePolling: boolean
  // Interface density.
  viewMode: ViewMode
  // Notifications.
  emailAlerts: boolean
  soundAlerts: boolean
}

export const SETTINGS_KEY = "bitbash:settings"
export const SETTINGS_UPDATED_EVENT = "bitbash:settings-updated"

export const DEFAULT_SETTINGS: UserSettings = {
  criticalThreshold: -2.0,
  aggressivePolling: false,
  viewMode: "expanded",
  emailAlerts: true,
  soundAlerts: false,
}

// Poll interval (ms) driven by the Aggressive Polling setting.
export const POLL_DEFAULT_MS = 30_000
export const POLL_AGGRESSIVE_MS = 10_000

export function readSettings(): UserSettings {
  if (typeof window === "undefined") return DEFAULT_SETTINGS
  try {
    const raw = localStorage.getItem(SETTINGS_KEY)
    if (!raw) return DEFAULT_SETTINGS
    const parsed = JSON.parse(raw)
    // Migrate the old SettingsContent shape (interfaceView -> viewMode).
    const viewMode: ViewMode =
      parsed.viewMode ?? (parsed.interfaceView === "compact" ? "compact" : "expanded")
    return { ...DEFAULT_SETTINGS, ...parsed, viewMode }
  } catch {
    return DEFAULT_SETTINGS
  }
}

export function saveSettings(patch: Partial<UserSettings>): UserSettings {
  const next = { ...readSettings(), ...patch }
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(next))
  } catch {
    // storage unavailable — keep in-memory value
  }
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(SETTINGS_UPDATED_EVENT))
  }
  return next
}

export function pollIntervalFor(settings: UserSettings): number {
  return settings.aggressivePolling ? POLL_AGGRESSIVE_MS : POLL_DEFAULT_MS
}
