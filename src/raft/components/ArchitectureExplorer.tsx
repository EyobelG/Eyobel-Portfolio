import { useState } from 'react';
import { Cpu, Database, GitBranch, Terminal } from 'lucide-react';

type ArchTab = 'channels' | 'storage' | 'safety' | 'cli';

type ChannelKey = 'appendEntries' | 'requestVote' | 'clientRequest' | 'gracefulExit';

const CHANNELS: Record<
  ChannelKey,
  {
    name: string;
    typeDef: string;
    purpose: string;
    byState: {
      follower: string;
      candidate: string;
      leader: string;
    };
  }
> = {
  appendEntries: {
    name: 'r.appendEntries',
    typeDef: 'chan AppendEntriesMsg',
    purpose: 'Carries leader heartbeats and piggybacked log replication entries.',
    byState: {
      follower:
        'Validates term and prevLogIndex/prevLogTerm, truncates conflicting suffix, appends new logs, advances commitIndex, and resets election timer.',
      candidate:
        'If leader term >= currentTerm, recognizes legitimate leader, updates currentTerm in BoltStore, and returns r.doFollower immediately.',
      leader:
        'Rejects stale lower-term leaders. If incoming term > currentTerm, steps down via return r.doFollower and lets the new leader reconcile.',
    },
  },
  requestVote: {
    name: 'r.requestVote',
    typeDef: 'chan RequestVoteMsg',
    purpose: 'Carries candidate election ballots during term transitions.',
    byState: {
      follower:
        'Grants vote if term >= currentTerm, votedFor is empty or matches candidate, and candidate log is at least as up-to-date (§5.4.1); resets timer on grant.',
      candidate:
        'Rejects equal-term requests (already voted for self). On strictly higher term, updates currentTerm and steps down to Follower.',
      leader:
        'Rejects equal-term requests. On strictly higher term, persists new term, clears votedFor, and returns r.doFollower.',
    },
  },
  clientRequest: {
    name: 'r.clientRequest',
    typeDef: 'chan ClientRequestMsg',
    purpose: 'Carries external hash-chain commands and client registrations.',
    byState: {
      follower:
        'Rejects execution and returns LeaderHint pointing to the known leader (or r.Self if no leader is currently known).',
      candidate:
        'Rejects execution during election and returns LeaderHint: r.Self so the client retries after quorum settles.',
      leader:
        'Checks GetCachedReply first, coalesces in-flight duplicates into requestsByCacheId, or appends to StableStore for heartbeat commitment.',
    },
  },
  gracefulExit: {
    name: 'r.gracefulExit',
    typeDef: 'chan bool',
    purpose: 'Signals deterministic node shutdown during fault injection or cleanup.',
    byState: {
      follower: 'Returns nil immediately to halt the state-machine goroutine cleanly.',
      candidate: 'Aborts pending election loop and returns nil without leaking goroutines.',
      leader: 'Stops heartbeat ticker and returns nil so peers detect leader loss cleanly.',
    },
  },
};

