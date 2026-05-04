"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useApp } from "@/frontend/context/AppContext";
import { fetchApi } from "@/frontend/lib/config";
import { BADGE_DEFS } from "@/frontend/lib/badges";
import type { EarnedBadge } from "@/types";

/* ─── Coin visual themes ─────────────────────────────────────────── */
const COIN_THEMES: Record<string, {
  rimLight: string; rimDark: string;
  faceLight: string; faceMid: string; faceDark: string;
  innerRing: string; dotColor: string;
  glow: string; metalLabel: string;
}> = {
  SIMULATION_COMPLETE: {
    rimLight:   "#FFF0A0", rimDark:   "#8B6508",
    faceLight:  "#FFFACC", faceMid:   "#F5C842", faceDark:  "#C48F1A",
    innerRing:  "#FFE168", dotColor:  "#9B7210",
    glow:       "rgba(245,196,66,0.80)", metalLabel: "GOLD",
  },
  FIRST_TRADE: {
    rimLight:   "#DDEEFF", rimDark:   "#2A5FA0",
    faceLight:  "#EEF8FF", faceMid:   "#80B8E8", faceDark:  "#3A70C0",
    innerRing:  "#A8D0F4", dotColor:  "#1A4070",
    glow:       "rgba(60,140,230,0.72)", metalLabel: "SILVER",
  },
  DIVERSIFIED: {
    rimLight:   "#F4D8FF", rimDark:   "#620EA8",
    faceLight:  "#FBF0FF", faceMid:   "#C880E8", faceDark:  "#8030B8",
    innerRing:  "#E0A0FA", dotColor:  "#520888",
    glow:       "rgba(170,60,230,0.72)", metalLabel: "AMETHYST",
  },
  MARKET_WATCHER: {
    rimLight:   "#FFD8B8", rimDark:   "#7A3010",
    faceLight:  "#FFE8D0", faceMid:   "#D08050", faceDark:  "#984020",
    innerRing:  "#F0A870", dotColor:  "#6A2808",
    glow:       "rgba(210,100,50,0.72)", metalLabel: "COPPER",
  },
};

const LOCKED = {
  rimLight: "#3A4050", rimDark: "#1A1E28",
  faceLight: "#4A5060", faceMid: "#2E333E", faceDark: "#1C2028",
  innerRing: "#3A404E", dotColor: "#252A34",
  glow: "transparent", metalLabel: "LOCKED",
};

