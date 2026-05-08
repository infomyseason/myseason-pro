import { useEffect, useState } from "react"
import {
  CommunityRaces,
  Footer,
  LocalRaces,
  SeasonPlannerPreview,
  SportSections,
  WorldClassEvents,
} from "../../components"

type NavLink = { label: string; href: string; accent?: boolean }

const NAV_LINKS: NavLink[] = [
  { label: "Explore", href: "#" },
  { label: "My Calendar", href: "#", accent: true },
  { label: "Community", href: "#" },
  { label: "+ Add Race", href: "#" },
]

export function HomePage() {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  useEffect(() => {
    if (!mobileNavOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => {
      document.body.style.overflow = prev
    }
  }, [mobileNavOpen])

  return (
    <main className="relative isolate min-h-screen overflow-x-hidden bg-[#030712] text-white antialiased">
      <div
        className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
        aria-hidden="true"
      >
        <div className="absolute inset-0 bg-[linear-gradient(180deg,#071024_0%,#060d1c_22%,#030712_52%,#020611_100%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_110%_70%_at_50%_-18%,rgba(246,215,176,0.065),transparent_58%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_50%_42%_at_94%_12%,rgba(59,130,246,0.085),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_55%_48%_at_6%_78%,rgba(30,58,138,0.14),transparent_62%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_90%_60%_at_50%_108%,rgba(246,215,176,0.035),transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_95%_70%_at_50%_45%,transparent_52%,rgba(2,6,17,0.52)_100%)]" />
      </div>

      <div className="relative z-10">
      <header className="sticky top-0 z-50 border-b border-white/[0.10] bg-[#030712]/80 backdrop-blur-xl supports-[backdrop-filter]:bg-[#030712]/65">
        <nav className="mx-auto flex h-[60px] max-w-7xl items-center justify-between gap-3 px-3 sm:h-20 sm:gap-4 sm:px-6">
          <a href="#" className="min-w-0 shrink text-base font-black tracking-tight sm:text-xl">
            myseason<span className="text-[#f6d7b0]">.pro</span>
          </a>

          <div className="hidden gap-8 text-sm font-semibold text-slate-300 md:flex">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={
                  link.accent
                    ? "text-[#f6d7b0] transition hover:text-white/95"
                    : "transition hover:text-white"
                }
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              className="inline-flex min-h-11 min-w-[5.5rem] items-center justify-center rounded-xl bg-[#f6d7b0] px-3 py-2 text-xs font-extrabold text-[#050a18] shadow-[0_14px_36px_-22px_rgba(246,215,176,0.95)] transition hover:brightness-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d7b0]/60 sm:min-h-0 sm:min-w-0 sm:px-5 sm:py-3 sm:text-sm"
            >
              Sign in
            </button>
            <button
              type="button"
              className="inline-flex min-h-11 min-w-11 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white transition hover:bg-white/10 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#f6d7b0]/55 md:hidden"
              aria-expanded={mobileNavOpen}
              aria-label={mobileNavOpen ? "Close menu" : "Open menu"}
              onClick={() => setMobileNavOpen((o) => !o)}
            >
              {mobileNavOpen ? (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                  <path
                    d="M6 6l12 12M18 6 6 18"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="22" height="22" fill="none" aria-hidden="true">
                  <path
                    d="M5 7h14M5 12h14M5 17h14"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </nav>

        {mobileNavOpen ? (
          <div className="border-t border-white/[0.08] bg-[#030712]/95 backdrop-blur-xl md:hidden">
            <div className="mx-auto max-w-7xl px-3 py-3">
              <div className="flex flex-col rounded-2xl border border-white/10 bg-white/[0.03] p-2">
                {NAV_LINKS.map((link) => (
                  <a
                    key={link.label}
                    href={link.href}
                    className={[
                      "rounded-xl px-4 py-3 text-[15px] font-semibold transition active:scale-[0.99]",
                      link.accent ? "text-[#f6d7b0]" : "text-slate-200",
                    ].join(" ")}
                    onClick={() => setMobileNavOpen(false)}
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </header>

      <section className="relative mx-auto flex min-h-[min(72vh,760px)] w-full max-w-7xl flex-col items-center justify-center overflow-hidden px-3 py-12 text-center sm:min-h-[min(78vh,880px)] sm:px-6 sm:py-16 lg:py-24">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-[radial-gradient(900px_520px_at_50%_-10%,rgba(246,215,176,0.085),transparent_55%),radial-gradient(700px_440px_at_90%_30%,rgba(59,130,246,0.065),transparent_55%),radial-gradient(720px_460px_at_10%_55%,rgba(30,58,138,0.22),transparent_60%)] opacity-75" />
          <div className="absolute inset-0 bg-[linear-gradient(to_bottom,rgba(3,7,18,0)_0%,rgba(3,7,18,0.35)_45%,rgba(3,7,18,0.85)_100%)]" />
          <div className="absolute left-1/2 top-[18%] h-[420px] w-[620px] max-w-[92vw] -translate-x-1/2 rounded-full bg-[radial-gradient(circle_at_center,rgba(246,215,176,0.10),transparent_62%)] blur-3xl" />
        </div>

        <div className="relative z-10 flex w-full max-w-6xl flex-col items-center px-0 sm:px-4 lg:px-8">
          <p className="mb-4 inline-flex max-w-[92vw] flex-wrap items-center justify-center gap-2 rounded-full border border-[#f6d7b0]/25 bg-[#030712]/55 px-3 py-2 text-[11px] font-semibold uppercase tracking-[0.12em] text-[#f6d7b0]/95 shadow-[0_0_40px_-22px_rgba(246,215,176,0.65)] backdrop-blur-md sm:mb-6 sm:px-4 sm:text-sm sm:normal-case sm:tracking-normal">
            <span className="h-1.5 w-1.5 rounded-full bg-[#f6d7b0] shadow-[0_0_18px_rgba(246,215,176,0.65)]" />
            1000+ races across 44 European countries
          </p>

          <h1 className="max-w-[92vw] text-balance text-[clamp(1.875rem,7.2vw,4.75rem)] font-black leading-[1.03] tracking-[-0.03em] sm:max-w-5xl sm:tracking-[-0.04em]">
            <span className="relative inline-block text-white drop-shadow-[0_22px_55px_rgba(0,0,0,0.65)]">
              Plan your season.
              <span className="pointer-events-none absolute -inset-x-8 -inset-y-6 -z-10 rounded-[999px] bg-[radial-gradient(circle_at_50%_40%,rgba(246,215,176,0.09),transparent_62%)] blur-2xl sm:-inset-x-12" />
            </span>
            <span className="mt-2 block bg-[linear-gradient(180deg,#f8e6cc_0%,#f6d7b0_42%,#d9bc94_100%)] bg-clip-text text-transparent drop-shadow-[0_18px_48px_rgba(246,215,176,0.22)]">
              Find your next race.
            </span>
          </h1>

          <p className="mt-4 max-w-[34rem] text-pretty text-[13px] leading-relaxed text-slate-400 sm:mt-6 sm:text-base md:max-w-3xl md:text-lg">
            Discover running, triathlon, cycling, and HYROX events across Europe.
          </p>

          <div className="group/input relative mt-8 w-full max-w-3xl sm:mt-12">
            <div className="pointer-events-none absolute -inset-1 rounded-[18px] bg-[linear-gradient(120deg,rgba(246,215,176,0.35),rgba(255,255,255,0.08),rgba(59,130,246,0.22))] opacity-60 blur-xl transition duration-500 group-focus-within/input:opacity-100 group-focus-within/input:blur-2xl" />
            <div className="relative flex min-h-[52px] items-center gap-3 rounded-2xl border border-white/[0.10] bg-[#050b18]/80 px-3.5 py-2.5 shadow-[0_24px_80px_-50px_rgba(0,0,0,0.95)] ring-1 ring-white/[0.05] backdrop-blur-xl transition group-focus-within/input:border-[#f6d7b0]/28 group-focus-within/input:ring-[#f6d7b0]/18 sm:min-h-0 sm:px-5 sm:py-4">
              <svg
                viewBox="0 0 24 24"
                width="18"
                height="18"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="h-[18px] w-[18px] shrink-0 text-slate-400 transition group-focus-within/input:text-[#f6d7b0]/85 sm:h-5 sm:w-5"
                aria-hidden="true"
              >
                <path
                  d="M10.5 18a7.5 7.5 0 1 1 0-15 7.5 7.5 0 0 1 0 15Z"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <path d="M16 16.2 21 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                className="min-h-[44px] w-full bg-transparent text-[15px] font-medium text-white outline-none placeholder:text-slate-500 sm:text-base"
                placeholder="Search races, cities, countries..."
              />
              <span className="hidden shrink-0 select-none rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[11px] font-semibold text-slate-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] sm:inline">
                Press /
              </span>
            </div>
          </div>

          <div className="mt-7 flex flex-wrap justify-center gap-2 sm:mt-8 sm:gap-3">
            {["Running", "Triathlon", "Cycling", "HYROX"].map((sport) => (
              <button
                key={sport}
                type="button"
                className="min-h-11 rounded-full border border-white/[0.10] bg-white/[0.045] px-3.5 py-2 text-[13px] font-semibold text-slate-100 shadow-[inset_0_1px_0_rgba(255,255,255,0.07)] ring-1 ring-white/[0.03] backdrop-blur-sm transition hover:border-[#f6d7b0]/28 hover:bg-[#f6d7b0]/10 hover:text-white hover:shadow-[0_14px_46px_-34px_rgba(246,215,176,0.55)] active:scale-[0.98] sm:min-h-0 sm:px-5 sm:py-3 sm:text-sm"
              >
                {sport}
              </button>
            ))}
          </div>
        </div>
      </section>

      <WorldClassEvents />
      <SeasonPlannerPreview />
      <SportSections />
      <LocalRaces />
      <CommunityRaces />
      <Footer />
      </div>
    </main>
  )
}