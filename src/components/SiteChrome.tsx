import Link from "next/link";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-[#071428]/95 text-white backdrop-blur-md">
      <div className="mx-auto flex h-[72px] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="group flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-[#1a66d1] to-[#0d3f8a] text-sm font-extrabold shadow-lg shadow-blue-900/40">
            RR
          </span>
          <span>
            <span className="block font-display text-[15px] font-extrabold tracking-[0.04em] sm:text-lg">
              REPAIR RISK REVIEW
            </span>
            <span className="block text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-200/80">
              Powered by My Road Armor
            </span>
          </span>
        </Link>
        {!compact && (
          <nav className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/#how-it-works"
              className="hidden rounded-lg px-3 py-2 text-sm font-medium text-blue-100/80 transition hover:bg-white/5 hover:text-white sm:inline"
            >
              How it works
            </Link>
            <Link
              href="/admin"
              className="rounded-lg border border-white/20 bg-white/5 px-3.5 py-2 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              Admin
            </Link>
          </nav>
        )}
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200/80 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-10 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div>
          <p className="font-display font-semibold text-navy-900">
            Repair Risk Review
          </p>
          <p className="mt-0.5">© {new Date().getFullYear()} · Powered by My Road Armor</p>
        </div>
        <p className="text-xs leading-relaxed text-slate-400">
          Demo environment · Relative Repair Risk Index · Version 1
        </p>
      </div>
    </footer>
  );
}
