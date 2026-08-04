"use client"

// Tiny global event bridge so the TopBar search can live-filter any grid on
// the current page (Dashboard / Watchlist / Market) without coupling components.
export const SEARCH_EVENT = "bitbash:global-search"

export function emitSearch(query: string) {
  if (typeof window === "undefined") return
  window.dispatchEvent(new CustomEvent(SEARCH_EVENT, { detail: query }))
}