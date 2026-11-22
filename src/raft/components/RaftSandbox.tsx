import { useEffect, useMemo, useState } from 'react';
import {
  Check,
  CopyCheck,
  Crown,
  Database,
  Pause,
  Play,
  Power,
  PowerOff,
  Radio,
  RotateCcw,
  Scissors,
  Send,
  ShieldCheck,
  StepForward,
  Unplug,
} from 'lucide-react';
import {
  createInitialCluster,
  stepCluster,
  submitClientCommand,
  toggleNetworkPartition,
  toggleNodeCrash,
} from '../engine/raftSimulation';
import type { ClusterState, NodeRole, RaftNodeState } from '../types/raft';

interface RaftSandboxProps {
  isDark: boolean;
}

type StoryChapterId = 'election' | 'client' | 'duplicate' | 'partition';

interface StoryChapter {
  id: StoryChapterId;
  number: string;
  title: string;
  subtitle: string;
  takeaway: string;
}

const STORY_CHAPTERS: StoryChapter[] = [
  {
    id: 'election',
    number: '01',
    title: 'Leader Election',
    subtitle: 'Cold start with randomized timeouts',
    takeaway:
      'All 5 nodes boot as Followers. The first node whose randomTimeout() expires increments currentTerm, persists its self-vote to BoltStore, wins a 3/5 quorum, and appends its opening no-op entry.',
  },
  {
    id: 'client',
    number: '02',
    title: 'Client Write & Redirect',
    subtitle: 'Follower LeaderHint -> Quorum Hash',
    takeaway:
      'A client sends a hash command to a Follower. The Follower replies with LeaderHint; the client retries at the Leader, which piggybacks the entry onto sendHeartbeats() and applies it to hashmachine once 3/5 nodes confirm.',
  },
  {
    id: 'duplicate',
    number: '03',
    title: 'Duplicate Deduplication',
    subtitle: 'Idempotent replay via GetCachedReply',
    takeaway:
      'When networks drop replies, clients retry with the same (ClientID, SeqNum). Our cache layer checks GetCachedReply and requestsByCacheId so the command is never double-applied to the hash chain.',
  },
  {
    id: 'partition',
    number: '04',
    title: 'Split-Brain Partition',
    subtitle: 'Isolate leader (2 vs 3), then heal',
    takeaway:
      'Unlike classic Raft demos, our test suite uses network_policy.go to split clusters. Watch the 2-node minority leader stall while the 3-node majority elects a higher-term leader - then heal the partition to observe safe log reconciliation.',
  },
];

const NODE_POSITIONS: Record<number, { x: number; y: number }> = {
  1: { x: 145, y: 108 },
  2: { x: 145, y: 274 },
  3: { x: 408, y: 82 },
  4: { x: 466, y: 192 },
  5: { x: 408, y: 300 },
};

function roleStyles(role: NodeRole, isDark: boolean) {
  switch (role) {
    case 'leader':
      return {
        label: 'Leader',
        ring: isDark ? '#34d399' : '#059669',
        fill: isDark ? '#0b221a' : '#ecfdf5',
        text: 'text-emerald-700 dark:text-emerald-400',
        Icon: Crown,
      };
    case 'candidate':
      return {
        label: 'Candidate',
        ring: isDark ? '#fbbf24' : '#b45309',
        fill: isDark ? '#241b08' : '#fffbeb',
        text: 'text-amber-800 dark:text-amber-400',
        Icon: Radio,
      };
    case 'offline':
      return {
        label: 'Offline',
        ring: isDark ? '#fb7185' : '#e11d48',
        fill: isDark ? '#240b11' : '#fff1f2',
        text: 'text-rose-700 dark:text-rose-400',
        Icon: PowerOff,
      };
    default:
      return {
        label: 'Follower',
        ring: isDark ? '#6ba7e6' : '#1b5ca0',
        fill: isDark ? '#0d1a2a' : '#eff6ff',
        text: 'text-[#1b5ca0] dark:text-[#6ba7e6]',
        Icon: ShieldCheck,
      };
  }
}

