/**
 * Project Strata - Digital Architecture & Speculative Archival Showcase
 * Created by an Independent Frontend & Visual Designer in Gombe, Nigeria
 */

export const STRATA_BRAND_TOKENS = {
  name: "Strata Archive — Speculative Editorial Showcase",
  tagline: "Stories written for the screen. Crafted for memory.",
  location: "Gombe, Nigeria · Digital Archive Experiment",
  colors: {
    paperWhite: "#FAF8F5",
    parchment: "#F4F1EA",
    parchmentDark: "#EDE8DF",
    charcoal: "#18181B",
    charcoalLight: "#27272A",
    charcoalMuted: "#71717A",
    amberAccent: "#B45309",
    amberLight: "#D97706",
    editorialBorder: "rgba(24, 24, 27, 0.1)"
  },
  typography: {
    display: "'Syne', sans-serif",
    body: "'Plus Jakarta Sans', sans-serif"
  }
};

/**
 * STRATA_LOGO_MARK
 * Minimalist 35mm film aperture gate and geometric editorial emblem.
 */
export const STRATA_LOGO_MARK = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none" class="strata-cinema-mark" role="img" aria-label="Strata Archive Emblem">
  <rect x="14" y="18" width="72" height="64" rx="2" stroke="currentColor" stroke-width="2.5" />
  <line x1="26" y1="18" x2="26" y2="82" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 4" stroke-opacity="0.6"/>
  <line x1="74" y1="18" x2="74" y2="82" stroke="currentColor" stroke-width="1.2" stroke-dasharray="3 4" stroke-opacity="0.6"/>
  <rect x="31" y="32" width="38" height="36" stroke="currentColor" stroke-width="1.8" />
  <circle cx="50" cy="50" r="10" stroke="currentColor" stroke-width="1.8" stroke-dasharray="2 3"/>
  <circle cx="50" cy="50" r="3" fill="currentColor" />
  <line x1="50" y1="23" x2="50" y2="28" stroke="currentColor" stroke-width="1.5" />
  <line x1="50" y1="72" x2="50" y2="77" stroke="currentColor" stroke-width="1.5" />
</svg>`;

/**
 * FILM_SLATE_GLYPH
 * Clean film-slate title aperture mark for the minimalist 1.2s entrance fade.
 */
export const FILM_SLATE_GLYPH = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 140 100" fill="none" class="strata-film-slate" role="img" aria-label="Strata Slate">
  <rect x="10" y="15" width="120" height="70" rx="3" stroke="currentColor" stroke-width="2" />
  <line x1="10" y1="36" x2="130" y2="36" stroke="currentColor" stroke-width="2" />
  <line x1="26" y1="15" x2="42" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="56" y1="15" x2="72" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <line x1="86" y1="15" x2="102" y2="36" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"/>
  <circle cx="70" cy="62" r="14" stroke="currentColor" stroke-width="1.5" stroke-dasharray="3 3"/>
  <circle cx="70" cy="62" r="4" fill="currentColor"/>
</svg>`;

/**
 * NAV_ICONS
 * Editorial glyphs for dialogs, drawers, and menus including animated quill.
 */
export const NAV_ICONS = {
  menu: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="strata-icon strata-icon-menu">
  <line x1="3" y1="7" x2="21" y2="7"></line>
  <line x1="7" y1="12" x2="21" y2="12"></line>
  <line x1="3" y1="17" x2="17" y2="17"></line>
</svg>`,

  dismiss: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="strata-icon strata-icon-dismiss">
  <line x1="18" y1="6" x2="6" y2="18"></line>
  <line x1="6" y1="6" x2="18" y2="18"></line>
</svg>`,

  quill: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" class="strata-quill-glyph w-4 h-4 text-amberAccent inline-block">
  <path d="M12 19l7-7 3 3-7 7-3-3z"></path>
  <path d="M18 13l-1.5-7.5L2 2l3.5 14.5L13 18l5-5z"></path>
  <path d="M2 2l7.586 7.586"></path>
</svg>`
};

export default {
  STRATA_BRAND_TOKENS,
  STRATA_LOGO_MARK,
  FILM_SLATE_GLYPH,
  NAV_ICONS
};
