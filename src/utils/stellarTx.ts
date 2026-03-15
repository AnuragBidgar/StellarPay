import {
    TransactionBuilder,
    Operation,
    Memo,
    Asset,
} from '@stellar/stellar-sdk';
import freighter from '@stellar/freighter-api';
import {
    HORIZON_URL,
    NETWORK_PASS,
    getServer,
    accountExists,
} from './stellar';

const BASE_FEE = '100';

interface SendPaymentParams {
    sourcePublicKey: string;
    destination: string;
    amount: string;
}

interface SendPaymentResult {
    hash: string;
}

// ─── Build, sign (via Freighter), and submit an XLM payment ──────────────────
export async function sendXLMPayment(params: SendPaymentParams): Promise<SendPaymentResult> {
    const { sourcePublicKey, destination, amount } = params;
    const server = getServer();
    const account = await server.loadAccount(sourcePublicKey);

    const txBuilder = new TransactionBuilder(account, {
        fee: BASE_FEE,
        networkPassphrase: NETWORK_PASS,
    });

    const destExists = await accountExists(destination);

    if (destExists) {
        txBuilder.addOperation(
            Operation.payment({
                destination,
                asset: Asset.native(),
                amount: parseFloat(amount).toFixed(7),
            })
        );
    } else {
        txBuilder.addOperation(
            Operation.createAccount({
                destination,
                startingBalance: parseFloat(amount).toFixed(7),
            })
        );
    }



    txBuilder.setTimeout(180);
    const transaction = txBuilder.build();

    // Sign via Freighter
    const xdr = transaction.toXDR();
    const signedTxXdr = await freighter.signTransaction(xdr, {
        networkPassphrase: NETWORK_PASS
    });

    if (!signedTxXdr) {
        throw new Error('Transaction signing was rejected');
    }

    const signedTx = TransactionBuilder.fromXDR(signedTxXdr, NETWORK_PASS);

    // Submit to Horizon
    const response = await fetch(`${HORIZON_URL}/transactions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `tx=${encodeURIComponent(signedTx.toEnvelope().toXDR('base64'))}`,
    });

    if (!response.ok) {
        const err = await response.json() as { extras?: { result_codes?: { transaction?: string; operations?: string[] } } };
        const codes = err?.extras?.result_codes;
        if (codes) {
            throw new Error(`Transaction failed: ${codes.transaction || ''} | ops: ${(codes.operations || []).join(', ')}`);
        }
        throw new Error(`Network error: ${response.status} ${response.statusText}`);
    }

    const result = await response.json() as { hash: string };
    return { hash: result.hash };
}
