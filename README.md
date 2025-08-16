# CurtisOS - Neon Noir Design System

CurtisOS is a unified life and work management system featuring a professional "Neon Noir" visual identity. This dark-first design system emphasizes calm efficiency with punchy cyan accents only where action is expected.

## Visual Identity: "Neon Noir"

### Color Philosophy
- **Dark First**: Deep charcoal backgrounds with subtle gradients
- **Calm by Default**: Matte surfaces and subtle borders
- **Punchy Accents**: Cyan glows only for active/actionable elements

### Design Tokens

#### Colors
```css
/* Background */
--bg-950: #0A0A0C

/* Surfaces (darkest to lightest) */
--surface-0: #0E0E11
--surface-1: #121216
--surface-2: #16161C
--surface-3: #1B1B22

/* Borders */
--border-1: rgba(255,255,255,0.06)  /* Default borders */
--border-2: rgba(255,255,255,0.10)  /* Raised cards */

/* Text (lightest to darkest) */
--ink-100: #EBF0F3  /* Primary text */
--ink-200: #D2D8DC  /* Secondary text */
--ink-300: #AAB2BA  /* Meta text */
--ink-400: #888E96  /* Placeholders */

/* Action Colors */
--action-cyan-600: #00FFF5
--action-cyan-500: #00E6E0
--action-cyan-400: #00CFCB

/* Status Colors */
--ok-500: #27D3A6
--warn-500: #FF9F1C
--danger-500: #FF4D6D
--alert-yellow-500: #FFDD44
--momentum-pink-500: #FF007F
```

#### Spacing Scale
```css
--sp-8: 8px
--sp-12: 12px
--sp-16: 16px
--sp-24: 24px
--sp-32: 32px
--sp-48: 48px
```

#### Border Radius
```css
--r-card: 14px    /* Cards */
--r-input: 10px   /* Inputs, buttons */
--r-pill: 999px   /* Pills, badges */
```

### Typography

**Font Stack**: Inter, SF, "Segoe UI", Roboto, Ubuntu, Arial, sans-serif  
**Base Size**: 16px  
**Line Height**: 1.35  
**Weights**: 400 (normal), 500 (medium), 600 (semibold)

#### Headings
- **H1**: 28px, weight 600, --ink-100
- **H2**: 24px, weight 600, --ink-100  
- **H3**: 20px, weight 600, --ink-200

#### Body & Meta
- **Body**: 16px, --ink-200
- **Meta**: 12px, --ink-400, letter-spacing 0.2px

### Component System

#### Buttons
```css
/* Primary - Cyan glow for main actions */
.btn--primary {
  background: linear-gradient(180deg, rgba(0,255,245,0.16), rgba(0,0,0,0));
  border: 1px solid rgba(0,255,245,0.35);
  box-shadow: 0 0 0 2px rgba(0,255,245,0.20), 0 0 24px rgba(0,255,245,0.16);
}

/* Secondary - Subtle surface button */
.btn--secondary {
  background: var(--surface-2);
  border: 1px solid var(--border-1);
}
```

#### Cards
```css
.card {
  background: var(--surface-1);
  border: 1px solid var(--border-2);
  border-radius: var(--r-card);
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}

.card:hover {
  box-shadow: var(--shadow-raise), inset 0 1px 0 rgba(255,255,255,0.06);
  transform: translateY(-1px);
}
```

#### Pills & Badges
```css
.glass-pill {
  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.18);
  box-shadow: inset 0 1px 0 rgba(255,255,255,0.06);
  border-radius: var(--r-pill);
}

.glass-pill--selected {
  box-shadow: 0 0 0 2px rgba(0,255,245,0.18);
}
```

### Motion & Interaction

**Duration**: 160ms  
**Easing**: cubic-bezier(0.2, 0.8, 0.2, 1)  
**Hover**: translateY(-1px) + inner highlight  
**Focus Ring**: 0 0 0 3px rgba(0,255,245,0.35)

#### Animations
- Cards lift on hover (1px translateY)
- Buttons show inner highlight on hover
- Focus rings appear with cyan glow
- Priority spines slide in from left on selection

### Layout System

#### AppShell Grid
```css
.app-shell {
  display: grid;
  grid-template-areas: 
    "nav header header"
    "nav main drawer";
  grid-template-columns: 240px 1fr 360px;
  grid-template-rows: 56px 1fr;
}
```

- **Left Nav**: 240px, matte buttons with cyan glow for active state
- **Header**: 56px, search + quick actions
- **Main**: Flexible content area with --bg-950 background
- **Right Drawer**: 360px, frosted surface with top cyan glow

### Priority System

Visual priority indicators using left color spines:

```css
.priority-spine {
  width: 2px;
  align-self: stretch;
  border-radius: 1px;
}

.priority--medium { background: var(--ok-500); }      /* Green */
.priority--high { background: var(--warn-500); }      /* Orange */
.priority--urgent { background: var(--danger-500); }  /* Red */
```

### Accessibility

#### Focus & Keyboard
- Every interactive element supports `:focus-visible` with cyan ring
- No color-only state indication (icons + spines for priority)
- WCAG AA 4.5:1 contrast ratio for all text

#### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
  .glow-cyan { box-shadow: none; }
  .card:hover { transform: none; }
}
```

### Usage Guidelines

#### When to Use Glows
**✅ DO**: Primary actions, active navigation, selected items, focus states  
**❌ DON'T**: Decorative elements, static content, secondary information

#### Surface Hierarchy
- **Level 0**: surface-1/surface-2, border-1, no shadow
- **Level 1**: surface-1, border-2, raised shadow + hover lift

#### Typography Pairing
- **Headings**: ink-100/ink-200 with semibold weight
- **Body**: ink-200 for primary content  
- **Meta**: ink-400 for timestamps, labels, secondary info

## Technical Implementation

### CSS Architecture
- **tokens.ts**: TypeScript design token definitions
- **curtisos.css**: Complete CSS framework with utilities
- **AppShell.tsx**: Main layout component using CSS Grid

### Component Structure
```
components/
├── ui/
│   ├── AppShell.tsx       # Main layout
│   └── [other-ui-components]
└── productivity/          # Feature components
    ├── BulkTaskActions.tsx
    ├── TaskTemplates.tsx
    └── ProductivityDashboard.tsx
```

### Integration
1. Import design system: `@import './styles/curtisos.css'`
2. Use AppShell for layout: `<AppShell>{content}</AppShell>`
3. Apply CSS classes: `.btn`, `.card`, `.glass-pill`, etc.
4. Reference design tokens: `var(--action-cyan-500)`

## Examples

### Metric Cards (Dashboard)
Features duotone spark charts with cyan bars and pink area fills, tabular numerals for values, and glass pill deltas.

### Task Lists
Priority spines, glass pill contexts, cyan selection spines, and hover states with inner highlights.

### Navigation
Matte buttons with active cyan glow, proper visual hierarchy, and responsive collapse on mobile.

---

*This design system ensures CurtisOS maintains a consistent, professional appearance while providing excellent usability and accessibility across all features.*