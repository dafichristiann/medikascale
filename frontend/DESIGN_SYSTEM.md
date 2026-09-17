# MedikaScale Design System

## Color Palette

### Primary Colors
- **Blue-600**: `#2563eb` - Primary actions, links
- **Blue-50**: `#eff6ff` - Light backgrounds
- **Blue-100**: `#dbeafe` - Hover states

### Status Colors
- **Green**: Success, normal status
  - `#10b981` (emerald-500)
  - `#dcfce7` (emerald-100)
  - `#166534` (emerald-900)
  
- **Yellow**: Warning, at-risk
  - `#f59e0b` (amber-500)
  - `#fef3c7` (amber-100)
  - `#92400e` (amber-900)
  
- **Red**: Danger, malnutrition
  - `#ef4444` (red-500)
  - `#fee2e2` (red-100)
  - `#991b1b` (red-900)

- **Gray**: Neutral, pending
  - `#6b7280` (gray-500)
  - `#f3f4f6` (gray-100)
  - `#111827` (gray-900)

### Antrian Status Colors
- **Putih** (White): Pending → `#f3f4f6` bg, `#111827` text
- **Hijau** (Green): Called → `#dcfce7` bg, `#166534` text
- **Kuning** (Yellow): In-progress → `#fef3c7` bg, `#92400e` text
- **Merah** (Red): Completed/Closed → `#fee2e2` bg, `#991b1b` text

### Gizi Status Colors
- **Normal**: Green `#10b981`
- **At-Risk**: Yellow `#f59e0b`
- **Malnutrition**: Red `#ef4444`

---

## Typography

### Font Stack
```css
--sans: system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif;
--mono: ui-monospace, Consolas, 'Courier New', monospace;
```

### Heading Styles
- **H1**: 32px, 600 weight, `#111827`
- **H2**: 24px, 600 weight, `#111827`
- **H3**: 18px, 600 weight, `#111827`

### Body Text
- **Body**: 16px, 400 weight, `#4b5563` (line-height: 1.5)
- **Small**: 14px, 400 weight, `#6b7280`
- **Xsmall**: 12px, 400 weight, `#9ca3af`

### Monospace (Data)
- Queue numbers: 18px, 700 weight, `#111827`
- Measurements: 16px, 500 weight, `#374151`

---

## Spacing Scale

```
4px   (0.25rem) - xs
8px   (0.5rem)  - sm
12px  (0.75rem) - md
16px  (1rem)    - lg
24px  (1.5rem)  - xl
32px  (2rem)    - 2xl
48px  (3rem)    - 3xl
```

### Component Spacing
- **Button padding**: 8px 16px (sm lg)
- **Input padding**: 8px 12px (sm md)
- **Card padding**: 24px (xl)
- **Section gap**: 24px (xl)
- **Grid gap**: 16px (lg)

---

## Button Styles

### Primary Button
```
Background: #2563eb (blue-600)
Text: white
Padding: 10px 16px
Border-radius: 6px
Font-weight: 500
Hover: #1d4ed8 (blue-700)
Focus: ring 2px offset 2px #3b82f6
Disabled: opacity 0.5, cursor not-allowed
```

### Secondary Button
```
Background: #e5e7eb (gray-200)
Text: #111827 (gray-900)
Padding: 10px 16px
Border-radius: 6px
Font-weight: 500
Hover: #d1d5db (gray-300)
```

### Danger Button
```
Background: #dc2626 (red-600)
Text: white
Hover: #b91c1c (red-700)
```

---

## Form Elements

### Text Input
```
Border: 1px solid #d1d5db (gray-300)
Border-radius: 6px
Padding: 8px 12px
Font-size: 14px
Focus: border #3b82f6, outline none, ring 1px #3b82f6
Placeholder: #d1d5db (gray-300)
Background: white
```

### Select Dropdown
```
Same as text input
Padding-right: 28px (for dropdown arrow)
```

### Textarea
```
Same as text input
Min-height: 80px
Font-family: monospace
```

### Checkbox / Radio
```
Border: 1px solid #d1d5db
Border-radius: 4px
Size: 18px × 18px
Focus: ring 2px #3b82f6
Checked: background #2563eb, border #2563eb
```

---

## Badges

### Success Badge
```
Background: #dcfce7 (green-100)
Text: #166534 (green-900)
Padding: 4px 8px
Border-radius: 999px
Font-size: 12px
Font-weight: 600
```

### Warning Badge
```
Background: #fef3c7 (yellow-100)
Text: #92400e (yellow-900)
```

### Danger Badge
```
Background: #fee2e2 (red-100)
Text: #991b1b (red-900)
```

### Info Badge
```
Background: #dbeafe (blue-100)
Text: #1e40af (blue-900)
```

---

## Cards & Containers

