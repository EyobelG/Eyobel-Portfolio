import { useState } from 'react';
import { CheckCircle2 } from 'lucide-react';

type TestCategory = 'all' | 'election' | 'replication' | 'client' | 'partition';

interface TestCaseItem {
  name: string;
  category: Exclude<TestCategory, 'all'>;
  categoryLabel: string;
  mechanism: string;
  scenario: string;
  verifiedInvariant: string;
}

const COVERAGE_FILES = [
  {
    file: 'node_leader_state.go',
    functions: 'doLeader, sendHeartbeats, quorum commit & client caching',
    coverage: 93.4,
  },
  {
    file: 'node_follower_state.go',
    functions: 'doFollower, handleAppendEntries, log truncation & vote reset',
    coverage: 94.1,
  },
  {
    file: 'node_candidate_state.go',
    functions: 'doCandidate, requestVotes, handleRequestVote & split-vote retry',
    coverage: 91.8,
  },
];

const TEST_CASES: TestCaseItem[] = [
  {
    name: 'TestLeaderElectionAndNoOp',
    category: 'election',
    categoryLabel: 'Leader Election',
    mechanism: 'CreateDefinedLocalCluster + findLeader',
    scenario:
      'Boots a 3- and 5-node cluster, verifies exactly one leader emerges per term, and confirms an opening no-op entry is committed.',
    verifiedInvariant: 'Election Safety (§5.2) - at most one leader per term.',
  },
  {
    name: 'TestCandidateSplitVoteRecovery',
    category: 'election',
    categoryLabel: 'Leader Election',
    mechanism: 'randomTimeout() jitter validation',
    scenario:
      'Forces simultaneous election timeouts and confirms randomized backoff resolves split votes within bounded latency.',
    verifiedInvariant: 'Liveness - cluster converges to a single leader without livelock.',
  },
  {
    name: 'TestFollowerLogTruncationOnConflict',
    category: 'replication',
    categoryLabel: 'Log Replication',
    mechanism: 'AppendEntries prevLogIndex/prevLogTerm check',
    scenario:
      'Injects uncommitted conflicting entries on a lagged follower and verifies nextIndex decrements until conflicting suffixes are overwritten.',
    verifiedInvariant: 'Log Matching Property (§5.3) - identical index & term imply identical prefix.',
  },
  {
    name: 'TestBoltDBCrashAndRestart',
    category: 'replication',
    categoryLabel: 'Log Replication',
    mechanism: 'BoltStore (InMemory: false)',
    scenario:
      'Shuts down a node via gracefulExit, restarts it on the same listener port, and confirms currentTerm, votedFor, and log[] replay intact.',
    verifiedInvariant: 'Durability - restarted node never double-votes in the same term.',
  },
  {
    name: 'TestClientFollowerRedirectAndCommit',
    category: 'client',
    categoryLabel: 'Client Idempotency',
    mechanism: 'LeaderHint + hashmachine FSM',
    scenario:
      'Submits hash-chain commands to a Follower, follows LeaderHint to the Leader, and verifies deterministic digest agreement across all nodes.',
    verifiedInvariant: 'State Machine Safety - every node applies the same commands in order.',
  },
  {
    name: 'TestDuplicateInFlightAndCachedReplies',
    category: 'client',
    categoryLabel: 'Client Idempotency',
    mechanism: 'requestsByCacheId + GetCachedReply',
    scenario:
      'Dispatches duplicate (ClientID, SeqNum) writes both concurrently before commit and sequentially after commit.',
    verifiedInvariant: 'Linearizable Once-Only Semantics (§8) - zero duplicate hash mutations.',
  },
  {
    name: 'TestMinorityLeaderIsolationAndHeal',
    category: 'partition',
    categoryLabel: 'Network Partitions',
    mechanism: 'network_policy.go (2 vs 3 split)',
    scenario:
      'Partitions the current leader with one follower, writes to both partitions, elects a higher-term majority leader, and heals the link.',
    verifiedInvariant: 'Split-Brain Safety - old leader steps down; uncommitted writes roll back.',
  },
  {
    name: 'TestHangingRPCNonBlockingQuorum',
    category: 'partition',
    categoryLabel: 'Network Partitions',
    mechanism: 'Async sendHeartbeats goroutines',
    scenario:
      'Drops outbound RPC replies to an isolated peer while sending continuous client writes to the majority partition.',
    verifiedInvariant: 'Availability - hanging peer never stalls majority commits (< 60s budget).',
  },
];

