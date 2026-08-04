import fs from "fs"
import path from "path"

// Shared crash/spike sensitivity store bridging the Next.js frontend and the
// Express surveillance engine (two separate processes).
// The Settings page persists the Critical Sensitivity value in localStorage for
// the UI, AND POSTs it to /api/settings/threshold which writes it here. The
// engine reads this file on every poll cycle so live threshold changes actually
// control detection — not just the client-side badge display.

const CONFIG_DIR = path.join(process.cwd(), ".config")
const FILE = path.join(CONFIG_DIR, "sensitivity.json")

export const DEFAULT_THRESHOLD_PCT = 2.0
const MIN_THRESHOLD_PCT = 0.5
const MAX_THRESHOLD_PCT = 5.0

export function clampThreshold(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_THRESHOLD_PCT
  return Math.min(MAX_THRESHOLD_PCT, Math.max(MIN_THRESHOLD_PCT, value))
}

export function readSensitivity(): number {
  try {
    const raw = fs.readFileSync(FILE, "utf-8")
    const parsed = JSON.parse(raw)
    return clampThreshold(parsed.threshold)
  } catch {
    return DEFAULT_THRESHOLD_PCT
  }
}

export function writeSensitivity(threshold: number): number {
  const value = clampThreshold(threshold)
  try {
    fs.mkdirSync(CONFIG_DIR, { recursive: true })
    fs.writeFileSync(FILE, JSON.stringify({ threshold: value }), "utf-8")
  } catch {
    // ignore write errors — fall back to default on next read
  }
  return value
}

// Human thread-safe-ish write for the Express engine to log which threshold it is using.
export function describeSensitivity(value: number): string {
  return value === DEFAULT_THRESHOLD_PCT
    ? `default ${value.toFixed(1)}%`
    : `runtime ${value.toFixed(2)}%`
}