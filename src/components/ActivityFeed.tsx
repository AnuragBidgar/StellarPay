import React from 'react';
import type { TxHistoryItem } from '../types';
import { EXPLORER_BASE, truncateAddress, formatXLM } from '../utils/stellar';

interface ActivityFeedProps {
    history: TxHistoryItem[];
    currentPublicKey: string | null;
}

const ActivityFeed: React.FC<ActivityFeedProps> = ({ history, currentPublicKey }) => {
    if (!history.length) {
        return (
            <div className="card">
                <div className="card-header-row">
                    <div className="card-icon-wrap icon-history">📋</div>
                    <h2 className="card-heading">Activity Feed</h2>
                </div>
                <p className="empty-state">No transactions yet</p>
            </div>
        );
    }

    return (
        <div className="card">
            <div className="card-header-row">
                <div className="card-icon-wrap icon-history">📋</div>
                <h2 className="card-heading">Activity Feed</h2>
            </div>

            <ul className="activity-list" aria-label="Transaction history">
                {history.map((tx, i) => {
                    const isSend = tx.type === 'send';
                    const peer = isSend
                        ? tx.destination
                        : (tx.source === currentPublicKey ? tx.destination : tx.source);
                    const date = tx.timestamp
                        ? new Date(tx.timestamp).toLocaleDateString()
                        : '';

                    return (
                        <li key={tx.hash || i} className="activity-item">
                            <a
                                href={`${EXPLORER_BASE}${tx.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="activity-link"
                                title="View on Stellar Expert"
                            >
                                <div className={`activity-icon ${isSend ? 'icon-send-sm' : 'icon-recv-sm'}`}>
                                    {isSend ? '↑' : '↓'}
                                </div>
                                <div className="activity-info">
                                    <div className="activity-type">{isSend ? 'Sent' : 'Received'}</div>
                                    <div className="activity-peer">{truncateAddress(peer)}</div>
                                    {date && <div className="activity-date">{date}</div>}
                                </div>
                                <div className="activity-amount">
                                    <span className={`amt-value ${isSend ? 'amt-send' : 'amt-recv'}`}>
                                        {isSend ? '−' : '+'}{formatXLM(tx.amount)}
                                    </span>
                                    <span className="amt-ticker">XLM</span>
                                </div>
                            </a>
                        </li>
                    );
                })}
            </ul>
        </div>
    );
};

export default ActivityFeed;