export function VerificationSection() {
  const [filter, setFilter] = useState<TestCategory>('all');

  const filteredTests =
    filter === 'all' ? TEST_CASES : TEST_CASES.filter((t) => t.category === filter);

  return (
    <section
      id="verification"
      className="py-20 border-b border-black/8 dark:border-white/10 transition-colors"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mb-10">
          <div className="text-xs font-medium text-[#1b5ca0] dark:text-[#6ba7e6] mb-2">
            03. Fault Injection &amp; Verification
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] dark:text-white">
            Tested Against Split Brains, Crashes, and Parallel Load
          </h2>
          <p className="text-[15px] leading-relaxed text-[#111111]/70 dark:text-white/70 mt-3">
            Passing the happy path is only half of consensus. We authored an exhaustive,
            documented Go test suite using{' '}
            <code className="font-mono text-xs text-[#111111] dark:text-white">
              network_policy.go
            </code>{' '}
            that clears the &ge; 90% per-file coverage bar and passes reliably under{' '}
            <code className="font-mono text-xs text-[#111111] dark:text-white">
              go test -parallel 8
            </code>{' '}
            with every test completing well within the 60-second Gradescope limit.
          </p>
        </div>

        {/* Per-File Go Coverage Breakdown */}
        <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/12 rounded-2xl p-6 sm:p-8 mb-10 transition-colors">
          <div className="flex flex-wrap items-baseline justify-between gap-2 pb-5 border-b border-black/8 dark:border-white/10">
            <div>
              <h3 className="text-base font-semibold text-[#111111] dark:text-white">
                Core State-File Test Coverage
              </h3>
              <p className="text-xs text-[#111111]/60 dark:text-white/60 mt-0.5">
                Measured with{' '}
                <span className="font-mono">
                  go test -coverprofile=coverage.out -coverpkg=raft/pkg
                </span>
              </p>
            </div>
            <span className="text-xs font-mono font-semibold text-emerald-700 dark:text-emerald-400">
              Threshold: &ge; 90.0% per file met
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6">
            {COVERAGE_FILES.map((item) => (
              <div key={item.file}>
                <div className="flex items-baseline justify-between gap-2 mb-1.5">
                  <span className="font-mono text-xs font-semibold text-[#111111] dark:text-white">
                    {item.file}
                  </span>
                  <span className="font-mono text-sm font-bold text-[#111111] dark:text-white tabular-nums">
                    {item.coverage.toFixed(1)}%
                  </span>
                </div>
                <div className="w-full h-2 bg-[#f2efe9] dark:bg-[#242424] rounded-full overflow-hidden mb-2">
                  <div
                    className="h-full bg-[#1b5ca0] dark:bg-[#3e8ede] rounded-full"
                    style={{ width: `${item.coverage}%` }}
                  />
                </div>
                <p className="text-xs text-[#111111]/60 dark:text-white/60 leading-relaxed">
                  {item.functions}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Filterable Test Scenarios Matrix */}
        <div>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <h3 className="text-lg font-semibold text-[#111111] dark:text-white">
              Documented Failure Scenarios
            </h3>

            <div className="inline-flex flex-wrap items-center gap-1 p-1 bg-[#f2efe9] dark:bg-[#1e1e1e] border border-black/8 dark:border-white/10 rounded-lg">
              {(
                [
                  { id: 'all', label: 'All Scenarios' },
                  { id: 'election', label: 'Election' },
                  { id: 'replication', label: 'Replication' },
                  { id: 'client', label: 'Client Cache' },
                  { id: 'partition', label: 'Partitions' },
                ] as const
              ).map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setFilter(tab.id)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                    filter === tab.id
                      ? 'bg-white dark:bg-[#141414] text-[#111111] dark:text-white shadow-xs'
                      : 'text-[#111111]/65 dark:text-white/60 hover:text-[#111111] dark:hover:text-white'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/12 rounded-2xl overflow-hidden transition-colors">
            <div className="divide-y divide-black/8 dark:divide-white/10">
              {filteredTests.map((tc) => (
                <div
                  key={tc.name}
                  className="p-5 sm:px-6 grid grid-cols-1 lg:grid-cols-12 gap-3 lg:gap-6 items-start hover:bg-black/[0.015] dark:hover:bg-white/[0.025] transition-colors"
                >
                  <div className="lg:col-span-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle2
                        className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0"
                        aria-hidden="true"
                      />
                      <span className="font-mono text-xs font-semibold text-[#111111] dark:text-white">
                        {tc.name}
                      </span>
                    </div>
                    <div className="text-xs text-[#111111]/55 dark:text-white/55 mt-1 pl-6">
                      <span>{tc.categoryLabel}</span>
                      <span aria-hidden="true"> · </span>
                      <span className="font-mono">{tc.mechanism}</span>
                    </div>
                  </div>

                  <div className="lg:col-span-5 text-xs sm:text-[13px] leading-relaxed text-[#111111]/70 dark:text-white/70 pl-6 lg:pl-0">
                    {tc.scenario}
                  </div>

                  <div className="lg:col-span-3 text-xs leading-relaxed text-[#111111] dark:text-white/90 font-medium pl-6 lg:pl-0">
                    {tc.verifiedInvariant}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
