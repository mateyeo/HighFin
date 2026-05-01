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
    <div className="min-h-screen flex flex-col">
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-16 bg-gradient-to-b from-emerald-50 to-slate-50">
        <div className="max-w-2xl mx-auto">
          <span className="inline-block bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full mb-4">
            Free Educational Simulator
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 leading-tight">
            Learn investing.<br />Build your future.
          </h1>
          <p className="text-lg text-slate-600 mb-8 max-w-lg mx-auto">
            HighFin helps high school students understand stocks, bonds, and funds
            through a safe, hands-on simulator — no real money involved.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/onboarding">
              <Button size="lg">Get Started Free</Button>
            </Link>
            <Link href="/onboarding?role=teacher">
              <Button size="lg" variant="secondary">I&rsquo;m a Teacher</Button>
            </Link>
          </div>
        </div>
      </section>

      <section className="py-12 px-4 bg-white">
        <div className="max-w-4xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-6">
          {[
            { title: "Risk Quiz", desc: "Discover your investor type in under 3 minutes." },
            { title: "Portfolio Builder", desc: "Practice building a diversified portfolio." },
            { title: "Run Simulations", desc: "See how markets affect your money over time." },
          ].map((f) => (
            <div
              key={f.title}
              className="text-center p-6 rounded-2xl bg-slate-50 border border-slate-100"
            >
              <h3 className="font-bold text-slate-800 mb-2">{f.title}</h3>
              <p className="text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <footer className="text-center text-xs text-slate-400 py-6 border-t border-slate-100">
        HighFin is an educational simulator. No real money is ever used or at risk.
      </footer>
    </div>
  );
}
