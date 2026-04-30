"use client";

import { useState } from "react";

interface TooltipProps {
  term: string;
  children: React.ReactNode;
}

export default function Tooltip({ term, children }: TooltipProps) {
  const [open, setOpen] = useState(false);
  return (
    <span className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="underline decoration-dotted decoration-emerald-500 text-emerald-700 font-medium cursor-help focus:outline-none"
        aria-expanded={open}
      >
        {term}
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute z-50 left-0 top-full mt-2 w-72 bg-slate-800 text-white text-sm rounded-xl p-3 shadow-lg"
        >
          {children}
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="block mt-2 text-xs text-slate-300 underline"
          >
            Close
          </button>
        </span>
      )}
    </span>
  );
}
