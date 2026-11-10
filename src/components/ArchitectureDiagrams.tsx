import React from "react";

/**
 * Each diagram draws one mechanism from a real project, not its component tree:
 * the decision the architecture actually turns on.
 */

function Diagram({
  viewBox,
  label,
  caption,
  children
}: {
  viewBox: string;
  label: string;
  caption: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <figure className="rounded-2xl border border-cream-border bg-zinc-500/[0.03] dark:bg-white/[0.03] p-4 sm:p-5">
      <svg viewBox={viewBox} role="img" aria-label={label} className="w-full h-auto text-charcoal">
        {children}
      </svg>
      <figcaption className="text-[13px] leading-relaxed text-charcoal-light pt-3 mt-3 border-t border-dashed border-cream-border">
        {caption}
      </figcaption>
    </figure>
  );
}

const arrow = (
  <defs>
    <marker id="arch-arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
      <path d="M0,0 L10,5 L0,10 z" fill="currentColor" />
    </marker>
  </defs>
);

function InboundDiagram() {
  return (
    <Diagram
      viewBox="0 0 760 460"
      label="Browser splits into an authenticated data path, verified by Firebase and enforced by 22 Postgres row-level-security policies, and a public map-tile path that bypasses the backend entirely."
      caption={
        <>
          <b className="text-charcoal font-semibold">Inbound.</b> Authorization is enforced at the database, not in
          application code — 22 RLS policies evaluate every query inside the boundary, so a forgotten check in one
          route can't leak a row. Map tiles carry no user data, so they skip the backend entirely for latency.
        </>
      }
    >
      {arrow}
      <rect x="280" y="10" width="200" height="44" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="380" y="37" textAnchor="middle" fontSize="13" fontWeight={600} fill="currentColor">Browser</text>

      <line x1="340" y1="54" x2="210" y2="96" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
      <line x1="420" y1="54" x2="560" y2="96" stroke="currentColor" className="text-tufts-blue" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />

      <rect x="100" y="98" width="220" height="46" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="210" y="125" textAnchor="middle" fontSize="12.5" fontWeight={600} fill="currentColor">Next.js server</text>

      <line x1="210" y1="144" x2="210" y2="182" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
      <text x="222" y="168" fontSize="10" fill="currentColor" opacity={0.65}>verifies ID token</text>
      <rect x="100" y="184" width="220" height="40" rx="8" fill="none" strokeDasharray="3 3" stroke="currentColor" strokeWidth="1.5" />
      <text x="210" y="208" textAnchor="middle" fontSize="11" fill="currentColor">Firebase Auth</text>

      <line x1="210" y1="224" x2="210" y2="262" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
      <text x="222" y="248" fontSize="10" fill="currentColor" opacity={0.65}>withUser(uid) opens txn</text>

      <rect x="40" y="320" width="340" height="120" rx="10" className="text-tufts-blue" fill="currentColor" fillOpacity={0.08} stroke="currentColor" strokeWidth="1.6" />
      <text x="58" y="342" fontSize="10" fontWeight={700} className="text-tufts-blue" fill="currentColor" letterSpacing="0.06em">RLS BOUNDARY</text>
      <text x="210" y="368" textAnchor="middle" fontSize="12.5" fontWeight={600} fill="currentColor">Cloud SQL — Postgres + PostGIS</text>
      <text x="210" y="388" textAnchor="middle" fontSize="10.5" fill="currentColor" opacity={0.65}>22 RLS policies · 11 tables · GiST indexes</text>
      <text x="210" y="420" textAnchor="middle" fontSize="10" className="text-tufts-blue" fill="currentColor">a row you don't own simply isn't returned</text>
      <line x1="210" y1="264" x2="210" y2="318" className="text-tufts-blue" stroke="currentColor" strokeWidth="2" markerEnd="url(#arch-arrow)" />

      <rect x="460" y="98" width="220" height="46" rx="8" fill="none" className="text-tufts-blue" stroke="currentColor" strokeWidth="1.5" />
      <text x="570" y="125" textAnchor="middle" fontSize="12.5" fontWeight={600} fill="currentColor">MapLibre GL</text>
      <line x1="570" y1="144" x2="570" y2="182" className="text-tufts-blue" stroke="currentColor" strokeDasharray="4 3" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
      <rect x="460" y="184" width="220" height="40" rx="8" fill="none" className="text-tufts-blue" strokeDasharray="3 3" stroke="currentColor" strokeWidth="1.5" />
      <text x="570" y="208" textAnchor="middle" fontSize="11" fill="currentColor">OpenFreeMap tile CDN</text>
      <line x1="570" y1="224" x2="570" y2="438" stroke="currentColor" strokeWidth="1" strokeDasharray="2 4" opacity={0.4} />
      <text x="584" y="330" fontSize="9.5" fill="currentColor" opacity={0.55}>never touches the</text>
      <text x="584" y="344" fontSize="9.5" fill="currentColor" opacity={0.55}>RLS boundary</text>
    </Diagram>
  );
}