/* ─── Coin SVG ───────────────────────────────────────────────────── */
function Coin({ id, icon, earned, canRedeem }: {
  id: string; icon: string; earned: boolean; canRedeem: boolean;
}) {
  const t   = earned ? (COIN_THEMES[id] ?? COIN_THEMES.SIMULATION_COMPLETE) : LOCKED;
  const gid = id.toLowerCase();

  return (
    <div className="relative flex items-center justify-center" style={{ width: 150, height: 150 }}>

      {/* Outer glow bloom */}
      {earned && (
        <div className="absolute rounded-full blur-2xl"
          style={{
            inset: 0,
            background: t.glow,
            animation: canRedeem
              ? "pulse 1.2s cubic-bezier(.4,0,.6,1) infinite"
              : "pulse 3s cubic-bezier(.4,0,.6,1) infinite",
          }}
        />
      )}

      {/* Coin SVG */}
      <svg width="150" height="150" viewBox="0 0 150 150" className="relative z-10">
        <defs>
          {/* Rim radial gradient */}
          <radialGradient id={`rim-${gid}`} cx="38%" cy="33%" r="65%">
            <stop offset="0%"   stopColor={t.rimLight} />
            <stop offset="100%" stopColor={t.rimDark}  />
          </radialGradient>
          {/* Face radial gradient */}
          <radialGradient id={`face-${gid}`} cx="36%" cy="30%" r="68%">
            <stop offset="0%"   stopColor={t.faceLight} />
            <stop offset="55%"  stopColor={t.faceMid}   />
            <stop offset="100%" stopColor={t.faceDark}  />
          </radialGradient>
          {/* Subtle dot texture */}
          <pattern id={`dots-${gid}`} x="0" y="0" width="7" height="7" patternUnits="userSpaceOnUse">
            <circle cx="3.5" cy="3.5" r="0.9" fill={t.dotColor} opacity="0.28" />
          </pattern>
          {/* Clip to face circle */}
          <clipPath id={`fclip-${gid}`}>
            <circle cx="75" cy="75" r="56" />
          </clipPath>
        </defs>

        {/* ── Drop shadow ── */}
        <circle cx="77" cy="79" r="66" fill="rgba(0,0,0,0.40)" />

        {/* ── Rim edge (thick coin side) ── */}
        <circle cx="75" cy="75" r="66" fill={`url(#rim-${gid})`} />
        {/* Rim inner bevel - slightly lighter */}
        <circle cx="75" cy="75" r="61"
          fill="none" stroke={t.rimLight} strokeWidth="3" opacity="0.35" />

        {/* ── Coin face ── */}
        <circle cx="75" cy="75" r="57" fill={`url(#face-${gid})`} />

        {/* Dot texture on face */}
        <circle cx="75" cy="75" r="57" fill={`url(#dots-${gid})`} />

        {/* Recessed inner ring (embossing detail) */}
        <circle cx="75" cy="75" r="54"
          fill="none" stroke={t.innerRing} strokeWidth="1.8" opacity="0.55" />
        <circle cx="75" cy="75" r="51"
          fill="none" stroke={t.innerRing} strokeWidth="0.7" opacity="0.30" />

        {/* ── Face specular highlight (top-left shine) ── */}
        <ellipse cx="57" cy="46" rx="24" ry="14"
          fill="white" opacity={earned ? 0.28 : 0.07}
          clipPath={`url(#fclip-${gid})`} />

        {/* ── Bottom ambient shadow on face ── */}
        <ellipse cx="75" cy="96" rx="34" ry="11"
          fill="rgba(0,0,0,0.18)"
          clipPath={`url(#fclip-${gid})`} />

        {/* ── Edge highlight (left rim glint) ── */}
        <path d="M26,52 Q18,75 26,98"
          fill="none" stroke="white"
          strokeWidth="3" opacity={earned ? 0.22 : 0.06}
          strokeLinecap="round" />

        {/* Shimmer sweep overlay when redeemable */}
        {canRedeem && (
          <ellipse cx="75" cy="75" rx="57" ry="57"
            fill="none"
            stroke="white"
            strokeWidth="28"
            opacity="0.06"
            strokeDasharray="60 300"
            style={{ animation: "spin 2.5s linear infinite", transformOrigin: "75px 75px" }}
          />
        )}
      </svg>

      {/* ── Emoji overlaid on coin face ── */}
      <div className="absolute z-20 flex items-center justify-center"
        style={{
          inset: 0,
          fontSize: earned ? 56 : 42,
          filter: earned
            ? `drop-shadow(0 2px 4px rgba(0,0,0,0.45)) drop-shadow(0 -1px 1px rgba(255,255,255,0.20))`
            : "grayscale(1) opacity(0.20)",
        }}
      >
        {earned ? icon : "🔒"}
      </div>

      {/* ── Sparkle stars for earned badges ── */}
      {earned && [
        { top: 2,  left: 18,  s: 9,  d: "0s",    dr: "2.2s"  },
        { top: 8,  right: 14, s: 7,  d: "0.7s",  dr: "2.8s"  },
        { top: 38, left: 4,   s: 6,  d: "1.2s",  dr: "3s"    },
        { top: -4, left: 65,  s: 8,  d: "0.4s",  dr: "2.4s"  },
        { top: 30, right: 2,  s: 5,  d: "1.6s",  dr: "2.6s"  },
      ].map((sp, i) => (
        <div key={i} className="absolute z-30 font-black"
          style={{
            top: sp.top,
            left: "left" in sp ? sp.left : undefined,
            right: "right" in sp ? (sp as { right: number }).right : undefined,
            fontSize: sp.s,
            color: t.rimLight,
            animation: `ping ${sp.dr} ${sp.d} cubic-bezier(0,0,.2,1) infinite`,
          }}
        >✦</div>
      ))}
    </div>
  );
}

