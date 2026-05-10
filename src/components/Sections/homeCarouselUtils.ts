/** Shared horizontal snap carousel: step size from first card + CSS gap. */
export function homeCarouselStepPx(scrollEl: HTMLDivElement, fallbackStep = 336): number {
  const first = scrollEl.firstElementChild as HTMLElement | undefined
  if (!first) return fallbackStep
  const style = getComputedStyle(scrollEl)
  const gapRaw = style.columnGap || style.gap || "16px"
  const gap = Number.parseFloat(gapRaw) || 16
  return first.offsetWidth + gap
}

export function homeCarouselScrollNextLoop(el: HTMLDivElement): void {
  const step = homeCarouselStepPx(el)
  const maxScroll = el.scrollWidth - el.clientWidth
  const atEnd = el.scrollLeft >= maxScroll - 2
  if (atEnd) el.scrollTo({ left: 0, behavior: "smooth" })
  else el.scrollBy({ left: step, behavior: "smooth" })
}

export function homeCarouselScrollPrevLoop(el: HTMLDivElement): void {
  const step = homeCarouselStepPx(el)
  const maxScroll = el.scrollWidth - el.clientWidth
  const atStart = el.scrollLeft <= 2
  if (atStart) el.scrollTo({ left: maxScroll, behavior: "smooth" })
  else el.scrollBy({ left: -step, behavior: "smooth" })
}

export const HOME_CAROUSEL_ARROW_CLASS =
  "pointer-events-auto absolute top-1/2 z-20 flex size-10 -translate-y-1/2 items-center justify-center rounded-full border border-[#e8d4b0]/35 bg-[#0c1018]/65 text-[#f0e6d4] shadow-[inset_0_1px_0_rgba(255,255,255,0.12),0_8px_32px_-12px_rgba(0,0,0,0.75)] backdrop-blur-xl transition hover:border-primary/40 hover:bg-[#0c1018]/78 hover:text-primary active:scale-[0.96] sm:size-11"
