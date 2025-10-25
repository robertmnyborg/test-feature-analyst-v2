/**
 * Loading Component
 * Brand-compliant loading spinner following CLAUDE.md specifications
 */

import React from 'react';

export interface LoadingProps {
  size?: 'small' | 'medium' | 'large';
  text?: string;
}

export const Loading: React.FC<LoadingProps> = ({ size = 'medium', text }) => {
  const sizeMap = {
    small: 24,
    medium: 48,
    large: 72,
  };

  const spinnerSize = sizeMap[size];

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '15px',
    padding: '20px',
  };

  const spinnerStyles: React.CSSProperties = {
    width: `${spinnerSize}px`,
    height: `${spinnerSize}px`,
    border: '4px solid #E0E0E0',
    borderTop: '4px solid #04D2C6',
    borderRadius: '50%',
    animation: 'spin 1s linear infinite',
  };

  const textStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  };

  return (
    <div style={containerStyles}>
      <style>
        {`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}
      </style>
      <div style={spinnerStyles}></div>
      {text && <p style={textStyles}>{text}</p>}
    </div>
  );
};
