import React from 'react';

interface ProgressBarProps {
    value: number; // 0-100
    label?: string;
    color?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({
    value,
    label,
    color = 'var(--accent-2)',
}) => {
    const clamped = Math.min(100, Math.max(0, value));
    return (
        <div className="progress-outer" role="progressbar" aria-valuenow={clamped} aria-valuemin={0} aria-valuemax={100}>
            <div
                className="progress-inner"
                style={{ width: `${clamped}%`, background: color }}
            />
            {label && <span className="progress-label">{label}</span>}
        </div>
    );
};

export default ProgressBar;
