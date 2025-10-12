export const theme = {
  color: {
    bg: "#b1b2b9ff",           // App background
    card: "#e1e2e6ff",         // Default card color
    cardAlt: "#e1e2e6ff",      // Alternate card style
    text: "#000000ff",         // Primary text
    text1: "#ffffffff",        // Inverse text (e.g. on dark backgrounds)
    textMuted: "#000000ff",    // Subtle text (for labels, metadata)
    textDark: "#1f2937ff",     // Darker readable text
    lightGray: "#f3f4f6ff",    // Light UI elements (e.g. bar background)
    gray: "#9ca3afff",         // Neutral gray (e.g. buttons)
    primary: "#0ea5e9",        // Blue (for active bars, accents)
    primaryDark: "#1e3a8aff",  // Deep blue for headings
    secondary: "#c7d2fe",      // Soft secondary color (optional)
    secondaryLight: "#e0e7ffff", // Background for secondary sections

    brand: "#22c55e",          // Green - primary brand
    brandSoft: "#16a34a",      // Darker brand green
    danger: "#ef4444",         // Red - for errors, delete
    success: "#22c55e",        // Green - for confirm, success
    warning: "#f59e0b",        // Yellow - optional
    info: "#0ea5e9",           // Blue info messages

    border: "#727c8aff",       // Border color
    chip: "#bcc4cfff",         // Background for chips
    chipBorder: "#707070ff",   // Chip outline
    pill: "#1a1a1aff",         // For pill components
  },

  radius: { sm: 8, md: 12, lg: 16, xl: 22 },
  space: { xs: 6, sm: 10, md: 14, lg: 18, xl: 24 },
  font: { h1: 24, h2: 18, body: 14, small: 12, big: 32 },
  shadow: {
    card: {
      shadowColor: "#000",
      shadowOpacity: 0.25,
      shadowRadius: 10,
      elevation: 3,
    },
  },
};
