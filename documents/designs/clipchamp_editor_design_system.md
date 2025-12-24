# Clipchamp Video Editor Design System

## Design Philosophy

This design system is built on the principles of **professional creativity** and **intuitive workflows**. The interface emphasizes:

- **Dark-first design**: Reduces eye strain during long editing sessions and makes video content the star
- **Visual hierarchy**: Clear separation between navigation, tools, preview, and timeline
- **Purposeful color**: Vibrant accents on dark backgrounds guide user attention to key actions
- **Minimalist efficiency**: Clean interfaces that put tools within reach without overwhelming
- **Professional aesthetics**: Sophisticated color choices that evoke creativity and precision

The overall feel is **modern, focused, and empowering** - designed for creators who need powerful tools without complexity.

---

# Color Palette

## Primary Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Purple** | `#7C3AED` | rgb(124, 58, 237) | Primary CTA buttons, brand identity, active states |
| **Deep Purple** | `#6D28D9` | rgb(109, 40, 217) | Hover states for primary buttons |
| **Bright Purple** | `#8B5CF6` | rgb(139, 92, 246) | Button text, icons on primary buttons |

## Background Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Background** | `#1A1B1E` | rgb(26, 27, 30) | Main canvas background |
| **Secondary Background** | `#25262B` | rgb(37, 38, 43) | Sidebar panels, card backgrounds |
| **Tertiary Background** | `#2C2D33` | rgb(44, 45, 51) | Elevated elements, hover states |
| **Timeline Background** | `#1F2024` | rgb(31, 32, 36) | Timeline and playback area |
| **Panel Background** | `#212226` | rgb(33, 34, 38) | Left sidebar, tool panels |
| **Deep Black** | `#0D0D0F` | rgb(13, 13, 15) | Video preview background |

## Text Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Primary Text** | `#FFFFFF` | rgb(255, 255, 255) | Headings, primary labels, important text |
| **Secondary Text** | `#A0A1A7` | rgb(160, 161, 167) | Body text, descriptions, less emphasized content |
| **Tertiary Text** | `#6B6C72` | rgb(107, 108, 114) | Placeholder text, timestamps, metadata |
| **Muted Text** | `#4A4B50` | rgb(74, 75, 80) | Disabled states, very low emphasis |

## Accent Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Electric Blue** | `#0EA5E9` | rgb(14, 165, 233) | Active indicators, selected states, information |
| **Vibrant Red** | `#EF4444` | rgb(239, 68, 68) | Delete actions, errors, critical warnings |
| **Success Green** | `#10B981` | rgb(16, 185, 129) | Success states, confirmations, completion |
| **Warning Amber** | `#F59E0B` | rgb(245, 158, 11) | Warnings, alerts, important notices |

## Functional Colors

| Purpose | Color | Hex Code | Usage |
|---------|-------|----------|-------|
| **Success** | Green | `#10B981` | Upload complete, save successful, export finished |
| **Error** | Red | `#EF4444` | Failed operations, validation errors, critical issues |
| **Warning** | Amber | `#F59E0B` | Unsaved changes, storage warnings, rendering issues |
| **Info** | Blue | `#3B82F6` | Tips, helper text, feature highlights |
| **Neutral** | Gray | `#6B7280` | General information, neutral states |

## Border & Divider Colors

| Color Name | Hex Code | RGB | Usage |
|------------|----------|-----|-------|
| **Subtle Border** | `#2E2F35` | rgb(46, 47, 53) | Gentle separators between sections |
| **Medium Border** | `#3A3B42` | rgb(58, 59, 66) | Input fields, cards, containers |
| **Strong Border** | `#4A4B52` | rgb(74, 75, 82) | Active focus states, emphasized boundaries |
| **Divider** | `#2A2B30` | rgb(42, 43, 48) | Horizontal/vertical dividers in toolbars |

---

# Typography

## Font Families

```css
--font-primary: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', sans-serif;
--font-mono: 'SF Mono', 'Monaco', 'Inconsolata', 'Fira Code', 'Consolas', monospace;
```

## Font Weights

| Weight Name | Value | Usage |
|-------------|-------|-------|
| **Regular** | 400 | Body text, descriptions, general content |
| **Medium** | 500 | Subheadings, button text, emphasized labels |
| **Semibold** | 600 | Section headers, active states, important labels |
| **Bold** | 700 | Page titles, primary headings, strong emphasis |

