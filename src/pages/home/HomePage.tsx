export function HomePage() {
  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <section className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-4 rounded-full border border-[#f6d7b0]/30 px-4 py-2 text-sm text-[#f6d7b0]">
          myseason.pro
        </p>

        <h1 className="max-w-4xl text-5xl font-black tracking-tight md:text-7xl">
          Plan your season.{" "}
          <span className="text-[#f6d7b0]">Find your next race.</span>
        </h1>

        <p className="mt-6 max-w-2xl text-lg text-slate-300 md:text-xl">
          Discover running, triathlon, cycling, and HYROX events across Europe.
        </p>
      </section>
    </main>
  )
}