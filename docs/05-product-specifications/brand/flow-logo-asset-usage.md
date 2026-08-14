---
title: FLOW Logo Asset Usage
document_id: FLOW-BRAND-LOGO-ASSETS
status: implemented
owner: Design Systems
last_reviewed: 2026-08-14
source_of_truth: true
---

# FLOW Logo Asset Usage

This document defines the canonical FLOW platform assets used by the FoodFlow
web application. FLOW platform branding is separate from each restaurant's
tenant branding. Restaurant storefronts must keep the merchant identity primary.

## Canonical registry

UI, metadata, and manifest code must resolve paths through
`apps/web/next-flow/src/config/brand-assets.ts`. Do not scatter literal
`/brand/...` paths through components.

All canonical files are true, opaque PNG images. They were decoded from the
provided JPEG/JFIF payloads and re-encoded without cropping, recoloring,
background removal, or aspect-ratio changes.

| Asset | Purpose | Allowed contexts | Prohibited contexts | Background | Minimum display size | Aspect ratio | Source dimensions | Transparency | Metadata/PWA |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `flow-logo.png` | Primary FLOW identity | Login, corporate navigation, about/brand surfaces | Collapsed navigation, favicon, merchant logo | Light/off-white surfaces matching its opaque canvas | 120px wide | 3:2 | 1536×1024 | None | UI only |
| `flow-icon.png` | FLOW symbol | Mobile header, collapsed sidebar, brand avatar | Restaurant logo, social preview | Light surfaces; the light canvas is part of the file | 32px square | 1:1 | 1254×1254 | None | UI shortcut only |
| `flow-compact.png` | Compact application identity | Expanded sidebar, dashboard header, tablet navigation | Favicon or social preview | Light/off-white surfaces | 96px wide | 2:1 | 1774×887 | None | UI only |
| `flow-dark.png` | Reverse identity | Dark navigation, dark hero, zinc/black footer | Light surfaces | Near-black surfaces matching its opaque canvas | 120px wide | 1672:941 | 1672×941 | None | UI only |
| `flow-favicon.png` | Browser identity | Browser icon and shortcut metadata | Large UI logo | Browser-managed surface | 16px square | 1:1 | 1254×1254 | None | Favicon only |
| `flow-wordmark.png` | FLOW typography identity | Footer, splash/loading when a FLOW symbol is already present | Standalone identity without symbol context | Light/off-white surfaces | 96px wide | 2:1 | 1774×887 | None | UI only |
| `flow-icon-dark.png` | App identity master | PWA/home-screen source and system avatar | Restaurant identity, navbar wordmark | Self-contained black app-icon canvas | 48px square | 1:1 | 1254×1254 | None | PWA master |
| `flow-og.png` | External link preview | Open Graph, Twitter, LINE, Slack, Discord, Facebook | Navbar, sidebar, in-product UI | Self-contained dark artwork | Metadata only | 3:2 | 1536×1024 | None | OG/Twitter only |

Ownership of these files belongs to the FLOW platform brand. Tenant-uploaded
logos and tenant-generated social images must be stored separately and must not
overwrite the FLOW masters.

## Generated PWA derivatives

The current manifest uses derivatives generated from `flow-icon-dark.png`:

| File | Dimensions | Purpose |
| --- | --- | --- |
| `generated/flow-icon-192.png` | 192×192 | Standard PWA icon |
| `generated/flow-icon-512.png` | 512×512 | High-resolution PWA icon |
| `generated/flow-icon-maskable-512.png` | 512×512 | Maskable PWA icon |

The visible light symbol stays within the standard central maskable safe circle.
The black background is intentional and may be cropped by the operating system.

## Component contract

Use `FlowLogo` from
`apps/web/next-flow/src/components/shared/flow-logo.tsx` for UI rendering.

```tsx
<FlowLogo variant="compact" className="h-10 w-auto" />
<FlowLogo variant="icon" decorative className="size-8" />
<FlowLogo variant="reverse" alt="FLOW" className="h-12 w-auto" />
```

- Use `alt="FLOW"` when the image supplies the accessible brand name.
- Use `decorative` when nearby visible text already supplies that name.
- Logo links need their own accessible name and visible focus treatment.
- Preserve `w-auto` or `h-auto`; never force both axes to an unrelated ratio.
- Next.js 16 uses `preload` for the exceptional above-the-fold logo that needs it.
- Never pass the favicon or Open Graph image through the UI logo component.

## Placement rules

- Login on a light surface: `primary`.
- Expanded operational sidebar: `compact`.
- Collapsed sidebar or constrained mobile header: `icon`.
- Dark hero/navigation/footer: `reverse`.
- Loading with a separate FLOW symbol: `wordmark`; without one, use `primary`
  or `compact` so the identity is complete.
- Customer storefront: merchant logo or merchant placeholder first; FLOW may
  appear only as small secondary “Powered by FLOW” attribution.

## Known source limitations

- None of the supplied masters has an alpha channel. A rectangular light or
  dark canvas can be visible when the surface color does not match.
- `flow-favicon.png` has substantial whitespace; the symbol occupies roughly
  37% of its width and may be weak at 16px. Obtain a purpose-built favicon from
  the brand owner rather than cropping or redrawing this master.
- `flow-og.png` is 1536×1024 (3:2), not the preferred 1200×630 social ratio.
  Metadata declares the truthful dimensions. A redesigned 1200×630 master
  requires brand approval; do not crop this file automatically.

## Validation checklist

- Confirm every `.png` begins with the PNG signature and dimensions match this document.
- Inspect light/dark placement without CSS filters, stretching, or cropping.
- Check 320px, 390px, 768px, 1280px, and 1440px viewports.
- Verify browser favicon, Open Graph/Twitter tags, and manifest icon declarations.
- Run lint, typecheck, and the Next.js production build.
