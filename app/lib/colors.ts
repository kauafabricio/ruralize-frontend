// RURALIZE Design Token System - Official Color Palette
export const colors = {
  primary: {
    dark: "#2c4a24", // Primary Dark - Verde acinzentado escuro
    darker: "#1a3a1b", // Darker variant for hover/active states
    light: "#36592d", // Lighter variant
  },
  secondary: {
    light: "#f5eee0", // Secondary Light - Laranja claro/Creme
  },
  pastel: {
    support: "#b0cdba", // Pastel Support - Verde acinzentado pastel
  },
  neutral: {
    darker: "#1e1f1d", // Very dark text
    muted: "#a1ba9b", // Neutral Muted - Verde apagado (subtitles, disabled)
    light: "#e8ede5", // Light border/divider
    lighter: "#f5f7f3", // Very light background
  },
  base: {
    clean: "#ffffff", // Base Clean - Branco (background cards)
  },
  supporting: {
    mutedText: "#7a8577", // Subtle text color
    border: "#d4dcd2", // Border color
    divider: "#e0e5db", // Divider color
  },
  danger: {
    primary: "#c74141", // Softened danger red
    darker: "#b33434", // Darker danger for hover
    light: "#f8e8e8", // Light danger background
  },
  success: {
    primary: "#2c4a24", // Use primary dark for success
    light: "#e8f4e3", // Light success background
  },
};

// Export as Tailwind-compatible format for use in config
export const tailwindColors = {
  primary: {
    DEFAULT: colors.primary.dark,
    dark: colors.primary.dark,
    darker: colors.primary.darker,
    light: colors.primary.light,
  },
  secondary: {
    light: colors.secondary.light,
  },
  pastel: {
    support: colors.pastel.support,
  },
  neutral: {
    darker: colors.neutral.darker,
    muted: colors.neutral.muted,
    light: colors.neutral.light,
    lighter: colors.neutral.lighter,
  },
  base: {
    clean: colors.base.clean,
  },
  danger: {
    DEFAULT: colors.danger.primary,
    primary: colors.danger.primary,
    darker: colors.danger.darker,
    light: colors.danger.light,
  },
  success: {
    primary: colors.success.primary,
    light: colors.success.light,
  },
};

// Shadow definitions with soft, organic effects
export const shadowDefinitions = {
  "soft-xs": "0 1px 4px rgba(44, 74, 36, 0.03)",
  "soft-sm": "0 2px 8px rgba(44, 74, 36, 0.04)",
  soft: "0 4px 20px rgba(44, 74, 36, 0.05)",
  "soft-lg": "0 8px 32px rgba(44, 74, 36, 0.08)",
  "soft-xl": "0 12px 48px rgba(44, 74, 36, 0.12)",
  "soft-2xl": "0 24px 70px rgba(44, 74, 36, 0.15)",
};
