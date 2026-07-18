# Design System - Modern Minimal

## Overview

The Support Ticket System features a sophisticated, modern minimal design using a carefully curated color palette and clean typography for maximum legibility and professional presentation.

## Color Palette

### Primary Colors

- **Background (Primary)**: `#FAF9F6` - Warm off-white/cream
- **Foreground (Primary)**: `#1A202C` - Deep navy/charcoal

### Supporting Colors

| Color | Hex | Usage |
|---|---|---|
| Card Background | `#FFFFFF` | White cards and surfaces |
| Input Background | `#F3F1ED` | Form input backgrounds |
| Secondary | `#E5E2DD` | Subtle accents and dividers |
| Muted | `#D4D1CC` | Disabled states |
| Border | `#E5E2DD` | Borders and dividers |
| Accent | `#2D3748` | Interactive elements |
| Destructive | `#DC2626` | Error/danger states |

### Dark Mode

- **Background**: `#0F111A` - Very dark navy
- **Foreground**: `#FAF9F6` - Maintains cream text
- **Card**: `#1A202C` - Dark navy surface
- **Secondary**: `#2D3748` - Slightly lighter navy

## Typography

### Font Stack
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Helvetica Neue', sans-serif;
```

### Type Scale

| Element | Size | Weight | Line Height |
|---|---|---|---|
| Display | 32px-40px | 600-700 | 1.2 |
| Heading 1 | 28px | 600 | 1.3 |
| Heading 2 | 24px | 600 | 1.3 |
| Heading 3 | 20px | 600 | 1.4 |
| Body | 16px | 400 | 1.5 |
| Small | 14px | 400 | 1.5 |
| Extra Small | 12px | 500 | 1.4 |
| Mono | 12px-14px | 400 | 1.5 |

## Design Principles

### 1. Minimal & Clean
- Generous whitespace
- No unnecessary decorations
- Focus on content clarity
- Maximum 3-4 colors per page

### 2. Modern
- Contemporary sans-serif typography
- Subtle shadows (box-shadow)
- Clean rounded corners (4px radius)
- High contrast for accessibility

### 3. Professional
- Sophisticated color combinations
- Consistent spacing (4px grid)
- Clear hierarchy
- Predictable layouts

### 4. Accessible
- High contrast ratios (WCAG AA+)
- Clear focus states
- Semantic HTML
- Keyboard navigation support

## Spacing System

All spacing follows a 4px base unit system:

| Unit | Pixels | Usage |
|---|---|---|
| xs | 4px | Tight spacing |
| sm | 8px | Small gaps |
| md | 12px | Standard padding |
| lg | 16px | Component spacing |
| xl | 24px | Section spacing |
| 2xl | 32px | Major spacing |
| 3xl | 48px | Page sections |

## Border Radius

```css
--radius: 4px;     /* Small elements */
--radius-md: 6px;  /* Medium elements */
--radius-lg: 8px;  /* Large elements */
```

## Component Styles

### Buttons

**Primary Button (Default)**
```css
Background: #1A202C
Text: #FAF9F6
Padding: 12px 24px
Border Radius: 4px
Font Weight: 500
Hover: opacity-90
```

**Secondary Button (Outline)**
```css
Background: transparent
Border: 1px solid #E5E2DD
Text: #1A202C
Padding: 12px 24px
Border Radius: 4px
Hover: Background #E5E2DD
```

### Form Inputs

```css
Background: #F3F1ED
Border: 1px solid #E5E2DD
Border Radius: 4px
Padding: 12px 16px
Color: #1A202C
Placeholder: rgba(26, 32, 44, 0.4)
Focus: ring 2px #2D3748
```

### Cards

```css
Background: #FFFFFF
Border: 1px solid #E5E2DD
Border Radius: 4px
Padding: 16px-24px
Box Shadow: 0 1px 2px rgba(0, 0, 0, 0.04)
```

### Badges

```css
Background: #E5E2DD
Text: #1A202C
Padding: 8px 12px
Border Radius: 4px
Font Size: 12px
Font Weight: 500
```

## Responsive Design

- **Mobile**: 320px to 767px
- **Tablet**: 768px to 1023px
- **Desktop**: 1024px+

All layouts follow mobile-first design principles with progressive enhancement for larger screens.

## Dark Mode

The design system supports dark mode with the following principles:

- Maintains color contrast ratios
- Reverses background and foreground
- Adjusts accent colors for visibility
- No harsh whites or blacks
- Smooth transitions

## Usage Guidelines

### Color Application

1. **Primary Colors**: Use #FAF9F6 for backgrounds and #1A202C for text
2. **Accents**: Use #2D3748 for interactive elements and CTAs
3. **Status**: Use semantic colors (green for success, red for error, amber for warning)
4. **Neutrals**: Use #E5E2DD for dividers and subtle elements

### Typography

1. **Headings**: Use 600-700 weight for visual hierarchy
2. **Body**: Use 400 weight for readability
3. **Mono**: Use for code and technical content
4. **Line Height**: Maintain 1.4-1.6 for body text

### Spacing

1. Use multiples of 4px for consistent spacing
2. Never use arbitrary spacing values
3. Maintain visual rhythm with consistent gaps
4. Apply generous margins for breathing room

### Shadows

- **None**: Most elements
- **Subtle**: Cards and modals (0 1px 2px rgba(0,0,0,0.04))
- **Medium**: Hover states (0 4px 12px rgba(0,0,0,0.08))

## Accessibility

### Contrast
- Text/Background: Minimum 7:1 ratio (AAA)
- Interactive Elements: Minimum 4.5:1 ratio (AA)

### Focus States
- 2px ring in #2D3748
- Clear visual indication
- Never remove focus outline

### Motion
- Reduced motion respected
- No auto-playing animations
- Smooth transitions: 200-300ms

## States

### Hover
- Background opacity: -10%
- Text: underline for links

### Active/Pressed
- Background opacity: -15%
- No additional changes

### Disabled
- Opacity: 50%
- Cursor: not-allowed
- No hover effects

### Loading
- Subtle spinner
- Opacity: 60%
- Cursor: wait

## Implementation

### CSS Variables
All color values are defined as CSS custom properties:
```css
:root {
  --background: #FAF9F6;
  --foreground: #1A202C;
  --card: #FFFFFF;
  --border: #E5E2DD;
  /* ... etc */
}
```

### Tailwind Integration
The design system is fully integrated with Tailwind CSS using semantic class names:
```html
<button class="bg-foreground text-background">Submit</button>
```

## Maintenance

### When to Update
- Brand color changes
- Accessibility issues discovered
- New component patterns needed
- Device/platform requirements change

### How to Update
1. Update color values in globals.css
2. Update this documentation
3. Test all components visually
4. Verify accessibility compliance

---

**Last Updated**: 2024  
**Design System Version**: 1.0  
**Status**: Active
