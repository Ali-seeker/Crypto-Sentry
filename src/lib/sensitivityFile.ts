import prisma from "./prisma"

export const DEFAULT_THRESHOLD_PCT = 2.0
const MIN_THRESHOLD_PCT = 0.05
const MAX_THRESHOLD_PCT = 5.0

export function clampThreshold(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_THRESHOLD_PCT
  return Math.min(MAX_THRESHOLD_PCT, Math.max(MIN_THRESHOLD_PCT, value))
}

export async function readSensitivity(): Promise<number> {
  try {
    const result = await prisma.$queryRaw`SELECT value FROM "SystemSetting" WHERE key = 'critical_threshold' LIMIT 1` as any[]
    if (result && result.length > 0 && result[0].value) {
      return clampThreshold(parseFloat(result[0].value))
    }
  } catch (error) {
    // console.error(error)
  }
  return DEFAULT_THRESHOLD_PCT
}

export async function writeSensitivity(threshold: number): Promise<number> {
  const value = clampThreshold(threshold)
  try {
    await prisma.$executeRaw`
      INSERT INTO "SystemSetting" (key, value)
      VALUES ('critical_threshold', ${value.toString()})
      ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
    `
  } catch (error) {
    // ignore
  }
  return value
}

// Human thread-safe-ish write for the Express engine to log which threshold it is using.
export function describeSensitivity(value: number): string {
  return value === DEFAULT_THRESHOLD_PCT
    ? `default ${value.toFixed(1)}%`
    : `runtime ${value.toFixed(2)}%`
}