/* ─── Metal label strip ──────────────────────────────────────────── */
function CoinLabel({ id, earned }: { id: string; earned: boolean }) {
  const t = earned ? (COIN_THEMES[id] ?? COIN_THEMES.SIMULATION_COMPLETE) : LOCKED;
  return (
    <div className="relative flex items-center justify-center mt-1" style={{ width: 110, height: 26 }}>
      <svg width="110" height="26" viewBox="0 0 110 26">
        <defs>
          <linearGradient id={`lbl-${id.toLowerCase()}`} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%"   stopColor={t.rimLight} stopOpacity="0.9" />
            <stop offset="50%"  stopColor={t.faceMid}  />
            <stop offset="100%" stopColor={t.rimDark}  />
          </linearGradient>
        </defs>
        <rect x="2" y="2" width="106" height="22" rx="11"
          fill={`url(#lbl-${id.toLowerCase()})`} />
        <rect x="2" y="2" width="106" height="22" rx="11"
          fill="none" stroke={t.rimLight} strokeWidth="1" opacity="0.4" />
        {/* Top shine on label */}
        <rect x="6" y="3" width="98" height="8" rx="4"
          fill="white" opacity="0.18" />
      </svg>
      <span className="absolute font-black uppercase tracking-widest"
        style={{
          fontSize: 9,
          letterSpacing: "0.14em",
          color: earned ? "rgba(0,0,0,0.55)" : "#4B5563",
          textShadow: earned ? "0 1px 0 rgba(255,255,255,0.35)" : "none",
        }}
      >
        {t.metalLabel}
      </span>
    </div>
  );
}

