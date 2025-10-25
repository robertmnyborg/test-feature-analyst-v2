/**
 * Frontend-Specific Types
 *
 * This file contains types specific to the frontend application
 * that are not shared with the backend.
 */

import type { SearchFilters, Unit } from '@shared/types';

/**
 * UI State for filter panel
 */
export interface FilterPanelState {
  isExpanded: boolean;
  activeTab?: 'basic' | 'advanced';
}

/**
 * Table sorting state
 */
export interface TableSortState {
  column: string;
  direction: 'asc' | 'desc';
}

/**
 * Pagination state
 */
export interface PaginationState {
  page: number;
  pageSize: number;
}

/**
 * Export modal state
 */
export interface ExportModalState {
  isOpen: boolean;
  format: 'csv' | 'json';
  selectedFields?: string[];
}

/**
 * Photo viewer state
 */
export interface PhotoViewerState {
  isOpen: boolean;
  currentUnit?: Unit;
  currentPhotoIndex: number;
}

/**
 * Loading state for async operations
 */
export interface LoadingState {
  isLoading: boolean;
  error?: string;
}

/**
 * Complete application state (for context or state management)
 */
export interface AppState {
  filters: SearchFilters;
  units: Unit[];
  selectedCommunities: string[];
  filterPanel: FilterPanelState;
  tableSort: TableSortState;
  pagination: PaginationState;
  exportModal: ExportModalState;
  photoViewer: PhotoViewerState;
  loading: {
    communities: LoadingState;
    units: LoadingState;
    features: LoadingState;
    export: LoadingState;
  };
}
