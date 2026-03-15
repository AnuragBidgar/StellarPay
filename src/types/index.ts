// ─── Wallet Types ─────────────────────────────────────────────────────────────
export interface WalletState {
    connected: boolean;
    publicKey: string | null;
    balance: string | null;
    balanceUsd: string | null;
    loading: boolean;
    error: string | null;
}

// ─── Transaction Types ────────────────────────────────────────────────────────
export type TxStatus = 'idle' | 'loading' | 'success' | 'error';

export interface TxResult {
    status: TxStatus;
    hash: string | null;
    message: string | null;
}

export interface TxHistoryItem {
    type: 'send' | 'recv';
    amount: string;
    destination: string;
    source: string;
    hash: string;
    timestamp: string;
}

// ─── Send Form Types ──────────────────────────────────────────────────────────
export interface SendFormData {
    destination: string;
    amount: string;
}
