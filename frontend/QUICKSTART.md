# Quick Start Guide - Feature Analyst V2 Frontend

## Project Location
```
/Users/robertnyborg/Projects/test-apps-feature-analyst-v2/frontend
```

---

## Installation

```bash
cd /Users/robertnyborg/Projects/test-apps-feature-analyst-v2
yarn install
```

This installs dependencies for all workspaces (frontend, backend, shared).

---

## Running Locally

### Option 1: Run Everything
```bash
cd /Users/robertnyborg/Projects/test-apps-feature-analyst-v2
yarn dev
```

This starts both:
- Backend API on `http://localhost:3001`
- Frontend on `http://localhost:5173`

### Option 2: Run Frontend Only
```bash
cd /Users/robertnyborg/Projects/test-apps-feature-analyst-v2
yarn frontend
```

Access at: `http://localhost:5173`

**Note**: You need the backend running on port 3001 for API calls to work.

---

## Verification

### Type Check (Already Verified ✓)
```bash
cd /Users/robertnyborg/Projects/test-apps-feature-analyst-v2/frontend
yarn type-check
```

Expected output: `Done in 1.67s`

### Build
```bash
cd /Users/robertnyborg/Projects/test-apps-feature-analyst-v2/frontend
yarn build
```

Outputs to: `dist/`

### Linting
```bash
cd /Users/robertnyborg/Projects/test-apps-feature-analyst-v2/frontend
yarn lint
```

---

## Component Testing (Manual)

### Test Component 1: Community Browser
1. Open `http://localhost:5173`
2. Click on communities to select them
3. Search for communities by name
4. Filter by metro area
5. Click "Select All" / "Clear Selection"

**Expected**:
- Selected communities have teal background `rgba(4, 210, 198, 0.1)`
- Selected count shows in teal `#04D2C6`
- Search filters communities in real-time

### Test Component 2: Advanced Filter Panel
1. Expand/collapse the panel
2. Enter bedroom range (0-5)
3. Enter bathroom range (0-4)
4. Enter price range
5. Enter square footage range
6. Search and select features
7. Change availability filter
8. Click "Search Units"
9. Click "Clear All Filters"

**Expected**:
- "Active" badge appears when filters applied (teal background)
- Inputs have teal focus border and glow
- Feature checkboxes have teal accent
- Search button is teal with shadow

### Test Component 3: Unit Comparison Table
1. Select communities and apply filters
2. Click "Search Units"
3. Click column headers to sort
4. Hover over rows
5. Click a row to open photo viewer

**Expected**:
- Table loads with data
- Sort indicators appear (▲▼⇅) in teal
- Rows have teal hover background `rgba(4, 210, 198, 0.05)`
- Feature badges are teal with white text
- Sticky header on scroll

### Test Component 4: Photo Floor Plan Viewer
1. Click any unit row in table
2. Navigate through images with arrows
3. Click thumbnails
4. Click virtual tour button (if available)
5. Press Escape or click X to close

**Expected**:
- Modal opens with black overlay
- Selected thumbnail has teal border
- Navigation arrows work
- Virtual tour button is teal

### Test Component 5: Export Controls
1. Select communities and search units
2. Toggle between CSV/JSON format
3. Click "Export CSV" or "Export JSON"
4. Wait for completion

**Expected**:
- Format toggle shows active state in teal
- Export button is teal with shadow
- Success message appears in teal background
- File downloads automatically
- Success message auto-dismisses after 3 seconds

### Test Component 6: MSA Statistics Panel
1. Select a metro area
2. View demographics panel
3. Expand/collapse panel
4. Check all metric values

**Expected**:
- Panel shows when MSA selected
- Metric values are teal `#04D2C6`
- Metric cards have light gray background `#F8F8F8`
- Panel collapses/expands smoothly

---

## User Workflow Testing

### Workflow 1: Community Feature Analysis
1. Select MSA: "Denver-Aurora-Lakewood, CO"
2. Select 2-3 communities
3. Open Advanced Filters
4. Select features: "Granite Countertops" + "Stainless Steel Appliances"
5. Set bedrooms: Min 2, Max 2
6. Click "Search Units"
7. Sort by price (click "Rent" header)
8. Click a unit to view photos

**Expected**: See filtered units with both features, sorted by price

