---
name: Tequit Design System
colors:
  surface: '#effdf3'
  surface-dim: '#cfddd4'
  surface-bright: '#effdf3'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#e9f7ed'
  surface-container: '#e3f1e7'
  surface-container-high: '#ddece2'
  surface-container-highest: '#d8e6dc'
  on-surface: '#121e18'
  on-surface-variant: '#414844'
  inverse-surface: '#27332d'
  inverse-on-surface: '#e6f4ea'
  outline: '#717974'
  outline-variant: '#c1c8c3'
  surface-tint: '#3e6656'
  primary: '#00251a'
  on-primary: '#ffffff'
  primary-container: '#123c2e'
  on-primary-container: '#7da794'
  inverse-primary: '#a4d0bc'
  secondary: '#2a6951'
  on-secondary: '#ffffff'
  secondary-container: '#aceece'
  on-secondary-container: '#2f6e55'
  tertiary: '#420c00'
  on-tertiary: '#ffffff'
  tertiary-container: '#671800'
  on-tertiary-container: '#f47b57'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#c0ecd8'
  primary-fixed-dim: '#a4d0bc'
  on-primary-fixed: '#002116'
  on-primary-fixed-variant: '#264e3f'
  secondary-fixed: '#aff0d1'
  secondary-fixed-dim: '#94d4b6'
  on-secondary-fixed: '#002115'
  on-secondary-fixed-variant: '#09513a'
  tertiary-fixed: '#ffdbd1'
  tertiary-fixed-dim: '#ffb5a0'
  on-tertiary-fixed: '#3b0a00'
  on-tertiary-fixed-variant: '#822709'
  background: '#effdf3'
  on-background: '#121e18'
  surface-variant: '#d8e6dc'
typography:
  display-lg:
    fontFamily: Fraunces
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.02em
  headline-lg:
    fontFamily: Fraunces
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
  headline-lg-mobile:
    fontFamily: Fraunces
    fontSize: 28px
    fontWeight: '600'
    lineHeight: 36px
  title-md:
    fontFamily: Fraunces
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-md:
    fontFamily: Manrope
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 20px
    letterSpacing: 0.01em
  label-sm:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.03em
  numeric-display:
    fontFamily: Fraunces
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  xs: 4px
  sm: 8px
  md: 12px
  base: 16px
  lg: 24px
  xl: 32px
  xxl: 48px
  huge: 64px
  giant: 96px
---

## Brand & Style
The design system is built on the concept of "Human Craft" (Oficio Humano), celebrating the local commerce of Tepic, Nayarit. It bridges the gap between traditional reliability and modern editorial precision. The visual language avoids folk clichés, opting instead for a sophisticated, documentary-style aesthetic that treats local services with the same gravity as luxury brands.

The style is **Modern-Editorial**, characterized by:
- **Warmth and Authenticity:** A paper-based color palette that feels tactile and grounded.
- **Precision:** Sharp grid alignments and generous whitespace that command trust.
- **Documentary Photography:** High-quality imagery focusing on textures, hands at work, and real environments rather than stock graphics.

## Colors
The palette is inspired by natural materials: forest greens, sun-baked clay, and raw paper.

- **Foundational Surfaces:** Use `#FFFCF7` (Paper) for the main background to reduce eye strain and provide a tactile feel. Use `#F7F1E7` (Cream) to differentiate content sections.
- **Brand Greens:** The Forest Green (`#123C2E`) is the primary voice of authority. Secondary green and verification shades are used to denote growth and trust.
- **Clay Accents:** Use the Barro (`#A94324`) sparingly for highlights, secondary CTAs, or to draw attention to artisan elements.
- **Functional Colors:** The WhatsApp Green (`#08783E`) is a reserved brand asset specifically for direct communication triggers.

## Typography
The typographic pairing reflects the "Editorial Precision" of the brand.

- **Fraunces:** A "Soft-Serif" used for headlines and figures. It provides a literary, established feel. Use tighter letter-spacing for large displays.
- **Manrope:** A modern, highly legible sans-serif used for all functional UI, body text, and navigation. Its geometric but warm structure complements the organic nature of Fraunces.
- **Hierarchical Usage:** Always prioritize Fraunces for price displays and service names to elevate the perceived value of local work. Use Manrope Semibold (600) or Bold (700) for interactive elements like buttons and navigation.

## Layout & Spacing
This design system utilizes an 8-pixel linear scale to ensure mathematical harmony across all components.

- **Grid Model:** Use a 12-column fluid grid for desktop and a 4-column grid for mobile.
- **Gutters:** Standard gutter is 24px on desktop to allow for "Editorial" breathing room, reducing to 16px on mobile.
- **Vertical Rhythm:** Use the `huge` (64px) and `giant` (96px) spacing tokens to separate major homepage sections, reinforcing the "Minimalist" and "Clean" brand pillars. 
- **Safe Areas:** On mobile, ensure all interactive elements maintain a minimum 16px distance from the screen edges.

## Elevation & Depth
To maintain the "Paper" and "Craft" aesthetic, this design system avoids heavy shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Level 0 (Floor):** Base background `#FFFCF7`.
- **Level 1 (Cards/Containers):** White or `#F7F1E7` background with a 1px border of `#DCE4DE`.
- **Level 2 (Interactive/Floating):** Use a very soft, diffused shadow: `0 4px 12px rgba(23, 35, 29, 0.05)`.
- **Focus States:** High-visibility `#E3A600` (Gold) 2px solid ring with a 2px offset.
- **Depth through Color:** Depth is primarily created by swapping background colors (e.g., a Cream section on a Paper background) rather than using literal drop shadows.

## Shapes
Shapes are intentional and hierarchical, moving from functional to expressive.

- **Controls (10px):** Inputs, buttons, and small UI elements use a moderate roundness that feels modern but structured.
- **Cards (16px):** Standard container roundness for service and business listings.
- **Editorial Surfaces (24px):** Large hero sections, modal containers, and decorative containers use a generous radius to feel welcoming and "soft."
- **Pills:** Strictly reserved for status Badges, Chips, and Filters to distinguish them from actionable buttons.

## Components

### Buttons & Inputs
- **Primary Button:** Forest Green (`#123C2E`) background, White text, 10px radius.
- **WhatsApp CTA:** Background `#08783E` with a Lucide "MessageCircle" icon.
- **Inputs:** 1px border `#DCE4DE`, 10px radius. On focus, border changes to `#123C2E` with the Gold focus ring.

### Navigation & Shells
- **Public Shell:** Transparent header that becomes Paper-colored on scroll.
- **Bottom Nav:** 5 items, fixed height 64px. Active state uses Forest Green for the icon and label.
- **Header:** Minimalist. Logo on the left, search trigger or profile on the right.

### Cards
- **Business Card:** Vertical layout, 16px radius, large image (3:2 ratio), Fraunces Title, Ratings with Gold stars.
- **Service/Provider Card:** Horizontal layout for mobile, emphasis on the person's portrait (documentary style) and their years of experience.

### Search & Discovery
- **Hero Search:** Large, centered input with 24px radius and "Clay" accent for the search button.
- **Chips/Filters:** Pill-shaped, light cream background, becoming Forest Green when active.

### Feedback & State
- **Ratings:** Use 1.75px stroke Lucide "Star" icons. Filled state in `#E3A600`.
- **Skeletons:** Use a subtle pulse animation transitioning between `#F7F1E7` and `#F0E8DB`.
- **Empty States:** Centered Fraunces typography with a large, low-opacity Lucide icon in Forest Green.