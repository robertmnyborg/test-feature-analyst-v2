/**
 * Component 2: Advanced Filter Panel
 * Comprehensive filtering controls for unit attributes and features
 * States: Collapsed, expanded, filtered, cleared
 */

import React, { useState, useEffect } from 'react';
import { Card, Button, Input } from './common';
import { useFeatures } from '../hooks';
import type { SearchFilters } from '@feature-analyst/shared';

export interface AdvancedFilterPanelProps {
  filters: SearchFilters;
  onFiltersChange: (filters: SearchFilters) => void;
  onSearch: () => void;
  disabled?: boolean;
}

export const AdvancedFilterPanel: React.FC<AdvancedFilterPanelProps> = ({
  filters,
  onFiltersChange,
  onSearch,
  disabled = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const [featureSearchQuery, setFeatureSearchQuery] = useState('');
  const { features } = useFeatures();

  const hasActiveFilters =
    (filters.features && filters.features.length > 0) ||
    filters.bedroomRange?.min !== undefined ||
    filters.bedroomRange?.max !== undefined ||
    filters.bathroomRange?.min !== undefined ||
    filters.bathroomRange?.max !== undefined ||
    filters.priceRange?.min !== undefined ||
    filters.priceRange?.max !== undefined ||
    filters.squareFeetRange?.min !== undefined ||
    filters.squareFeetRange?.max !== undefined ||
    (filters.availability && filters.availability !== 'all');

  const filteredFeatures = features.filter((f) =>
    f.name.toLowerCase().includes(featureSearchQuery.toLowerCase())
  );

  const handleClearAll = () => {
    onFiltersChange({
      ...filters,
      features: [],
      bedroomRange: undefined,
      bathroomRange: undefined,
      priceRange: undefined,
      squareFeetRange: undefined,
      availability: 'all',
    });
  };

  const handleFeatureToggle = (featureName: string) => {
    const currentFeatures = filters.features || [];
    const newFeatures = currentFeatures.includes(featureName)
      ? currentFeatures.filter((f) => f !== featureName)
      : [...currentFeatures, featureName];
    onFiltersChange({ ...filters, features: newFeatures });
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
    cursor: 'pointer',
    userSelect: 'none',
  };

  const titleContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  };

  const titleStyles: React.CSSProperties = {
    fontSize: '20px',
    fontWeight: '600',
    color: '#333',
  };

  const badgeStyles: React.CSSProperties = {
    backgroundColor: '#04D2C6',
    color: '#FFFFFF',
    fontSize: '12px',
    fontWeight: '600',
    padding: '4px 8px',
    borderRadius: '12px',
  };

  const toggleStyles: React.CSSProperties = {
    fontSize: '14px',
    color: '#666',
  };

  const sectionStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
  };

  const sectionTitleStyles: React.CSSProperties = {
    fontSize: '16px',
    fontWeight: '500',
    color: '#555',
    marginBottom: '5px',
  };

  const rangeInputsStyles: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '10px',
  };

  const featureGridStyles: React.CSSProperties = {
    maxHeight: '200px',
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '10px',
    backgroundColor: '#F8F8F8',
    borderRadius: '8px',
  };

  const featureItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    padding: '8px',
    backgroundColor: '#FFFFFF',
    borderRadius: '6px',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  const checkboxStyles: React.CSSProperties = {
    marginRight: '10px',
    cursor: 'pointer',
    accentColor: '#04D2C6',
  };

  const featureNameStyles: React.CSSProperties = {
    flex: 1,
    fontSize: '14px',
    color: '#333',
  };

  const featureCountStyles: React.CSSProperties = {
    fontSize: '12px',
    color: '#666',
    fontWeight: '500',
  };

  const actionButtonsStyles: React.CSSProperties = {
    display: 'flex',
    gap: '10px',
    marginTop: '10px',
  };

  return (
    <Card>
      <div style={containerStyles}>
        <div style={headerStyles} onClick={() => setIsExpanded(!isExpanded)}>
          <div style={titleContainerStyles}>
            <h2 style={titleStyles}>Advanced Filters</h2>
            {hasActiveFilters && <span style={badgeStyles}>Active</span>}
          </div>
          <span style={toggleStyles}>{isExpanded ? '▼' : '▶'} {isExpanded ? 'Collapse' : 'Expand'}</span>
        </div>

        {isExpanded && (
          <>
            <div style={sectionStyles}>
              <h3 style={sectionTitleStyles}>Bedrooms</h3>
              <div style={rangeInputsStyles}>
                <Input
                  type="number"
                  placeholder="Min (0-5)"
                  value={filters.bedroomRange?.min ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    onFiltersChange({
                      ...filters,
                      bedroomRange: { ...filters.bedroomRange, min: value },
                    });
                  }}
                  min={0}
                  max={5}
                  disabled={disabled}
                />
                <Input
                  type="number"
                  placeholder="Max (0-5)"
                  value={filters.bedroomRange?.max ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    onFiltersChange({
                      ...filters,
                      bedroomRange: { ...filters.bedroomRange, max: value },
                    });
                  }}
                  min={0}
                  max={5}
                  disabled={disabled}
                />
              </div>
            </div>

            <div style={sectionStyles}>
              <h3 style={sectionTitleStyles}>Bathrooms</h3>
              <div style={rangeInputsStyles}>
                <Input
                  type="number"
                  placeholder="Min (0-4)"
                  value={filters.bathroomRange?.min ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    onFiltersChange({
                      ...filters,
                      bathroomRange: { ...filters.bathroomRange, min: value },
                    });
                  }}
                  min={0}
                  max={4}
                  disabled={disabled}
                />
                <Input
                  type="number"
                  placeholder="Max (0-4)"
                  value={filters.bathroomRange?.max ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    onFiltersChange({
                      ...filters,
                      bathroomRange: { ...filters.bathroomRange, max: value },
                    });
                  }}
                  min={0}
                  max={4}
                  disabled={disabled}
                />
              </div>
            </div>

            <div style={sectionStyles}>
              <h3 style={sectionTitleStyles}>Monthly Rent</h3>
              <div style={rangeInputsStyles}>
                <Input
                  type="number"
                  placeholder="Min ($)"
                  value={filters.priceRange?.min ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    onFiltersChange({
                      ...filters,
                      priceRange: { ...filters.priceRange, min: value },
                    });
                  }}
                  min={0}
                  disabled={disabled}
                />
                <Input
                  type="number"
                  placeholder="Max ($)"
                  value={filters.priceRange?.max ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    onFiltersChange({
                      ...filters,
                      priceRange: { ...filters.priceRange, max: value },
                    });
                  }}
                  min={0}
                  disabled={disabled}
                />
              </div>
            </div>

            <div style={sectionStyles}>
              <h3 style={sectionTitleStyles}>Square Footage</h3>
              <div style={rangeInputsStyles}>
                <Input
                  type="number"
                  placeholder="Min sq ft"
                  value={filters.squareFeetRange?.min ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    onFiltersChange({
                      ...filters,
                      squareFeetRange: { ...filters.squareFeetRange, min: value },
                    });
                  }}
                  min={0}
                  disabled={disabled}
                />
                <Input
                  type="number"
                  placeholder="Max sq ft"
                  value={filters.squareFeetRange?.max ?? ''}
                  onChange={(e) => {
                    const value = e.target.value ? parseInt(e.target.value) : undefined;
                    onFiltersChange({
                      ...filters,
                      squareFeetRange: { ...filters.squareFeetRange, max: value },
                    });
                  }}
                  min={0}
                  disabled={disabled}
                />
              </div>
            </div>

            <div style={sectionStyles}>
              <h3 style={sectionTitleStyles}>
                Features ({filters.features?.length || 0} selected)
              </h3>
              <Input
                type="text"
                placeholder="Search features..."
                value={featureSearchQuery}
                onChange={(e) => setFeatureSearchQuery(e.target.value)}
                disabled={disabled}
              />
              <div style={featureGridStyles}>
                {filteredFeatures.map((feature) => {
                  const isSelected = filters.features?.includes(feature.name) || false;
                  return (
                    <div
                      key={feature.id}
                      style={featureItemStyles}
                      onClick={() => !disabled && handleFeatureToggle(feature.name)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleFeatureToggle(feature.name)}
                        onClick={(e) => e.stopPropagation()}
                        style={checkboxStyles}
                        disabled={disabled}
                      />
                      <span style={featureNameStyles}>{feature.name}</span>
                      {feature.unitCount !== undefined && (
                        <span style={featureCountStyles}>({feature.unitCount})</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div style={sectionStyles}>
              <h3 style={sectionTitleStyles}>Availability</h3>
              <select
                value={filters.availability || 'all'}
                onChange={(e) =>
                  onFiltersChange({
                    ...filters,
                    availability: e.target.value as 'available' | 'occupied' | 'all',
                  })
                }
                disabled={disabled}
                style={{
                  backgroundColor: '#FFFFFF',
                  border: '1px solid #E0E0E0',
                  borderRadius: '6px',
                  padding: '10px 12px',
                  fontSize: '16px',
                  color: '#333',
                  outline: 'none',
                  cursor: 'pointer',
                }}
              >
                <option value="all">All Units</option>
                <option value="available">Available Only</option>
                <option value="occupied">Occupied Only</option>
              </select>
            </div>

            <div style={actionButtonsStyles}>
              <Button
                variant="primary"
                onClick={onSearch}
                disabled={disabled || filters.communityIds.length === 0}
                fullWidth
              >
                Search Units
              </Button>
              <Button variant="secondary" onClick={handleClearAll} disabled={disabled}>
                Clear All Filters
              </Button>
            </div>
          </>
        )}
      </div>
    </Card>
  );
};
