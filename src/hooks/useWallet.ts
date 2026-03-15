import { useState, useCallback } from 'react';
import freighter from '@stellar/freighter-api';
const { isConnected, getPublicKey, getNetworkDetails } = freighter;
import type { WalletState, TxHistoryItem } from '../types';
import { fetchXLMBalance, fetchXLMPrice, fetchPaymentHistory } from '../utils/stellar';
import { setCache, getCache, clearCache } from '../utils/cache';

export interface UseWalletReturn {
    wallet: WalletState;
    history: TxHistoryItem[];
    connect: () => Promise<void>;
    disconnect: () => void;
    refreshBalance: () => Promise<void>;
    refreshHistory: () => Promise<void>;
}

export function useWallet(): UseWalletReturn {
    const [wallet, setWallet] = useState<WalletState>({
        connected: false,
        publicKey: null,
        balance: null,
        balanceUsd: null,
        loading: false,
        error: null,
    });
    const [history, setHistory] = useState<TxHistoryItem[]>([]);

    // ── Refresh balance ─────────────────────────────────────────────────────────
    const refreshBalance = useCallback(async (publicKey?: string | null) => {
        const key = publicKey ?? wallet.publicKey;
        if (!key) return;

        // Try cache first
        const cached = getCache<{ balance: string; balanceUsd: string | null }>(`balance:${key}`);
        if (cached) {
            setWallet(w => ({ ...w, balance: cached.balance, balanceUsd: cached.balanceUsd }));
            return;
        }

        setWallet(w => ({ ...w, loading: true, error: null }));
        try {
            const [balance, price] = await Promise.all([
                fetchXLMBalance(key),
                fetchXLMPrice(),
            ]);
            const balanceUsd = price ? `≈ $${(parseFloat(balance) * price).toFixed(2)} USD` : null;

            setCache(`balance:${key}`, { balance, balanceUsd }, 30_000);
            setWallet(w => ({ ...w, balance, balanceUsd, loading: false }));
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Failed to load balance';
            setWallet(w => ({ ...w, loading: false, error: msg }));
        }
    }, [wallet.publicKey]);

    // ── Refresh history ─────────────────────────────────────────────────────────
    const refreshHistory = useCallback(async (publicKey?: string | null) => {
        const key = publicKey ?? wallet.publicKey;
        if (!key) return;

        const cached = getCache<TxHistoryItem[]>(`history:${key}`);
        if (cached) {
            setHistory(cached);
            return;
        }

        try {
            const items = await fetchPaymentHistory(key);
            setCache(`history:${key}`, items, 60_000);
            setHistory(items);
        } catch {
            // Non-critical, silently fail
        }
    }, [wallet.publicKey]);

    // ── Connect wallet ──────────────────────────────────────────────────────────
    const connect = useCallback(async () => {
        setWallet(w => ({ ...w, loading: true, error: null }));

        try {
            // Using official isConnected() from @stellar/freighter-api
            const isFreighterAvailable = await isConnected();

            if (!isFreighterAvailable) {
                throw new Error('Freighter wallet extension is not detected. Please make sure it is installed and enabled.');
            }

            // In Freighter API v1.x, getPublicKey() triggers the access request if needed.
            const pk = await getPublicKey();
            if (!pk) throw new Error('Could not retrieve public key from Freighter. Please make sure you are logged in.');

            setWallet({
                connected: true,
                publicKey: pk,
                balance: null,
                balanceUsd: null,
                loading: false,
                error: null,
            });

            await Promise.all([refreshBalance(pk), refreshHistory(pk)]);
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Wallet connection failed';
            setWallet(w => ({ ...w, loading: false, connected: false, error: msg }));
        }
    }, [refreshBalance, refreshHistory]);

    // ── Disconnect wallet ───────────────────────────────────────────────────────
    const disconnect = useCallback(() => {
        clearCache();
        setWallet({
            connected: false,
            publicKey: null,
            balance: null,
            balanceUsd: null,
            loading: false,
            error: null,
        });
        setHistory([]);
    }, []);

    return {
        wallet,
        history,
        connect,
        disconnect,
        refreshBalance: () => refreshBalance(),
        refreshHistory: () => refreshHistory(),
    };
}
