export function Hero() {
  return (
    <section className="mx-auto flex min-h-[80vh] max-w-7xl flex-col items-center justify-center px-6 text-center">
      <div className="mb-6 rounded-full border border-[#f6d7b0]/30 px-4 py-2 text-sm text-[#f6d7b0]">
        10,000+ races across 44 European countries
      </div>

      <h1 className="max-w-5xl text-5xl font-black leading-tight md:text-7xl">
        <span className="block text-white">Plan your season.</span>
        <span className="block text-[#f6d7b0]">Find your next race.</span>
      </h1>

      <p className="mt-6 max-w-3xl text-lg text-slate-300 md:text-xl">
        Discover running, triathlon, cycling, and HYROX events across Europe.
      </p>
    </section>
  )
}