# Design System Specification

## 1. Overview & Creative North Star: "The Obsidian Forge"
This design system is built for the high-performance developer ecosystem—a realm where speed meets absolute precision. The Creative North Star is **The Obsidian Forge**: a visual language that feels carved from a single block of dark glass, illuminated by high-intensity data and editorial-grade typography. 

To achieve a "signature" experience, we move beyond the generic SaaS template. We leverage **intentional asymmetry** and **tonal depth** to guide the eye. This system doesn't rely on boxes; it relies on the relationship between light (typography) and void (black space). We treat the UI as a professional instrument—utilitarian, yet undeniably premium.

---

## 2. Colors & Tonal Depth
The palette is rooted in absolute blacks and layered greys, designed to minimize eye strain while maximizing focus.

### The "No-Line" Rule
Designers are prohibited from using 1px solid borders to define major layout sections. Boundaries must be established through background color shifts. For instance, a main content area using the `surface` (#131313) token should sit adjacent to a sidebar using `surface_container_low` (#1b1b1b). This creates a sophisticated "carved" look rather than a "sketched" look.

### Surface Hierarchy & Nesting
Depth is achieved through the physical layering of the `surface-container` tiers:
- **Base Layer:** `surface_container_lowest` (#0e0e0e) or `surface` (#131313).
- **Secondary Content:** `surface_container_low` (#1b1b1b).
- **Floating/Interactive Elements:** `surface_container_high` (#2a2a2a) or `highest` (#353535).

### The "Glass & Gradient" Rule
To elevate the aesthetic, use **Glassmorphism** for navigation and floating panels. Apply a `surface_container` color at 70% opacity with a `40px` backdrop-blur. 
- **Signature Texture:** For primary CTAs or hero sections, use a subtle radial gradient transitioning from `primary` (#FFFFFF) to `secondary` (#c7c6c6) at a 45-degree angle. This adds a "metallic" soul to the interface that flat colors cannot replicate.

---

## 3. Typography: The Editorial Voice
We utilize **Inter** (and **Geist/Geist Mono**) to create a high-contrast, developer-centric hierarchy.

- **Display & Headlines:** Use `display-lg` (3.5rem) and `headline-lg` (2rem) with bold weights (600-700). Tracking should be tightened to `-0.02em` to create an authoritative, "newspaper-header" impact.
- **Body:** Use `body-lg` (1rem) and `body-md` (0.875rem) at weights 400-500. This ensures maximum readability against pure black backgrounds.
- **Monospaced Utility:** Use **Geist Mono** for technical data, SKUs, and price points. This reinforces the "developer-grade" brand promise, making commerce feel like code.

---

## 4. Elevation & Depth
In this design system, shadows are atmospheric, not structural.

- **Tonal Layering Principle:** Place `surface_container_high` cards on top of `surface_container_low` sections to create a soft, natural lift. No border or shadow is required when the tonal contrast is correct.
- **Ambient Shadows:** When a card must "float" (e.g., a modal or hovering product card), use an extra-diffused shadow:
  - **Blur:** 60px
  - **Opacity:** 6%
  - **Color:** Derived from the `on_surface` (#e2e2e2) token, creating a subtle "glow" rather than a dark smudge.
- **The "Ghost Border" Fallback:** If a container requires a border for accessibility, use the `outline_variant` (#444748) at **15% opacity**. Never use 100% opaque borders for decorative containment.

---

## 5. Components

### Buttons: The Kinetic Core
- **Primary:** Background `primary` (#FFFFFF), Text `on_primary` (#2f3131). Weight: 600. Corner radius: `lg` (0.5rem).
- **Secondary (Ghost):** Border `outline_variant` (#444748) at 40%, Text `primary` (#FFFFFF). No background.
- **Interaction:** On hover, primary buttons should slightly increase in "glow" (ambient shadow), while ghost buttons should transition to a 10% opacity white background.

### Input Fields
- **Style:** Minimalist. No background fill. 
- **Borders:** Use a `px` width border of `outline_variant`. On focus, the border intensifies to `primary` white, and a subtle "outer glow" (4px blur) is applied using the `primary` token at 20% opacity.

### Cards & Lists: The Negative Space Rule
- **Forbid Divider Lines:** Separate list items and card content using the Spacing Scale. Use `spacing-6` (2rem) or `spacing-8` (2.75rem) to let the typography breathe.
- **Content Separation:** If separation is required, use a 1-step shift in `surface-container` tokens.

### Product Detail Components
- **The "Spec Sheet" Grid:** Use `Geist Mono` for technical specifications. Layout these specs in a tight, 2-column grid using `label-md` to mimic a terminal output or an invoice.

---

## 6. Do's and Don'ts

### Do
- **Do** use generous whitespace (`spacing-16` and `spacing-20`) to separate major narrative blocks.
- **Do** use `primary` white for all interactive elements to maintain high-contrast accessibility (WCAG AAA).
- **Do** leverage asymmetric layouts—for example, a large `display-lg` headline on the left with a small `body-md` paragraph tucked into the bottom-right of the next grid cell.

### Don't
- **Don't** use standard "drop shadows." They feel dated and muddy in a pure black environment.
- **Don't** use blue or colored links. All interactivity should be conveyed through white/grey tonal shifts or underlined typography.
- **Don't** use `DEFAULT` (0.25rem) rounding for large containers; reserve it for small tags or chips. Use `lg` (0.5rem) for cards and buttons to maintain a "futuristic-industrial" feel.