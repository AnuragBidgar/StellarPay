import { describe, it, expect } from 'vitest';
import { isValidPublicKey, truncateAddress, formatXLM } from '../utils/stellar';

// Well-known valid Stellar Ed25519 public keys for testing
const VALID_KEY_1 = 'GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5';
const VALID_KEY_2 = 'GDQERENWDDSQZS7R7WKHZI3BSOYMV3FSBE7RACRYZ5AY3WYAAAAAAAA';

describe('stellar utilities', () => {
    it('validates a correct Stellar public key', () => {
        // GBBD47IF6LWK7P7MDEVSCWR7DPUWV3NY3DTQEVFL4NAT4AQH3ZLLFLA5 is a well-known valid key
        expect(isValidPublicKey(VALID_KEY_1)).toBe(true);
    });

    it('rejects an invalid public key', () => {
        expect(isValidPublicKey('not-a-key')).toBe(false);
        expect(isValidPublicKey('')).toBe(false);
        expect(isValidPublicKey('short')).toBe(false);
    });

    it('truncates an address correctly', () => {
        const truncated = truncateAddress(VALID_KEY_1, 6, 6);
        expect(truncated).toContain('…');
        expect(truncated.startsWith(VALID_KEY_1.slice(0, 6))).toBe(true);
        expect(truncated.endsWith(VALID_KEY_1.slice(-6))).toBe(true);
        expect(truncated.length).toBeLessThan(VALID_KEY_1.length);
    });

    it('returns empty string for empty address', () => {
        expect(truncateAddress('')).toBe('');
    });

    it('formats XLM amounts correctly', () => {
        expect(formatXLM('100.00')).toBe('100.00');
        expect(formatXLM('0')).toBe('0.00');
        expect(formatXLM('invalid')).toBe('0.00');
    });

    it('formats large XLM amounts with commas', () => {
        const formatted = formatXLM('10000');
        expect(formatted).toContain('10,000');
    });
});
