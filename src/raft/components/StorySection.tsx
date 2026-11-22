interface StorySectionProps {
  onBackToSandbox: () => void;
}

const EDGE_CASES = [
  {
    number: '01',
    title: 'Preventing Hanging RPCs From Stalling Heartbeats',
    problem:
      'In a naive sequential loop, a partitioned or crashed follower causes AppendEntriesRPC to hang until TCP timeout - starving healthy followers and triggering cascading re-elections.',
    resolution:
      'Fired peer RPCs concurrently inside asynchronous goroutines inside sendHeartbeats() and requestVotes(), committing logs as soon as a strict majority responded rather than waiting on stragglers.',
  },
  {
    number: '02',
    title: 'Coalescing Concurrent Duplicate Client Requests',
    problem:
      'Clients retrying before a log entry finishes replicating arrive with the same (ClientID, SeqNum) while no completed reply exists in GetCachedReply yet.',
    resolution:
      'Backed n.requestsByCacheId with a slice of reply channels per cache ID so processLogEntry fans out the committed state-machine result to every waiting caller without duplicating the log entry.',
  },
  {
    number: '03',
    title: 'Guarding Off-By-One & Slice Bounds During Truncation',
    problem:
      'Raft logs are 1-indexed while Go slices are 0-indexed. Rapid leadership churn during partitions easily triggers index-out-of-range panics when decrementing nextIndex or slicing conflicting tails.',
    resolution:
      'Standardized all persistent lookups through StableStore helpers (LastLogIndex, GetLog, TruncateLog) with explicit boundary checks on prevLogIndex == 0 and empty log cases.',
  },
  {
    number: '04',
    title: 'Enforcing Raft’s Figure 8 Commitment Invariant',
    problem:
      'Committing a log entry from a previous term merely because it appears on a majority of servers can lead to overwritten committed data after a leader crash.',
    resolution:
      'Appended a blank no-op entry at the start of every leader term and restricted direct commitIndex advancement to entries where log[N].term == currentTerm.',
  },
];

export function StorySection({ onBackToSandbox }: StorySectionProps) {
  return (
    <>
      <section id="story" className="py-20 transition-colors">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Left Partnership Narrative */}
            <div className="lg:col-span-5">
              <div className="text-xs font-medium text-[#1b5ca0] dark:text-[#6ba7e6] mb-2">
                04. Engineering Story &amp; Partnership
              </div>
              <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] dark:text-white mb-5">
                Two Engineers, One Consensus Paper, Zero Shortcuts
              </h2>

              <div className="space-y-4 text-[15px] leading-[1.72] text-[#111111]/70 dark:text-white/70">
                <p>
                  We built this entire Raft implementation as a two-person engineering team for
                  Tufts CS 118: Cloud Computing. Rather than working from pseudocode tutorials, our
                  ground truth was Figure 2 and Sections 5 &amp; 8 of Diego Ongaro and John
                  Ousterhout&rsquo;s original 2014 Stanford paper.
                </p>
                <p>
                  We shared a reproducible Go 1.13 Docker workflow and Git repository, pairing
                  closely across the boundary between leader election, log reconciliation, and
                  client idempotency. Because the project concluded with an{' '}
                  <span className="font-semibold text-[#111111] dark:text-white">
                    independent in-person technical Q&amp;A
                  </span>{' '}
                  worth 30% of the grade, both of us had to understand and defend every single line
                  of concurrency and recovery logic on our own.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-black/8 dark:border-white/10 space-y-3 text-xs text-[#111111]/65 dark:text-white/65">
                <div className="flex justify-between gap-4">
                  <span className="text-[#111111]/50 dark:text-white/50">Collaboration Model</span>
                  <span className="font-medium text-[#111111] dark:text-white">
                    2-Person Team · Paired &amp; Reviewed
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#111111]/50 dark:text-white/50">Core Stack</span>
                  <span className="font-mono text-[#111111] dark:text-white">
                    Go 1.13 · gRPC/Proto · BoltDB · Docker
                  </span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-[#111111]/50 dark:text-white/50">Final Evaluation</span>
                  <span className="font-medium text-[#111111] dark:text-white">
                    Gradescope Suite + In-Person Code Q&amp;A
                  </span>
                </div>
              </div>
            </div>

            {/* Right Edge Cases Solved */}
            <div className="lg:col-span-7">
              <h3 className="text-lg font-semibold text-[#111111] dark:text-white mb-5">
                Four Subtle Edge Cases We Solved
              </h3>
              <div className="divide-y divide-black/8 dark:divide-white/10 border-y border-black/8 dark:border-white/10">
                {EDGE_CASES.map((item) => (
                  <div key={item.number} className="py-5 first:pt-4 last:pb-4">
                    <div className="flex items-baseline gap-3 mb-2">
                      <span className="font-mono text-xs font-semibold text-[#1b5ca0] dark:text-[#6ba7e6] tabular-nums">
                        {item.number}
                      </span>
                      <h4 className="text-sm sm:text-base font-semibold text-[#111111] dark:text-white">
                        {item.title}
                      </h4>
                    </div>
                    <div className="pl-7 space-y-2 text-xs sm:text-[13px] leading-relaxed">
                      <p className="text-[#111111]/60 dark:text-white/60">
                        <span className="font-semibold text-[#111111]/85 dark:text-white/85">
                          Challenge:{' '}
                        </span>
                        {item.problem}
                      </p>
                      <p className="text-[#111111]/80 dark:text-white/80">
                        <span className="font-semibold text-[#111111] dark:text-white">Fix: </span>
                        {item.resolution}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quiet Editorial Portfolio Footer */}
      <footer className="border-t border-black/8 dark:border-white/10 bg-white dark:bg-[#0e0e0e] transition-colors">
        <div className="max-w-[1200px] mx-auto px-6 py-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#111111]/60 dark:text-white/60">
          <div className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
            <span
              className="font-semibold text-[#111111] dark:text-white text-sm"
              style={{ fontFamily: 'var(--font-serif)' }}
            >
              Eyobel Gebre
            </span>
            <span aria-hidden="true">·</span>
            <span>Raft Distributed Consensus (Tufts CS 118)</span>
            <span aria-hidden="true">·</span>
            <span>Built in Go with a partner</span>
          </div>

          <div className="flex items-center gap-5">
            <a
              href="#overview"
              className="hover:text-[#111111] dark:hover:text-white transition-colors"
            >
              Overview
            </a>
            <button
              type="button"
              onClick={onBackToSandbox}
              className="hover:text-[#111111] dark:hover:text-white transition-colors cursor-pointer"
            >
              Interactive Cluster
            </button>
            <a
              href="#architecture"
              className="hover:text-[#111111] dark:hover:text-white transition-colors"
            >
              Architecture
            </a>
          </div>
        </div>
      </footer>
    </>
  );
}
