import { useState } from 'react';
import {
  ArrowDownRight,
  ArrowRight,
  Crown,
  Moon,
  PowerOff,
  Radio,
  ShieldCheck,
  Sun,
} from 'lucide-react';

interface HeroSectionProps {
  onLaunchSandbox: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

type StateKey = 'follower' | 'candidate' | 'leader' | 'shutdown';

interface StateDetail {
  key: StateKey;
  title: string;
  fnName: string;
  file: string;
  summary: string;
  outgoing: { to: string; condition: string; targetKey: StateKey }[];
  goReturn: string;
}

const STATE_DETAILS: Record<StateKey, StateDetail> = {
  follower: {
    key: 'follower',
    title: 'Follower State',
    fnName: 'func (r *Node) doFollower() stateFunction',
    file: 'node_follower_state.go',
    summary:
      'Responds to AppendEntries and RequestVote RPCs, resets its randomized election timer on valid leader heartbeats or granted votes, and redirects client writes using LeaderHint.',
    outgoing: [
      {
        to: 'Candidate',
        condition: 'Election timeout elapses without heartbeat',
        targetKey: 'candidate',
      },
      {
        to: 'Shutdown',
        condition: 'Signal received on r.gracefulExit channel',
        targetKey: 'shutdown',
      },
    ],
    goReturn: 'case <-electionTimeout:\n    return r.doCandidate',
  },
  candidate: {
    key: 'candidate',
    title: 'Candidate State',
    fnName: 'func (r *Node) doCandidate() stateFunction',
    file: 'node_candidate_state.go',
    summary:
      'Increments currentTerm in BoltStore, votes for itself, and dispatches concurrent RequestVote RPCs across peers. Rejects equal-term requests and restarts on split votes.',
    outgoing: [
      {
        to: 'Leader',
        condition: 'Receives votes from strict majority (> N/2)',
        targetKey: 'leader',
      },
      {
        to: 'Follower',
        condition: 'Discovers valid leader or higher term',
        targetKey: 'follower',
      },
    ],
    goReturn: 'if electionWon {\n    return r.doLeader\n}\nif fallback {\n    return r.doFollower\n}',
  },
  leader: {
    key: 'leader',
    title: 'Leader State',
    fnName: 'func (r *Node) doLeader() stateFunction',
    file: 'node_leader_state.go',
    summary:
      'Appends an opening no-op entry, drives async sendHeartbeats() to sync lagging followers via nextIndex[]/matchIndex[], deduplicates client writes, and commits once a majority acknowledges.',
    outgoing: [
      {
        to: 'Follower',
        condition: 'Any RPC reply reports term > currentTerm',
        targetKey: 'follower',
      },
      {
        to: 'Shutdown',
        condition: 'Signal received on r.gracefulExit channel',
        targetKey: 'shutdown',
      },
    ],
    goReturn: 'if fallback := r.sendHeartbeats(); fallback {\n    return r.doFollower\n}',
  },
  shutdown: {
    key: 'shutdown',
    title: 'Graceful Shutdown',
    fnName: 'return nil',
    file: 'All state loops',
    summary:
      'Every state loop monitors r.gracefulExit. Returning nil cleanly terminates the node loop while BoltDB retains currentTerm, votedFor, and log[] on disk for crash recovery.',
    outgoing: [
      {
        to: 'Follower',
        condition: 'Node restarts and reloads persisted BoltStore state',
        targetKey: 'follower',
      },
    ],
    goReturn: 'case <-r.gracefulExit:\n    return nil',
  },
};

export function HeroSection({
  onLaunchSandbox,
  theme,
  onToggleTheme,
}: HeroSectionProps) {
  const [activeState, setActiveState] = useState<StateKey>('leader');
  const current = STATE_DETAILS[activeState];

  return (
    <section
      id="overview"
      className="pt-10 pb-16 border-b border-black/8 dark:border-white/10 transition-colors"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Top Metadata & Theme Switch Row */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-8 mb-8 border-b border-black/8 dark:border-white/10">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1 text-xs font-medium text-[#111111]/65 dark:text-white/65">
            <span className="text-[#1b5ca0] dark:text-[#6ba7e6] font-semibold">
              Tufts CS 118: Cloud Computing
            </span>
            <span aria-hidden="true">·</span>
            <span>Pair Systems Project</span>
            <span aria-hidden="true">·</span>
            <span>Go 1.13, BoltDB &amp; Docker</span>
          </div>

          {/* Clean Light / Dark Theme Control */}
          <div
            role="group"
            aria-label="Color theme"
            className="inline-flex items-center gap-1 p-1 rounded-lg bg-[#f2efe9] dark:bg-[#1e1e1e] border border-black/8 dark:border-white/10"
          >
            <button
              type="button"
              onClick={() => theme === 'dark' && onToggleTheme()}
              aria-pressed={theme === 'light'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                theme === 'light'
                  ? 'bg-white text-[#111111] shadow-xs'
                  : 'text-white/60 hover:text-white'
              }`}
            >
              <Sun className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Light</span>
            </button>
            <button
              type="button"
              onClick={() => theme === 'light' && onToggleTheme()}
              aria-pressed={theme === 'dark'}
              className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                theme === 'dark'
                  ? 'bg-[#141414] text-white shadow-xs'
                  : 'text-[#111111]/60 hover:text-[#111111]'
              }`}
            >
              <Moon className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Dark</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
          {/* Left Editorial Narrative */}
          <div className="lg:col-span-6 flex flex-col justify-between py-1">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[54px] font-semibold tracking-tight text-[#111111] dark:text-white leading-[1.08] mb-6">
                Raft Consensus, <span className="italic font-normal">Built From the Paper Up.</span>
              </h1>

              <p className="text-[15.5px] leading-[1.72] text-[#111111]/70 dark:text-white/70 max-w-[56ch] mb-8">
                Working as a two-engineer team, we translated Ongaro &amp; Ousterhout&rsquo;s 2014
                Raft consensus paper into a fault-tolerant Go implementation—complete with
                function-pointer state machines, BoltDB crash recovery, hash-chain state
                replication, idempotent client caching, and split-brain partition resilience.
              </p>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={onLaunchSandbox}
                  className="inline-flex items-center gap-2 px-5 py-3 text-sm font-semibold text-white bg-[#1b5ca0] dark:bg-[#3e8ede] rounded-lg hover:bg-[#164b84] dark:hover:bg-[#579ee6] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#3e8ede] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                >
                  <span>Explore Live Cluster</span>
                  <ArrowDownRight className="w-4 h-4" aria-hidden="true" />
                </button>
                <a
                  href="#architecture"
                  className="inline-flex items-center gap-1.5 px-4 py-3 text-sm font-semibold text-[#111111]/80 dark:text-white/80 hover:text-[#111111] dark:hover:text-white transition-colors whitespace-nowrap shrink-0"
                >
                  <span>Inspect Go Architecture</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </a>
              </div>
            </div>

            <div className="mt-10 pt-6 border-t border-black/8 dark:border-white/10 text-xs text-[#111111]/60 dark:text-white/60 flex flex-wrap items-center gap-x-3 gap-y-1">
              <span className="font-semibold text-[#111111] dark:text-white">
                Protocol Scope:
              </span>
              <span>Leader Election (§5.2)</span>
              <span aria-hidden="true">/</span>
              <span>Log Replication &amp; Safety (§5.3–5.4)</span>
              <span aria-hidden="true">/</span>
              <span>Client Idempotency (§8)</span>
            </div>
          </div>

          {/* Right Interactive State-Function Visual */}
          <div className="lg:col-span-6 flex">
            <div className="w-full bg-white dark:bg-[#141414] border border-black/10 dark:border-white/12 rounded-2xl p-6 sm:p-7 flex flex-col justify-between transition-colors">
              <div>
                <div className="flex flex-wrap items-baseline justify-between gap-3 mb-5">
                  <div>
                    <h2
                      className="text-lg font-semibold text-[#111111] dark:text-white"
                      style={{ fontFamily: 'var(--font-serif)' }}
                    >
                      Interactive Node State Machine
                    </h2>
                    <p className="text-xs text-[#111111]/60 dark:text-white/60 mt-0.5">
                      Select any Raft role to inspect its Go state-function transitions
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#111111]/55 dark:text-white/55 tabular-nums shrink-0">
                    func() stateFunction
                  </span>
                </div>

                {/* Interactive State Selector */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 p-1.5 bg-[#f2efe9] dark:bg-[#1e1e1e] rounded-xl mb-6">
                  {(
                    [
                      { key: 'follower', label: 'Follower', Icon: ShieldCheck },
                      { key: 'candidate', label: 'Candidate', Icon: Radio },
                      { key: 'leader', label: 'Leader', Icon: Crown },
                      { key: 'shutdown', label: 'Exit (nil)', Icon: PowerOff },
                    ] as const
                  ).map(({ key, label, Icon }) => {
                    const isActive = activeState === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveState(key)}
                        className={`flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-white dark:bg-[#141414] text-[#111111] dark:text-white shadow-xs ring-1 ring-black/8 dark:ring-white/12'
                            : 'text-[#111111]/65 dark:text-white/60 hover:text-[#111111] dark:hover:text-white'
                        }`}
                      >
                        <Icon
                          className={`w-3.5 h-3.5 shrink-0 ${
                            isActive
                              ? key === 'leader'
                                ? 'text-emerald-600 dark:text-emerald-400'
                                : key === 'candidate'
                                  ? 'text-amber-700 dark:text-amber-400'
                                  : key === 'shutdown'
                                    ? 'text-rose-600 dark:text-rose-400'
                                    : 'text-[#1b5ca0] dark:text-[#6ba7e6]'
                              : 'text-[#111111]/40 dark:text-white/40'
                          }`}
                          aria-hidden="true"
                        />
                        <span>{label}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Active State Explanation */}
                <div className="space-y-4">
                  <div className="flex flex-wrap items-baseline justify-between gap-2 pb-3 border-b border-black/8 dark:border-white/10">
                    <span className="text-sm font-semibold text-[#111111] dark:text-white">
                      {current.title}
                    </span>
                    <span className="text-xs font-mono text-[#111111]/55 dark:text-white/55">
                      {current.file}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-[#111111]/70 dark:text-white/70">
                    {current.summary}
                  </p>

                  {/* Outgoing clickable transitions */}
                  <div className="space-y-2 pt-1">
                    <div className="text-xs font-medium text-[#111111]/55 dark:text-white/55">
                      Outgoing transitions (click to follow):
                    </div>
                    <div className="divide-y divide-black/8 dark:divide-white/10 border-y border-black/8 dark:border-white/10">
                      {current.outgoing.map((edge) => (
                        <button
                          key={`${current.key}-${edge.targetKey}`}
                          type="button"
                          onClick={() => setActiveState(edge.targetKey)}
                          className="w-full py-2.5 flex items-center justify-between gap-3 text-left group cursor-pointer hover:bg-black/[0.03] dark:hover:bg-white/[0.04] transition-colors px-1.5 -mx-1.5 rounded"
                        >
                          <span className="text-xs text-[#111111]/70 dark:text-white/70 group-hover:text-[#111111] dark:group-hover:text-white">
                            {edge.condition}
                          </span>
                          <span className="inline-flex items-center gap-1 text-xs font-semibold text-[#1b5ca0] dark:text-[#6ba7e6] whitespace-nowrap shrink-0">
                            <span>{edge.to}</span>
                            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Go snippet */}
              <div className="mt-5 pt-4 border-t border-black/8 dark:border-white/10">
                <div className="text-[11px] font-mono text-[#111111]/55 dark:text-white/55 mb-2">
                  {current.fnName}
                </div>
                <pre className="bg-[#111111] dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 text-zinc-100 rounded-xl p-3.5 text-xs font-mono leading-relaxed overflow-x-auto">
                  <code>{current.goReturn}</code>
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Full-Width 4-Column Proof Strip */}
        <div className="mt-12 pt-8 border-t border-black/8 dark:border-white/10 grid grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <div className="text-3xl font-semibold tracking-tight text-[#111111] dark:text-white font-mono tabular-nums">
              3
            </div>
            <div className="text-sm font-semibold text-[#111111] dark:text-white/90 mt-1">
              Consensus State Machines
            </div>
            <div className="text-xs text-[#111111]/60 dark:text-white/55 mt-0.5">
              Follower, Candidate, and Leader loops
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight text-[#111111] dark:text-white font-mono tabular-nums">
              &ge; 90%
            </div>
            <div className="text-sm font-semibold text-[#111111] dark:text-white/90 mt-1">
              Per-File Test Coverage
            </div>
            <div className="text-xs text-[#111111]/60 dark:text-white/55 mt-0.5">
              Verified with go test -parallel 8
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight text-[#111111] dark:text-white font-mono tabular-nums">
              4
            </div>
            <div className="text-sm font-semibold text-[#111111] dark:text-white/90 mt-1">
              Multiplexed Go Channels
            </div>
            <div className="text-xs text-[#111111]/60 dark:text-white/55 mt-0.5">
              RPC, client, and shutdown select loops
            </div>
          </div>
          <div>
            <div className="text-3xl font-semibold tracking-tight text-[#111111] dark:text-white font-mono tabular-nums">
              2
            </div>
            <div className="text-sm font-semibold text-[#111111] dark:text-white/90 mt-1">
              Engineers, One Protocol
            </div>
            <div className="text-xs text-[#111111]/60 dark:text-white/55 mt-0.5">
              Pair-built &amp; defended in live code Q&amp;A
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
