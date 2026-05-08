export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030712]/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-20 max-w-7xl items-center justify-between px-6">
        <div className="text-xl font-black tracking-tight text-white">
          myseason<span className="text-[#f6d7b0]">.pro</span>
        </div>

        <div className="hidden items-center gap-8 text-sm font-semibold text-slate-300 md:flex">
          <a className="transition hover:text-white" href="#">
            Explore
          </a>

          <a
            className="rounded-full border border-[#f6d7b0]/30 bg-[#f6d7b0]/10 px-4 py-2 text-[#f6d7b0]"
            href="#"
          >
            My Calendar
          </a>

          <a className="transition hover:text-white" href="#">
            Community
          </a>

          <a className="transition hover:text-white" href="#">
            + Add Race
          </a>
        </div>

        <button className="rounded-xl bg-[#f6d7b0] px-5 py-3 text-sm font-bold text-black shadow-lg shadow-[#f6d7b0]/20">
          Sign in
        </button>
      </nav>
    </header>
  )
}