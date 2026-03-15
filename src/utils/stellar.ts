import { Horizon, Networks, Asset, StrKey } from '@stellar/stellar-sdk';
import type { TxHistoryItem } from '../types';

export const HORIZON_URL = 'https://horizon-testnet.stellar.org';
export const NETWORK_PASS = Networks.TESTNET;
export const EXPLORER_BASE = 'https://stellar.expert/explorer/testnet/tx/';

const server = new Horizon.Server(HORIZON_URL);

// ─── Fetch XLM balance from Horizon ──────────────────────────────────────────
export async function fetchXLMBalance(publicKey: string): Promise<string> {
    const account = await server.loadAccount(publicKey);
    const native = account.balances.find(b => b.asset_type === 'native');
    return native ? native.balance : '0';
}

// ─── Fetch XLM/USD price from CoinGecko ──────────────────────────────────────
export async function fetchXLMPrice(): Promise<number | null> {
    try {
        const res = await fetch(
            'https://api.coingecko.com/api/v3/simple/price?ids=stellar&vs_currencies=usd'
        );
        const data = await res.json() as { stellar?: { usd?: number } };
        return data?.stellar?.usd ?? null;
    } catch {
        return null;
    }
}

// ─── Fetch recent payment history ────────────────────────────────────────────
export async function fetchPaymentHistory(publicKey: string): Promise<TxHistoryItem[]> {
    const ops = await server.payments()
        .forAccount(publicKey)
        .limit(10)
        .order('desc')
        .call();

    return ops.records
        .filter(r => r.type === 'payment' || r.type === 'create_account')
        .slice(0, 8)
        .map(r => ({
            type: r.from === publicKey ? 'send' : 'recv',
            amount: (r as { amount?: string; starting_balance?: string }).amount
                || (r as { starting_balance?: string }).starting_balance
                || '0',
            destination: (r as { to?: string; account?: string }).to || (r as { account?: string }).account || '',
            source: (r as { from?: string; funder?: string }).from || (r as { funder?: string }).funder || '',
            hash: r.transaction_hash,
            timestamp: r.created_at,
        })) as TxHistoryItem[];
}

// ─── Validate Stellar public key ──────────────────────────────────────────────
export function isValidPublicKey(key: string): boolean {
    return StrKey.isValidEd25519PublicKey(key);
}

// ─── Check if destination account exists ─────────────────────────────────────
export async function accountExists(publicKey: string): Promise<boolean> {
    try {
        await server.loadAccount(publicKey);
        return true;
    } catch {
        return false;
    }
}

// ─── Get Horizon server instance ──────────────────────────────────────────────
export function getServer(): Horizon.Server {
    return server;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
export function getNativeAsset(): Asset {
    return Asset.native();
}

export function truncateAddress(addr: string, start = 6, end = 6): string {
    if (!addr) return '';
    return `${addr.slice(0, start)}…${addr.slice(-end)}`;
}

export function formatXLM(amount: string | number, decimals = 2): string {
    const n = parseFloat(String(amount));
    if (isNaN(n)) return '0.00';
    return n.toLocaleString('en-US', {
        minimumFractionDigits: decimals,
        maximumFractionDigits: 7,
    });
}
