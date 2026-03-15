import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProgressBar from '../components/ProgressBar';

describe('ProgressBar', () => {
    it('renders without crashing', () => {
        render(<ProgressBar value={50} />);
        const el = screen.getByRole('progressbar');
        expect(el).toBeDefined();
    });

    it('clamps value to 0-100 range', () => {
        const { container: c1 } = render(<ProgressBar value={150} />);
        const inner1 = c1.querySelector('.progress-inner') as HTMLElement;
        expect(inner1.style.width).toBe('100%');

        const { container: c2 } = render(<ProgressBar value={-10} />);
        const inner2 = c2.querySelector('.progress-inner') as HTMLElement;
        expect(inner2.style.width).toBe('0%');
    });

    it('renders a label when provided', () => {
        render(<ProgressBar value={75} label="75% funded" />);
        expect(screen.getByText('75% funded')).toBeDefined();
    });

    it('applies correct aria attributes', () => {
        render(<ProgressBar value={42} />);
        const bar = screen.getByRole('progressbar');
        expect(bar.getAttribute('aria-valuenow')).toBe('42');
        expect(bar.getAttribute('aria-valuemin')).toBe('0');
        expect(bar.getAttribute('aria-valuemax')).toBe('100');
    });
});
