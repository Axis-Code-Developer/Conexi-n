# Figma Design System Rules for Ministry Organizer

## Asset Management Guidelines

### 1. Icons
- **Source**: Extract from Figma as SVG.
- **Destination**: `src/assets/icons/`
- **Naming Convention**: kebab-case, descriptive (e.g., `calendar-icon.svg`, `user-avatar-placeholder.svg`).
- **Usage**: Import as React components or use with `Image` component depending on loader. Preferred: Inline SVG or SVGR if configured, otherwise Next.js Image.

### 2. Images
- **Source**: Extract as WebP (preferred) or PNG/JPG.
- **Destination**: `public/images/`
- **Naming Convention**: kebab-case (e.g., `ministry-hero-bg.webp`).

### 3. Colors & Typography (Tailwind)
- **Colors**: Define in `tailwind.config.ts`.
    - Primary, Secondary, Accent, Background (`#fff` for Calendar).
    - Map Figma color variables to Tailwind semantic names (e.g., `bg-calendar-card`).
- **Typography**: Use `Inter` (or Figma specific font) via `next/font`.
    - Define font families in `tailwind.config.ts`.

### 4. Component Structure
- **Atomic Design**:
    - `src/components/ui`: Base elements (buttons, inputs) - shadcn/ui style.
    - `src/components/domain`: Feature specific (e.g., `CalendarGrid`, `AgentStatus`).
    - `src/components/layout`: Navbar, Sidebar.

## Workflow for MCP
When extracting assets using Figma MCP:
1. Identify the node type (Icon, Image).
2. Construct the filename based on the layer name (sanitized to kebab-case).
3. Download/Write to the appropriate directory defined above.
