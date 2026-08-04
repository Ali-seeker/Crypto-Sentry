"use client"

import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react"
import {
  UserSettings,
  DEFAULT_SETTINGS,
  SETTINGS_UPDATED_EVENT,
  readSettings,
  saveSettings,
} from "@/lib/clientSettings"

interface SettingsContextValue {
  settings: UserSettings
  update: (patch: Partial<UserSettings>) => void
}

const SettingsContext = createContext<SettingsContextValue>({
  settings: DEFAULT_SETTINGS,
  update: () => {},
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS)

  useEffect(() => {
    setSettings(readSettings())
    const sync = () => setSettings(readSettings())
    window.addEventListener(SETTINGS_UPDATED_EVENT, sync)
    window.addEventListener("storage", sync)
    return () => {
      window.removeEventListener(SETTINGS_UPDATED_EVENT, sync)
      window.removeEventListener("storage", sync)
    }
  }, [])

  // Reflect density onto <html data-density> so the global CSS applies.
  useEffect(() => {
    document.documentElement.dataset.density = settings.viewMode
  }, [settings.viewMode])

  const update = useCallback((patch: Partial<UserSettings>) => {
    saveSettings(patch)
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}
