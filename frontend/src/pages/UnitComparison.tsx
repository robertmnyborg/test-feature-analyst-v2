/**
 * Unit Comparison Page
 * Main page integrating all 6 components
 * Supports all 4 user workflows from NEWSPEC.md
 */

import React, { useState } from 'react';
import {
  CommunityBrowser,
  AdvancedFilterPanel,
  UnitComparisonTable,
  PhotoFloorPlanViewer,
  ExportButton,
  MSAStatisticsPanel,
} from '../components';
import { useUnitSearch } from '../hooks';
import type { SearchFilters, Unit } from '@feature-analyst/shared';

export const UnitComparison: React.FC = () => {
  const [selectedMSAId, setSelectedMSAId] = useState<string | undefined>();
  const [selectedCommunityIds, setSelectedCommunityIds] = useState<string[]>([]);
  const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);
  const [filters, setFilters] = useState<SearchFilters>({
    communityIds: [],
    availability: 'all',
  });

  const { units, total, loading, error, search } = useUnitSearch();

  const handleCommunitySelectionChange = (communityIds: string[]) => {
    setSelectedCommunityIds(communityIds);
    setFilters((prev) => ({
      ...prev,
      communityIds,
    }));
  };

  const handleMSAChange = (msaId: string) => {
    setSelectedMSAId(msaId || undefined);
    // Clear community selection when MSA changes
    setSelectedCommunityIds([]);
    setFilters((prev) => ({
      ...prev,
      communityIds: [],
      msaId: msaId || undefined,
    }));
  };

  const handleSearch = async () => {
    if (filters.communityIds.length === 0) {
      return;
    }
    await search(filters);
  };

  const containerStyles: React.CSSProperties = {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
  };

  const headerStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    padding: '20px 30px',
    boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)',
    position: 'sticky',
    top: 0,
    zIndex: 100,
  };

  const headerContentStyles: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  };

  const titleContainerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
  };

  const h1Styles: React.CSSProperties = {
    color: '#04D2C6',
    fontSize: '32px',
    fontWeight: '600',
    marginBottom: '5px',
  };

  const subtitleStyles: React.CSSProperties = {
    color: '#666',
    fontSize: '16px',
  };

  const dataFreshnessStyles: React.CSSProperties = {
    fontSize: '12px',
    color: '#888',
    fontStyle: 'italic',
  };

  const mainStyles: React.CSSProperties = {
    flex: 1,
    backgroundColor: '#2B2D31',
    padding: '30px',
  };

  const contentStyles: React.CSSProperties = {
    maxWidth: '1400px',
    margin: '0 auto',
    display: 'grid',
    gridTemplateColumns: '1fr 2fr',
    gap: '30px',
  };

  const leftColumnStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const rightColumnStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  };

  const exportContainerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'flex-end',
    alignItems: 'center',
  };

  const footerStyles: React.CSSProperties = {
    backgroundColor: '#FFFFFF',
    padding: '20px',
    textAlign: 'center',
    color: '#888',
    fontSize: '14px',
    boxShadow: '0 -2px 10px rgba(0, 0, 0, 0.1)',
  };

  const responsiveStyles: React.CSSProperties = {
    '@media (max-width: 1024px)': {
      gridTemplateColumns: '1fr',
    },
  } as any;

  return (
    <div style={containerStyles}>
      <header style={headerStyles}>
        <div style={headerContentStyles}>
          <div style={titleContainerStyles}>
            <h1 style={h1Styles}>Feature Analyst V2</h1>
            <p style={subtitleStyles}>Multifamily Unit Feature Comparison Tool</p>
          </div>
          <div style={dataFreshnessStyles}>
            Data last updated: {new Date().toLocaleDateString()}
          </div>
        </div>
      </header>

      <main style={mainStyles}>
        <div style={contentStyles}>
          <div style={leftColumnStyles}>
            <CommunityBrowser
              selectedCommunityIds={selectedCommunityIds}
              onSelectionChange={handleCommunitySelectionChange}
              msaId={selectedMSAId}
              onMSAChange={handleMSAChange}
            />

            <AdvancedFilterPanel
              filters={filters}
              onFiltersChange={setFilters}
              onSearch={handleSearch}
              disabled={loading}
            />

            {selectedMSAId && <MSAStatisticsPanel msaCode={selectedMSAId} />}
          </div>

          <div style={rightColumnStyles}>
            {units.length > 0 && (
              <div style={exportContainerStyles}>
                <ExportButton
                  filters={filters}
                  disabled={loading || units.length === 0}
                />
              </div>
            )}

            <UnitComparisonTable
              units={units}
              loading={loading}
              onRowClick={setSelectedUnit}
            />

            {error && (
              <div
                style={{
                  padding: '20px',
                  backgroundColor: '#FFEBEE',
                  borderRadius: '8px',
                  color: '#D32F2F',
                  fontSize: '14px',
                }}
              >
                {error}
              </div>
            )}
          </div>
        </div>
      </main>

      <PhotoFloorPlanViewer unit={selectedUnit} onClose={() => setSelectedUnit(null)} />

      <footer style={footerStyles}>
        © 2025 Feature Analyst V2 - Investment & Acquisition Analytics
      </footer>
    </div>
  );
};
