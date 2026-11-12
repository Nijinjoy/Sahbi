/**
 * Sahbi palette, taken from the app icon: deep navy, emerald, mint and
 * turquoise. Coral is kept only for alerts (unread badges, saved hearts).
 */
export const colors = {
  /** Emerald accent: highlights, focus rings, active chips, badges. */
  primary: '#10B981',
  primarySoft: '#E6F7F0',
  /** Deep navy: headings, dark buttons, headers. */
  secondary: '#0B2340',
  /** Deep navy used by headers and dark surfaces. */
  brandNavy: '#0B2340',
  /** Forest green behind the app icon and splash. */
  brandForest: '#0F3F2E',
  /** Champagne gold and warm ivory from the knot logo. */
  brandGold: '#D8B577',
  brandIvory: '#FBF6EC',
  brandEmerald: '#10B981',
  brandMint: '#34D399',
  brandTurquoise: '#2DD4BF',

  /** Readable teal for accent text on white. */
  accentTeal: '#0F766E',
  accentCoral: '#E2553A',
  /** Rating stars. */
  star: '#F2B84B',

  background: '#FFFFFF',
  surface: '#F8F9FB',
  border: '#D5D9E2',
  error: '#C2410C',
  success: '#22A06B',

  textMuted: '#5B6478',
  textOnSecondary: '#FFFFFF',
  textOnPrimary: '#0B2340',
} as const;
