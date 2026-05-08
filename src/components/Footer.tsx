const PLATFORM_LINKS = [
  { label: "Explore", href: "#" },
  { label: "My Calendar", href: "#" },
  { label: "Community", href: "#" },
  { label: "Add Race", href: "#" },
] as const

const SPORT_LINKS = ["Running", "Triathlon", "Cycling", "HYROX"] as const

export function Footer() {
  return (
    <footer className="border-t border-white/[0.10] bg-transparent shadow-[inset_0_1px_0_rgba(255,255,255,0.034)]">
      <div className="mx-auto max-w-7xl px-3 py-12 sm:px-6 sm:py-20">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <div className="text-xl font-black tracking-tight text-white">
              myseason<span className="text-[#f6d7b0]">.pro</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
              Plan your season, discover races across Europe, and build a calendar that keeps you
              moving toward your next start line.
            </p>
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-7">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#f6d7b0]/80">
                Platform
              </div>
              <ul className="mt-4 space-y-3">
                {PLATFORM_LINKS.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-sm font-semibold text-slate-300 transition hover:text-white focus:outline-none focus-visible:text-[#f6d7b0]"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <div className="text-xs font-semibold uppercase tracking-wider text-[#f6d7b0]/80">
                Sports
              </div>
              <ul className="mt-4 space-y-3">
                {SPORT_LINKS.map((s) => (
                  <li key={s}>
                    <a
                      href="#"
                      className="text-sm font-semibold text-slate-300 transition hover:text-white focus:outline-none focus-visible:text-[#f6d7b0]"
                    >
                      {s}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/[0.10] pt-8 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} myseason.pro. All rights reserved.</p>
          <p className="text-slate-600">Made for athletes across Europe.</p>
        </div>
      </div>
    </footer>
  )
}
