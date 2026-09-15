---
name: Warm Culinary Modernism
colors:
  surface: '#faf9f5'
  surface-dim: '#dbdad6'
  surface-bright: '#faf9f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f5f4f0'
  surface-container: '#efeeea'
  surface-container-high: '#e9e8e4'
  surface-container-highest: '#e3e2df'
  on-surface: '#1b1c1a'
  on-surface-variant: '#514535'
  inverse-surface: '#30312e'
  inverse-on-surface: '#f2f1ed'
  outline: '#847563'
  outline-variant: '#d6c4af'
  surface-tint: '#825500'
  primary: '#825500'
  on-primary: '#ffffff'
  primary-container: '#efa736'
  on-primary-container: '#633f00'
  inverse-primary: '#ffb953'
  secondary: '#2f6858'
  on-secondary: '#ffffff'
  secondary-container: '#b3efda'
  on-secondary-container: '#356e5e'
  tertiary: '#6d3bd7'
  on-tertiary: '#ffffff'
  tertiary-container: '#c1a7ff'
  on-tertiary-container: '#5516be'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffddb4'
  primary-fixed-dim: '#ffb953'
  on-primary-fixed: '#291800'
  on-primary-fixed-variant: '#633f00'
  secondary-fixed: '#b3efda'
  secondary-fixed-dim: '#98d2bf'
  on-secondary-fixed: '#002018'
  on-secondary-fixed-variant: '#115041'
  tertiary-fixed: '#e9ddff'
  tertiary-fixed-dim: '#d0bcff'
  on-tertiary-fixed: '#23005c'
  on-tertiary-fixed-variant: '#5516be'
  background: '#faf9f5'
  on-background: '#1b1c1a'
  surface-variant: '#e3e2df'
typography:
  display-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  headline-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
    letterSpacing: 0em
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: 0em
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
    letterSpacing: 0.01em
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
  numeric-table:
    fontFamily: Plus Jakarta Sans
    fontSize: 18px
    fontWeight: '700'
    lineHeight: 22px
    letterSpacing: -0.02em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  space-2xs: 0.25rem
  space-xs: 0.5rem
  space-sm: 0.75rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
  space-2xl: 3rem
  sidebar-width: 5rem
  sidebar-expanded: 16rem
  drawer-width: 26rem
  touch-target-min: 2.75rem
---

## Brand & Style

This design system establishes a high-efficiency, hospitality-driven operational environment. Designed specifically for fast-paced dining rooms, culinary counters, and administrative floor management, the visual direction merges architectural warmth with utilitarian precision. 

The aesthetic is grounded in **Warm Culinary Modernism**:
- **Tone & Mood:** Poised, welcoming, laser-focused, and unhurried under pressure. The tactile calm of porcelain surfaces counteracts chaotic dinner rushes.
- **Visual Stance:** Ultra-refined minimalism paired with clear operational feedback loops. High visual comfort ensures reduced eye strain across 12-hour shifts.
- **Physicality:** Dense tactile affordances reminiscent of physical tickets, linen textures, and ambient brass bistro fixtures, distilled into clean digital surfaces.

## Colors

The palette is built around natural culinary tones—honey amber, deep cedar/forest emerald, and bone porcelain—supplemented by an unmistakable functional status engine.

### Core Roles
- **Primary Accent (`#EFA736` / `#F5A623`):** Honey Amber. Reserved for active navigation states, primary action anchors, checkout completion triggers, and interactive table focus.
- **Secondary Identity (`#135142`):** Deep Forest Emerald. Expresses heritage and structural grounding. Used for structural badges, executive filters, active floor tab indicators, and key operational confirmations.
- **Base Canvas (`#F7F6F2`):** Warm Porcelain. A warm, non-glare canvas designed for continuous high-brightness POS terminals.
- **Surface Elevation (`#FFFFFF`):** Crisp pure white applied to actionable tickets, bill cards, and table nodes. Paired with subtle border framing (`#EAE8E1`).

### Typography Hierarchy
- **Text Primary (`#1C1F23`):** Deep Charcoal. High legibility without the harshness of pure black.
- **Text Secondary (`#737B85`):** Muted Slate. Used for metadata, seating times, and seat positions.
- **Text Tertiary (`#9EA5B0`):** Soft Stone Gray. Applied to inactive placeholders and table IDs.

### Floor Plan & Order Status Engine
Statuses rely on paired border-tint tokens to ensure immediate peripheral scanning across large dining room overviews:
- **Available / Ready:** Solid `#10B981` on tint `#E6F7F0`.
- **Occupied / In Prep:** Solid `#F59E0B` on tint `#FEF3C7`.
- **Reserved / Waiting:** Solid `#3B82F6` on tint `#EFF6FF`.
- **Billed / Closing:** Solid `#8B5CF6` on tint `#F3E8FF`.
- **Urgent / Delayed:** Solid `#EF4444` on tint `#FEE2E2`.

## Typography

The type system runs entirely on **Plus Jakarta Sans**, chosen for its geometric balance, generous counters, and rounded apexes that convey hospitality without sacrificing technical rigor.

- **Numerics & Tabular Data:** All prices, guest counts, and table identifiers must use `font-variant-numeric: tabular-nums` to maintain aligned columns in rapid line-item tallies.
- **Micro-Labels & Timers:** Operational status badges utilize `label-sm` in all-caps with generous kerning (`letterSpacing: 0.04em`) to remain immediately recognizable on wall-mounted kitchen monitors or handheld terminal screens.
- **Touch-Friendly Headlines:** `headline-sm` acts as the primary interactive item descriptor in dense food menus, maintaining crisp legibility at glance distance.

