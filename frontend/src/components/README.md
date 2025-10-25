# Components

This directory contains React components for the Feature Analyst V2 frontend.

## Planned Components (Stubs)

### 1. CommunityBrowser.tsx
**Purpose**: Browse and select communities for analysis

**Props**:
- `selectedCommunities: string[]`
- `onCommunitySelect: (communityId: string) => void`
- `msaFilter?: string`

**Features**:
- Searchable community list
- Multi-select with checkboxes
- MSA filtering
- Loading and empty states

---

### 2. AdvancedFilterPanel.tsx
**Purpose**: Comprehensive filtering controls for unit attributes

**Props**:
- `filters: SearchFilters`
- `onFiltersChange: (filters: SearchFilters) => void`
- `onReset: () => void`

**Features**:
- Bedroom/bathroom range sliders
- Price and square footage inputs
- Feature multi-select
- Availability toggles
- Collapsible/expandable design

---

### 3. UnitComparisonTable.tsx
**Purpose**: Display filtered units in sortable table

**Props**:
- `units: Unit[]`
- `onUnitClick: (unit: Unit) => void`
- `loading: boolean`

**Features**:
- TanStack Table v8 integration
- Column sorting
- Sticky header
- Row click for details
- Responsive horizontal scroll

---

### 4. PhotoFloorPlanViewer.tsx
**Purpose**: Display unit photos and floor plans

**Props**:
- `unit: Unit`
- `onClose: () => void`

**Features**:
- Modal/lightbox display
- Image carousel
- Lazy loading
- Placeholder for missing images
- Virtual tour links

---

### 5. ExportButton.tsx
**Purpose**: Trigger data export to CSV/JSON

**Props**:
- `filters: SearchFilters`
- `format: 'csv' | 'json'`
- `disabled?: boolean`

**Features**:
- Loading state during export
- Success/error feedback
- Download initiation
- Format selection

---

### 6. MSAStatisticsPanel.tsx
**Purpose**: Show metro area demographics

**Props**:
- `msaCode?: string`

**Features**:
- US Census Bureau data display
- Population, median income, housing units
- Collapsible panel
- Loading and error states
- Cache-aware data fetching

---

## Component Organization

```
components/
├── common/               # Reusable UI components
│   ├── Button.tsx
│   ├── Card.tsx
│   ├── Input.tsx
│   ├── Select.tsx
│   └── Spinner.tsx
├── CommunityBrowser.tsx
├── AdvancedFilterPanel.tsx
├── UnitComparisonTable.tsx
├── PhotoFloorPlanViewer.tsx
├── ExportButton.tsx
└── MSAStatisticsPanel.tsx
```

## Styling Conventions

- Use brand colors from `index.css` CSS variables
- Teal accent (`#04D2C6`) for primary actions and key data
- White cards on dark background
- 20px border radius for cards, 12px for buttons
- Consistent spacing using CSS variables
