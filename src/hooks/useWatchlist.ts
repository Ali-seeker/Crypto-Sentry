"use client"

import { useState, useEffect, useRef } from "react"
import { useSession } from "next-auth/react"

export function useWatchlistAction(initialIsStarred: boolean, initialWatchlistId?: string) {
  const { data: session } = useSession()
  const [isStarred, setIsStarred] = useState(initialIsStarred)
  const [watchlistId, setWatchlistId] = useState<string | undefined>(initialWatchlistId)
  const isProcessing = useRef(false)

  useEffect(() => {
    setIsStarred(initialIsStarred)
    setWatchlistId(initialWatchlistId)
  }, [initialIsStarred, initialWatchlistId])

  const toggleStar = async (asset_id: string, asset_name: string) => {
    if (!session) {
      window.location.href = "/login"
      return
    }

    if (isProcessing.current) return
    isProcessing.current = true

    const previousStarred = isStarred
    const previousId = watchlistId

    setIsStarred(!previousStarred)

    try {
      if (!previousStarred) {
        const res = await fetch("/api/watchlist", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ asset_id, asset_name }),
        })
        if (!res.ok) throw new Error("Failed to star")
        const data = await res.json()
        setWatchlistId(data.id)
      } else {
        if (!previousId) {
          isProcessing.current = false
          return
        }
        const res = await fetch(`/api/watchlist/${previousId}`, {
          method: "DELETE",
        })
        if (!res.ok) throw new Error("Failed to unstar")
        setWatchlistId(undefined)
      }
    } catch (error) {
      console.error(error)
      setIsStarred(previousStarred)
      setWatchlistId(previousId)
      alert("Failed to update watchlist. Please try again.")
    } finally {
      isProcessing.current = false
    }
  }

  return { isStarred, toggleStar }
}