function QuantFolioDiagram() {
  return (
    <Diagram
      viewBox="0 0 760 290"
      label="Historical backtest data stays entirely offline and never writes an order; only a diff engine, which reads real Alpaca positions and compares them to the backtest's target weights, has write access, and it only ever writes the gap."
      caption={
        <>
          <b className="text-charcoal font-semibold">QuantFolio.</b> The backtest engine produces an opinion across
          six allocation rules; it never gets a write path. The <b className="text-charcoal font-semibold">diff engine</b> is
          the one component with access to place a real Alpaca order — and it only ever writes the gap between target
          and live positions, never the raw model output.
        </>
      }
    >
      {arrow}
      <rect x="15" y="15" width="330" height="175" rx="10" fill="none" stroke="currentColor" strokeDasharray="3 4" strokeWidth="1.1" opacity={0.5} />
      <text x="30" y="34" fontSize="9.5" letterSpacing="0.06em" fill="currentColor" opacity={0.55}>OFFLINE — HISTORICAL ONLY</text>

      <rect x="34" y="50" width="135" height="44" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="101" y="76" textAnchor="middle" fontSize="11.5" fontWeight={600} fill="currentColor">Market data</text>
      <line x1="169" y1="72" x2="216" y2="72" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
      <rect x="218" y="50" width="105" height="44" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="270" y="76" textAnchor="middle" fontSize="11.5" fontWeight={600} fill="currentColor">Backtest</text>

      <line x1="270" y1="94" x2="270" y2="134" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />
      <rect x="55" y="136" width="240" height="34" rx="8" fill="none" stroke="currentColor" strokeWidth="1.3" />
      <text x="175" y="157" textAnchor="middle" fontSize="10" fill="currentColor">target weights (best Sharpe)</text>

      <line x1="296" y1="153" x2="400" y2="153" className="text-tufts-blue" stroke="currentColor" strokeWidth="2" markerEnd="url(#arch-arrow)" />

      <rect x="402" y="15" width="340" height="175" rx="10" className="text-tufts-blue" fill="currentColor" fillOpacity={0.07} stroke="currentColor" strokeWidth="1.5" />
      <text x="418" y="34" fontSize="9.5" letterSpacing="0.06em" className="text-tufts-blue" fill="currentColor">LIVE — TOUCHES REAL ACCOUNT</text>

      <rect x="570" y="50" width="150" height="44" rx="8" fill="none" className="text-tufts-blue" stroke="currentColor" strokeWidth="1.5" />
      <text x="645" y="76" textAnchor="middle" fontSize="11.5" fontWeight={600} fill="currentColor">Alpaca account</text>
      <line x1="570" y1="72" x2="535" y2="72" className="text-tufts-blue" stroke="currentColor" strokeWidth="1.5" markerEnd="url(#arch-arrow)" />

      <rect x="420" y="128" width="210" height="44" rx="8" className="text-tufts-blue" fill="currentColor" fillOpacity={0.12} stroke="currentColor" strokeWidth="2" />
      <text x="525" y="154" textAnchor="middle" fontSize="12" fontWeight={700} fill="currentColor">Diff engine</text>
      <line x1="630" y1="150" x2="672" y2="136" className="text-tufts-blue" stroke="currentColor" strokeWidth="1.6" markerEnd="url(#arch-arrow)" />
      <text x="700" y="124" textAnchor="middle" fontSize="9" className="text-tufts-blue" fill="currentColor">order</text>

      <text x="34" y="225" fontSize="10" fill="currentColor" opacity={0.6}>Nothing offline can place an order — the diff engine is</text>
      <text x="34" y="242" fontSize="10" fill="currentColor" opacity={0.6}>the only write path, and it only ever writes the gap.</text>
    </Diagram>
  );
}

