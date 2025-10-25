/**
 * Select Component
 * Brand-compliant select/dropdown following CLAUDE.md specifications
 */

import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  options: SelectOption[];
  error?: string;
  fullWidth?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  options,
  error,
  fullWidth = false,
  style,
  ...props
}) => {
  const [isFocused, setIsFocused] = React.useState(false);

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '5px',
    width: fullWidth ? '100%' : 'auto',
  };

  const labelStyles: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: '500',
    color: '#555',
  };

  const getBorderColor = () => {
    if (error) return '#D32F2F';
    if (isFocused) return '#04D2C6';
    return '#E0E0E0';
  };

  const selectStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    border: `1px solid ${getBorderColor()}`,
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '16px',
    color: '#333',
    outline: 'none',
    boxShadow: isFocused ? '0 0 0 3px rgba(4, 210, 198, 0.1)' : 'none',
    transition: 'border-color 0.2s ease, box-shadow 0.2s ease',
    cursor: 'pointer',
    ...style,
  };

  const errorStyles: React.CSSProperties = {
    fontSize: '12px',
    color: '#D32F2F',
  };

  return (
    <div style={containerStyles}>
      {label && <label style={labelStyles}>{label}</label>}
      <select
        {...props}
        style={selectStyles}
        onFocus={(e) => {
          setIsFocused(true);
          props.onFocus?.(e);
        }}
        onBlur={(e) => {
          setIsFocused(false);
          props.onBlur?.(e);
        }}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <span style={errorStyles}>{error}</span>}
    </div>
  );
};
