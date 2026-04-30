"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useApp } from "@/context/AppContext";

const studentLinks = [
  { href: "/dashboard", label: "Home" },
  { href: "/quiz",      label: "Quiz" },
  { href: "/goal",      label: "Goal" },
  { href: "/portfolio", label: "Portfolio" },
  { href: "/simulation",label: "Simulate" },
  { href: "/glossary",  label: "Glossary" },
];

const teacherLinks = [
  { href: "/teacher",   label: "Dashboard" },
  { href: "/glossary",  label: "Glossary" },
];

export default function Nav() {
  const { user, logout } = useApp();
  const pathname = usePathname();

  if (!user) return null;

  const links = user.role === "teacher" ? teacherLinks : studentLinks;

  return (
    <>
      {/* Desktop top nav */}
      <header className="hidden md:flex items-center justify-between px-6 py-3 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <Link href="/dashboard" className="text-xl font-bold text-emerald-700">
          HighFin
        </Link>
        <nav className="flex gap-1">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={[
                "px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                pathname.startsWith(l.href)
                  ? "bg-emerald-50 text-emerald-700"
                  : "text-slate-600 hover:bg-slate-50",
              ].join(" ")}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-500">{user.name}</span>
          <button
            onClick={logout}
            className="text-sm text-slate-500 hover:text-red-600 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Mobile top bar */}
      <header className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-slate-200 sticky top-0 z-40 shadow-sm">
        <Link href="/dashboard" className="text-lg font-bold text-emerald-700">
          HighFin
        </Link>
        <span className="text-sm text-slate-500">{user.name}</span>
      </header>

      {/* Mobile bottom nav */}
      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t border-slate-200 z-40 flex justify-around py-2 safe-area-bottom">
        {links.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={[
              "flex flex-col items-center gap-0.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors min-w-[48px] min-h-[48px] justify-center",
              pathname.startsWith(l.href)
                ? "text-emerald-700"
                : "text-slate-500",
            ].join(" ")}
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </>
  );
}
