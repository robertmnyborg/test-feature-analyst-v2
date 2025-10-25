/**
 * Component 6: Metro Area Statistics Display
 * Shows MSA demographics when selected
 * States: Hidden, loading, displayed, error (API failure)
 */

import React, { useState } from 'react';
import { Card, Loading } from './common';
import { useMSADemographics } from '../hooks';
import { formatCurrency, formatNumber } from '@feature-analyst/shared';

export interface MSAStatisticsPanelProps {
  msaCode?: string;
}

export const MSAStatisticsPanel: React.FC<MSAStatisticsPanelProps> = ({ msaCode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const { msa, loading, error } = useMSADemographics({ code: msaCode });

  if (!msaCode) {
    return null;
  }

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
    userSelect: 'none',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  };

  const toggleStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
  };

  const metricsGridStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
    gap: '15px',
  };

  const metricCardStyles: React.CSSProperties = {
    backgroundColor: '#F8F8F8',
    border: '1px solid #E0E0E0',
    borderRadius: '12px',
    padding: '15px',
    textAlign: 'center',
  };

  const metricValueStyles: React.CSSProperties = {
    fontSize: '28px',
    fontWeight: '600',
    color: '#04D2C6',
    marginBottom: '5px',
  };

  const metricLabelStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
    fontWeight: '500',
  };

  const errorContainerStyles: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#FFF3E0',
    borderRadius: '8px',
    color: '#F57C00',
    fontSize: '14px',
    textAlign: 'center',
  };

  const msaNameStyles: React.CSSProperties = {
    fontSize: '16px',
    color: '#666',
    marginBottom: '15px',
  };

  return (
    <Card>
      <div style={containerStyles}>
        <div style={headerStyles} onClick={() => setIsExpanded(!isExpanded)}>
          <h2 style={titleStyles}>Metro Area Statistics</h2>
          <span style={toggleStyles}>{isExpanded ? '▼' : '▶'} {isExpanded ? 'Collapse' : 'Expand'}</span>
        </div>

        {isExpanded && (
          <>
            {loading ? (
              <Loading text="Loading demographics..." />
            ) : error ? (
              <div style={errorContainerStyles}>
                <div style={{ fontWeight: '600', marginBottom: '5px' }}>
                  Census API temporarily unavailable
                </div>
                <div>Unable to load demographic data. Please try again later.</div>
              </div>
            ) : msa ? (
              <>
                <div style={msaNameStyles}>{msa.name}</div>
                <div style={metricsGridStyles}>
                  {msa.population !== undefined && (
                    <div style={metricCardStyles}>
                      <div style={metricValueStyles}>{formatNumber(msa.population)}</div>
                      <div style={metricLabelStyles}>Population</div>
                    </div>
                  )}
                  {msa.medianIncome !== undefined && (
                    <div style={metricCardStyles}>
                      <div style={metricValueStyles}>{formatCurrency(msa.medianIncome)}</div>
                      <div style={metricLabelStyles}>Median Income</div>
                    </div>
                  )}
                  {msa.housingUnits !== undefined && (
                    <div style={metricCardStyles}>
                      <div style={metricValueStyles}>{formatNumber(msa.housingUnits)}</div>
                      <div style={metricLabelStyles}>Housing Units</div>
                    </div>
                  )}
                  {msa.rentalVacancyRate !== undefined && (
                    <div style={metricCardStyles}>
                      <div style={metricValueStyles}>{msa.rentalVacancyRate.toFixed(1)}%</div>
                      <div style={metricLabelStyles}>Vacancy Rate</div>
                    </div>
                  )}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>
    </Card>
  );
};
