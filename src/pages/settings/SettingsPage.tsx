import { Footer } from "../../components/Footer"
import { HomeNavbar } from "../../components/marketing/HomeNavbar"

export function SettingsPage() {
  return (
    <div className="min-h-screen bg-background">
      <HomeNavbar />

      <main className="mx-auto max-w-2xl px-4 pb-20 pt-24 sm:px-6">
        <h1 className="text-2xl font-black tracking-tight text-foreground md:text-3xl">Settings</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Placeholder — notification and privacy preferences will live here.
        </p>
      </main>

      <Footer />
    </div>
  )
}
