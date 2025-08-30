import * as React from "react"

const MOBILE_BREAKPOINT = 768

export function useIsMobile() {
  const [isMobile, setIsMobile] = React.useState<boolean | undefined>(undefined)

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`)
    const onChange = () => {
      setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    }
    if (typeof mql.addEventListener === "function") {
      mql.addEventListener("change", onChange)
    } else {
      // Safari < 14
      // @ts-ignore
      mql.addListener(onChange)
    }
    setIsMobile(window.innerWidth < MOBILE_BREAKPOINT)
    return () => {
      if (typeof mql.removeEventListener === "function") {
        mql.removeEventListener("change", onChange)
      } else {
        // Safari < 14
        // @ts-ignore
        mql.removeListener(onChange)
      }
    }
  }, [])

  return !!isMobile
}

export function useMedia(query: string) {
  const [matches, setMatches] = React.useState<boolean>(false)

  React.useEffect(() => {
    const media = window.matchMedia(query)
    if (media.matches !== matches) {
      setMatches(media.matches)
    }
    
    const listener = () => setMatches(media.matches)
    if (typeof media.addEventListener === "function") {
      media.addEventListener("change", listener)
    } else {
      // Safari < 14
      // @ts-ignore
      media.addListener(listener)
    }
    return () => {
      if (typeof media.removeEventListener === "function") {
        media.removeEventListener("change", listener)
      } else {
        // Safari < 14
        // @ts-ignore
        media.removeListener(listener)
      }
    }
  }, [matches, query])

  return matches
}
