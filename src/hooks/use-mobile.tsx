
import { useCallback, useEffect, useState } from "react"

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined"
      ? window.matchMedia("(max-width: 768px)").matches
      : false
  )

  const handleResize = useCallback(() => {
    if (typeof window !== "undefined") {
      setIsMobile(window.matchMedia("(max-width: 768px)").matches)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== "undefined") {
      const mediaQueryList = window.matchMedia("(max-width: 768px)")
      setIsMobile(mediaQueryList.matches)

      // Use the addEventListener if supported, otherwise fall back to the
      // older addListener API.
      if (mediaQueryList.addEventListener) {
        mediaQueryList.addEventListener("change", handleResize)
        return () => mediaQueryList.removeEventListener("change", handleResize)
      } else {
        // @ts-ignore - Legacy API, TypeScript doesn't have types for this
        mediaQueryList.addListener(handleResize)
        // @ts-ignore - Legacy API
        return () => mediaQueryList.removeListener(handleResize)
      }
    }
  }, [handleResize])

  return isMobile
}
