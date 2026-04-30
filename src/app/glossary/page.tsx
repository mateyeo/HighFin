"use client";

import { useState } from "react";
import { GLOSSARY } from "@/lib/glossary";
import Card from "@/components/ui/Card";

export default function GlossaryPage() {
  const [open, setOpen] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const filtered = GLOSSARY.filter(
    (g) =>
      g.term.toLowerCase().includes(search.toLowerCase()) ||
      g.short.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-slate-900 mb-1">Glossary</h1>
      <p className="text-slate-500 text-sm mb-6">
        Plain-language definitions for every investing term you&rsquo;ll encounter in HighFin.
      </p>

      <input
        type="search"
        placeholder="Search terms…"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full mb-6 border border-slate-200 rounded-xl px-4 py-3 text-base focus:outline-none focus:ring-2 focus:ring-emerald-400"
      />

      <div className="flex flex-col gap-3">
        {filtered.map((g) => (
          <Card key={g.term} padding="sm">
            <button
              type="button"
              className="w-full text-left"
              onClick={() => setOpen(open === g.term ? null : g.term)}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-900">{g.term}</p>
                  <p className="text-sm text-slate-500">{g.short}</p>
                </div>
                <span className="text-slate-400 text-lg ml-3">
                  {open === g.term ? "−" : "+"}
                </span>
              </div>
            </button>
            {open === g.term && (
              <p className="mt-3 text-sm text-slate-700 leading-relaxed border-t border-slate-100 pt-3">
                {g.full}
              </p>
            )}
          </Card>
        ))}
        {filtered.length === 0 && (
          <p className="text-slate-400 text-center py-8">No terms found for &ldquo;{search}&rdquo;</p>
        )}
      </div>
    </div>
  );
}
