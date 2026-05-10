/** Shared vertical rhythm for primary home race strips */
export const HOME_SECTION_PY = "py-10 md:py-20"

/** Content column inside home sections (matches header/footer gutters) */
export const HOME_SECTION_INNER =
  "relative z-10 mx-auto w-full min-w-0 max-w-7xl px-4 sm:px-6 lg:px-8"

/** Title row + optional actions — consistent margins under eyebrow */
export const HOME_SECTION_HEADER_ROW =
  "mb-5 flex min-w-0 flex-col gap-3 md:mb-8 md:flex-row md:items-end md:justify-between md:gap-4"

/** Snap carousel: edge bleed on small screens, flush inside section padding on md+ */
export const HOME_RACE_CAROUSEL_STRIP =
  "-mx-4 flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain scroll-smooth px-4 pb-4 [-ms-overflow-style:none] [scrollbar-width:none] scrollbar-hide touch-pan-x md:mx-0 md:gap-5 md:px-0"

/** “View all” text-style links in section headers */
export const HOME_VIEW_ALL_LINK =
  "flex shrink-0 items-center gap-2 px-3 py-1.5 text-xs font-semibold text-primary transition-colors hover:text-primary/85 md:px-4 md:py-2 md:text-sm"

/** Pill-style View all (local races CTA) */
export const HOME_VIEW_ALL_PILL =
  "inline-flex shrink-0 items-center justify-center gap-2 self-start whitespace-nowrap rounded-full border border-primary/25 bg-primary/[0.07] px-4 py-2 text-sm font-semibold text-primary shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-sm transition hover:border-primary/40 hover:bg-primary/[0.11] md:mt-0"

/** Standard card slide width in horizontal lists */
export const HOME_CARD_SLIDE =
  "w-[calc((100vw-2rem)*0.91)] max-w-[320px] shrink-0 snap-start md:w-auto md:max-w-none"

/** Featured / wider hero cards */
export const HOME_CARD_SLIDE_WIDE =
  "w-[calc((100vw-2rem)*0.91)] max-w-[360px] shrink-0 snap-start md:w-auto md:max-w-none"
