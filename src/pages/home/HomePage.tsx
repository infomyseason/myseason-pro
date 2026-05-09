import {
  CommunityRaces,
  Footer,
  HeroSection,
  HomeNavbar,
  LocalRaces,
  SeasonPlannerPreview,
  SportDiscovery,
  SportSections,
  WorldClassEvents,
} from "../../components"
import { Link } from "react-router-dom"

export function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />
      <HeroSection />
      <SportDiscovery />
      <LocalRaces />
      <WorldClassEvents />
      <SeasonPlannerPreview />
      <SportSections />
      <CommunityRaces />
      <section className="border-t border-border/30 bg-secondary/10 px-4 py-9 md:py-14">
        <div className="mx-auto flex max-w-7xl justify-center">
          <Link
            to="/explore"
            className="inline-flex items-center justify-center rounded-full border border-primary/35 bg-primary/12 px-8 py-3 text-sm font-semibold text-primary transition hover:border-primary/55 hover:bg-primary/[0.16]"
          >
            Explore more
            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" className="ml-2" aria-hidden="true">
              <path d="m9 18 6-6-6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  )
}