## Layout & Spacing

The platform uses a fixed-fluid hybrid spatial grid configured for landscape-oriented terminals, tablets, and administrative displays.

### Layout Topology
1. **Primary Icon Rail (Fixed):** 80px (`5rem`) docked left for primary navigational anchors (Floor, POS, KDS, Menu, Reports).
2. **Floor Engine Canvas (Fluid):** Flexible interactive viewport utilizing CSS subgrids for 2D table positioning, zone boundaries (Main Dining, Terrace, VIP, Bar), and panning controls.
3. **Cart & Order Panel (Anchored Drawer):** 416px (`26rem`) fixed-width panel docked to the right. Slides over or nests adjacent to the canvas based on screen viewport width.

### Responsive Breakpoints
- **Terminal Desktop (>= 1280px):** Simultaneous triple-pane view: slim navigation rail, interactive floor grid/menu matrix, and active order ticket drawer pinned open.
- **POS Tablet (768px - 1279px):** Drawer transitions into an off-canvas slide-over drawer triggered by a persistent bottom action sheet or top counter chip.
- **Handheld Mobile (< 768px):** Single-column stacked mode. Floor view collapses into dense grouped table lists with immediate tap-to-order screens.

### Ergonomics
All primary tap areas enforce a 44px (`touch-target-min`) bounding boundary to prevent mis-taps during high-throughput rush operations.

## Elevation & Depth

This system avoids heavy drop shadows, opting instead for architectural stacking using layered porcelain tones, whisper-thin borders, and ambient light distribution.

### Elevation Hierarchy
- **Level 0 (Canvas Base):** Flat `#F7F6F2`. The base upon which all restaurant architectural zones sit.
- **Level 1 (Surface Containers & Nodes):** Solid `#FFFFFF` surfaces with a crisp hairline border `1px solid #EAE8E1` and ambient shadow `0 4px 20px rgba(0, 0, 0, 0.03)`. Applied to idle table nodes, static menu items, and list containers.
- **Level 2 (Active Nodes & Hover Cards):** Border shifts to `rgba(239, 167, 54, 0.4)` with an ambient shadow `0 8px 24px rgba(239, 167, 54, 0.08)`. Applied to currently selected tables and hovered action modules.
- **Level 3 (Flyouts & Slide-over Drawer):** Pure `#FFFFFF` bordered by `#EAE8E1` with a directional cast shadow `-8px 0 32px rgba(28, 31, 35, 0.06)`. Applied exclusively to the order summary panel and payment confirmation drawers.
- **Level 4 (Modals & Emergency Alerts):** Centered high elevation `0 20px 48px rgba(28, 31, 35, 0.12)`, dimmed by a warm translucent scrim `rgba(28, 31, 35, 0.45)`.

## Shapes

The design system adopts a **Rounded (Level 2)** shape vocabulary, blending modern digital geometry with tactile ergonomics:

- **Structural Cards & Table Units:** Standard radius of `0.5rem` (8px). Delivers a clean architectural feel that simulates physical floor-plan layouts.
- **Flyout Drawers & Modular Panels:** `1rem` (16px) corner radiuses on interior edges to soften interface divisions.
- **Status Tags, Quick Action Buttons, and Nav Identifiers:** Full pill curvature (`9999px`) to immediately communicate tap-readiness and state differentiation.

## Components

### Buttons
- **Primary:** Warm Amber background (`#EFA736`), dark charcoal label (`#1C1F23`), font-weight 600. On press: `#D99322`. Fully rounded pill shape.
- **Secondary / Brand:** Forest Emerald background (`#135142`), pure white label (`#FFFFFF`). On hover: `#0F4538`.
- **Tertiary / Ghost:** Border `1px solid #EAE8E1`, background transparent, text `#1C1F23`. On hover: background `#F5F4F0`.

### Navigation Rail
- Vertical icon dock.
- **Active State:** Honey Amber pill background (`#FEF3C7`) with saturated active icon/text in Deep Charcoal (`#1C1F23`) or Emerald Green (`#135142`), marked by a 3px active amber border indicator.

### Status Pills & Badges
- Pill-shaped (`rounded-full`), `padding: 2px 8px`.
- High-visibility pairing of 10% tint backgrounds with 100% solid status text and a 6px status indicator dot on the leading edge.

### Floor Plan Table Nodes
- Modular components rendered as round or rectangular shapes matching real floor fixtures:
  - **Header:** Table identifier in bold tabular numerics (e.g., "T-12"), with total seat icons (e.g., "4p").
  - **Body:** Assigned server name or initials pill avatar, dynamic live timer (e.g., "42m").
  - **State Cue:** Tinted background matching status palette (Emerald = Empty, Amber = Entrees Served, Blue = Reserved, Purple = Check Dropped).

### Order Summary Drawer
- Docked right side.
- Header contains current table badge, active server, and quick-split icon buttons.
- Middle scroll-container holds itemized ticket lines with modifiers rendered in muted slate (`#737B85`).
- Footer pins total breakdowns and a full-width high-contrast Primary button: "Proceed to Payment".

### Inputs & Quantity Pickers
- **Text Inputs:** `#FFFFFF` background, border `1px solid #EAE8E1`, text `#1C1F23`. Active focus ring: `2px solid #EFA736`.
- **Stepper Counters:** Pill-enclosed increment/decrement containers featuring oversized touch targets with tabular numerals.