import React from 'react';
import { useWallet } from './hooks/useWallet';
import Header from './components/Header';
import WalletConnect from './components/WalletConnect';
import BalanceCard from './components/BalanceCard';
import SendForm from './components/SendForm';
import ActivityFeed from './components/ActivityFeed';

const App: React.FC = () => {
    const { wallet, history, connect, disconnect, refreshBalance, refreshHistory } = useWallet();

    const handleTxSuccess = async () => {
        await Promise.all([refreshBalance(), refreshHistory()]);
    };

    return (
        <div className="app">
            {/* Animated Background */}
            <div className="bg-canvas" aria-hidden="true">
                <div className="orb orb-1" />
                <div className="orb orb-2" />
                <div className="orb orb-3" />
            </div>

            {/* Header */}
            <Header
                wallet={wallet}
                onConnect={connect}
                onDisconnect={disconnect}
                onRefresh={refreshBalance}
            />

            {/* Main Content */}
            <main className="main-content">
                {!wallet.connected ? (
                    /* ── Pre-connect View ── */
                    <WalletConnect wallet={wallet} onConnect={connect} />
                ) : (
                    /* ── Connected View ── */
                    <div className="dashboard">
                        <div className="dashboard-left">
                            <BalanceCard wallet={wallet} />
                            <SendForm
                                publicKey={wallet.publicKey!}
                                balance={wallet.balance}
                                onSuccess={handleTxSuccess}
                            />
                        </div>
                        <div className="dashboard-right">
                            <ActivityFeed
                                history={history}
                                currentPublicKey={wallet.publicKey}
                            />
                        </div>
                    </div>
                )}
            </main>

            {/* Footer */}
            <footer className="app-footer">
                <p>
                    StellarPay · Built on{' '}
                    <a href="https://stellar.org" target="_blank" rel="noopener noreferrer">
                        Stellar
                    </a>{' '}
                    Testnet · Powered by Freighter &amp; Horizon API
                </p>
                <p>
                    <a
                        href="https://stellar.expert/explorer/testnet"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        🔍 Stellar Expert
                    </a>
                    {' · '}
                    <a
                        href="https://friendbot.stellar.org"
                        target="_blank"
                        rel="noopener noreferrer"
                    >
                        💧 Friendbot Faucet
                    </a>
                </p>
            </footer>
        </div>
    );
};

export default App;