const CLI_PRESETS = [
  {
    id: 'cluster',
    label: 'raft-cluster',
    command: 'raft-cluster -n 5 -m=false -d=true',
    packagePath: 'cmd/raft-cluster',
    description:
      'Boots a 5-node local Raft cluster simultaneously with BoltDB disk persistence enabled (-m=false) and verbose protocol logging (-d=true) to test leader election.',
    sampleOutput: [
      '[raft-cluster] spawning 5 nodes on ports :5001..:5005 (BoltStore)',
      '[node :5003] election timeout elapsed -> Candidate (term 1)',
      '[node :5003] received 4/5 RequestVote grants -> Leader (term 1)',
      '[node :5003] appended no-op log #1; heartbeat loop active',
    ],
  },
  {
    id: 'node',
    label: 'raft-node',
    command: 'raft-node -p 5001 -c localhost:5002 -m=false',
    packagePath: 'cmd/raft-node',
    description:
      'Interactive console for spawning an individual node bound to port 5001, joining an existing cluster peer, querying live state, and toggling network_policy partition rules.',
    sampleOutput: [
      '[raft-node] BoltDB opened at ./logs/node-5001.db (recovered term=2, entries=6)',
      '[raft-node] connected to cluster peer localhost:5002',
      'raft> state -> Follower | Term: 2 | CommitIndex: 6 | LastApplied: 6',
    ],
  },
  {
    id: 'client',
    label: 'raft-client',
    command: 'raft-client -c localhost:5001',
    packagePath: 'cmd/raft-client',
    description:
      'Connects to any Raft node, registers via CommandType_CLIENT_REGISTRATION, follows LeaderHint automatically, and submits commands to the deterministic hashmachine.',
    sampleOutput: [
      '[client] connected to :5001 (Follower) -> LeaderHint redirected to :5003',
      '[client] registered clientId=2 via log #2',
      'hash> send "cs118-raft" -> committed #3 | digest: 0x91e4...a7f2',
    ],
  },
  {
    id: 'tests',
    label: 'go test & cover',
    command: 'go test -parallel 8 -coverprofile=coverage.out -coverpkg=raft/pkg ./...',
    packagePath: 'Docker Go 1.13 suite',
    description:
      'Executes the full parallelized fault-injection suite (under 60s per test) and exports per-file line coverage for candidate, follower, and leader state modules.',
    sampleOutput: [
      'PASS  TestLeaderElectionBasic          (1.42s)',
      'PASS  TestNetworkPartitionAndHeal      (4.88s)',
      'PASS  TestDuplicateClientRequestCache  (2.15s)',
      'coverage: node_leader 93.4% | node_follower 94.1% | node_candidate 91.8%',
    ],
  },
];