const TERM_CHIP_STYLES: Record<number, string> = {
  1: 'bg-[#3e8ede]/10 dark:bg-[#3e8ede]/15 text-[#1b5ca0] dark:text-[#93c5fd] border-[#3e8ede]/35',
  2: 'bg-emerald-500/10 dark:bg-emerald-500/15 text-emerald-800 dark:text-emerald-300 border-emerald-500/35',
  3: 'bg-amber-500/10 dark:bg-amber-500/15 text-amber-900 dark:text-amber-300 border-amber-500/35',
  4: 'bg-violet-500/10 dark:bg-violet-500/15 text-violet-900 dark:text-violet-300 border-violet-500/35',
};

function termLogClass(term: number, committed: boolean): string {
  const base =
    TERM_CHIP_STYLES[((term - 1) % 4) + 1] ||
    'bg-black/5 dark:bg-white/5 text-[#111111] dark:text-white border-black/15 dark:border-white/15';
  return committed ? `${base} border-solid` : `${base} border-dashed opacity-75`;
}

export function RaftSandbox({ isDark }: RaftSandboxProps) {
  const [cluster, setCluster] = useState<ClusterState>(() => createInitialCluster(true));
  const [isRunning, setIsRunning] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [selectedNodeId, setSelectedNodeId] = useState<number>(1);
  const [activeChapter, setActiveChapter] = useState<StoryChapterId>('client');
  const [commandInput, setCommandInput] = useState('HASH("consensus-v2")');

  useEffect(() => {
    if (!isRunning) return;
    const interval = window.setInterval(() => {
      setCluster((prev) => stepCluster(prev, 70 * speed));
    }, 70);
    return () => window.clearInterval(interval);
  }, [isRunning, speed]);

  const selectedNode: RaftNodeState = useMemo(
    () => cluster.nodes.find((n) => n.id === selectedNodeId) ?? cluster.nodes[0],
    [cluster.nodes, selectedNodeId],
  );

  const currentLeader = useMemo(
    () => cluster.nodes.find((n) => n.role === 'leader'),
    [cluster.nodes],
  );

  const maxLogLen = useMemo(
    () => Math.max(4, ...cluster.nodes.map((n) => n.log.length)),
    [cluster.nodes],
  );

  const runStoryChapter = (chapterId: StoryChapterId) => {
    setActiveChapter(chapterId);
    setIsRunning(true);

    if (chapterId === 'election') {
      setCluster(createInitialCluster(false));
      setSelectedNodeId(1);
      return;
    }

    if (chapterId === 'client') {
      const fresh = createInitialCluster(true);
      const updated = submitClientCommand(fresh, 'HASH("tufts-cloud-118")', {
        targetNodeId: 3,
      });
      setCluster(updated);
      setSelectedNodeId(1);
      return;
    }

    if (chapterId === 'duplicate') {
      setCluster((prev) => {
        const hasLeader = prev.nodes.some((n) => n.role === 'leader');
        const base = hasLeader ? prev : createInitialCluster(true);
        return submitClientCommand(base, '', { duplicate: true });
      });
      return;
    }

    if (chapterId === 'partition') {
      const fresh = createInitialCluster(true);
      const split = toggleNetworkPartition(fresh);
      const withIsolatedWrite = submitClientCommand(split, 'HASH("minority-uncommitted")', {
        targetNodeId: split.minorityIds[0],
      });
      setCluster(withIsolatedWrite);
      setSelectedNodeId(split.minorityIds[0]);
    }
  };

  const handleSendCommand = (e: React.FormEvent) => {
    e.preventDefault();
    setCluster((prev) =>
      submitClientCommand(prev, commandInput, { targetNodeId: selectedNodeId }),
    );
    setCommandInput(`HASH("tx-${cluster.nextSeqNum + 1}")`);
  };

  const chapterMeta =
    STORY_CHAPTERS.find((c) => c.id === activeChapter) ?? STORY_CHAPTERS[0];

  const isNodeInMinority = (id: number) =>
    cluster.partitionActive && cluster.minorityIds.includes(id);

  const getNodePosition = (id: number): { x: number; y: number } => {
    if (!cluster.partitionActive) {
      return NODE_POSITIONS[id] ?? { x: 280, y: 190 };
    }
    const minIdx = cluster.minorityIds.indexOf(id);
    if (minIdx !== -1) {
      return minIdx === 0 ? { x: 138, y: 122 } : { x: 138, y: 264 };
    }
    const majNodes = cluster.nodes
      .filter((n) => !cluster.minorityIds.includes(n.id))
      .map((n) => n.id);
    const majIdx = majNodes.indexOf(id);
    const majSlots = [
      { x: 404, y: 92 },
      { x: 468, y: 196 },
      { x: 404, y: 296 },
    ];
    return majSlots[majIdx] ?? NODE_POSITIONS[id] ?? { x: 404, y: 196 };
  };

  return (
    <section
      id="simulator"
      className="py-20 border-b border-black/8 dark:border-white/10 transition-colors"
    >
      <div className="max-w-[1200px] mx-auto px-6">
        {/* Section Heading */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-2xl">
            <div className="text-xs font-medium text-[#1b5ca0] dark:text-[#6ba7e6] mb-2">
              01. Interactive Protocol Walkthrough
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-[#111111] dark:text-white">
              Watch the Cluster Survive Crashes &amp; Network Partitions
            </h2>
            <p className="text-[15px] leading-relaxed text-[#111111]/70 dark:text-white/70 mt-3">
              Standard Raft demos skip network splits. Click a guided story scenario below - or
              manually crash nodes, send hash-chain commands, and slice the network to watch our
              exact protocol rules play out in real time.
            </p>
          </div>

          {/* Playback Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setIsRunning((r) => !r)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-[#111111] dark:bg-white text-white dark:text-[#050505] hover:opacity-90 transition-opacity cursor-pointer whitespace-nowrap"
            >
              {isRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Pause</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" aria-hidden="true" />
                  <span>Resume</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRunning(false);
                setCluster((prev) => stepCluster(prev, 260));
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-[#141414] text-[#111111] dark:text-white border border-black/12 dark:border-white/15 hover:bg-[#f2efe9] dark:hover:bg-[#1e1e1e] transition-colors cursor-pointer whitespace-nowrap"
            >
              <StepForward className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Step</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setCluster(createInitialCluster(true));
                setSelectedNodeId(1);
                setIsRunning(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-white dark:bg-[#141414] text-[#111111] dark:text-white border border-black/12 dark:border-white/15 hover:bg-[#f2efe9] dark:hover:bg-[#1e1e1e] transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Reset</span>
            </button>
          </div>
        </div>

        {/* Guided Story Scenario Selector */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
          {STORY_CHAPTERS.map((ch) => {
            const active = activeChapter === ch.id;
            return (
              <button
                key={ch.id}
                type="button"
                onClick={() => runStoryChapter(ch.id)}
                className={`text-left p-4 rounded-xl border transition-all cursor-pointer ${
                  active
                    ? 'bg-white dark:bg-[#141414] border-[#1b5ca0] dark:border-[#3e8ede] shadow-xs'
                    : 'bg-white/70 dark:bg-[#141414]/65 border-black/8 dark:border-white/10 hover:border-black/20 dark:hover:border-white/25 hover:bg-white dark:hover:bg-[#141414]'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="text-xs font-mono font-semibold text-[#1b5ca0] dark:text-[#6ba7e6] tabular-nums">
                    {ch.number}
                  </span>
                  <span className="text-[11px] font-medium text-[#111111]/45 dark:text-white/45">
                    {active ? 'Active scenario' : 'Run scenario'}
                  </span>
                </div>
                <div className="text-sm font-semibold text-[#111111] dark:text-white">
                  {ch.title}
                </div>
                <div className="text-xs text-[#111111]/60 dark:text-white/60 mt-0.5">
                  {ch.subtitle}
                </div>
              </button>
            );
          })}
        </div>

        {/* Main 2-Zone Sandbox Stage */}
        <div className="bg-white dark:bg-[#141414] border border-black/10 dark:border-white/12 rounded-2xl overflow-hidden transition-colors">
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Left / Interactive Cluster Canvas (~65%) */}
            <div className="lg:col-span-8 p-6 border-b lg:border-b-0 lg:border-r border-black/8 dark:border-white/10 flex flex-col justify-between">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#111111]/60 dark:text-white/60">
                  <span className="font-semibold text-[#111111] dark:text-white">
                    5-Node Local Cluster
                  </span>
                  <span aria-hidden="true">·</span>
                  <span className="font-mono tabular-nums">Quorum: 3 / 5</span>
                  <span aria-hidden="true">·</span>
                  <span>
                    {cluster.partitionActive
                      ? 'Network Split (2 vs 3)'
                      : currentLeader
                        ? `Current Leader: Node ${currentLeader.id} (Term ${currentLeader.currentTerm})`
                        : 'Election in progress'}
                  </span>
                </div>

                {/* Speed Slider */}
                <label className="flex items-center gap-2 text-xs text-[#111111]/70 dark:text-white/70">
                  <span>Speed:</span>
                  <input
                    type="range"
                    min={0.5}
                    max={2}
                    step={0.25}
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-20 accent-[#3e8ede] cursor-pointer"
                    aria-label="Simulation speed"
                  />
                  <span className="font-mono tabular-nums w-10 text-right text-[#111111] dark:text-white font-medium">
                    {speed.toFixed(2)}×
                  </span>
                </label>
              </div>

              {/* SVG Cluster Graph */}
              <div className="relative w-full bg-[#faf9f6] dark:bg-[#0a0a0a] rounded-xl border border-black/8 dark:border-white/10 overflow-hidden transition-colors">
                <svg
                  viewBox="0 0 560 380"
                  className="w-full h-auto block select-none"
                  role="img"
                  aria-label="Interactive 5-node Raft cluster topology showing live RPC packets and network partitions"
                >
                  <defs>
                    <pattern
                      id="clusterGrid"
                      width="24"
                      height="24"
                      patternUnits="userSpaceOnUse"
                    >
                      <circle
                        cx="1"
                        cy="1"
                        r="1"
                        fill={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(17,17,17,0.12)'}
                      />
                    </pattern>
                  </defs>
                  <rect width="560" height="380" fill="url(#clusterGrid)" />

                  {/* Partition Zone Shading & Divider Wall */}
                  {cluster.partitionActive && (
                    <g>
                      <rect
                        x="12"
                        y="12"
                        width="246"
                        height="356"
                        rx="12"
                        fill={isDark ? '#4c0519' : '#fff1f2'}
                        fillOpacity={isDark ? '0.32' : '0.65'}
                      />
                      <rect
                        x="278"
                        y="12"
                        width="270"
                        height="356"
                        rx="12"
                        fill={isDark ? '#022c22' : '#ecfdf5'}
                        fillOpacity={isDark ? '0.32' : '0.65'}
                      />
                      <line
                        x1="268"
                        y1="16"
                        x2="268"
                        y2="364"
                        stroke={isDark ? '#fb7185' : '#e11d48'}
                        strokeWidth="2.25"
                        strokeDasharray="7 6"
                      />
                      <text
                        x="135"
                        y="32"
                        textAnchor="middle"
                        fill={isDark ? '#fda4af' : '#be123c'}
                        className="text-[11px] font-semibold"
                      >
                        Minority Partition (2 nodes · No Quorum)
                      </text>
                      <text
                        x="413"
                        y="32"
                        textAnchor="middle"
                        fill={isDark ? '#6ee7b7' : '#047857'}
                        className="text-[11px] font-semibold"
                      >
                        Majority Partition (3 nodes · Quorum)
                      </text>
                    </g>
                  )}

                  {/* Peer Mesh Links */}
                  {cluster.nodes.map((a, idxA) =>
                    cluster.nodes.slice(idxA + 1).map((b) => {
                      const posA = getNodePosition(a.id);
                      const posB = getNodePosition(b.id);
                      const blocked =
                        a.role === 'offline' ||
                        b.role === 'offline' ||
                        (cluster.partitionActive && a.partitionGroup !== b.partitionGroup);

                      return (
                        <line
                          key={`link-${a.id}-${b.id}`}
                          x1={posA.x}
                          y1={posA.y}
                          x2={posB.x}
                          y2={posB.y}
                          stroke={
                            blocked
                              ? isDark
                                ? 'rgba(251,113,133,0.28)'
                                : '#fecdd3'
                              : isDark
                                ? 'rgba(255,255,255,0.16)'
                                : '#cbd5e1'
                          }
                          strokeWidth={blocked ? 1 : 1.25}
                          strokeDasharray={blocked ? '4 5' : undefined}
                        />
                      );
                    }),
                  )}

                  {/* In-Flight RPC Packets */}
                  {cluster.packets.map((pkt) => {
                    const from = getNodePosition(pkt.fromId);
                    const to = getNodePosition(pkt.toId);
                    const x = from.x + (to.x - from.x) * pkt.progress;
                    const y = from.y + (to.y - from.y) * pkt.progress;

                    const color = pkt.dropped
                      ? isDark
                        ? '#fb7185'
                        : '#e11d48'
                      : pkt.kind === 'RequestVote' || pkt.kind === 'RequestVoteReply'
                        ? isDark
                          ? '#fbbf24'
                          : '#d97706'
                        : pkt.kind === 'ClientRedirect'
                          ? isDark
                            ? '#a78bfa'
                            : '#7c3aed'
                          : pkt.kind === 'AppendEntries'
                            ? isDark
                              ? '#34d399'
                              : '#059669'
                            : isDark
                              ? '#6ba7e6'
                              : '#1b5ca0';

                    return (
                      <g key={pkt.id} transform={`translate(${x}, ${y})`}>
                        <circle
                          r={pkt.dropped ? 5.5 : 5}
                          fill={color}
                          stroke={isDark ? '#0a0a0a' : '#ffffff'}
                          strokeWidth="1.75"
                        />
                        {pkt.dropped && pkt.progress > 0.36 && (
                          <text
                            y="-10"
                            textAnchor="middle"
                            fill={isDark ? '#fda4af' : '#be123c'}
                            className="text-[9px] font-mono font-semibold"
                          >
                            DROPPED
                          </text>
                        )}
                      </g>
                    );
                  })}

                  {/* Cluster Nodes */}
                  {cluster.nodes.map((node) => {
                    const pos = getNodePosition(node.id);
                    const styles = roleStyles(node.role, isDark);
                    const isSelected = node.id === selectedNodeId;
                    const radius = 34;
                    const circumference = 2 * Math.PI * (radius + 5);
                    const timerRatio =
                      node.role === 'follower' || node.role === 'candidate'
                        ? Math.min(1, node.electionElapsedMs / node.electionTimeoutMs)
                        : node.role === 'leader'
                          ? Math.min(1, node.heartbeatElapsedMs / 1050)
                          : 0;
                    const dashOffset = circumference * (1 - timerRatio);

                    return (
                      <g
                        key={node.id}
                        transform={`translate(${pos.x}, ${pos.y})`}
                        onClick={() => setSelectedNodeId(node.id)}
                        className="cursor-pointer"
                        role="button"
                        tabIndex={0}
                        aria-label={`Inspect ${node.label}, ${styles.label}, Term ${node.currentTerm}`}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault();
                            setSelectedNodeId(node.id);
                          }
                        }}
                      >
                        {isSelected && (
                          <circle
                            r={radius + 11}
                            fill="none"
                            stroke={isDark ? '#ffffff' : '#111111'}
                            strokeWidth="1.5"
                            strokeDasharray="3 3"
                          />
                        )}

                        <circle
                          r={radius + 5}
                          fill="none"
                          stroke={isDark ? 'rgba(255,255,255,0.12)' : 'rgba(17,17,17,0.12)'}
                          strokeWidth="3"
                        />
                        {node.role !== 'offline' && (
                          <circle
                            r={radius + 5}
                            fill="none"
                            stroke={styles.ring}
                            strokeWidth="3"
                            strokeDasharray={circumference}
                            strokeDashoffset={dashOffset}
                            strokeLinecap="round"
                            transform="rotate(-90)"
                          />
                        )}

                        <circle
                          r={radius}
                          fill={styles.fill}
                          stroke={styles.ring}
                          strokeWidth={isSelected ? '2.5' : '1.75'}
                        />

                        <text
                          y="-9"
                          textAnchor="middle"
                          fill={isDark ? '#ffffff' : '#111111'}
                          className="text-[12px] font-bold"
                        >
                          {node.label}
                        </text>
                        <text
                          y="6"
                          textAnchor="middle"
                          fill={styles.ring}
                          className="text-[10px] font-mono font-semibold"
                        >
                          {styles.label}
                        </text>
                        <text
                          y="20"
                          textAnchor="middle"
                          fill={isDark ? 'rgba(255,255,255,0.65)' : 'rgba(17,17,17,0.6)'}
                          className="text-[10px] font-mono"
                        >
                          T{node.currentTerm} · c{node.commitIndex}
                        </text>

                        <text
                          y={radius + 20}
                          textAnchor="middle"
                          fill={isDark ? 'rgba(255,255,255,0.55)' : 'rgba(17,17,17,0.55)'}
                          className="text-[10px] font-mono"
                        >
                          :{node.port}
                          {isNodeInMinority(node.id) ? ' (isolated)' : ''}
                        </text>
                      </g>
                    );
                  })}
                </svg>

                {/* Legend bar */}
                <div className="px-4 py-2.5 bg-white dark:bg-[#141414] border-t border-black/8 dark:border-white/10 flex flex-wrap items-center justify-between gap-3 text-[11px] text-[#111111]/65 dark:text-white/65">
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400" />
                      AppendEntries / Heartbeat
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1b5ca0] dark:bg-[#6ba7e6]" />
                      Ack Reply
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                      RequestVote
                    </span>
                    <span className="inline-flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-600 dark:bg-rose-400" />
                      Dropped by Partition
                    </span>
                  </div>
                  <span className="text-[#111111]/45 dark:text-white/45">
                    Click any node to inspect state
                  </span>
                </div>
              </div>

              {/* Contextual Story Callout for Active Scenario */}
              <div className="mt-4 pt-4 border-t border-black/8 dark:border-white/10">
                <div className="text-xs leading-relaxed text-[#111111]/70 dark:text-white/70">
                  <span className="font-semibold text-[#111111] dark:text-white">
                    Scenario {chapterMeta.number} ({chapterMeta.title}):{' '}
                  </span>
                  {chapterMeta.takeaway}
                </div>
              </div>
            </div>

            {/* Right / Control & Node Inspector Deck (~35%) */}
            <div className="lg:col-span-4 p-6 flex flex-col justify-between gap-6 bg-white dark:bg-[#141414]">
              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-semibold text-[#111111] dark:text-white mb-3">
                    Client &amp; Fault Controls
                  </h3>

                  {/* Client Command Form */}
                  <form onSubmit={handleSendCommand} className="space-y-2 mb-3">
                    <label
                      htmlFor="raft-client-cmd"
                      className="block text-xs text-[#111111]/60 dark:text-white/60"
                    >
                      Send command to{' '}
                      <span className="font-mono font-medium text-[#111111] dark:text-white">
                        {selectedNode.label}
                      </span>{' '}
                      ({selectedNode.role === 'leader' ? 'direct to leader' : 'triggers LeaderHint'}):
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="raft-client-cmd"
                        type="text"
                        value={commandInput}
                        onChange={(e) => setCommandInput(e.target.value)}
                        className="flex-1 min-w-0 px-3 py-2 text-xs font-mono text-[#111111] dark:text-white bg-[#faf9f6] dark:bg-[#1e1e1e] border border-black/12 dark:border-white/15 rounded-lg focus:outline-none focus:border-[#3e8ede]"
                      />
                      <button
                        type="submit"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-[#1b5ca0] dark:bg-[#3e8ede] rounded-lg hover:bg-[#164b84] dark:hover:bg-[#579ee6] transition-colors cursor-pointer whitespace-nowrap shrink-0"
                      >
                        <Send className="w-3.5 h-3.5" aria-hidden="true" />
                        <span>Write</span>
                      </button>
                    </div>
                  </form>

                  {/* Fault & Deduplication Buttons */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setCluster((prev) =>
                          submitClientCommand(prev, '', { duplicate: true }),
                        )
                      }
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#111111] dark:text-white bg-[#f2efe9] dark:bg-[#1e1e1e] border border-black/10 dark:border-white/12 rounded-lg hover:bg-[#e8e3da] dark:hover:bg-[#27272a] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      <CopyCheck
                        className="w-3.5 h-3.5 text-[#1b5ca0] dark:text-[#6ba7e6] shrink-0"
                        aria-hidden="true"
                      />
                      <span>Replay Duplicate</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => setCluster((prev) => toggleNetworkPartition(prev))}
                      className={`inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-colors cursor-pointer whitespace-nowrap ${
                        cluster.partitionActive
                          ? 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700'
                          : 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/50 hover:bg-rose-100 dark:hover:bg-rose-950'
                      }`}
                    >
                      {cluster.partitionActive ? (
                        <>
                          <Unplug className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>Heal Network</span>
                        </>
                      ) : (
                        <>
                          <Scissors className="w-3.5 h-3.5 shrink-0" aria-hidden="true" />
                          <span>Split Network</span>
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        setCluster((prev) => toggleNodeCrash(prev, selectedNode.id))
                      }
                      className="col-span-2 inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-[#111111] dark:text-white bg-white dark:bg-[#141414] border border-black/12 dark:border-white/15 rounded-lg hover:bg-[#f2efe9] dark:hover:bg-[#1e1e1e] transition-colors cursor-pointer whitespace-nowrap"
                    >
                      {selectedNode.role === 'offline' ? (
                        <>
                          <Power
                            className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span>Restart {selectedNode.label} from BoltDB</span>
                        </>
                      ) : (
                        <>
                          <PowerOff
                            className="w-3.5 h-3.5 text-rose-600 dark:text-rose-400 shrink-0"
                            aria-hidden="true"
                          />
                          <span>Crash {selectedNode.label} (gracefulExit)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Selected Node Struct Inspector */}
                <div className="pt-4 border-t border-black/8 dark:border-white/10">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <Database
                        className="w-4 h-4 text-[#111111]/45 dark:text-white/45"
                        aria-hidden="true"
                      />
                      <h3 className="text-sm font-semibold text-[#111111] dark:text-white">
                        {selectedNode.label} State Inspector
                      </h3>
                    </div>
                    <span
                      className={`text-xs font-semibold ${
                        roleStyles(selectedNode.role, isDark).text
                      }`}
                    >
                      {roleStyles(selectedNode.role, isDark).label}
                    </span>
                  </div>

                  <dl className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs font-mono">
                    <div className="flex justify-between border-b border-black/6 dark:border-white/8 pb-1">
                      <dt className="text-[#111111]/55 dark:text-white/55">currentTerm</dt>
                      <dd className="font-semibold text-[#111111] dark:text-white tabular-nums">
                        {selectedNode.currentTerm}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-black/6 dark:border-white/8 pb-1">
                      <dt className="text-[#111111]/55 dark:text-white/55">votedFor</dt>
                      <dd className="font-semibold text-[#111111] dark:text-white tabular-nums">
                        {selectedNode.votedFor ? `Node ${selectedNode.votedFor}` : 'nil'}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-black/6 dark:border-white/8 pb-1">
                      <dt className="text-[#111111]/55 dark:text-white/55">commitIndex</dt>
                      <dd className="font-semibold text-[#111111] dark:text-white tabular-nums">
                        {selectedNode.commitIndex}
                      </dd>
                    </div>
                    <div className="flex justify-between border-b border-black/6 dark:border-white/8 pb-1">
                      <dt className="text-[#111111]/55 dark:text-white/55">lastApplied</dt>
                      <dd className="font-semibold text-[#111111] dark:text-white tabular-nums">
                        {selectedNode.lastApplied}
                      </dd>
                    </div>
                    <div className="col-span-2 flex justify-between border-b border-black/6 dark:border-white/8 pb-1">
                      <dt className="text-[#111111]/55 dark:text-white/55">hashmachine</dt>
                      <dd className="font-semibold text-[#1b5ca0] dark:text-[#6ba7e6] tabular-nums">
                        {selectedNode.hashChainHead}
                      </dd>
                    </div>
                    <div className="col-span-2 flex justify-between pb-0.5">
                      <dt className="text-[#111111]/55 dark:text-white/55">cachedReplies</dt>
                      <dd className="font-semibold text-[#111111] dark:text-white tabular-nums">
                        {Object.keys(selectedNode.cachedReplies).length} entries
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              {/* Live Protocol Event Feed */}
              <div className="pt-4 border-t border-black/8 dark:border-white/10">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-xs font-semibold text-[#111111] dark:text-white">
                    Recent Protocol Events
                  </h3>
                  <span className="text-[11px] font-mono text-[#111111]/45 dark:text-white/45 tabular-nums">
                    tick {cluster.tick}
                  </span>
                </div>
                <div className="space-y-2 max-h-[175px] overflow-y-auto pr-1">
                  {cluster.events.slice(0, 8).map((ev) => (
                    <div
                      key={ev.id}
                      className="text-xs pb-2 border-b border-black/6 dark:border-white/8 last:border-b-0 last:pb-0"
                    >
                      <div className="font-medium text-[#111111] dark:text-white/90 leading-snug">
                        {ev.message}
                      </div>
                      {ev.detail && (
                        <div className="text-[11px] text-[#111111]/55 dark:text-white/55 mt-0.5 leading-snug">
                          {ev.detail}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Full-Width Replicated StableStore Log & HashMachine Matrix */}
          <div className="border-t border-black/8 dark:border-white/10 bg-[#faf9f6] dark:bg-[#0e0e0e] px-6 py-5 transition-colors">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-3.5">
              <div>
                <h3 className="text-sm font-semibold text-[#111111] dark:text-white">
                  Replicated StableStore Logs &amp; Deterministic Hash Chain
                </h3>
                <p className="text-xs text-[#111111]/60 dark:text-white/60">
                  Solid slots are committed to the state machine; dashed slots are uncommitted and
                  may be truncated after partition healing.
                </p>
              </div>
              {cluster.lastClientRequest && (
                <div className="text-xs font-mono text-[#111111]/65 dark:text-white/65 tabular-nums">
                  Last client ({cluster.lastClientRequest.cacheId}):{' '}
                  <span className="font-semibold text-[#111111] dark:text-white">
                    {cluster.lastClientRequest.status}
                  </span>
                  {cluster.lastClientRequest.resultHash
                    ? ` -> ${cluster.lastClientRequest.resultHash}`
                    : ''}
                </div>
              )}
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[11px] font-mono text-[#111111]/55 dark:text-white/55 border-b border-black/8 dark:border-white/10">
                    <th className="py-2 pr-4 font-medium w-36">Node / Role</th>
                    <th className="py-2 pr-4 font-medium w-36">Hash Head</th>
                    <th className="py-2 font-medium">
                      BoltStore Log Entries (Index 1..{maxLogLen})
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/6 dark:divide-white/8">
                  {cluster.nodes.map((node) => {
                    const styles = roleStyles(node.role, isDark);
                    const isSelected = node.id === selectedNodeId;
                    return (
                      <tr
                        key={node.id}
                        onClick={() => setSelectedNodeId(node.id)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-[#3e8ede]/8 dark:bg-[#3e8ede]/12'
                            : 'hover:bg-black/[0.02] dark:hover:bg-white/[0.03]'
                        }`}
                      >
                        <td className="py-2.5 pr-4 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-[#111111] dark:text-white font-mono">
                              N{node.id}
                            </span>
                            <span className={`text-xs font-medium ${styles.text}`}>
                              {styles.label}
                            </span>
                            <span className="text-[11px] font-mono text-[#111111]/45 dark:text-white/45 tabular-nums">
                              T{node.currentTerm}
                            </span>
                          </div>
                        </td>
                        <td className="py-2.5 pr-4 whitespace-nowrap font-mono text-xs text-[#111111]/80 dark:text-white/80 tabular-nums">
                          {node.hashChainHead}
                        </td>
                        <td className="py-2.5">
                          <div className="flex items-center gap-1.5">
                            {Array.from({ length: maxLogLen }, (_, idx) => {
                              const slotIndex = idx + 1;
                              const entry = node.log.find((e) => e.index === slotIndex);
                              if (!entry) {
                                return (
                                  <div
                                    key={slotIndex}
                                    className="h-8 min-w-[92px] px-2 rounded-md border border-dashed border-black/10 dark:border-white/12 bg-white/50 dark:bg-white/[0.02] flex items-center justify-center text-[10px] font-mono text-[#111111]/30 dark:text-white/25 tabular-nums"
                                  >
                                    #{slotIndex} empty
                                  </div>
                                );
                              }
                              const committed = slotIndex <= node.commitIndex;
                              return (
                                <div
                                  key={slotIndex}
                                  title={`Index #${entry.index} | Term ${entry.term} | ${entry.command} | ${
                                    committed ? 'Committed' : 'Uncommitted'
                                  }`}
                                  className={`h-8 min-w-[116px] max-w-[152px] px-2 rounded-md border flex items-center justify-between gap-1.5 text-[11px] font-mono ${termLogClass(
                                    entry.term,
                                    committed,
                                  )}`}
                                >
                                  <span className="truncate">
                                    #{entry.index}·T{entry.term}{' '}
                                    {entry.type === 'HASH'
                                      ? entry.command.replace('HASH("', '').replace('")', '')
                                      : entry.type.toLowerCase()}
                                  </span>
                                  {committed && (
                                    <Check
                                      className="w-3 h-3 shrink-0 text-emerald-700 dark:text-emerald-400"
                                      aria-hidden="true"
                                    />
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
