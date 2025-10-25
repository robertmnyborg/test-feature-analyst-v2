/**
 * Component 1: Community Browser and Selector
 * Allows users to browse and select communities for analysis
 * States: Loading, empty, populated, selected
 */

import React, { useState, useMemo } from 'react';
import { Card, Input, Loading } from './common';
import { useCommunities, useMSAs } from '../hooks';
import type { Community } from '@feature-analyst/shared';

export interface CommunityBrowserProps {
  selectedCommunityIds: string[];
  onSelectionChange: (communityIds: string[]) => void;
  msaId?: string;
  onMSAChange?: (msaId: string) => void;
}

export const CommunityBrowser: React.FC<CommunityBrowserProps> = ({
  selectedCommunityIds,
  onSelectionChange,
  msaId,
  onMSAChange,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const { msas, loading: msasLoading } = useMSAs();
  const { communities, loading: communitiesLoading, error } = useCommunities({ msaId });

  const filteredCommunities = useMemo(() => {
    if (!searchQuery) return communities;
    const query = searchQuery.toLowerCase();
    return communities.filter(
      (c) =>
        c.name.toLowerCase().includes(query) ||
        c.address?.city.toLowerCase().includes(query) ||
        c.msaName?.toLowerCase().includes(query)
    );
  }, [communities, searchQuery]);

  const handleCheckboxChange = (communityId: string, checked: boolean) => {
    if (checked) {
      onSelectionChange([...selectedCommunityIds, communityId]);
    } else {
      onSelectionChange(selectedCommunityIds.filter((id) => id !== communityId));
    }
  };

  const handleSelectAll = () => {
    onSelectionChange(filteredCommunities.map((c) => c.id));
  };

  const handleClearAll = () => {
    onSelectionChange([]);
  };

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  };

  const headerStyles: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '10px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  };

  const selectedCountStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#04D2C6',
    fontWeight: '500',
  };

  const controlsStyles: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    flexWrap: 'wrap',
  };

  const msaSelectStyles: React.CSSProperties = {
    flex: 1,
    minWidth: '200px',
    backgroundColor: '#FFFFFF',
    border: '1px solid #E0E0E0',
    borderRadius: '6px',
    padding: '10px 12px',
    fontSize: '16px',
    color: '#333',
    outline: 'none',
    cursor: 'pointer',
  };

  const actionButtonStyles: React.CSSProperties = {
    fontSize: '14px',
    padding: '8px 16px',
    borderRadius: '6px',
    border: '1px solid #E0E0E0',
    backgroundColor: '#FFFFFF',
    color: '#666',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
  };

  const communityListStyles: React.CSSProperties = {
    maxHeight: '400px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  const communityItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'flex-start',
    padding: '12px',
    backgroundColor: '#F8F8F8',
    borderRadius: '8px',
    transition: 'background-color 0.2s ease',
    cursor: 'pointer',
  };

  const checkboxStyles: React.CSSProperties = {
    marginRight: '12px',
    marginTop: '2px',
    cursor: 'pointer',
    accentColor: '#04D2C6',
  };

  const communityInfoStyles: React.CSSProperties = {
    flex: 1,
  };

  const communityNameStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#333',
    marginBottom: '4px',
  };

  const communityMetaStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
  };

  const emptyStateStyles: React.CSSProperties = {
    textAlign: 'center',
    padding: '40px 20px',
    color: '#666',
  };

  const errorStyles: React.CSSProperties = {
    padding: '20px',
    backgroundColor: '#FFEBEE',
    borderRadius: '8px',
    color: '#D32F2F',
    fontSize: '14px',
  };

  return (
    <Card>
      <div style={containerStyles}>
        <div style={headerStyles}>
          <h2 style={titleStyles}>Communities</h2>
          {selectedCommunityIds.length > 0 && (
            <span style={selectedCountStyles}>
              {selectedCommunityIds.length} selected
            </span>
          )}
        </div>

        <div style={controlsStyles}>
          {onMSAChange && (
            <select
              style={msaSelectStyles}
              value={msaId || ''}
              onChange={(e) => onMSAChange(e.target.value)}
              disabled={msasLoading}
            >
              <option value="">All Metro Areas</option>
              {msas.map((msa) => (
                <option key={msa.id} value={msa.id}>
                  {msa.name}
                </option>
              ))}
            </select>
          )}
          <Input
            type="text"
            placeholder="Search communities..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, minWidth: '200px' }}
          />
        </div>

        <div style={controlsStyles}>
          <button
            style={actionButtonStyles}
            onClick={handleSelectAll}
            disabled={filteredCommunities.length === 0}
          >
            Select All ({filteredCommunities.length})
          </button>
          <button
            style={actionButtonStyles}
            onClick={handleClearAll}
            disabled={selectedCommunityIds.length === 0}
          >
            Clear Selection
          </button>
        </div>

        {error && <div style={errorStyles}>{error}</div>}

        {communitiesLoading ? (
          <Loading text="Loading communities..." />
        ) : filteredCommunities.length === 0 ? (
          <div style={emptyStateStyles}>
            <p>No communities found.</p>
            {searchQuery && <p>Try adjusting your search criteria.</p>}
          </div>
        ) : (
          <div style={communityListStyles}>
            {filteredCommunities.map((community) => {
              const isSelected = selectedCommunityIds.includes(community.id);
              const itemStyle: React.CSSProperties = {
                ...communityItemStyles,
                backgroundColor: isSelected ? 'rgba(4, 210, 198, 0.1)' : '#F8F8F8',
              };

              return (
                <div
                  key={community.id}
                  style={itemStyle}
                  onClick={() => handleCheckboxChange(community.id, !isSelected)}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => handleCheckboxChange(community.id, e.target.checked)}
                    onClick={(e) => e.stopPropagation()}
                    style={checkboxStyles}
                  />
                  <div style={communityInfoStyles}>
                    <div style={communityNameStyles}>{community.name}</div>
                    <div style={communityMetaStyles}>
                      {community.address?.city}, {community.address?.state}
                      {community.msaName && ` • ${community.msaName}`}
                      {' • '}
                      {community.totalUnits} units
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Card>
  );
};
