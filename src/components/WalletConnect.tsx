import React from 'react';
import type { WalletState } from '../types';

interface WalletConnectProps {
    wallet: WalletState;
    onConnect: () => void;
}

const WalletConnect: React.FC<WalletConnectProps> = ({ wallet, onConnect }) => {
    return (
        <div className="card connect-card">
            <div className="card-icon-wrap icon-wallet">🔑</div>
            <h2 className="card-heading">Connect Your Wallet</h2>
            <p className="connect-desc">
                Connect your <strong>Freighter</strong> wallet to send XLM, check your
                balance, and view transaction history on the Stellar Testnet.
            </p>

            {wallet.error && (
                <div className="alert alert-error" role="alert">
                    ⚠️ {wallet.error}
                </div>
            )}

            <button
                className="btn btn-primary btn-lg"
                onClick={onConnect}
                disabled={wallet.loading}
                aria-label="Connect Freighter Wallet"
                id="connect-wallet-btn"
            >
                {wallet.loading ? (
                    <><span className="spinner" /> Connecting…</>
                ) : (
                    <>🔗 Connect Freighter</>
                )}
            </button>

            <p className="connect-hint">
                Don&apos;t have Freighter?{' '}
                <a
                    href="https://www.freighter.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Install it here ↗
                </a>
            </p>
        </div>
    );
};

export default WalletConnect;
