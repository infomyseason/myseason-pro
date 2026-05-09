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
      <Footer />
    </div>
  )
}
