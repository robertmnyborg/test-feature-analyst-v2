/**
 * Button Component
 * Brand-compliant button following CLAUDE.md specifications
 */

import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'small' | 'medium' | 'large';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'medium',
  isLoading = false,
  fullWidth = false,
  disabled,
  style,
  ...props
}) => {
  const baseStyles: React.CSSProperties = {
    fontFamily: 'inherit',
    fontSize: size === 'small' ? '14px' : size === 'large' ? '18px' : '16px',
    fontWeight: '500',
    padding: size === 'small' ? '8px 16px' : size === 'large' ? '16px 32px' : '12px 24px',
    borderRadius: '12px',
    border: 'none',
    cursor: disabled || isLoading ? 'not-allowed' : 'pointer',
    transition: 'all 0.2s ease',
    opacity: disabled || isLoading ? 0.5 : 1,
    width: fullWidth ? '100%' : 'auto',
    position: 'relative',
  };

  const primaryStyles: React.CSSProperties = {
    ...baseStyles,
    backgroundColor: '#04D2C6',
    color: '#FFFFFF',
    boxShadow: '0 10px 25px rgba(4, 210, 198, 0.3)',
  };

  const secondaryStyles: React.CSSProperties = {
    ...baseStyles,
    backgroundColor: '#FFFFFF',
    color: '#666',
    border: '1px solid #E0E0E0',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  };

  const hoverStyles: React.CSSProperties = variant === 'primary'
    ? { backgroundColor: '#03B5AB', boxShadow: '0 15px 30px rgba(4, 210, 198, 0.4)' }
    : { borderColor: '#04D2C6', backgroundColor: 'rgba(4, 210, 198, 0.05)' };

  const [isHovered, setIsHovered] = React.useState(false);

  const buttonStyles: React.CSSProperties = {
    ...(variant === 'primary' ? primaryStyles : secondaryStyles),
    ...(isHovered && !disabled && !isLoading ? hoverStyles : {}),
    ...style,
  };

  return (
    <button
      {...props}
      disabled={disabled || isLoading}
      style={buttonStyles}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {isLoading ? 'Loading...' : children}
    </button>
  );
};
