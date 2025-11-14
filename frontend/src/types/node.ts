export interface NodeStatus {
  moniker: string;
  network: string;
  version: string;
  latestBlockHeight: number;
  earliestBlockHeight: number;
  catchingUp: boolean;
}

export interface Peer {
  id: string;
  moniker: string;
  remoteIp: string;
}

export interface UnconfirmedTxs {
  total: number;
  txs: string[];
}