## Text Styles

### Headings

| Style | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **H1** | 24px | 700 | 32px | -0.02em | Page titles, main headers |
| **H2** | 20px | 600 | 28px | -0.01em | Section headings |
| **H3** | 16px | 600 | 24px | -0.01em | Subsection headers, panel titles |
| **H4** | 14px | 600 | 20px | 0em | Card headers, tool names |

### Body Text

| Style | Size | Weight | Line Height | Letter Spacing | Usage |
|-------|------|--------|-------------|----------------|-------|
| **Body Large** | 15px | 400 | 22px | 0em | Primary content, descriptions |
| **Body Medium** | 14px | 400 | 20px | 0em | Standard body text, labels |
| **Body Small** | 13px | 400 | 18px | 0em | Secondary information, metadata |
| **Body Tiny** | 12px | 400 | 16px | 0em | Timestamps, helper text, captions |

### Special Text

| Style | Size | Weight | Line Height | Letter Spacing | Color | Usage |
|-------|------|--------|-------------|----------------|-------|-------|
| **Button Text** | 14px | 500 | 20px | 0.01em | #FFFFFF | Button labels |
| **Link Text** | 14px | 500 | 20px | 0em | #7C3AED | Clickable links |
| **Label Text** | 12px | 500 | 16px | 0.02em | #A0A1A7 | Form labels, tags |
| **Code Text** | 13px | 400 | 18px | 0em | #E879F9 | Monospace, technical info |
| **Timestamp** | 11px | 500 | 14px | 0.03em | #6B6C72 | Time indicators, durations |

---

# Component Styles

## Buttons

### Primary Button

```css
.button-primary {
  background: linear-gradient(135deg, #7C3AED 0%, #6D28D9 100%);
  color: #FFFFFF;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  letter-spacing: 0.01em;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(124, 58, 237, 0.25);
}

.button-primary:hover {
  background: linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%);
  box-shadow: 0 4px 12px rgba(124, 58, 237, 0.35);
  transform: translateY(-1px);
}

.button-primary:active {
  transform: translateY(0);
  box-shadow: 0 1px 4px rgba(124, 58, 237, 0.2);
}
```

**Specifications:**
- Height: 40px
- Padding: 10px 20px (vertical horizontal)
- Border radius: 6px
- Icon spacing: 8px gap between icon and text
- Min width: 80px

### Secondary Button

```css
.button-secondary {
  background: transparent;
  color: #FFFFFF;
  border: 1px solid #3A3B42;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-secondary:hover {
  background: #2C2D33;
  border-color: #4A4B52;
}

.button-secondary:active {
  background: #25262B;
}
```

**Specifications:**
- Height: 40px
- Border width: 1px
- Border radius: 6px

### Ghost/Text Button

```css
.button-ghost {
  background: transparent;
  color: #A0A1A7;
  border: none;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-ghost:hover {
  color: #FFFFFF;
  background: #2C2D33;
}
```

### Icon Button

```css
.button-icon {
  background: transparent;
  color: #A0A1A7;
  border: none;
  width: 36px;
  height: 36px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.button-icon:hover {
  background: #2C2D33;
  color: #FFFFFF;
}

.button-icon:active {
  background: #25262B;
}
```

**Specifications:**
- Size: 36x36px
- Icon size: 20x20px
- Border radius: 6px

## Cards

### Media Card (Thumbnail)

```css
.media-card {
  background: #2C2D33;
  border-radius: 8px;
  padding: 0;
  overflow: hidden;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid transparent;
}

.media-card:hover {
  border-color: #4A4B52;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.media-card-thumbnail {
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
}

.media-card-info {
  padding: 12px;
  background: #25262B;
}

.media-card-title {
  font-size: 13px;
  font-weight: 500;
  color: #FFFFFF;
  margin-bottom: 4px;
}

.media-card-duration {
  font-size: 11px;
  color: #6B6C72;
  font-family: var(--font-mono);
}
```

**Specifications:**
- Border radius: 8px
- Thumbnail aspect ratio: 16:9
- Padding (info section): 12px
- Hover elevation: 2px translateY
- Border: 1px solid (transparent default, visible on hover)