/* ─── Full badge card ────────────────────────────────────────────── */
function BadgeCard({
  id, earned, canRedeem, earnedAt, onRedeem, redeeming,
}: {
  id: string; earned: boolean; canRedeem: boolean;
  earnedAt?: string; onRedeem: (id: string) => void; redeeming: string | null;
}) {
  const def = BADGE_DEFS[id];
  if (!def) return null;

  return (
    <div className="flex flex-col items-center gap-2">
      <Coin id={id} icon={def.icon} earned={earned} canRedeem={canRedeem} />
      <CoinLabel id={id} earned={earned} />

      <div className="text-center px-1 mt-1" style={{ minHeight: 52 }}>
        <p className={`text-sm font-black ${earned ? "text-white" : "text-slate-600"}`}>
          {def.name}
        </p>
        {earned && earnedAt ? (
          <p className="text-xs text-slate-400 mt-0.5">
            {new Date(earnedAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
          </p>
        ) : !earned ? (
          <p className="text-xs text-slate-500 italic mt-0.5 leading-snug">{def.hint}</p>
        ) : null}
      </div>

      {canRedeem && (
        <button
          onClick={() => onRedeem(id)}
          disabled={redeeming === id}
          className="mt-1 px-5 py-2 text-xs font-black uppercase tracking-wider rounded-full text-slate-900 disabled:opacity-60 transition-all hover:scale-105 active:scale-95 shadow-lg"
          style={{
            background: "linear-gradient(135deg,#FFF0A0,#F5C842,#C48F1A)",
            letterSpacing: "0.1em",
          }}
        >
          {redeeming === id ? "Unlocking…" : "⚡ Unlock Level 2"}
        </button>
      )}

      {earned && !canRedeem && def.unlocksLevel && (
        <p className="text-xs font-bold text-emerald-400 mt-1">✓ Level 2 Unlocked</p>
      )}
    </div>
  );
}

/* ─── Page ───────────────────────────────────────────────────────── */
export default function BadgesPage() {
  const { user, setUser } = useApp();
  const router = useRouter();
  const [badges, setBadges]       = useState<EarnedBadge[]>([]);
  const [loading, setLoading]     = useState(true);
  const [redeeming, setRedeeming] = useState<string | null>(null);

  useEffect(() => {
    if (!user) { router.replace("/login"); return; }
    fetchApi("/api/badges")
      .then((r) => r.json())
      .then((d: EarnedBadge[]) => setBadges(Array.isArray(d) ? d : []))
      .catch(() => setBadges([]))
      .finally(() => setLoading(false));
  }, [user, router]);

  async function handleRedeem(badgeId: string) {
    setRedeeming(badgeId);
    try {
      const res = await fetchApi("/api/badges/redeem", {
        method: "POST", credentials: "same-origin",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ badgeId }),
      });
      const data = await res.json() as { ok: boolean; user: typeof user };
      if (data.ok && data.user) {
        setUser(data.user);
        setBadges((p) => p.map((b) => b.badgeId === badgeId ? { ...b, redeemed: true } : b));
        window.location.reload();
      }
    } catch { /* silent */ }
    finally { setRedeeming(null); }
  }

  if (!user) return null;

  const badgeMap  = new Map(badges.map((b) => [b.badgeId as string, b]));
  const earnedCnt = badges.length;
  const totalCnt  = Object.keys(BADGE_DEFS).length;
  const levelPct  = user.level >= 2 ? 100 : Math.round((earnedCnt / totalCnt) * 100);

  return (
    <>
      <style>{`
        @keyframes ping   { 75%,100% { transform:scale(2.2); opacity:0; } }
        @keyframes spin   { to { transform:rotate(360deg); } }
      `}</style>

      <main
        className="min-h-screen px-4 py-10 pb-28"
        style={{ background: "linear-gradient(160deg,#0F172A 0%,#1E1B4B 55%,#0F172A 100%)" }}
      >
        <div className="max-w-5xl mx-auto">

          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-black text-white mb-2 tracking-tight">
              🪙 Coin Collection
            </h1>
            <p className="text-slate-400 text-sm max-w-sm mx-auto">
              Complete challenges to earn rare coins. Collect them all — your friends will be jealous.
            </p>
          </div>

          {/* Level progress */}
          <div className="rounded-2xl p-5 mb-10 border"
            style={{
              background: "linear-gradient(135deg,rgba(16,185,129,0.10),rgba(124,58,237,0.10))",
              borderColor: "rgba(255,255,255,0.09)",
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-0.5">
                  Current Level
                </p>
                <p className="text-xl font-black text-white">
                  {user.level >= 2 ? "⚡ Level 2 — Active Trader" : "📊 Level 1 — Simulation Investor"}
                </p>
              </div>
              <div className="w-16 h-16 rounded-full flex items-center justify-center font-black text-2xl text-white border-4"
                style={{
                  background: user.level >= 2
                    ? "linear-gradient(135deg,#F5C842,#C48F1A)"
                    : "linear-gradient(135deg,#10B981,#059669)",
                  borderColor: user.level >= 2 ? "#FFE168" : "#34D399",
                  boxShadow:   user.level >= 2
                    ? "0 0 24px rgba(245,200,66,0.55)"
                    : "0 0 24px rgba(16,185,129,0.55)",
                }}
              >
                {user.level}
              </div>
            </div>
            <div className="h-3 rounded-full overflow-hidden" style={{ background: "rgba(255,255,255,0.09)" }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{
                  width: `${levelPct}%`,
                  background: "linear-gradient(90deg,#10B981,#F5C842)",
                  boxShadow: "0 0 10px rgba(16,185,129,0.55)",
                }}
              />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-xs text-slate-500">{earnedCnt}/{totalCnt} coins earned</span>
              <span className="text-xs font-bold text-emerald-400">{levelPct}%</span>
            </div>
          </div>

          {/* Coin grid */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 place-items-center">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="w-36 h-48 rounded-full animate-pulse"
                  style={{ background: "rgba(255,255,255,0.06)" }} />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-x-4 gap-y-12 place-items-center">
              {Object.keys(BADGE_DEFS).map((id) => {
                const b = badgeMap.get(id);
                return (
                  <BadgeCard key={id} id={id}
                    earned={!!b}
                    canRedeem={!!b && !b.redeemed && !!BADGE_DEFS[id].unlocksLevel}
                    earnedAt={b?.earnedAt}
                    onRedeem={handleRedeem}
                    redeeming={redeeming}
                  />
                );
              })}
            </div>
          )}

          {/* Empty state */}
          {!loading && badges.length === 0 && (
            <div className="text-center mt-10">
              <p className="text-slate-500 text-sm mb-4">
                Complete your first simulation to mint your first coin!
              </p>
              <Link href="/simulation"
                className="inline-block px-6 py-3 rounded-full text-sm font-bold text-slate-900 shadow-lg hover:scale-105 transition-transform"
                style={{ background: "linear-gradient(135deg,#FFF0A0,#F5C842,#C48F1A)" }}
              >
                Go to Simulation →
              </Link>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
