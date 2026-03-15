import React, { useState } from 'react';
import type { TxResult, SendFormData } from '../types';
import { isValidPublicKey } from '../utils/stellar';
import { sendXLMPayment } from '../utils/stellarTx';
import { clearCache } from '../utils/cache';
import { EXPLORER_BASE } from '../utils/stellar';

interface SendFormProps {
    publicKey: string;
    balance: string | null;
    onSuccess: () => void; // called after tx to refresh balance/history
}

const INITIAL_FORM: SendFormData = { destination: '', amount: '' };

const SendForm: React.FC<SendFormProps> = ({ publicKey, balance, onSuccess }) => {
    const [form, setForm] = useState<SendFormData>(INITIAL_FORM);
    const [result, setResult] = useState<TxResult>({ status: 'idle', hash: null, message: null });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
        setForm(f => ({ ...f, [e.target.name]: e.target.value }));

    const handleMax = () => {
        if (balance !== null) {
            const max = Math.max(0, parseFloat(balance) - 1.0001).toFixed(7);
            setForm(f => ({ ...f, amount: max }));
        }
    };

    const validate = (): string | null => {
        if (!form.destination.trim()) return 'Recipient address is required.';
        if (!isValidPublicKey(form.destination.trim())) return 'Invalid Stellar public key.';
        if (form.destination.trim() === publicKey) return 'Cannot send XLM to yourself.';
        const amt = parseFloat(form.amount);
        if (!form.amount || isNaN(amt) || amt <= 0) return 'Enter a valid amount greater than 0.';
        if (balance !== null && amt >= parseFloat(balance) - 1) {
            return `Insufficient balance. Keep at least 1 XLM as reserve. Max: ${(parseFloat(balance) - 1).toFixed(2)} XLM`;
        }
        return null;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        const error = validate();
        if (error) {
            setResult({ status: 'error', hash: null, message: error });
            return;
        }

        setResult({ status: 'loading', hash: null, message: null });

        try {
            const { hash } = await sendXLMPayment({
                sourcePublicKey: publicKey,
                destination: form.destination.trim(),
                amount: parseFloat(form.amount).toFixed(7),
            });

            setResult({ status: 'success', hash, message: null });
            setForm(INITIAL_FORM);
            clearCache(`balance:${publicKey}`);
            clearCache(`history:${publicKey}`);
            onSuccess();
        } catch (err) {
            const msg = err instanceof Error ? err.message : 'Transaction failed';
            setResult({ status: 'error', hash: null, message: msg });
        }
    };

    return (
        <div className="card">
            <div className="card-header-row">
                <div className="card-icon-wrap icon-send">🚀</div>
                <h2 className="card-heading">Send XLM</h2>
            </div>

            <form onSubmit={handleSubmit} noValidate autoComplete="off">
                {/* Recipient */}
                <div className="form-group">
                    <label className="form-label" htmlFor="destination">Recipient Address</label>
                    <input
                        id="destination"
                        name="destination"
                        className="form-input"
                        type="text"
                        placeholder="G… (Stellar public key)"
                        value={form.destination}
                        onChange={handleChange}
                        spellCheck={false}
                        aria-label="Recipient Stellar address"
                    />
                </div>

                {/* Amount + MAX */}
                <div className="form-group">
                    <label className="form-label" htmlFor="amount">Amount (XLM)</label>
                    <div className="input-row">
                        <input
                            id="amount"
                            name="amount"
                            className="form-input"
                            type="number"
                            min="0.0000001"
                            step="0.0000001"
                            placeholder="0.00"
                            value={form.amount}
                            onChange={handleChange}
                            aria-label="Amount in XLM"
                        />
                        <button
                            type="button"
                            className="btn btn-max"
                            onClick={handleMax}
                            disabled={balance === null}
                            aria-label="Use maximum available balance"
                        >
                            MAX
                        </button>
                    </div>
                    {balance && (
                        <p className="form-hint">
                            Available: ~{(Math.max(0, parseFloat(balance) - 1)).toFixed(2)} XLM
                        </p>
                    )}
                </div>



                {/* Submit */}
                <button
                    id="send-btn"
                    className="btn btn-primary btn-full"
                    type="submit"
                    disabled={result.status === 'loading'}
                    aria-label="Send XLM payment"
                >
                    {result.status === 'loading' ? (
                        <><span className="spinner" /> Sending…</>
                    ) : (
                        <>🚀 Send XLM</>
                    )}
                </button>
            </form>

            {/* Result Panel */}
            {result.status === 'success' && result.hash && (
                <div className="alert alert-success" role="alert" aria-live="polite">
                    <span className="alert-icon">✅</span>
                    <div>
                        <strong>Transaction Successful!</strong>
                        <div style={{ marginTop: '0.4rem' }}>
                            <span className="tx-hash-label">TX Hash: </span>
                            <a
                                href={`${EXPLORER_BASE}${result.hash}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="tx-hash-link"
                                title="View on Stellar Expert"
                            >
                                {result.hash}
                            </a>
                        </div>
                        <p className="alert-hint">🔗 Click hash to view on Stellar Expert Testnet</p>
                    </div>
                </div>
            )}

            {result.status === 'error' && result.message && (
                <div className="alert alert-error" role="alert" aria-live="polite">
                    <span className="alert-icon">❌</span>
                    <div>
                        <strong>Transaction Failed</strong>
                        <p style={{ marginTop: '0.25rem' }}>{result.message}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SendForm;