### Card
```
Background: white
Border: 1px solid #e5e7eb (gray-200)
Border-radius: 8px
Padding: 24px
Box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1)
Hover: box-shadow 0 4px 6px rgba(0, 0, 0, 0.1)
```

### Header Card (Stat Box)
```
Border-left: 4px solid [status-color]
Background: [color]-50
Padding: 24px
Border-radius: 8px
```

### Table Header
```
Background: #f3f4f6 (gray-100)
Border-bottom: 1px solid #e5e7eb (gray-200)
Padding: 12px 16px
Font-weight: 600
Font-size: 14px
Text-align: left
Color: #374151 (gray-700)
```

### Table Row
```
Border-bottom: 1px solid #e5e7eb (gray-200)
Padding: 12px 16px
Hover: background #f9fafb (gray-50)
```

---

## Shadows

### Elevation Levels
- **None**: No shadow
- **Sm**: `0 1px 2px rgba(0, 0, 0, 0.05)`
- **Base**: `0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)`
- **Md**: `0 4px 6px rgba(0, 0, 0, 0.1), 0 2px 4px rgba(0, 0, 0, 0.06)`
- **Lg**: `0 10px 15px rgba(0, 0, 0, 0.1), 0 4px 6px rgba(0, 0, 0, 0.05)`

---

## Border Radius

```
2px   - xs
4px   - sm
6px   - base (default)
8px   - md
12px  - lg
999px - full (rounded pill)
```

---

## Icons

### Icon Usage
- **Size**: 16px (small), 20px (medium), 24px (large)
- **Color**: Inherit text color or specific status color
- **SVG format preferred for scalability
- **Icons should be semantic (role="presentation" + aria-hidden for decorative)

### Common Icons
- 🏥 Clinic/Hospital
- 📊 Dashboard
- 📋 Queue/List
- 📏 Measurements
- 📄 Documents
- 🔬 Lab
- 💊 Pharmacy
- ⚙️ Settings
- 📞 Contact
- ⭐ Priority/Star

---

## Animations & Transitions

### Standard Timing
```
Fast: 150ms (interactions, hovers)
Base: 200ms (standard transitions)
Slow: 300ms (page transitions)
```

### Transition Functions
```
ease-in: cubic-bezier(0.4, 0, 1, 1)
ease-out: cubic-bezier(0, 0, 0.2, 1)
ease-in-out: cubic-bezier(0.4, 0, 0.2, 1)
linear: linear
```

### Common Transitions
```
- Background color: 200ms ease-in-out
- Border color: 200ms ease-in-out
- Transform: 150ms ease-out
- Opacity: 150ms ease-in-out
```

---

## Responsive Breakpoints

```
Mobile:     < 640px    (sm)
Tablet:     640px-1024px (md, lg)
Desktop:    > 1024px   (xl, 2xl)
```

### Grid Responsive
```
Mobile:  1 column
Tablet:  2 columns
Desktop: 3 columns
```

---

## Accessibility

### Color Contrast
- Normal text (14px+): 4.5:1 (AA) / 7:1 (AAA)
- Large text (18px+): 3:1 (AA) / 4.5:1 (AAA)
- All status colors meet WCAG AA minimum

### Focus States
```
Outline: 2px solid #3b82f6
Offset: 2px
Visible on all interactive elements
```

### Semantic HTML
- Use `<button>` for buttons (not `<div>`)
- Use `<label>` with form inputs
- Use `<table>` for tabular data
- Use `<nav>` for navigation
- Heading hierarchy (h1 > h2 > h3)

### ARIA Labels
```
aria-label="Close menu"
aria-describedby="help-text"
aria-hidden="true" (decorative icons)
role="presentation" (purely decorative)
```

---

## Dark Mode (Optional Future)

### Dark Palette
- **BG**: `#1f2937` (gray-900)
- **Surface**: `#111827` (gray-950)
- **Text**: `#f3f4f6` (gray-100)
- **Border**: `#374151` (gray-700)
- **Primary**: `#60a5fa` (blue-400)

---

## Code Examples

### Button Component
```tsx
<button className="px-4 py-2 rounded font-medium bg-blue-600 text-white hover:bg-blue-700 transition">
  Action
</button>
```

### Card Component
```tsx
<div className="rounded-lg bg-white border border-gray-200 shadow-sm p-6">
  <h3 className="text-lg font-semibold text-gray-900">Title</h3>
  <p className="mt-2 text-sm text-gray-600">Content</p>
</div>
```

### Badge Component
```tsx
<span className="inline-block rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-800">
  Status
</span>
```

### Status Table Row
```tsx
<tr className="bg-green-50 border-b border-gray-200">
  <td className="px-4 py-3">Data</td>
</tr>
```

---

**Version:** 1.0.0
**Last Updated:** Sept 17, 2026
**Maintained By:** MedikaScale Design Team
