export function HomePage() {
  return (
    <main className="min-h-screen bg-[#030712] text-white">
      <header className="border-b border-white/10 bg-[#030712]/90">
        <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
          <div className="text-xl font-black">
            myseason<span className="text-[#f6d7b0]">.pro</span>
          </div>

          <div className="hidden gap-8 text-sm font-semibold text-slate-300 md:flex">
            <a href="#">Explore</a>
            <a className="text-[#f6d7b0]" href="#">My Calendar</a>
            <a href="#">Community</a>
            <a href="#">+ Add Race</a>
          </div>

          <button className="rounded-xl bg-[#f6d7b0] px-5 py-3 text-sm font-bold text-black">
            Sign in
          </button>
        </nav>
      </header>

      <section className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
        <p className="mb-6 rounded-full border border-[#f6d7b0]/30 px-4 py-2 text-sm text-[#f6d7b0]">
          10,000+ races across 44 European countries
        </p>
        
        <h1 className="max-w-5xl text-5xl font-black leading-tight md:text-7xl">
        <span className="block text-white">Plan your season.</span>
        <span className="block text-[#f6d7b0]">Find your next race.</span>
      </h1>

        <p className="mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
          Discover running, triathlon, cycling, and HYROX events across Europe.
        </p>

        <input
          className="mt-10 w-full max-w-3xl rounded-2xl border border-white/10 bg-[#0b1220] px-6 py-5 text-white outline-none placeholder:text-slate-500"
          placeholder="Search races, cities, countries..."
        />

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          {["Running", "Triathlon", "Cycling", "HYROX"].map((sport) => (
            <button
              key={sport}
              className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white"
            >
              {sport}
            </button>
          ))}
        </div>
      </section>
    </main>
  )
}