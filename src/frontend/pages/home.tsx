"use client";

import Link from "next/link";
import { useApp } from "@/frontend/context/AppContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import Button from "@/frontend/components/ui/Button";

export default function LandingPage() {
  const { user } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace(user.role === "teacher" ? "/teacher" : "/dashboard");
    }
  }, [user, router]);

  return (
    <div className="h-screen flex flex-col overflow-hidden">

      {/* ── Hero — fills all available space between nav and footer ── */}
      <section
        className="relative flex-1 flex items-center justify-center text-center px-4 overflow-hidden"
        style={{ background: "#059669" }}
      >

        {/* ── Organic blob layer ── */}
        <div className="absolute inset-0 pointer-events-none select-none overflow-hidden">
          <svg
            className="absolute top-0 right-0 h-full"
            viewBox="0 0 700 700"
            preserveAspectRatio="xMaxYMid slice"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M460,20 C590,-10 730,60 760,200 C790,340 730,490 590,560 C450,630 280,590 200,470 C120,350 160,180 270,100 C340,50 390,40 460,20Z"
              fill="#10b981" opacity="0.72"
            />
          </svg>
          <svg
            className="absolute -bottom-24 -left-24 w-64 h-64"
            viewBox="0 0 300 300"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M160,20 C220,10 280,60 290,130 C300,200 260,270 190,285 C120,300 50,260 30,190 C10,120 50,40 120,20 C140,14 150,22 160,20Z"
              fill="#047857" opacity="0.55"
            />
          </svg>
          <div className="absolute top-10 left-[15%]  w-5 h-5 rounded-full bg-white/20" />
          <div className="absolute top-[22%] left-10   w-3 h-3 rounded-full bg-white/15" />
          <div className="absolute top-[55%] left-[8%] w-4 h-4 rounded-full bg-white/15" />
          <div className="absolute bottom-16 left-[30%]  w-3 h-3 rounded-full bg-white/20" />
          <div className="absolute bottom-24 right-[30%] w-5 h-5 rounded-full bg-white/20" />
          <div className="absolute top-[18%] right-[14%] w-4 h-4 rounded-full bg-emerald-300/40" />
          <div className="absolute top-[70%] right-[10%] w-3 h-3 rounded-full bg-white/20" />
          <div className="absolute top-6 right-[38%]    w-3 h-3 rounded-full bg-white/15" />
        </div>

        {/* ── Content ── */}
        <div className="relative z-10 max-w-xl mx-auto">
          <span className="inline-block bg-white/20 text-white text-sm font-semibold px-4 py-1.5 rounded-full mb-5 border border-white/25">
            Free Educational Simulator
          </span>

          <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4 leading-tight drop-shadow-sm">
            Learn investing.<br />Build your future.
          </h1>

          <p className="text-lg text-emerald-100 mb-8 max-w-md mx-auto leading-relaxed">
            HighFin helps high school students understand stocks, bonds, and funds
            through a safe, hands-on simulator — no real money involved.
          </p>

          {/* ── Animated feature pills ── */}
          <div className="flex flex-wrap justify-center gap-3 mb-8">
            {[
              { icon: "📊", label: "Risk Quiz" },
              { icon: "🏗️", label: "Portfolio Builder" },
              { icon: "📈", label: "Run Simulations" },
            ].map((f) => (
              <div
                key={f.label}
                className="flex items-center gap-2 bg-white/15 backdrop-blur-sm border border-white/25 text-white text-sm font-medium px-4 py-2 rounded-full"
              >
                <span className="text-base">{f.icon}</span>
                {f.label}
              </div>
            ))}
          </div>

          <Link href="/onboarding">
            <Button
              size="lg"
              className="bg-amber-400 hover:bg-amber-500 active:bg-amber-600 text-slate-900 border-0 shadow-xl font-bold rounded-full px-10"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </section>

      {/* ── Sticky footer ── */}
      <footer className="flex-shrink-0 text-center text-xs text-slate-400 py-3 bg-white border-t border-slate-100">
        HighFin is an educational simulator. No real money is ever used or at risk.
      </footer>
    </div>
  );
}
