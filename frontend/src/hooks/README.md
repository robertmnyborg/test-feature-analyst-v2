# Hooks

This directory contains custom React hooks for the Feature Analyst V2 frontend.

## Planned Hooks

### useCommunities.ts
```typescript
export function useCommunities(msaId?: string) {
  // Fetch and manage community data
  // Returns: { communities, loading, error, refetch }
}
```

### useUnitSearch.ts
```typescript
export function useUnitSearch(filters: SearchFilters) {
  // Execute unit search with filters
  // Returns: { units, loading, error, total, refetch }
}
```

### useFeatures.ts
```typescript
export function useFeatures(communityId?: string) {
  // Fetch available features
  // Returns: { features, loading, error }
}
```

### useMSADemographics.ts
```typescript
export function useMSADemographics(msaCode?: string) {
  // Fetch MSA demographics with caching
  // Returns: { demographics, loading, error }
}
```

### useExport.ts
```typescript
export function useExport() {
  // Handle data export operations
  // Returns: { exportData, loading, error, downloadUrl }
}
```

## Hook Patterns

All data-fetching hooks should:
- Use `apiClient` from `services/api.ts`
- Implement loading and error states
- Support refetch/refresh capability
- Handle cleanup on unmount
- Cache responses when appropriate