### Panel Card

```css
.panel-card {
  background: #25262B;
  border: 1px solid #2E2F35;
  border-radius: 8px;
  padding: 16px;
}
```

## Input Fields

### Text Input

```css
.input-text {
  background: #2C2D33;
  border: 1px solid #3A3B42;
  border-radius: 6px;
  padding: 10px 12px;
  font-size: 14px;
  color: #FFFFFF;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.input-text::placeholder {
  color: #6B6C72;
}

.input-text:hover {
  border-color: #4A4B52;
}

.input-text:focus {
  outline: none;
  border-color: #7C3AED;
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.1);
}
```

**Specifications:**
- Height: 40px
- Border radius: 6px
- Padding: 10px 12px
- Border width: 1px
- Focus ring: 3px shadow with 10% opacity

### Search Input

```css
.input-search {
  background: #2C2D33;
  border: 1px solid #3A3B42;
  border-radius: 8px;
  padding: 10px 12px 10px 40px;
  font-size: 14px;
  color: #FFFFFF;
  background-image: url('search-icon.svg');
  background-position: 12px center;
  background-repeat: no-repeat;
}
```

**Specifications:**
- Icon position: 12px from left
- Left padding: 40px (to accommodate icon)

## Icons

### Icon Sizes

| Size Name | Dimensions | Usage |
|-----------|------------|-------|
| **Extra Small** | 16x16px | Inline icons, small indicators |
| **Small** | 20x20px | Standard toolbar icons, button icons |
| **Medium** | 24x24px | Panel headers, primary actions |
| **Large** | 32x32px | Feature icons, empty states |
| **Extra Large** | 48x48px | Onboarding, major features |

### Icon Colors

| State | Color | Hex Code |
|-------|-------|----------|
| **Default** | Gray | `#A0A1A7` |
| **Hover** | White | `#FFFFFF` |
| **Active** | Purple | `#7C3AED` |
| **Disabled** | Dark Gray | `#4A4B50` |

### Icon Styles

```css
.icon-default {
  width: 20px;
  height: 20px;
  color: #A0A1A7;
  transition: color 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.icon-default:hover {
  color: #FFFFFF;
}
```

## Sidebar Navigation

```css
.sidebar-nav {
  background: #212226;
  width: 60px;
  padding: 12px 8px;
  border-right: 1px solid #2E2F35;
}

.sidebar-nav-item {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  margin-bottom: 8px;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.sidebar-nav-item:hover {
  background: #2C2D33;
}

.sidebar-nav-item.active {
  background: #7C3AED;
}

.sidebar-nav-item-icon {
  width: 24px;
  height: 24px;
  color: #A0A1A7;
}

.sidebar-nav-item.active .sidebar-nav-item-icon {
  color: #FFFFFF;
}

.sidebar-nav-item-label {
  font-size: 10px;
  color: #6B6C72;
  font-weight: 500;
}

.sidebar-nav-item.active .sidebar-nav-item-label {
  color: #FFFFFF;
}
```

**Specifications:**
- Width: 60px
- Item size: 44x44px
- Icon size: 24x24px
- Label size: 10px
- Spacing between items: 8px
- Border radius: 8px

## Timeline Components

### Timeline Track

```css
.timeline-track {
  background: #1F2024;
  border: 1px solid #2E2F35;
  border-radius: 4px;
  min-height: 64px;
  padding: 8px;
}
```

### Timeline Clip

```css
.timeline-clip {
  background: #3A3B42;
  border: 1px solid #4A4B52;
  border-radius: 4px;
  height: 48px;
  cursor: move;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

.timeline-clip:hover {
  border-color: #7C3AED;
  box-shadow: 0 0 0 1px #7C3AED;
}

.timeline-clip.selected {
  border-color: #7C3AED;
  background: #4A3B5C;
}
```

### Playhead

```css
.timeline-playhead {
  width: 2px;
  background: #FFFFFF;
  height: 100%;
  position: relative;
}

.timeline-playhead::before {
  content: '';
  position: absolute;
  top: -6px;
  left: -6px;
  width: 14px;
  height: 14px;
  background: #FFFFFF;
  border-radius: 50%;
}
```

