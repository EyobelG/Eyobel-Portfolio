import type {
  ClusterEvent,
  ClusterState,
  InFlightPacket,
  LogEntry,
  RaftNodeState,
} from '../types/raft';

const NODE_COUNT = 5;
const HEARTBEAT_INTERVAL_MS = 1050;
const BASE_ELECTION_MIN_MS = 2300;
const BASE_ELECTION_MAX_MS = 3900;
const PACKET_TRAVEL_MS = 560;
const GENESIS_HASH = '0x8f4a...c10e';

let packetSeq = 1;
let eventSeq = 1;

export function deterministicHash(prevHash: string, input: string): string {
  const combined = `${prevHash}:${input}`;
  let h1 = 0xdeadbeef ^ combined.length;
  let h2 = 0x41c6ce57 ^ combined.length;
  for (let i = 0; i < combined.length; i++) {
    const ch = combined.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 =
    Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^
    Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 =
    Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^
    Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  const hex1 = (h1 >>> 0).toString(16).padStart(8, '0');
  const hex2 = (h2 >>> 0).toString(16).padStart(8, '0');
  return `0x${hex1.slice(0, 4)}…${hex2.slice(4, 8)}`;
}

function randomElectionTimeout(biasIndex?: number): number {
  if (typeof biasIndex === 'number') {
    const baseOffsets = [2100, 2950, 3400, 2600, 3750];
    return baseOffsets[biasIndex % baseOffsets.length];
  }
  return Math.round(
    BASE_ELECTION_MIN_MS +
      Math.random() * (BASE_ELECTION_MAX_MS - BASE_ELECTION_MIN_MS),
  );
}

function pushEvent(
  events: ClusterEvent[],
  tick: number,
  category: ClusterEvent['category'],
  message: string,
  detail?: string,
): ClusterEvent[] {
  const next: ClusterEvent = {
    id: `ev-${eventSeq++}`,
    tick,
    category,
    message,
    detail,
  };
  return [next, ...events].slice(0, 36);
}

function getLastLogInfo(node: RaftNodeState): { index: number; term: number } {
  if (node.log.length === 0) return { index: 0, term: 0 };
  const last = node.log[node.log.length - 1];
  return { index: last.index, term: last.term };
}

function canCommunicate(
  state: ClusterState,
  a: RaftNodeState,
  b: RaftNodeState,
): boolean {
  if (a.role === 'offline' || b.role === 'offline') return false;
  if (!state.partitionActive) return true;
  return a.partitionGroup === b.partitionGroup;
}

function applyCommittedEntries(
  node: RaftNodeState,
  state: ClusterState,
): { node: RaftNodeState; events: ClusterEvent[]; clientReply?: { cacheId: string; hash: string } } {
  let updated = {
    ...node,
    cachedReplies: { ...node.cachedReplies },
    pendingCacheWaiters: { ...node.pendingCacheWaiters },
  };
  let events = state.events;
  let clientReply: { cacheId: string; hash: string } | undefined;

  while (updated.lastApplied < updated.commitIndex) {
    const nextIdx = updated.lastApplied + 1;
    const entry = updated.log.find((e) => e.index === nextIdx);
    if (!entry) break;
    updated.lastApplied = nextIdx;

    if (entry.type === 'HASH') {
      const nextHash = deterministicHash(updated.hashChainHead, entry.command);
      updated.hashChainHead = nextHash;
      if (entry.cacheId) {
        updated.cachedReplies[entry.cacheId] = nextHash;
        const waiters = updated.pendingCacheWaiters[entry.cacheId] || 0;
        if (waiters > 0) {
          delete updated.pendingCacheWaiters[entry.cacheId];
          clientReply = { cacheId: entry.cacheId, hash: nextHash };
          events = pushEvent(
            events,
            state.tick,
            'commit',
            `Node ${updated.id} applied log #${entry.index} -> ${nextHash}`,
            waiters > 1
              ? `processLogEntry replied to ${waiters} coalesced client channels (${entry.cacheId})`
              : `processLogEntry committed to hashmachine & cached reply (${entry.cacheId})`,
          );
        }
      }
    } else if (entry.type === 'CLIENT_REG' && entry.cacheId) {
      updated.cachedReplies[entry.cacheId] = `client-${entry.index}`;
    }
  }

  return { node: updated, events, clientReply };
}

export function createInitialCluster(preElected = true): ClusterState {
  const nodes: RaftNodeState[] = [];
  const initEntries: LogEntry[] = preElected
    ? [
        { index: 1, term: 1, type: 'NOOP', command: 'no-op (term 1)' },
        {
          index: 2,
          term: 1,
          type: 'CLIENT_REG',
          command: 'register client #1',
          cacheId: 'c1:0',
        },
        {
          index: 3,
          term: 1,
          type: 'HASH',
          command: 'HASH("tufts-cs118")',
          cacheId: 'c1:1',
        },
      ]
    : [];

  const genesisHash = preElected
    ? deterministicHash(GENESIS_HASH, 'HASH("tufts-cs118")')
    : GENESIS_HASH;

  for (let i = 1; i <= NODE_COUNT; i++) {
    const isLeader = preElected && i === 1;
    const nextIndex: Record<number, number> = {};
    const matchIndex: Record<number, number> = {};
    for (let j = 1; j <= NODE_COUNT; j++) {
      if (j !== i) {
        nextIndex[j] = initEntries.length + 1;
        matchIndex[j] = initEntries.length;
      }
    }

    nodes.push({
      id: i,
      port: 5000 + i,
      label: `Node ${i}`,
      role: isLeader ? 'leader' : 'follower',
      currentTerm: preElected ? 1 : 0,
      votedFor: preElected ? 1 : null,
      votesReceived: isLeader ? [1, 2, 3, 4, 5] : [],
      log: initEntries.map((e) => ({ ...e })),
      commitIndex: preElected ? 3 : 0,
      lastApplied: preElected ? 3 : 0,
      nextIndex,
      matchIndex,
      electionElapsedMs: 0,
      electionTimeoutMs: randomElectionTimeout(i - 1),
      heartbeatElapsedMs: isLeader ? 400 : 0,
      knownLeaderId: preElected ? 1 : null,
      hashChainHead: genesisHash,
      cachedReplies: preElected ? { 'c1:1': genesisHash, 'c1:0': 'client-2' } : {},
      pendingCacheWaiters: {},
      partitionGroup: 0,
    });
  }

  return {
    tick: 0,
    nodes,
    packets: [],
    events: preElected
      ? [
          {
            id: `ev-${eventSeq++}`,
            tick: 0,
            category: 'commit',
            message: 'Cluster ready: Node 1 elected Leader in Term 1',
            detail: `Log entries #1–#3 committed across 5/5 nodes. Hash head: ${genesisHash}`,
          },
        ]
      : [
          {
            id: `ev-${eventSeq++}`,
            tick: 0,
            category: 'election',
            message: 'Cold boot: 5 followers waiting on randomTimeout()',
            detail: 'First node whose election timer expires transitions via return doCandidate',
          },
        ],
    partitionActive: false,
    minorityIds: [],
    lastClientRequest: preElected
      ? {
          clientId: 1,
          seqNum: 1,
          command: 'HASH("tufts-cs118")',
          cacheId: 'c1:1',
          status: 'committed',
          resultHash: genesisHash,
        }
      : null,
    nextSeqNum: 2,
  };
}

function createHeartbeatPackets(
  state: ClusterState,
  leader: RaftNodeState,
): InFlightPacket[] {
  const out: InFlightPacket[] = [];
  for (const peer of state.nodes) {
    if (peer.id === leader.id) continue;
    const nextIdx = leader.nextIndex[peer.id] ?? leader.log.length + 1;
    const prevLogIndex = Math.max(0, nextIdx - 1);
    const prevEntry = leader.log.find((e) => e.index === prevLogIndex);
    const prevLogTerm = prevEntry ? prevEntry.term : 0;
    const entries = leader.log.filter((e) => e.index >= nextIdx).map((e) => ({ ...e }));
    const dropped = !canCommunicate(state, leader, peer);

    out.push({
      id: `pkt-${packetSeq++}`,
      fromId: leader.id,
      toId: peer.id,
      kind: 'AppendEntries',
      term: leader.currentTerm,
      progress: 0,
      dropped,
      summary:
        entries.length > 0
          ? `AppendEntries (+${entries.length} log)`
          : `Heartbeat T${leader.currentTerm}`,
      payload: {
        prevLogIndex,
        prevLogTerm,
        entries,
        leaderCommit: leader.commitIndex,
      },
    });
  }
  return out;
}

export function stepCluster(prev: ClusterState, dtMs: number): ClusterState {
  let state: ClusterState = {
    ...prev,
    tick: prev.tick + 1,
    nodes: prev.nodes.map((n) => ({
      ...n,
      nextIndex: { ...n.nextIndex },
      matchIndex: { ...n.matchIndex },
      votesReceived: [...n.votesReceived],
      cachedReplies: { ...n.cachedReplies },
      pendingCacheWaiters: { ...n.pendingCacheWaiters },
    })),
    packets: [],
    events: prev.events,
  };

  const spawnedPackets: InFlightPacket[] = [];

  // 1. Advance node timers
  for (let i = 0; i < state.nodes.length; i++) {
    const node = state.nodes[i];
    if (node.role === 'offline') continue;

    if (node.role === 'leader') {
      node.heartbeatElapsedMs += dtMs;
      if (node.heartbeatElapsedMs >= HEARTBEAT_INTERVAL_MS) {
        node.heartbeatElapsedMs = 0;
        spawnedPackets.push(...createHeartbeatPackets(state, node));
      }
    } else {
      node.electionElapsedMs += dtMs;
      if (node.electionElapsedMs >= node.electionTimeoutMs) {
        // Transition Follower/Candidate -> Candidate
        node.role = 'candidate';
        node.currentTerm += 1;
        node.votedFor = node.id;
        node.votesReceived = [node.id];
        node.knownLeaderId = null;
        node.electionElapsedMs = 0;
        node.electionTimeoutMs = randomElectionTimeout();

        const lastLog = getLastLogInfo(node);
        state.events = pushEvent(
          state.events,
          state.tick,
          'election',
          `Node ${node.id} timed out -> Candidate (Term ${node.currentTerm})`,
          `Persisted term & self-vote in BoltStore; broadcasting RequestVote RPCs`,
        );

        for (const peer of state.nodes) {
          if (peer.id === node.id) continue;
          const dropped = !canCommunicate(state, node, peer);
          spawnedPackets.push({
            id: `pkt-${packetSeq++}`,
            fromId: node.id,
            toId: peer.id,
            kind: 'RequestVote',
            term: node.currentTerm,
            progress: 0,
            dropped,
            summary: `RequestVote T${node.currentTerm}`,
            payload: {
              lastLogIndex: lastLog.index,
              lastLogTerm: lastLog.term,
            },
          });
        }
      }
    }
  }

  // 2. Advance existing packets and handle arrivals
  const remainingPackets: InFlightPacket[] = [];
  const stepFraction = dtMs / PACKET_TRAVEL_MS;

  for (const pkt of prev.packets) {
    const nextProgress = pkt.progress + stepFraction;
    if (pkt.dropped && nextProgress >= 0.52) {
      // Dropped mid-flight at partition wall or offline target
      continue;
    }
    if (nextProgress < 1) {
      remainingPackets.push({ ...pkt, progress: nextProgress });
      continue;
    }

    // Packet arrived at target
    const targetIdx = state.nodes.findIndex((n) => n.id === pkt.toId);
    const senderNode = state.nodes.find((n) => n.id === pkt.fromId);
    if (targetIdx === -1) continue;
    const target = state.nodes[targetIdx];
    if (target.role === 'offline') continue;
    if (senderNode && state.partitionActive && target.partitionGroup !== senderNode.partitionGroup) {
      continue;
    }

    // Universal Raft Rule (§5.1): higher term forces step-down to follower
    if (pkt.term > target.currentTerm) {
      const wasLeader = target.role === 'leader';
      target.currentTerm = pkt.term;
      target.role = 'follower';
      target.votedFor = null;
      target.votesReceived = [];
      target.electionElapsedMs = 0;
      if (wasLeader) {
        state.events = pushEvent(
          state.events,
          state.tick,
          'election',
          `Node ${target.id} stepped down to Follower (saw Term ${pkt.term})`,
          'doLeader() returned doFollower upon discovering higher term',
        );
      }
    }

    if (pkt.kind === 'RequestVote') {
      const candLastIndex = pkt.payload?.lastLogIndex ?? 0;
      const candLastTerm = pkt.payload?.lastLogTerm ?? 0;
      const myLast = getLastLogInfo(target);
      const logUpToDate =
        candLastTerm > myLast.term ||
        (candLastTerm === myLast.term && candLastIndex >= myLast.index);

      const grant =
        pkt.term >= target.currentTerm &&
        (target.votedFor === null || target.votedFor === pkt.fromId) &&
        logUpToDate &&
        target.role === 'follower';

      if (grant) {
        target.votedFor = pkt.fromId;
        target.electionElapsedMs = 0;
      }

      const sender = state.nodes.find((n) => n.id === pkt.fromId);
      const dropped = sender ? !canCommunicate(state, target, sender) : true;
      spawnedPackets.push({
        id: `pkt-${packetSeq++}`,
        fromId: target.id,
        toId: pkt.fromId,
        kind: 'RequestVoteReply',
        term: target.currentTerm,
        progress: 0,
        dropped,
        summary: grant ? `VoteGranted T${target.currentTerm}` : `VoteDenied`,
        payload: { voteGranted: grant },
      });
    } else if (pkt.kind === 'RequestVoteReply') {
      if (
        target.role === 'candidate' &&
        pkt.term === target.currentTerm &&
        pkt.payload?.voteGranted
      ) {
        if (!target.votesReceived.includes(pkt.fromId)) {
          target.votesReceived.push(pkt.fromId);
        }
        const majority = Math.floor(NODE_COUNT / 2) + 1;
        if (target.votesReceived.length >= majority) {
          // Elected leader!
          target.role = 'leader';
          target.knownLeaderId = target.id;
          target.heartbeatElapsedMs = 0;

          // Append opening no-op entry per CS 118 hints slide 16
          const nextIdx = getLastLogInfo(target).index + 1;
          target.log = [
            ...target.log,
            {
              index: nextIdx,
              term: target.currentTerm,
              type: 'NOOP',
              command: `no-op (term ${target.currentTerm})`,
            },
          ];

          for (const peer of state.nodes) {
            if (peer.id !== target.id) {
              target.nextIndex[peer.id] = nextIdx;
              target.matchIndex[peer.id] = 0;
            }
          }

          state.events = pushEvent(
            state.events,
            state.tick,
            'election',
            `Node ${target.id} won election (${target.votesReceived.length}/5 votes) -> Leader T${target.currentTerm}`,
            `Appended opening no-op entry #${nextIdx} and firing immediate sendHeartbeats()`,
          );

          spawnedPackets.push(...createHeartbeatPackets(state, target));
        }
      }
    } else if (pkt.kind === 'AppendEntries') {
      const prevLogIndex = pkt.payload?.prevLogIndex ?? 0;
      const prevLogTerm = pkt.payload?.prevLogTerm ?? 0;
      const incoming = pkt.payload?.entries ?? [];
      const leaderCommit = pkt.payload?.leaderCommit ?? 0;

      let success = false;
      let matchIdx = 0;

      if (pkt.term >= target.currentTerm) {
        if (target.role !== 'follower') {
          target.role = 'follower';
          target.votesReceived = [];
        }
        target.knownLeaderId = pkt.fromId;
        target.electionElapsedMs = 0;

        // Consistency check (§5.3)
        const prevMatches =
          prevLogIndex === 0 ||
          target.log.some(
            (e) => e.index === prevLogIndex && e.term === prevLogTerm,
          );

        if (prevMatches) {
          success = true;
          let updatedLog = [...target.log];
          let truncated = false;

          for (const entry of incoming) {
            const existingIdx = updatedLog.findIndex(
              (e) => e.index === entry.index,
            );
            if (existingIdx !== -1) {
              if (updatedLog[existingIdx].term !== entry.term) {
                updatedLog = updatedLog.slice(0, existingIdx);
                updatedLog.push({ ...entry });
                truncated = true;
              }
            } else {
              updatedLog.push({ ...entry });
            }
          }

          if (truncated) {
            state.events = pushEvent(
              state.events,
              state.tick,
              'replication',
              `Node ${target.id} truncated conflicting uncommitted log entries`,
              `Reconciled follower log with Leader Node ${pkt.fromId} (Term ${pkt.term})`,
            );
          }

          target.log = updatedLog;
          matchIdx = getLastLogInfo(target).index;

          if (leaderCommit > target.commitIndex) {
            target.commitIndex = Math.min(leaderCommit, matchIdx);
            const applied = applyCommittedEntries(target, state);
            state.nodes[targetIdx] = applied.node;
            state.events = applied.events;
          }
        }
      }

      const sender = state.nodes.find((n) => n.id === pkt.fromId);
      const dropped = sender ? !canCommunicate(state, target, sender) : true;
      spawnedPackets.push({
        id: `pkt-${packetSeq++}`,
        fromId: target.id,
        toId: pkt.fromId,
        kind: 'AppendEntriesReply',
        term: target.currentTerm,
        progress: 0,
        dropped,
        summary: success ? `Ack #${matchIdx}` : `LogMismatch`,
        payload: {
          success,
          matchIndex: matchIdx,
        },
      });
    } else if (pkt.kind === 'AppendEntriesReply') {
      if (target.role === 'leader' && pkt.term === target.currentTerm) {
        if (pkt.payload?.success) {
          const m = pkt.payload.matchIndex ?? 0;
          target.matchIndex[pkt.fromId] = Math.max(
            target.matchIndex[pkt.fromId] ?? 0,
            m,
          );
          target.nextIndex[pkt.fromId] = target.matchIndex[pkt.fromId] + 1;

          // Check quorum commit rule (§5.3 & §5.4: log[N].term == currentTerm)
          const lastIdx = getLastLogInfo(target).index;
          const majority = Math.floor(NODE_COUNT / 2) + 1;

          for (let n = lastIdx; n > target.commitIndex; n--) {
            const entry = target.log.find((e) => e.index === n);
            if (!entry || entry.term !== target.currentTerm) continue;

            let replicatedCount = 1; // leader itself
            for (const peer of state.nodes) {
              if (peer.id === target.id) continue;
              if ((target.matchIndex[peer.id] ?? 0) >= n) {
                replicatedCount += 1;
              }
            }
            if (replicatedCount >= majority) {
              target.commitIndex = n;
              const applied = applyCommittedEntries(target, state);
              state.nodes[targetIdx] = applied.node;
              state.events = applied.events;

              if (
                applied.clientReply &&
                state.lastClientRequest &&
                state.lastClientRequest.cacheId === applied.clientReply.cacheId
              ) {
                state.lastClientRequest = {
                  ...state.lastClientRequest,
                  status: 'committed',
                  resultHash: applied.clientReply.hash,
                };
              }
              break;
            }
          }
        } else {
          // Decrement nextIndex and retry on next heartbeat
          const curNext = target.nextIndex[pkt.fromId] ?? 1;
          target.nextIndex[pkt.fromId] = Math.max(1, curNext - 1);
        }
      }
    }
  }

  state.packets = [...remainingPackets, ...spawnedPackets];
  return state;
}

export function submitClientCommand(
  prev: ClusterState,
  rawCommand: string,
  opts?: { targetNodeId?: number; duplicate?: boolean },
): ClusterState {
  const command = rawCommand.trim() || 'HASH("raft-consensus")';
  const state: ClusterState = {
    ...prev,
    nodes: prev.nodes.map((n) => ({
      ...n,
      cachedReplies: { ...n.cachedReplies },
      pendingCacheWaiters: { ...n.pendingCacheWaiters },
    })),
    packets: [...prev.packets],
    events: prev.events,
  };

  const seqNum =
    opts?.duplicate && state.lastClientRequest
      ? state.lastClientRequest.seqNum
      : state.nextSeqNum;
  const cacheId = `c1:${seqNum}`;
  const effectiveCmd =
    opts?.duplicate && state.lastClientRequest
      ? state.lastClientRequest.command
      : command;

  // Pick a target node (or current leader)
  let target =
    (opts?.targetNodeId
      ? state.nodes.find((n) => n.id === opts.targetNodeId)
      : undefined) ||
    state.nodes.find((n) => n.role === 'leader' && n.partitionGroup === 0) ||
    state.nodes.find((n) => n.role === 'leader') ||
    state.nodes.find((n) => n.role !== 'offline');

  if (!target) {
    state.events = pushEvent(
      state.events,
      state.tick,
      'client',
      'Client request failed: no reachable nodes',
      'All nodes are currently offline',
    );
    return state;
  }

  // If sent to a follower, demonstrate LeaderHint redirection!
  if (target.role !== 'leader') {
    const hintedLeader = state.nodes.find(
      (n) => n.id === target!.knownLeaderId && n.role === 'leader',
    );
    state.events = pushEvent(
      state.events,
      state.tick,
      'client',
      `Node ${target.id} rejected ClientRequest (not leader) -> LeaderHint: ${
        hintedLeader ? `Node ${hintedLeader.id}` : `n.Self (Node ${target.id})`
      }`,
      'Client automatically follows LeaderHint to leader node',
    );

    if (hintedLeader) {
      state.packets.push({
        id: `pkt-${packetSeq++}`,
        fromId: target.id,
        toId: hintedLeader.id,
        kind: 'ClientRedirect',
        term: target.currentTerm,
        progress: 0,
        dropped: false,
        summary: `LeaderHint -> N${hintedLeader.id}`,
      });
      target = hintedLeader;
    } else {
      state.lastClientRequest = {
        clientId: 1,
        seqNum,
        command: effectiveCmd,
        cacheId,
        status: 'redirected',
      };
      return state;
    }
  }

  // Step 2 from CS 118 Hints Slide 15: Check GetCachedReply first
  if (target.cachedReplies[cacheId]) {
    const cachedHash = target.cachedReplies[cacheId];
    state.events = pushEvent(
      state.events,
      state.tick,
      'client',
      `Duplicate (${cacheId}) served from GetCachedReply -> ${cachedHash}`,
      'Idempotency preserved: command was NOT appended twice to StableStore',
    );
    state.lastClientRequest = {
      clientId: 1,
      seqNum,
      command: effectiveCmd,
      cacheId,
      status: 'deduplicated',
      resultHash: cachedHash,
    };
    return state;
  }

  // Step 3: Check in-flight requestsByCacheId
  if (target.pendingCacheWaiters[cacheId]) {
    target.pendingCacheWaiters[cacheId] += 1;
    state.events = pushEvent(
      state.events,
      state.tick,
      'client',
      `In-flight duplicate (${cacheId}) coalesced into requestsByCacheId`,
      `Now ${target.pendingCacheWaiters[cacheId]} reply channels awaiting commit`,
    );
    return state;
  }

  // Step 4: Append new log entry to Leader's StableStore
  const nextIndex = getLastLogInfo(target).index + 1;
  target.log = [
    ...target.log,
    {
      index: nextIndex,
      term: target.currentTerm,
      type: 'HASH',
      command: effectiveCmd,
      cacheId,
    },
  ];
  target.pendingCacheWaiters[cacheId] = 1;

  state.events = pushEvent(
    state.events,
    state.tick,
    'client',
    `Leader Node ${target.id} appended #${nextIndex} ${effectiveCmd} (${cacheId})`,
    'Queued reply channel in requestsByCacheId; replicating on next sendHeartbeats()',
  );

  // Fire immediate replication heartbeat so user gets crisp visual feedback
  target.heartbeatElapsedMs = 0;
  state.packets = [...state.packets, ...createHeartbeatPackets(state, target)];

  state.lastClientRequest = {
    clientId: 1,
    seqNum,
    command: effectiveCmd,
    cacheId,
    status: 'pending',
  };
  if (!opts?.duplicate) {
    state.nextSeqNum = seqNum + 1;
  }

  return state;
}

export function toggleNetworkPartition(prev: ClusterState): ClusterState {
  if (prev.partitionActive) {
    const healedNodes = prev.nodes.map((n) => ({
      ...n,
      partitionGroup: 0 as const,
    }));
    return {
      ...prev,
      nodes: healedNodes,
      partitionActive: false,
      minorityIds: [],
      events: pushEvent(
        prev.events,
        prev.tick,
        'partition',
        'Network partition healed (5 nodes reconnected)',
        'Higher-term leader heartbeats will force minority leader step-down & log reconciliation',
      ),
    };
  }

  // Put current leader (or Node 1) + 1 neighbor in minority (group 1), other 3 in majority (group 0)
  const currentLeader = prev.nodes.find((n) => n.role === 'leader') ?? prev.nodes[0];
  const neighborId = (currentLeader.id % NODE_COUNT) + 1;
  const minorityIds = [currentLeader.id, neighborId];

  const partitionedNodes = prev.nodes.map((n) => ({
    ...n,
    partitionGroup: (minorityIds.includes(n.id) ? 1 : 0) as 0 | 1,
  }));

  return {
    ...prev,
    nodes: partitionedNodes,
    partitionActive: true,
    minorityIds,
    events: pushEvent(
      prev.events,
      prev.tick,
      'partition',
      `Network split active: Minority {N${minorityIds[0]}, N${minorityIds[1]}} | Majority (3 nodes)`,
      'Isolated leader cannot reach quorum; majority partition will elect a new leader',
    ),
  };
}

export function toggleNodeCrash(prev: ClusterState, nodeId: number): ClusterState {
  const target = prev.nodes.find((n) => n.id === nodeId);
  if (!target) return prev;

  const isComingOnline = target.role === 'offline';
  const nodes = prev.nodes.map((n) => {
    if (n.id !== nodeId) return n;
    if (isComingOnline) {
      return {
        ...n,
        role: 'follower' as const,
        electionElapsedMs: 0,
        electionTimeoutMs: randomElectionTimeout(),
        // BoltDB recovers persistent state (currentTerm, votedFor, log[]), resets volatile state
        commitIndex: Math.min(n.commitIndex, n.log.length),
        lastApplied: 0,
        hashChainHead: GENESIS_HASH,
      };
    }
    return {
      ...n,
      role: 'offline' as const,
      votesReceived: [],
    };
  });

  // Re-apply already committed entries from BoltStore on restart
  const nextState: ClusterState = {
    ...prev,
    nodes,
    events: pushEvent(
      prev.events,
      prev.tick,
      'fault',
      isComingOnline
        ? `Node ${nodeId} restarted from BoltDB (Term ${target.currentTerm}, ${target.log.length} logs recovered)`
        : `Node ${nodeId} crashed (gracefulExit -> return nil)`,
      isComingOnline
        ? 'Persistent state restored from disk; rejoining cluster as Follower'
        : target.role === 'leader'
          ? 'Followers will detect missing heartbeats and trigger election'
          : 'Cluster remains available while majority quorum (>= 3/5) is intact',
    ),
  };

  if (isComingOnline) {
    const idx = nextState.nodes.findIndex((n) => n.id === nodeId);
    if (idx !== -1) {
      const replayed = applyCommittedEntries(nextState.nodes[idx], nextState);
      nextState.nodes[idx] = replayed.node;
    }
  }

  return nextState;
}
