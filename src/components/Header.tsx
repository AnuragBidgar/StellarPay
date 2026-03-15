import React from 'react';
import type { WalletState } from '../types';

interface HeaderProps {
    wallet: WalletState;
    onConnect: () => void;
    onDisconnect: () => void;
    onRefresh: () => void;
}

function truncate(addr: string) {
    return `${addr.slice(0, 6)}…${addr.slice(-6)}`;
}

const Header: React.FC<HeaderProps> = ({ wallet, onConnect, onDisconnect, onRefresh }) => {
    return (
        <header className="app-header">
            <div className="header-brand">
                <div className="brand-icon" aria-hidden="true">✦</div>
                <div>
                    <h1 className="brand-title">StellarPay</h1>
                    <p className="brand-subtitle">Simple XLM payments · Stellar Testnet</p>
                </div>
            </div>

            <div className="header-right">
                <span className="network-badge">
                    <span className="net-dot" />
                    Testnet
                </span>

                {wallet.connected && wallet.publicKey ? (
                    <div className="wallet-pills">
                        <span className="addr-pill" title={wallet.publicKey}>
                            🔑 {truncate(wallet.publicKey)}
                        </span>
                        <button
                            className="btn btn-xs btn-outline"
                            onClick={onRefresh}
                            disabled={wallet.loading}
                            aria-label="Refresh balance"
                        >
                            ↻
                        </button>
                        <button
                            className="btn btn-xs btn-danger"
                            onClick={onDisconnect}
                            aria-label="Disconnect wallet"
                        >
                            Disconnect
                        </button>
                    </div>
                ) : (
                    <button
                        className="btn btn-primary"
                        onClick={onConnect}
                        disabled={wallet.loading}
                        aria-label="Connect Freighter wallet"
                    >
                        {wallet.loading ? (
                            <><span className="spinner" /> Connecting…</>
                        ) : (
                            <>🔗 Connect Freighter</>
                        )}
                    </button>
                )}
            </div>
        </header>
    );
};

export default Header;
