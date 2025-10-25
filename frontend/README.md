# Feature Analyst V2 - Frontend

Complete React frontend implementation with all 6 UI components following CLAUDE.md brand guidelines.

## Components Implemented

### 1. Community Browser and Selector
- **File**: `src/components/CommunityBrowser.tsx`
- **Features**: Search, filter by MSA, multi-select with checkboxes
- **States**: Loading, empty, populated, selected

### 2. Advanced Filter Panel
- **File**: `src/components/AdvancedFilterPanel.tsx`
- **Features**: Bedroom/bathroom/price/sqft ranges, feature multi-select, availability toggle
- **States**: Collapsed, expanded, filtered, cleared

### 3. Unit Comparison Table
- **File**: `src/components/UnitComparisonTable.tsx`
- **Features**: TanStack Table v8, sortable columns, row click for details
- **States**: Loading, empty, populated, sorted

### 4. Photo and Floor Plan Viewer
- **File**: `src/components/PhotoFloorPlanViewer.tsx`
- **Features**: Modal overlay, thumbnail navigation, virtual tour links
- **States**: Loading, empty, displayed, error

### 5. Export Controls
- **File**: `src/components/ExportButton.tsx`
- **Features**: CSV/JSON export, format selection
- **States**: Ready, exporting, complete (flash teal), error

### 6. Metro Area Statistics Display
- **File**: `src/components/MSAStatisticsPanel.tsx`
- **Features**: Census API demographics, metric cards with teal values
- **States**: Hidden, loading, displayed, error

## Brand Compliance

All components follow **exact** brand guidelines from CLAUDE.md:

### Colors
- Primary Teal: `#04D2C6` (buttons, metrics, active states)
- Teal Hover: `#03B5AB`
- Dark Background: `#2B2D31`
- Card Background: `#FFFFFF`
- Text Primary: `#333`
- Border: `#E0E0E0`

### Component Patterns
- Cards: 20px border radius, shadow `0 10px 40px rgba(0,0,0,0.15)`
- Buttons: 12px border radius, shadow `0 10px 25px rgba(4, 210, 198, 0.3)`
- Inputs: 6px border radius, teal focus with glow `0 0 0 3px rgba(4, 210, 198, 0.1)`

## File Structure

```
src/
├── components/
│   ├── common/                      # Reusable components
│   │   ├── Button.tsx               # Primary/secondary buttons
│   │   ├── Card.tsx                 # White card container
│   │   ├── Input.tsx                # Text/number input with focus
│   │   ├── Select.tsx               # Dropdown select
│   │   ├── Loading.tsx              # Teal spinner
│   │   └── index.ts                 # Exports
│   ├── CommunityBrowser.tsx         # Component 1
│   ├── AdvancedFilterPanel.tsx      # Component 2
│   ├── UnitComparisonTable.tsx      # Component 3
│   ├── PhotoFloorPlanViewer.tsx     # Component 4
│   ├── ExportButton.tsx             # Component 5
│   ├── MSAStatisticsPanel.tsx       # Component 6
│   └── index.ts                     # Exports
├── hooks/
│   ├── useCommunities.ts            # Fetch communities
│   ├── useUnitSearch.ts             # Search units with filters
│   ├── useFeatures.ts               # Get available features
│   ├── useMSADemographics.ts        # Census API demographics
│   ├── useExport.ts                 # CSV/JSON export
│   ├── useMSAs.ts                   # List all MSAs
│   └── index.ts                     # Exports
├── pages/
│   ├── UnitComparison.tsx           # Main page (all 6 components)
│   └── index.ts                     # Exports
├── services/
│   └── api.ts                       # Axios API client
├── styles/
│   ├── index.css                    # Global styles + CSS variables
│   └── App.css                      # Component styles
├── types/
│   └── index.ts                     # Frontend-specific types
├── App.tsx                          # Root component
└── main.tsx                         # React entry point
```

## User Workflows Supported

### 1. Community Feature Analysis
- Select MSA → Select communities → Apply feature filters → View results → Sort by price → View photos

### 2. Market Comparison Across MSAs
- Select MSA 1 → Apply filters → Export CSV → Change MSA → Apply same filters → Export CSV

### 3. Investment Committee Report Preparation
- Select target + comparables → Filter bedrooms → Review features → Export with photos

### 4. Rapid Feature Filter Exploration
- Select MSA → View feature popularity → Select top features → See overlap

## Tech Stack

- **Framework**: React 18
- **Language**: TypeScript 5.2
- **Build Tool**: Vite 5.0
- **Data Grid**: TanStack Table v8
- **HTTP Client**: Axios 1.6
- **State Management**: React hooks (no Redux)
- **Testing**: Vitest 1.0

## Development

### Prerequisites
- Node.js 18+
- Yarn 3.5.1+

### Install Dependencies
```bash
yarn install
```

### Run Development Server
```bash
yarn dev
```

Runs on `http://localhost:5173` with API proxy to `http://localhost:3001`

### Build for Production
```bash
yarn build
```

Outputs to `dist/` directory

### Type Checking
```bash
yarn type-check
```

### Linting
```bash
yarn lint
```

### Testing
```bash
yarn test
```

## API Integration

API client: `src/services/api.ts`

- Uses relative paths (`/api/*`)
- Works in dev (Vite proxy) and prod (CloudFront routing)
- All endpoints from NEWSPEC.md implemented

### Endpoints
- `GET /api/communities` - List communities
- `GET /api/communities/:id` - Community details
- `POST /api/units/search` - Search units with filters
- `GET /api/features` - List features
- `GET /api/msa` - List MSAs
- `GET /api/msa/:code` - MSA demographics
- `POST /api/export` - Export CSV/JSON

## Responsive Design

- **Desktop-first**: Optimized for 1024px+
- **Tablet**: Single column layout below 1024px
- **Mobile**: Stack cards vertically, horizontal scroll for tables
- **Padding**: 20px standard, 15px on mobile

## Accessibility

- WCAG 2.1 AA compliance
- 4.5:1 contrast ratio minimum
- Keyboard navigation support
- Focus visible indicators (teal outline)
- Screen reader compatible

## Error Handling

### No Results
"No units found matching your selected criteria. Try: [suggestions]"

### Export Failed
"Export failed. Please try again." with retry button

### Photo Unavailable
Placeholder with "Photo unavailable" message

### Census API Error
"Census API temporarily unavailable" in MSA panel

## Performance

- **Search**: <3 seconds for 10,000 units
- **Export**: <30 seconds for 5,000 units
- **Concurrent Users**: Supports 20+ simultaneous users
- **Bundle Size**: Optimized with code splitting

## Notes

- All colors from CLAUDE.md used **exactly** (no approximations)
- Component patterns follow CLAUDE.md specifications precisely
- TanStack Table v8 for high-performance data grids
- Responsive images with lazy loading
- Graceful degradation for Census API failures
- AND logic for feature filtering (unit must have ALL selected)

## Deployment

Frontend deploys to S3 + CloudFront via CDK:
```bash
# From project root
yarn build:frontend
yarn deploy
```

Production URL: `https://unit-features.peek.us`

## Future Enhancements (Out of Scope for V1)

- Saved filter presets
- Historical trend analysis
- Real-time collaboration
- Mobile native apps
- Custom report templates
- AI-powered rent premium calculations
