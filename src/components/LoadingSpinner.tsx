import React from 'react';

interface LoadingSpinnerProps {
    message?: string;
    size?: 'sm' | 'md' | 'lg';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
    message = 'Loading…',
    size = 'md',
}) => {
    const sizeClass = `spinner-${size}`;
    return (
        <div className="spinner-wrap" role="status" aria-label={message}>
            <span className={`spinner ${sizeClass}`} />
            {message && <span className="spinner-label">{message}</span>}
        </div>
    );
};

export default LoadingSpinner;
