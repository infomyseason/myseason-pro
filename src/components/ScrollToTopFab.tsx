import { useCallback, useEffect, useState } from "react"

/** Vertical scroll offset before the FAB appears (keeps top-of-page clean). */
const SHOW_AFTER_PX = 280

export function ScrollToTopFab() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY ?? document.documentElement.scrollTop ?? 0
      setVisible(y > SHOW_AFTER_PX)
    }
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const goTop = useCallback(() => {
    const reduceMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: reduceMotion ? "auto" : "smooth",
    })
  }, [])

  return (
    <button
      type="button"
      onClick={goTop}
      aria-label="Back to top"
      aria-hidden={!visible}
      tabIndex={visible ? 0 : -1}
      className={`fixed bottom-6 right-4 z-[90] flex size-12 items-center justify-center rounded-full border border-primary/40 bg-secondary/92 text-primary shadow-[0_12px_40px_rgba(0,0,0,0.45),inset_0_1px_0_rgba(255,255,255,0.05)] backdrop-blur-xl transition-[opacity,transform,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-primary/65 hover:bg-secondary hover:shadow-[0_16px_48px_rgba(232,200,150,0.12)] focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background motion-reduce:transition-none sm:bottom-8 sm:right-6 ${
        visible
          ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
          : "pointer-events-none translate-y-3 scale-90 opacity-0"
      }`}
    >
      <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
        <path
          d="M12 19V5M12 5l6 6M12 5 6 11"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  )
}