export function ArchitectureExplorer() {
  const [activeTab, setActiveTab] = useState<ArchTab>('channels');
  const [activeChannel, setActiveChannel] = useState<ChannelKey>('clientRequest');
  const [storageEngine, setStorageEngine] = useState<'bolt' | 'memory'>('bolt');
  const [activeCli, setActiveCli] = useState<string>('cluster');

  const selectedChannel = CHANNELS[activeChannel];
  const selectedCli = CLI_PRESETS.find((c) => c.id === activeCli) ?? CLI_PRESETS[0];

  return (
    <section
      id="architecture"
      className="py-20 border-b border-black/8 dark:border-white/10 transition-colors"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        <div className="max-w-2xl mb-8">
          <div className="text-xs font-medium text-[#1b5ca0] dark:text-[#6ba7e6] mb-2">
            02. Systems Architecture Deep Dive
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] dark:text-white">
            Inside the Go Implementation
          </h2>
          <p className="text-[15px] leading-relaxed text-[#111111]/70 dark:text-white/70 mt-3">
            Rather than locking shared structs across dozens of callbacks, our implementation
            uses Go&rsquo;s CSP primitives—channel multiplexing, asynchronous RPC goroutines, and
            a pluggable StableStore interface backed by BoltDB.
          </p>
        </div>

        {/* Clean Segmented Tab Control */}
        <div
          role="tablist"
          aria-label="Architecture modules"
          className="inline-flex flex-wrap items-center gap-1 p-1.5 bg-[#f2efe9] dark:bg-[#1e1e1e] border border-black/8 dark:border-white/10 rounded-xl mb-8"
        >
          {(
            [
              { id: 'channels', label: '4-Channel Event Loop', Icon: Cpu },
              { id: 'storage', label: 'BoltDB & Deduplication', Icon: Database },
              { id: 'safety', label: 'Replication & Safety', Icon: GitBranch },
              { id: 'cli', label: 'Packages & CLIs', Icon: Terminal },
            ] as const
          ).map(({ id, label, Icon }) => {
            const active = activeTab === id;
            return (
              <button
                key={id}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveTab(id)}
                className={`inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer whitespace-nowrap ${
                  active
                    ? 'bg-white dark:bg-[#141414] text-[#111111] dark:text-white shadow-xs'
                    : 'text-[#111111]/65 dark:text-white/60 hover:text-[#111111] dark:hover:text-white'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 shrink-0 ${
                    active
                      ? 'text-[#1b5ca0] dark:text-[#6ba7e6]'
                      : 'text-[#111111]/40 dark:text-white/40'
                  }`}
                  aria-hidden="true"
                />
                <span>{label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab 1: 4-Channel Event Loop */}
        {activeTab === 'channels' && (
          <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/12 rounded-2xl p-6 sm:p-8 transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5 space-y-3">
                <h3 className="text-base font-semibold text-[#111111] dark:text-white">
                  Select a Go Channel
                </h3>
                <p className="text-xs text-[#111111]/60 dark:text-white/60 leading-relaxed mb-4">
                  Every node state runs an infinite{' '}
                  <code className="font-mono text-[#111111] dark:text-white">select</code> loop
                  over all four channels so no incoming RPC or client request can ever stall a
                  node.
                </p>

                <div className="space-y-2">
                  {(Object.keys(CHANNELS) as ChannelKey[]).map((key) => {
                    const ch = CHANNELS[key];
                    const active = activeChannel === key;
                    return (
                      <button
                        key={key}
                        type="button"
                        onClick={() => setActiveChannel(key)}
                        className={`w-full text-left px-4 py-3 rounded-xl border transition-all cursor-pointer ${
                          active
                            ? 'bg-[#3e8ede]/10 dark:bg-[#3e8ede]/14 border-[#1b5ca0] dark:border-[#3e8ede]'
                            : 'bg-[#faf9f6] dark:bg-[#1a1a1a] border-black/8 dark:border-white/10 hover:border-black/20 dark:hover:border-white/20'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-mono text-xs font-semibold text-[#111111] dark:text-white">
                            {ch.name}
                          </span>
                          <span className="font-mono text-[11px] text-[#111111]/55 dark:text-white/55">
                            {ch.typeDef}
                          </span>
                        </div>
                        <p className="text-xs text-[#111111]/65 dark:text-white/65 mt-1">
                          {ch.purpose}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between lg:border-l lg:border-black/8 dark:lg:border-white/10 lg:pl-8">
                <div>
                  <div className="flex flex-wrap items-baseline justify-between gap-2 pb-4 border-b border-black/8 dark:border-white/10">
                    <h3 className="text-lg font-semibold text-[#111111] dark:text-white font-mono">
                      {selectedChannel.name}
                    </h3>
                    <span className="text-xs text-[#111111]/55 dark:text-white/55">
                      State-specific behavior matrix
                    </span>
                  </div>

                  <div className="divide-y divide-black/8 dark:divide-white/10 mt-2">
                    <div className="py-4">
                      <div className="text-xs font-semibold text-[#1b5ca0] dark:text-[#6ba7e6] mb-1">
                        In doFollower()
                      </div>
                      <p className="text-sm leading-relaxed text-[#111111]/70 dark:text-white/70">
                        {selectedChannel.byState.follower}
                      </p>
                    </div>
                    <div className="py-4">
                      <div className="text-xs font-semibold text-amber-800 dark:text-amber-400 mb-1">
                        In doCandidate()
                      </div>
                      <p className="text-sm leading-relaxed text-[#111111]/70 dark:text-white/70">
                        {selectedChannel.byState.candidate}
                      </p>
                    </div>
                    <div className="py-4">
                      <div className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1">
                        In doLeader()
                      </div>
                      <p className="text-sm leading-relaxed text-[#111111]/70 dark:text-white/70">
                        {selectedChannel.byState.leader}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-black/8 dark:border-white/10 text-xs text-[#111111]/70 dark:text-white/70 leading-relaxed">
                  <span className="font-semibold text-[#111111] dark:text-white">
                    Hanging RPC Resilience:{' '}
                  </span>
                  Outbound{' '}
                  <code className="font-mono text-[#111111] dark:text-white">sendHeartbeats()</code>{' '}
                  and{' '}
                  <code className="font-mono text-[#111111] dark:text-white">requestVotes()</code>{' '}
                  calls launch in asynchronous goroutines—a slow or partitioned peer never blocks
                  quorum commitment for healthy nodes.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: BoltDB Persistence & Client Deduplication */}
        {activeTab === 'storage' && (
          <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/12 rounded-2xl p-6 sm:p-8 transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-6">
                <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
                  <h3 className="text-base font-semibold text-[#111111] dark:text-white">
                    StableStore Interface
                  </h3>
                  <div className="inline-flex p-1 bg-[#f2efe9] dark:bg-[#1e1e1e] rounded-lg">
                    <button
                      type="button"
                      onClick={() => setStorageEngine('bolt')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        storageEngine === 'bolt'
                          ? 'bg-white dark:bg-[#141414] text-[#111111] dark:text-white shadow-xs'
                          : 'text-[#111111]/65 dark:text-white/60 hover:text-[#111111] dark:hover:text-white'
                      }`}
                    >
                      BoltStore (Disk)
                    </button>
                    <button
                      type="button"
                      onClick={() => setStorageEngine('memory')}
                      className={`px-3 py-1 text-xs font-semibold rounded-md transition-colors cursor-pointer whitespace-nowrap ${
                        storageEngine === 'memory'
                          ? 'bg-white dark:bg-[#141414] text-[#111111] dark:text-white shadow-xs'
                          : 'text-[#111111]/65 dark:text-white/60 hover:text-[#111111] dark:hover:text-white'
                      }`}
                    >
                      MemoryStore (RAM)
                    </button>
                  </div>
                </div>

                <p className="text-sm leading-relaxed text-[#111111]/70 dark:text-white/70 mb-5">
                  {storageEngine === 'bolt'
                    ? 'Powered by BoltDB—the same embedded Go key-value store behind HashiCorp Consul and InfluxDB. Persists currentTerm, votedFor, and every replicated log entry to disk before RPC responses are sent, enabling full crash recovery per listener port.'
                    : 'Configured via Config.InMemory = true for rapid parallel unit testing. Keeps logs in memory so isolated test clusters can boot, partition, and tear down in milliseconds without disk I/O overhead.'}
                </p>

                <div className="border-t border-black/8 dark:border-white/10 pt-4 space-y-2.5 text-xs">
                  <div className="flex items-center justify-between py-1 border-b border-black/6 dark:border-white/8">
                    <span className="font-mono text-[#111111]/55 dark:text-white/55">
                      Persisted Fields
                    </span>
                    <span className="font-mono font-semibold text-[#111111] dark:text-white">
                      currentTerm · votedFor · log[]
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-black/6 dark:border-white/8">
                    <span className="font-mono text-[#111111]/55 dark:text-white/55">
                      Node Identity
                    </span>
                    <span className="font-mono font-semibold text-[#111111] dark:text-white">
                      Listener Port (e.g. :5001)
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1 border-b border-black/6 dark:border-white/8">
                    <span className="font-mono text-[#111111]/55 dark:text-white/55">
                      Survives Crash Restart
                    </span>
                    <span className="font-semibold text-[#111111] dark:text-white">
                      {storageEngine === 'bolt'
                        ? 'Yes — reloads log & votes from LogPath'
                        : 'No — ephemeral test state'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between py-1">
                    <span className="font-mono text-[#111111]/55 dark:text-white/55">
                      StateMachine Replay
                    </span>
                    <span className="font-mono font-semibold text-[#111111] dark:text-white">
                      processLogEntry() -&gt; hashmachine
                    </span>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-6 lg:border-l lg:border-black/8 dark:lg:border-white/10 lg:pl-8">
                <h3 className="text-base font-semibold text-[#111111] dark:text-white mb-2">
                  Two-Stage Client Idempotency Pipeline
                </h3>
                <p className="text-xs text-[#111111]/60 dark:text-white/60 mb-5">
                  Guarantees linearizable, at-most-once execution even when clients retry timed-out
                  requests during leader transitions.
                </p>

                <ol className="space-y-4">
                  {[
                    {
                      step: '01',
                      title: 'Leader Gate & Redirection',
                      body: 'Non-leaders immediately reject ClientRequest and return LeaderHint (or r.Self if unknown).',
                    },
                    {
                      step: '02',
                      title: 'Completed Reply Lookup (GetCachedReply)',
                      body: 'Keyed by createCacheID(clientId, seqNum). If the command was already applied, returns the cached hash immediately without appending.',
                    },
                    {
                      step: '03',
                      title: 'In-Flight Coalescing (requestsByCacheId)',
                      body: 'If a duplicate arrives while the entry is still replicating, appends its reply channel to the existing waiter slice so both callers receive the committed response.',
                    },
                    {
                      step: '04',
                      title: 'Log Append & Quorum Commit',
                      body: 'Novel requests append to StableStore, replicate via sendHeartbeats(), and fan out state-machine results once processLogEntry executes.',
                    },
                  ].map((item) => (
                    <li key={item.step} className="flex gap-3.5">
                      <span className="font-mono text-xs font-semibold text-[#1b5ca0] dark:text-[#6ba7e6] tabular-nums pt-0.5 shrink-0">
                        {item.step}
                      </span>
                      <div>
                        <div className="text-sm font-semibold text-[#111111] dark:text-white">
                          {item.title}
                        </div>
                        <p className="text-xs leading-relaxed text-[#111111]/65 dark:text-white/65 mt-0.5">
                          {item.body}
                        </p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Log Replication & Figure 8 Safety */}
        {activeTab === 'safety' && (
          <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/12 rounded-2xl p-6 sm:p-8 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 divide-y md:divide-y-0 md:divide-x divide-black/8 dark:divide-white/10">
              <div className="pt-0">
                <div className="text-xs font-mono font-semibold text-[#1b5ca0] dark:text-[#6ba7e6] mb-2">
                  01 · Term Initialization
                </div>
                <h3 className="text-base font-semibold text-[#111111] dark:text-white mb-2">
                  Opening No-Op Entry
                </h3>
                <p className="text-sm leading-relaxed text-[#111111]/70 dark:text-white/70">
                  Immediately upon winning an election, the new leader appends a blank{' '}
                  <code className="font-mono text-xs text-[#111111] dark:text-white">NO-OP</code>{' '}
                  entry in its current term. Committing this entry indirectly commits safe logs
                  from prior terms without violating Raft&rsquo;s Figure 8 invariant.
                </p>
              </div>

              <div className="pt-6 md:pt-0 md:pl-8">
                <div className="text-xs font-mono font-semibold text-[#1b5ca0] dark:text-[#6ba7e6] mb-2">
                  02 · Piggybacked Replication
                </div>
                <h3 className="text-base font-semibold text-[#111111] dark:text-white mb-2">
                  Unified Heartbeat Sync
                </h3>
                <p className="text-sm leading-relaxed text-[#111111]/70 dark:text-white/70">
                  Instead of separating empty heartbeats from log catch-up, each{' '}
                  <code className="font-mono text-xs text-[#111111] dark:text-white">
                    sendHeartbeats()
                  </code>{' '}
                  tick checks{' '}
                  <code className="font-mono text-xs text-[#111111] dark:text-white">
                    nextIndex[peerID]
                  </code>{' '}
                  and streams missing entries. On mismatch,{' '}
                  <code className="font-mono text-xs text-[#111111] dark:text-white">nextIndex</code>{' '}
                  backs off until logs converge.
                </p>
              </div>

              <div className="pt-6 md:pt-0 md:pl-8">
                <div className="text-xs font-mono font-semibold text-[#1b5ca0] dark:text-[#6ba7e6] mb-2">
                  03 · Quorum Commit Rule (§5.4.2)
                </div>
                <h3 className="text-base font-semibold text-[#111111] dark:text-white mb-2">
                  Current-Term Majority Check
                </h3>
                <p className="text-sm leading-relaxed text-[#111111]/70 dark:text-white/70">
                  The leader advances{' '}
                  <code className="font-mono text-xs text-[#111111] dark:text-white">
                    commitIndex
                  </code>{' '}
                  to{' '}
                  <code className="font-mono text-xs text-[#111111] dark:text-white">N</code>{' '}
                  without waiting for slow stragglers as soon as a majority satisfies{' '}
                  <code className="font-mono text-xs text-[#111111] dark:text-white">
                    matchIndex[i] &gt;= N
                  </code>{' '}
                  and{' '}
                  <code className="font-mono text-xs text-[#111111] dark:text-white">
                    log[N].term == currentTerm
                  </code>
                  .
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Packages & CLIs */}
        {activeTab === 'cli' && (
          <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/12 rounded-2xl p-6 sm:p-8 transition-colors">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              <div className="lg:col-span-5">
                <h3 className="text-base font-semibold text-[#111111] dark:text-white mb-2">
                  Repository Layout &amp; Binaries
                </h3>
                <p className="text-xs text-[#111111]/60 dark:text-white/60 mb-5">
                  Built in a reproducible Go 1.13 Docker workspace with three core packages and
                  three interactive CLI binaries.
                </p>

                <div className="space-y-2 mb-6">
                  {CLI_PRESETS.map((preset) => {
                    const active = activeCli === preset.id;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => setActiveCli(preset.id)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-lg border flex items-center justify-between gap-2 transition-colors cursor-pointer ${
                          active
                            ? 'bg-[#3e8ede]/10 dark:bg-[#3e8ede]/14 border-[#1b5ca0] dark:border-[#3e8ede] text-[#111111] dark:text-white'
                            : 'bg-[#faf9f6] dark:bg-[#1a1a1a] border-black/8 dark:border-white/10 text-[#111111]/75 dark:text-white/75 hover:border-black/20 dark:hover:border-white/20'
                        }`}
                      >
                        <span className="font-mono text-xs font-semibold">{preset.label}</span>
                        <span className="font-mono text-[11px] text-[#111111]/45 dark:text-white/45">
                          {preset.packagePath}
                        </span>
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-black/8 dark:border-white/10 text-xs text-[#111111]/70 dark:text-white/70 space-y-1.5 font-mono">
                  <div className="text-[#111111] dark:text-white font-semibold font-sans mb-2">
                    Core Packages
                  </div>
                  <div>raft/         — election, replication, state loops</div>
                  <div>hashmachine/  — deterministic hash-chain FSM</div>
                  <div>client/       — client RPC &amp; LeaderHint routing</div>
                </div>
              </div>

              <div className="lg:col-span-7 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-medium text-[#111111]/55 dark:text-white/55 mb-1">
                    {selectedCli.packagePath}
                  </div>
                  <h3 className="text-lg font-semibold text-[#111111] dark:text-white mb-2">
                    {selectedCli.label}
                  </h3>
                  <p className="text-sm leading-relaxed text-[#111111]/70 dark:text-white/70 mb-5">
                    {selectedCli.description}
                  </p>
                </div>

                <div className="bg-[#111111] dark:bg-[#0a0a0a] border border-black/10 dark:border-white/10 text-zinc-100 rounded-xl p-5 font-mono text-xs leading-relaxed overflow-x-auto">
                  <div className="text-zinc-400 pb-3 mb-3 border-b border-white/10">
                    $ {selectedCli.command}
                  </div>
                  <div className="space-y-1.5 text-zinc-200">
                    {selectedCli.sampleOutput.map((line) => (
                      <div key={line}>{line}</div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
