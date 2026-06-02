---
name: Woolini
colors:
  surface: '#f7f9fc'
  surface-dim: '#d8dadd'
  surface-bright: '#f7f9fc'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f2f4f7'
  surface-container: '#eceef1'
  surface-container-high: '#e6e8eb'
  surface-container-highest: '#e0e3e6'
  on-surface: '#191c1e'
  on-surface-variant: '#404847'
  inverse-surface: '#2d3133'
  inverse-on-surface: '#eff1f4'
  outline: '#707977'
  outline-variant: '#c0c8c6'
  surface-tint: '#356761'
  primary: '#356761'
  on-primary: '#ffffff'
  primary-container: '#a5d8d1'
  on-primary-container: '#2e605a'
  inverse-primary: '#9dd0c9'
  secondary: '#655978'
  on-secondary: '#ffffff'
  secondary-container: '#e9d9ff'
  on-secondary-container: '#6a5d7d'
  tertiary: '#665f34'
  on-tertiary: '#ffffff'
  tertiary-container: '#d9cf9b'
  on-tertiary-container: '#5f582e'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#b9ede5'
  primary-fixed-dim: '#9dd0c9'
  on-primary-fixed: '#00201d'
  on-primary-fixed-variant: '#1b4e4a'
  secondary-fixed: '#ecdcff'
  secondary-fixed-dim: '#d0c0e5'
  on-secondary-fixed: '#211632'
  on-secondary-fixed-variant: '#4d4160'
  tertiary-fixed: '#eee3ad'
  tertiary-fixed-dim: '#d1c794'
  on-tertiary-fixed: '#201c00'
  on-tertiary-fixed-variant: '#4e471f'
  background: '#f7f9fc'
  on-background: '#191c1e'
  surface-variant: '#e0e3e6'
typography:
  headline-xl:
    fontFamily: Plus Jakarta Sans
    fontSize: 40px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 32px
    fontWeight: '700'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg-mobile:
    fontFamily: Plus Jakarta Sans
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 32px
  body-lg:
    fontFamily: Be Vietnam Pro
    fontSize: 18px
    fontWeight: '500'
    lineHeight: 28px
  body-md:
    fontFamily: Be Vietnam Pro
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-bold:
    fontFamily: Be Vietnam Pro
    fontSize: 14px
    fontWeight: '700'
    lineHeight: 20px
  interactive:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 16px
rounded:
  sm: 0.5rem
  DEFAULT: 1rem
  md: 1.5rem
  lg: 2rem
  xl: 3rem
  full: 9999px
spacing:
  unit: 8px
  container-padding-mobile: 20px
  container-padding-desktop: 40px
  card-gap: 16px
  widget-padding: 24px
---

## Brand & Style
The design system is centered on a "Cozy Productivity" narrative. It aims to transform the often-stressful act of studying into a nurturing, gamified experience. The target audience includes students and lifelong learners who value emotional well-being alongside efficiency. 

The visual style is a blend of **Soft Minimalism** and **Tactile/Skeuomorphic** elements. Surfaces should feel soft to the touch, like physical stationery or plush toys. The emotional response should be one of safety, motivation, and delight, achieved through "bubbly" geometry and a high-degree of interface responsiveness that mimics physical physics.

## Colors
The palette utilizes a "Sugar-Powdered" pastel logic. The **Primary (Mint)** is used for success states and primary actions. **Secondary (Lavender)** is reserved for focus periods and deep work sessions. **Tertiary (Light Yellow)** acts as a highlight for warnings or "Golden Rewards" in the gamification loop.

- **Light Mode (Default):** Uses a soft off-white (`#F7F9FC`) background to reduce eye strain compared to pure white.
- **Pastel Mode:** Background shifts to a very desaturated version of the Primary Mint.
- **Dark Mode:** Surfaces transition to a deep navy-charcoal with high-vibrancy pastel accents to maintain the "glow" of the UI.

## Typography
This design system uses **Plus Jakarta Sans** for headlines to provide a friendly, wide-aperture look that feels modern and approachable. For body text and labels, **Be Vietnam Pro** is utilized for its exceptional legibility and warm character. 

Type should always be rendered with slightly tighter letter-spacing in headlines to emphasize the "bubbly" feel. Avoid all-caps except for very small labels to keep the tone conversational rather than shouting.

## Layout & Spacing
The layout follows a **Fluid Card Grid**. On mobile, cards stack vertically with a 20px side margin. On desktop, a flexible masonry-style layout allows the 'Mini Calendar' and 'Today’s Todo' to sit side-by-side.

Spacing follows an 8px base grid, but internal card padding should be generous (24px) to emphasize the airy, relaxed vibe. Widgets do not use harsh borders; they rely on whitespace and soft shadows to define their boundaries.

## Elevation & Depth
Depth is created using **Ambient Shadows**. Instead of grey shadows, this design system uses shadows tinted with the primary or secondary color (e.g., a soft lavender shadow under a lavender card).

- **Level 1 (Resting):** Very soft, diffused shadow (Y: 4, Blur: 20, Opacity: 0.08).
- **Level 2 (Hover/Active):** Slightly deeper shadow with a small scale-up (1.02x) to mimic a "bouncy" physical reaction.
- **Floating Character:** High elevation (Y: 10, Blur: 30) with a subtle vertical floating animation (2px oscillation).

## Shapes
The shape language is dominated by **extreme roundedness**. Standard components use a `1rem` (16px) radius, while primary containers and "Today's Todo" cards utilize `rounded-3xl` (24px to 32px). 

Buttons should always be **pill-shaped** (fully rounded) to reinforce the "bubbly" aesthetic. Icons are enclosed in circular or "squircle" containers.

## Components
### Bubbly Buttons
Primary buttons feature a subtle inner-glow (top white border 1px, 20% opacity) and a slight bottom "weight" (2px darker border on the bottom) to look like a physical, pushable toy.

### Today's Todo Cards
Cards include a progress ring in the corner. Task items use large, rounded checkboxes that "pop" with a confetti burst animation when tapped.

### Floating Character Widget
The character sits in a circular container with a glassmorphic background (`backdrop-filter: blur(10px)`). Speech bubbles from the character use the Secondary Lavender color.

### Edit Mode
When Edit Mode is active:
- Widgets transition to a **dashed border** (2px width, 4px dash-gap) using the Primary Mint color.
- **Resize Handles:** Solid white circles (24px diameter) appear at the bottom-right corner with a small shadow.
- **Delete Handle:** A small circular 'X' icon sits at the top-left, slightly overlapping the card boundary.
- **Animation:** A subtle "jiggle" effect is applied to all cards to indicate they are movable.

### Navigation Bar
Top-aligned with a simplified hamburger menu (rounded line ends). The bar is semi-transparent to allow the background pastel gradients to bleed through.