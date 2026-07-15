import Link from "next/link";

export function SiteHeader({ compact = false }: { compact?: boolean }) {
  return (
    <header className="border-b border-white/10 bg-navy-900 text-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="group">
          <div className="text-lg font-bold tracking-wide sm:text-xl">
            REPAIR RISK REVIEW
          </div>
          <div className="text-[11px] font-medium uppercase tracking-[0.14em] text-blue-200/90">
            Powered by My Road Armor
          </div>
        </Link>
        {!compact && (
          <nav className="flex items-center gap-4 text-sm">
            <Link href="/#how-it-works" className="hidden text-blue-100/80 hover:text-white sm:inline">
              How it works
            </Link>
            <Link
              href="/admin"
              className="rounded-md border border-white/20 px-3 py-1.5 text-blue-100/90 hover:bg-white/10"
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
    <footer className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-4 py-8 text-sm text-slate-500 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <p>© {new Date().getFullYear()} Repair Risk Review · Powered by My Road Armor</p>
        <p className="text-xs">Demo environment — relative repair-risk index, Version 1</p>
      </div>
    </footer>
  );
}