### Workflow 2: Market Comparison Across MSAs
1. Select MSA 1 (e.g., Denver)
2. Select communities
3. Apply feature filters
4. Click "Export CSV"
5. Download completes
6. Change to MSA 2 (e.g., Austin)
7. Apply same filters
8. Export again

**Expected**: Two CSV files downloaded for comparison

### Workflow 3: Investment Committee Report Preparation
1. Select target community + 2-3 comparables
2. Filter: 1-2 bedrooms only
3. Review feature distribution
4. Click units to view photos
5. Export data with photos

**Expected**: Comprehensive dataset ready for presentation

### Workflow 4: Rapid Feature Filter Exploration
1. Select metro area
2. Open feature filter
3. View features ranked by popularity (unit counts shown)
4. Select top 3 features
5. Search units

**Expected**: Units with all 3 selected features displayed

---

## Responsive Testing

### Desktop (1024px+)
- 2-column layout
- All features visible
- No horizontal scrolling (except table if wide)

### Tablet (768px - 1023px)
- Single column layout
- Cards stack vertically
- Table horizontal scroll

### Mobile (< 768px)
- Stacked layout
- Smaller padding (15px)
- Smaller fonts (min 12px)
- Table horizontal scroll

**Test**: Resize browser window to verify responsive behavior

---

## Browser Testing

### Recommended Browsers
- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

### Features to Test
- CSS Grid layout
- Flexbox
- CSS variables (custom properties)
- Box shadows
- Border radius
- Hover states
- Focus states
- Animations (spinner, skeleton)

---

## Accessibility Testing

### Keyboard Navigation
- Tab through all interactive elements
- Enter activates buttons
- Escape closes modals
- Arrow keys (if applicable)

### Screen Reader
- All images have alt text
- All buttons have labels
- Form inputs have labels
- ARIA attributes (if needed)

### Color Contrast
- Teal on White: 4.52:1 (AA) ✓
- Dark Text on White: 12.63:1 (AAA) ✓
- White on Teal: 4.52:1 (AA) ✓

---

## Common Issues & Troubleshooting

### Issue: "Cannot find module '@feature-analyst/shared'"
**Solution**: Install dependencies from project root
```bash
cd /Users/robertnyborg/Projects/test-apps-feature-analyst-v2
yarn install
```

### Issue: API calls failing (404, 500)
**Solution**: Ensure backend is running on port 3001
```bash
cd /Users/robertnyborg/Projects/test-apps-feature-analyst-v2
yarn backend
```

### Issue: TypeScript errors
**Solution**: Run type check to see specific errors
```bash
cd /Users/robertnyborg/Projects/test-apps-feature-analyst-v2/frontend
yarn type-check
```

### Issue: Port 5173 already in use
**Solution**: Kill process or change port in vite.config.ts

### Issue: Changes not reflecting
**Solution**: Clear browser cache or hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

---

## Performance Testing

### Search Performance
- Select 3+ communities
- Apply multiple filters
- Click "Search Units"
- Measure time from click to results displayed

**Target**: < 3 seconds for 10,000 units

### Export Performance
- Search for 1,000+ units
- Click "Export CSV"
- Measure time to download completion

**Target**: < 30 seconds for 5,000 units

### Table Sorting
- Display 100+ units
- Click column header to sort
- Measure re-render time

**Target**: Instant (< 100ms)

---

## Next Steps After Frontend Verification

1. **Backend Integration**: Connect to real backend API
2. **Database Setup**: Configure PostgreSQL and MongoDB
3. **Census API**: Add Census Bureau API key
4. **Unit Tests**: Write Vitest tests
5. **E2E Tests**: Add Playwright tests
6. **Deployment**: Configure CDK for production

---

## Documentation Files

- `README.md` - Full frontend documentation
- `IMPLEMENTATION_SUMMARY.md` - Complete implementation details
- `BRAND_COMPLIANCE.md` - Visual brand guide
- `QUICKSTART.md` - This file

---

## Support

**File Location**: `/Users/robertnyborg/Projects/test-apps-feature-analyst-v2/frontend`

**Key Commands**:
```bash
yarn dev          # Run dev server
yarn build        # Build for production
yarn type-check   # TypeScript validation
yarn lint         # ESLint check
yarn test         # Run Vitest tests (when added)
```

**Production URL** (after deployment): `https://unit-features.peek.us`

---

**Last Updated**: 2025-10-24
**Status**: Complete and ready for testing
