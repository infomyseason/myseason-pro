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
import { HOME_SECTION_INNER } from "../../components/Sections/homeSectionLayout"
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
      <section className="border-t border-border/30 bg-secondary/10 py-10 md:py-16">
        <div className={`${HOME_SECTION_INNER} flex justify-center`}>
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
