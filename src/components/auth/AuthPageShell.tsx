import type { ReactNode } from "react"
import { Link } from "react-router-dom"
import { Footer } from "../Footer"
import { HomeNavbar } from "../marketing/HomeNavbar"

type AuthPageShellProps = {
  title: string
  subtitle?: string
  children: ReactNode
}

export function AuthPageShell({ title, subtitle, children }: AuthPageShellProps) {
  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="relative overflow-hidden pt-24 pb-20">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-primary/7 blur-[110px]" />
          <div className="absolute bottom-0 right-0 h-[300px] w-[300px] rounded-full bg-[#a855f7]/10 blur-[95px]" />
        </div>

        <div className="relative z-10 mx-auto w-full max-w-md px-4 sm:px-6">
          <Link
            to="/"
            className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" aria-hidden="true">
              <path d="m15 18-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            Back to home
          </Link>

          <div className="rounded-3xl border border-border/45 bg-secondary/35 p-8 shadow-[inset_0_1px_0_rgba(255,255,255,0.06)] backdrop-blur-xl sm:p-10">
            <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">{title}</h1>
            {subtitle ? <p className="mt-2 text-sm text-muted-foreground">{subtitle}</p> : null}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  )
}
