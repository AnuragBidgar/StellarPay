import React from 'react';
import type { WalletState } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface BalanceCardProps {
    wallet: WalletState;
}

function formatXLM(val: string | null): string {
    if (!val) return '—';
    return parseFloat(val).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 7 });
}

const BalanceCard: React.FC<BalanceCardProps> = ({ wallet }) => {
    return (
        <div className="card balance-card">
            <div className="card-header-row">
                <div className="card-icon-wrap icon-balance">💎</div>
                <h2 className="card-heading">XLM Balance</h2>
            </div>

            {wallet.loading && !wallet.balance ? (
                <LoadingSpinner message="Loading balance…" />
            ) : (
                <div className="balance-display">
                    <div className="balance-amount" id="balance-amount">
                        {formatXLM(wallet.balance)} <span className="balance-ticker">XLM</span>
                    </div>
                    {wallet.balanceUsd && (
                        <div className="balance-usd">{wallet.balanceUsd}</div>
                    )}
                    {wallet.error && (
                        <p className="balance-error">⚠️ {wallet.error}</p>
                    )}
                </div>
            )}
        </div>
    );
};

export default BalanceCard;