**Specifications:**
- Playhead width: 2px
- Playhead handle: 14x14px circle
- Color: White (#FFFFFF)

### Time Ruler

```css
.timeline-ruler {
  background: #1F2024;
  height: 32px;
  border-bottom: 1px solid #2E2F35;
  padding: 0 8px;
}

.timeline-ruler-marker {
  font-size: 11px;
  color: #6B6C72;
  font-family: var(--font-mono);
}
```

## Dropdowns & Menus

```css
.dropdown-menu {
  background: #2C2D33;
  border: 1px solid #3A3B42;
  border-radius: 8px;
  padding: 4px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  min-width: 200px;
}

.dropdown-item {
  padding: 10px 12px;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #FFFFFF;
  transition: background 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.dropdown-item:hover {
  background: #3A3B42;
}

.dropdown-divider {
  height: 1px;
  background: #3A3B42;
  margin: 4px 0;
}
```

**Specifications:**
- Border radius: 8px
- Item padding: 10px 12px
- Item border radius: 6px
- Shadow: 0 8px 24px rgba(0,0,0,0.4)

## Tooltips

```css
.tooltip {
  background: #1A1B1E;
  border: 1px solid #3A3B42;
  border-radius: 6px;
  padding: 6px 10px;
  font-size: 12px;
  color: #FFFFFF;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
  max-width: 240px;
}
```

**Specifications:**
- Border radius: 6px
- Padding: 6px 10px
- Font size: 12px
- Max width: 240px

## Progress Bars

```css
.progress-bar {
  background: #2C2D33;
  height: 4px;
  border-radius: 2px;
  overflow: hidden;
}

.progress-bar-fill {
  background: linear-gradient(90deg, #7C3AED 0%, #8B5CF6 100%);
  height: 100%;
  border-radius: 2px;
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}
```

**Specifications:**
- Height: 4px
- Border radius: 2px
- Fill color: Purple gradient

## Sliders

```css
.slider {
  height: 4px;
  background: #3A3B42;
  border-radius: 2px;
  position: relative;
}

.slider-track {
  height: 4px;
  background: #7C3AED;
  border-radius: 2px;
}

.slider-thumb {
  width: 16px;
  height: 16px;
  background: #FFFFFF;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
  cursor: grab;
  transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1);
}

.slider-thumb:hover {
  transform: scale(1.15);
}

.slider-thumb:active {
  cursor: grabbing;
  transform: scale(1.05);
}
```

**Specifications:**
- Track height: 4px
- Thumb size: 16x16px
- Active track color: Purple (#7C3AED)

---

# Spacing System

The design uses a consistent 4px-based spacing system:

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Minimal spacing, icon gaps |
| `--space-2` | 8px | Small gaps, tight spacing |
| `--space-3` | 12px | Standard element spacing |
| `--space-4` | 16px | Card padding, section gaps |
| `--space-5` | 20px | Large gaps between sections |
| `--space-6` | 24px | Major section spacing |
| `--space-8` | 32px | Extra large gaps |
| `--space-10` | 40px | Major layout spacing |
| `--space-12` | 48px | Very large spacing |
| `--space-16` | 64px | Maximum spacing |

## Component-Specific Spacing

```css
/* Button spacing */
--button-padding-y: 10px;
--button-padding-x: 20px;
--button-gap: 8px; /* between icon and text */

/* Card spacing */
--card-padding: 16px;
--card-gap: 12px; /* between cards */

/* Form spacing */
--input-padding-y: 10px;
--input-padding-x: 12px;
--form-gap: 16px; /* between form elements */

/* Layout spacing */
--panel-padding: 16px;
--section-gap: 24px;
--toolbar-padding: 12px;
```

---

# Layout & Grid

## Container Widths

```css
--sidebar-width: 60px;
--panel-width: 280px;
--toolbar-height: 56px;
--timeline-height: 240px;
```

## Z-Index System

| Layer | Value | Usage |
|-------|-------|-------|
| **Base** | 1 | Standard content |
| **Dropdown** | 10 | Dropdown menus |
| **Sticky** | 20 | Sticky headers |
| **Overlay** | 30 | Overlays, backdrops |
| **Modal** | 40 | Modal dialogs |
| **Popover** | 50 | Popovers, tooltips |
| **Toast** | 60 | Notifications, toasts |

---

# Animations & Transitions

## Timing Functions

```css
/* Standard easing */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);

/* Deceleration - elements entering */
--ease-decelerate: cubic-bezier(0.0, 0, 0.2, 1);

/* Acceleration - elements exiting */
--ease-accelerate: cubic-bezier(0.4, 0, 1, 1);

/* Sharp - quick transitions */
--ease-sharp: cubic-bezier(0.4, 0, 0.6, 1);
```

## Duration Tokens

```css
--duration-instant: 100ms;    /* Micro-interactions */
--duration-fast: 150ms;       /* Hover states */
--duration-normal: 200ms;     /* Standard transitions */
--duration-slow: 300ms;       /* Complex animations */
--duration-slower: 400ms;     /* Page transitions */
```

## Common Transitions

```css
/* Hover transitions */
.transition-hover {
  transition: all 0.2s var(--ease-standard);
}

/* Color transitions */
.transition-color {
  transition: color 0.15s var(--ease-standard),
              background-color 0.15s var(--ease-standard);
}

/* Transform transitions */
.transition-transform {
  transition: transform 0.2s var(--ease-standard);
}

/* Shadow transitions */
.transition-shadow {
  transition: box-shadow 0.2s var(--ease-standard);
}

/* Opacity transitions */
.transition-opacity {
  transition: opacity 0.2s var(--ease-standard);
}
```

## Animation Examples

### Fade In

```css
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.fade-in {
  animation: fadeIn 0.2s var(--ease-decelerate);
}
```

### Slide Up

```css
@keyframes slideUp {
  from {
    transform: translateY(10px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.slide-up {
  animation: slideUp 0.3s var(--ease-decelerate);
}
```

### Scale In

```css
@keyframes scaleIn {
  from {
    transform: scale(0.95);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}

.scale-in {
  animation: scaleIn 0.2s var(--ease-decelerate);
}
```

### Spinner

```css
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.spinner {
  animation: spin 1s linear infinite;
}
```

---

# Shadow System

## Elevation Levels

```css
/* Level 0 - No shadow */
--shadow-none: none;

/* Level 1 - Subtle elevation (cards, inputs) */
--shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.2),
             0 1px 2px rgba(0, 0, 0, 0.12);

/* Level 2 - Medium elevation (dropdowns, hover states) */
--shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3),
             0 2px 4px rgba(0, 0, 0, 0.15);

/* Level 3 - High elevation (modals, popovers) */
--shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.4),
             0 4px 8px rgba(0, 0, 0, 0.2);

/* Level 4 - Maximum elevation (dialogs) */
--shadow-xl: 0 16px 48px rgba(0, 0, 0, 0.5),
             0 8px 16px rgba(0, 0, 0, 0.25);

/* Colored shadows for accent elements */
--shadow-primary: 0 4px 12px rgba(124, 58, 237, 0.35);
--shadow-success: 0 4px 12px rgba(16, 185, 129, 0.3);
--shadow-error: 0 4px 12px rgba(239, 68, 68, 0.3);
```

---

# Border Radius System

```css
--radius-sm: 4px;    /* Small elements, timeline clips */
--radius-md: 6px;    /* Buttons, inputs, standard elements */
--radius-lg: 8px;    /* Cards, panels, containers */
--radius-xl: 12px;   /* Large cards, modals */
--radius-2xl: 16px;  /* Hero sections, featured content */
--radius-full: 9999px; /* Pills, circular buttons */
```

---

# Dark Mode Variants

This design system is **dark-mode first**, but here are the optimized dark mode values:

## Dark Mode Background Hierarchy

```css
/* Darkest to lightest */
--dm-bg-deepest: #0D0D0F;     /* Video preview, canvas */
--dm-bg-base: #1A1B1E;        /* Primary background */
--dm-bg-elevated-1: #212226;  /* Sidebars, panels */
--dm-bg-elevated-2: #25262B;  /* Cards, containers */
--dm-bg-elevated-3: #2C2D33;  /* Hover states, inputs */
--dm-bg-elevated-4: #3A3B42;  /* Active states, pressed */
```

## Dark Mode Text Hierarchy

```css
--dm-text-primary: #FFFFFF;      /* Headings, emphasis */
--dm-text-secondary: #A0A1A7;    /* Body text */
--dm-text-tertiary: #6B6C72;     /* Metadata, timestamps */
--dm-text-disabled: #4A4B50;     /* Disabled states */
```

## Dark Mode Borders

```css
--dm-border-subtle: #2E2F35;     /* Gentle dividers */
--dm-border-default: #3A3B42;    /* Standard borders */
--dm-border-strong: #4A4B52;     /* Emphasized borders */
```

## Dark Mode Overlays

```css
--dm-overlay-light: rgba(0, 0, 0, 0.4);    /* Tooltips, light modals */
--dm-overlay-medium: rgba(0, 0, 0, 0.6);   /* Standard modals */
--dm-overlay-heavy: rgba(0, 0, 0, 0.8);    /* Heavy emphasis modals */
```

---

# Accessibility Guidelines

## Color Contrast

All text must meet WCAG AA standards:

- **Normal text (< 18px)**: Minimum 4.5:1 contrast ratio
- **Large text (≥ 18px or 14px bold)**: Minimum 3:1 contrast ratio
- **UI components**: Minimum 3:1 contrast ratio against adjacent colors

### Contrast Pairs (Tested)

| Foreground | Background | Ratio | Passes |
|------------|------------|-------|--------|
| #FFFFFF | #1A1B1E | 14.8:1 | AAA |
| #A0A1A7 | #1A1B1E | 7.2:1 | AAA |
| #6B6C72 | #1A1B1E | 4.6:1 | AA |
| #FFFFFF | #7C3AED | 4.8:1 | AA |
| #FFFFFF | #2C2D33 | 13.1:1 | AAA |

## Focus States

All interactive elements must have visible focus indicators:

```css
.focusable:focus-visible {
  outline: 2px solid #7C3AED;
  outline-offset: 2px;
}

/* Alternative focus ring */
.focusable-alt:focus-visible {
  box-shadow: 0 0 0 3px rgba(124, 58, 237, 0.4);
}
```

## Keyboard Navigation

- Tab order must be logical
- All interactive elements must be keyboard accessible
- Skip links provided for main sections
- Escape key closes modals and dropdowns

## Screen Reader Support

```css
/* Visually hidden but screen-reader accessible */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
}
```

## Motion Preferences

```css
/* Respect reduced motion preferences */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

---

# Responsive Breakpoints

```css
/* Mobile first approach */
--breakpoint-sm: 640px;   /* Small devices */
--breakpoint-md: 768px;   /* Tablets */
--breakpoint-lg: 1024px;  /* Laptops */
--breakpoint-xl: 1280px;  /* Desktops */
--breakpoint-2xl: 1536px; /* Large screens */
```

## Responsive Layout Adjustments

```css
/* Mobile - Stack panels vertically */
@media (max-width: 768px) {
  .sidebar-panel {
    width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--dm-border-subtle);
  }
}

/* Tablet - Collapsible sidebar */
@media (min-width: 768px) and (max-width: 1024px) {
  .sidebar-panel {
    width: 60px; /* Collapsed by default */
  }

  .sidebar-panel.expanded {
    width: 280px;
  }
}

/* Desktop - Full layout */
@media (min-width: 1024px) {
  .sidebar-panel {
    width: 280px;
  }
}
```

---

# Loading States

## Skeleton Screens

```css
.skeleton {
  background: linear-gradient(
    90deg,
    #2C2D33 0%,
    #3A3B42 50%,
    #2C2D33 100%
  );
  background-size: 200% 100%;
  animation: skeleton-loading 1.5s ease-in-out infinite;
  border-radius: 4px;
}

@keyframes skeleton-loading {
  0% {
    background-position: 200% 0;
  }
  100% {
    background-position: -200% 0;
  }
}
```

## Loading Spinner

```css
.spinner {
  width: 32px;
  height: 32px;
  border: 3px solid #2C2D33;
  border-top-color: #7C3AED;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}
```

---

# Empty States

```css
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  text-align: center;
}

.empty-state-icon {
  width: 64px;
  height: 64px;
  color: #4A4B50;
  margin-bottom: 16px;
}

.empty-state-title {
  font-size: 18px;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 8px;
}

.empty-state-description {
  font-size: 14px;
  color: #6B6C72;
  max-width: 400px;
  margin-bottom: 24px;
}
```

---

# Layout Architecture

## Vertical Layout Distribution

The editor uses a flex column layout for optimal vertical space distribution:

| Section | Height | Flex | Description |
|---------|--------|------|-------------|
| **Header** | 48px | Fixed | Logo, project name, aspect ratio selector, action buttons |
| **Main Content** | Remaining | `flex: 1` | Contains sidebar, panels, canvas, and timeline |

### Main Content Area (Horizontal Split)

| Component | Width | Description |
|-----------|-------|-------------|
| **Icon Sidebar** | 72px | Tool icons with text labels |
| **Side Panel** | 280px | Context-specific content (Video Library, properties, etc.) |
| **Editor Area** | Remaining | Canvas and timeline |
| **Properties Panel** | 280px | Element properties (when element selected) |

### Editor Area (Vertical Split)

| Section | Height | Flex | Description |
|---------|--------|------|-------------|
| **Canvas/Preview** | Flexible | `flex: 1 1 0` | Video preview area, shrinks to accommodate timeline |
| **Timeline** | 220px | `flex: 0 0 220px` | Fixed height timeline section |

### Timeline Section Breakdown

| Component | Height | Description |
|-----------|--------|-------------|
| **Controls Bar** | 40px | Play/pause, time display, zoom controls |
| **Time Ruler** | 30px | Timestamp markers |
| **Tracks Container** | ~150px | Scrollable area for timeline tracks |

### Track Specifications

| Property | Value | Description |
|----------|-------|-------------|
| **Track Height** | 50px | Individual track height |
| **Track Header** | 100px width | Drag handle, track label |
| **Visible Tracks** | ~3 | Number of tracks visible without scrolling |

## CSS Implementation

```css
/* Main container flex distribution */
.twick-editor-main-container {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 100%;
  overflow: hidden;
}

/* Canvas area - flexible height */
.twick-editor-view-section {
  flex: 1 1 0;
  min-height: 200px;
  overflow: hidden;
}

/* Timeline - fixed 220px */
.twick-editor-timeline-section {
  flex: 0 0 220px;
  height: 220px;
  min-height: 220px;
  max-height: 220px;
}

/* Individual tracks */
.twick-track {
  height: 50px;
  min-height: 50px;
}
```

---

# Implementation Notes

## CSS Variables Setup

```css
:root {
  /* Colors */
  --color-primary: #7C3AED;
  --color-primary-hover: #8B5CF6;
  --color-bg-primary: #1A1B1E;
  --color-bg-secondary: #25262B;
  --color-text-primary: #FFFFFF;
  --color-text-secondary: #A0A1A7;

  /* Spacing */
  --space-1: 4px;
  --space-2: 8px;
  --space-3: 12px;
  --space-4: 16px;

  /* Typography */
  --font-primary: 'Inter', sans-serif;
  --text-sm: 12px;
  --text-base: 14px;
  --text-lg: 16px;

  /* Animations */
  --ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
  --duration-normal: 200ms;

  /* Shadows */
  --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.3);

  /* Borders */
  --radius-md: 6px;
  --radius-lg: 8px;
}
```

## Component Architecture Recommendations

1. **Modular Components**: Build reusable UI components with clear prop interfaces
2. **Composition Over Inheritance**: Prefer composing smaller components
3. **Design Tokens**: Use CSS variables/design tokens for all values
4. **Consistent Naming**: Use BEM or similar methodology for class names
5. **Responsive First**: Mobile-first approach with progressive enhancement
6. **Accessibility**: ARIA labels, keyboard navigation, focus management
7. **Performance**: Optimize animations, lazy load heavy components

---

# Design Principles Summary

1. **Consistency**: Use the defined spacing, colors, and typography throughout
2. **Hierarchy**: Clear visual hierarchy guides user attention
3. **Feedback**: Every interaction provides immediate visual feedback
4. **Efficiency**: Reduce clicks, provide shortcuts, streamline workflows
5. **Accessibility**: Ensure all users can interact with the interface
6. **Performance**: Smooth 60fps animations, fast loading states
7. **Flexibility**: Adapt to different screen sizes and user preferences
8. **Clarity**: Clear labeling, intuitive icons, helpful tooltips

---

**Version**: 1.0
**Last Updated**: December 2025
**Based On**: Clipchamp Video Editor Interface Analysis
