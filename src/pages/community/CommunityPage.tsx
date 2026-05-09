import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"

export function CommunityPage() {
  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-24 sm:px-6">
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Community</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Placeholder — connect with other athletes and share your season here.
        </p>
      </main>

      <Footer />
    </div>
  )
}
