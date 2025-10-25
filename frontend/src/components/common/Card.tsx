/**
 * Card Component
 * Brand-compliant card following CLAUDE.md specifications
 */

import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: 'compact' | 'standard';
  hoverable?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  style = {},
  padding = 'standard',
  hoverable = false,
}) => {
  const [isHovered, setIsHovered] = React.useState(false);

  const cardStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '20px',
    padding: padding === 'compact' ? '15px' : '20px',
    boxShadow: isHovered && hoverable ? '0 15px 45px rgba(0, 0, 0, 0.2)' : '0 10px 40px rgba(0, 0, 0, 0.15)',
    transition: 'box-shadow 0.2s ease',
    ...style,
  };

  return (
    <div
      className={`card ${className}`}
      style={cardStyles}
      onMouseEnter={() => hoverable && setIsHovered(true)}
      onMouseLeave={() => hoverable && setIsHovered(false)}
    >
      {children}
    </div>
  );
};
