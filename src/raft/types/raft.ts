export type NodeRole = 'follower' | 'candidate' | 'leader' | 'offline';

export type LogCommandType = 'NOOP' | 'CLIENT_REG' | 'HASH';

export interface LogEntry {
  index: number;
  term: number;
  type: LogCommandType;
  command: string;
  cacheId?: string;
  hashResult?: string;
}

export interface RaftNodeState {
  id: number;
  port: number;
  label: string;
  role: NodeRole;
  currentTerm: number;
  votedFor: number | null;
  votesReceived: number[];
  log: LogEntry[];
  commitIndex: number;
  lastApplied: number;
  nextIndex: Record<number, number>;
  matchIndex: Record<number, number>;
  electionElapsedMs: number;
  electionTimeoutMs: number;
  heartbeatElapsedMs: number;
  knownLeaderId: number | null;
  hashChainHead: string;
  cachedReplies: Record<string, string>;
  pendingCacheWaiters: Record<string, number>;
  partitionGroup: 0 | 1;
}

export type RpcKind =
  | 'RequestVote'
  | 'RequestVoteReply'
  | 'AppendEntries'
  | 'AppendEntriesReply'
  | 'ClientRedirect';

export interface InFlightPacket {
  id: string;
  fromId: number;
  toId: number;
  kind: RpcKind;
  term: number;
  progress: number; // 0..1
  dropped: boolean;
  summary: string;
  payload?: {
    lastLogIndex?: number;
    lastLogTerm?: number;
    voteGranted?: boolean;
    prevLogIndex?: number;
    prevLogTerm?: number;
    entries?: LogEntry[];
    leaderCommit?: number;
    success?: boolean;
    matchIndex?: number;
    leaderHint?: number | null;
  };
}

export interface ClusterEvent {
  id: string;
  tick: number;
  category: 'election' | 'replication' | 'commit' | 'client' | 'partition' | 'fault';
  message: string;
  detail?: string;
}

export interface ClusterState {
  tick: number;
  nodes: RaftNodeState[];
  packets: InFlightPacket[];
  events: ClusterEvent[];
  partitionActive: boolean;
  minorityIds: number[];
  lastClientRequest: {
    clientId: number;
    seqNum: number;
    command: string;
    cacheId: string;
    status: 'idle' | 'redirected' | 'pending' | 'committed' | 'deduplicated';
    resultHash?: string;
  } | null;
  nextSeqNum: number;
}
