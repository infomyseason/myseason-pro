const SPORTS = [
  { label: "Running", color: "#22c55e", hoverClass: "hover:text-[#22c55e]" },
  { label: "Cycling", color: "#3b82f6", hoverClass: "hover:text-[#3b82f6]" },
  { label: "Triathlon", color: "#a855f7", hoverClass: "hover:text-[#a855f7]" },
  { label: "HYROX", color: "#f97316", hoverClass: "hover:text-[#f97316]" },
] as const

const PLATFORM = ["My Calendar", "Explore Races", "Community", "Add a Race"] as const
const COMPANY = ["About Us", "Blog", "Privacy", "Terms"] as const

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-secondary/20">
      <div className="mx-auto max-w-7xl px-4 py-16 lg:px-8">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-12 lg:gap-8">
          <div className="lg:col-span-5">
            <div className="text-2xl font-black tracking-tight text-foreground">
              myseason<span className="text-primary">.pro</span>
            </div>
            <p className="mt-4 max-w-md text-sm leading-relaxed text-muted-foreground">
              Plan your season, discover races across Europe, and build a calendar that keeps you moving toward your
              next start line.
            </p>
            <div className="mt-6 flex gap-2">
              <a
                href="#"
                className="rounded-lg p-2.5 text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
                aria-label="Instagram"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <rect width="20" height="20" x="2" y="2" rx="5" stroke="currentColor" strokeWidth="2" />
                  <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="2" />
                </svg>
              </a>
              <a
                href="#"
                className="rounded-lg p-2.5 text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
                aria-label="Twitter"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path
                    d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                </svg>
              </a>
              <a
                href="#"
                className="rounded-lg p-2.5 text-muted-foreground transition-all hover:bg-secondary/80 hover:text-foreground"
                aria-label="YouTube"
              >
                <svg viewBox="0 0 24 24" width="20" height="20" fill="none" aria-hidden="true">
                  <path
                    d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17"
                    stroke="currentColor"
                    strokeWidth="2"
                  />
                  <path d="m10 15 5-3-5-3z" fill="currentColor" />
                </svg>
              </a>
            </div>
          </div>

          <div className="grid gap-10 sm:grid-cols-3 lg:col-span-7">
            <div>
              <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-foreground">Sports</h3>
              <ul className="space-y-3">
                {SPORTS.map((s) => (
                  <li key={s.label}>
                    <a
                      href="#"
                      className={`group flex items-center gap-2 text-muted-foreground transition-colors ${s.hoverClass}`}
                    >
                      <span
                        className="size-1.5 rounded-full opacity-0 transition-opacity group-hover:opacity-100"
                        style={{ backgroundColor: s.color }}
                      />
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-foreground">Platform</h3>
              <ul className="space-y-3">
                {PLATFORM.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="mb-5 text-sm font-bold uppercase tracking-wider text-foreground">Company</h3>
              <ul className="space-y-3">
                {COMPANY.map((l) => (
                  <li key={l}>
                    <a href="#" className="text-muted-foreground transition-colors hover:text-foreground">
                      {l}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border/50 pt-8 md:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} myseason.pro. Built for athletes, by athletes.
          </p>
          <div className="flex flex-wrap items-center gap-6 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <path
                  d="M20 10c0 4.993-5.539 10.193-7.399 11.799a1 1 0 0 1-1.202 0C9.539 20.193 4 14.993 4 10a8 8 0 0 1 16 0"
                  stroke="currentColor"
                  strokeWidth="2"
                />
                <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
              </svg>
              Europe
            </span>
            <a href="mailto:hello@myseason.pro" className="flex items-center gap-1.5 hover:text-foreground">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
                <path d="m22 7-8.991 5.727a2 2 0 0 1-2.009 0L2 7" stroke="currentColor" strokeWidth="2" />
                <rect x="2" y="4" width="20" height="16" rx="2" stroke="currentColor" strokeWidth="2" />
              </svg>
              hello@myseason.pro
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