function CoReadDiagram() {
  return (
    <Diagram
      viewBox="0 0 760 250"
      label="An untrusted EPUB file is parsed client-side inside a boundary enforcing zip-bomb and path-traversal limits before sanitized content reaches the reading room; room access is governed separately by row-level security and a race-safe database trigger."
      caption={
        <>
          <b className="text-charcoal font-semibold">CoRead.</b> The trust boundary is the file parser, not the
          server — an EPUB is attacker-controlled XML inside a ZIP, sanitized client-side before anything reaches the
          DOM. Room access is a separate concern: RLS decides who can read, and a race-safe DB trigger (not an
          app-code check) stops two simultaneous joins from overshooting the plan limit.
        </>
      }
    >
      {arrow}
      <rect x="20" y="25" width="140" height="44" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="90" y="52" textAnchor="middle" fontSize="11.5" fontWeight={600} fill="currentColor">EPUB upload</text>
      <line x1="160" y1="47" x2="204" y2="47" className="text-tufts-blue" stroke="currentColor" strokeWidth="1.6" markerEnd="url(#arch-arrow)" />

      <rect x="206" y="10" width="250" height="84" rx="10" className="text-tufts-blue" fill="currentColor" fillOpacity={0.08} stroke="currentColor" strokeWidth="1.6" />
      <text x="222" y="28" fontSize="9" letterSpacing="0.05em" className="text-tufts-blue" fill="currentColor">PARSE BOUNDARY (client-side)</text>
      <text x="331" y="50" textAnchor="middle" fontSize="10" fill="currentColor">zip-bomb limit</text>
      <text x="331" y="66" textAnchor="middle" fontSize="10" fill="currentColor">path-traversal check</text>
      <text x="331" y="82" textAnchor="middle" fontSize="10" fill="currentColor">XHTML sanitize</text>

      <line x1="456" y1="52" x2="498" y2="52" className="text-tufts-blue" stroke="currentColor" strokeWidth="1.6" markerEnd="url(#arch-arrow)" />
      <rect x="500" y="30" width="220" height="44" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="610" y="57" textAnchor="middle" fontSize="11.5" fontWeight={600} fill="currentColor">Reading room</text>

      <text x="20" y="130" fontSize="10" letterSpacing="0.06em" fill="currentColor" opacity={0.55}>TWO INDEPENDENT ROOM GUARDS</text>
      <rect x="20" y="144" width="330" height="56" rx="8" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <text x="34" y="164" fontSize="11" fontWeight={700} fill="currentColor">Postgres RLS</text>
      <text x="34" y="182" fontSize="9.5" fill="currentColor" opacity={0.65}>who can read this room's rows</text>

      <rect x="390" y="144" width="330" height="56" rx="8" fill="none" className="text-tufts-blue" stroke="currentColor" strokeWidth="1.5" />
      <text x="404" y="164" fontSize="11" fontWeight={700} fill="currentColor">DB trigger, race-safe lock</text>
      <text x="404" y="182" fontSize="9.5" fill="currentColor" opacity={0.65}>won't admit member past the plan cap</text>
    </Diagram>
  );
}

export default function ArchitectureDiagrams() {
  return (
    <div className="space-y-10">
      <InboundDiagram />
      <QuantFolioDiagram />
      <CoReadDiagram />
    </div>
  );
}
