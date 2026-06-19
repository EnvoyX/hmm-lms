export const STORED_DATA_NAME = "user-setting-hmm-lms";

export const FONT_SIZES = {
  xsmall: { value: "12", label: "Extra Small (12px)" },
  small: { value: "14", label: "Small (14px)" },
  medium: { value: "16", label: "Medium (16px)" },
  large: { value: "18", label: "Large (18px)" },
  xlarge: { value: "20", label: "Extra Large (20px)" },
};

export const FONT_FAMILIES = {
  geist: { value: "--font-geist", label: "Geist", class: '[font-family:var(--font-geist)]' },
  inter: { value: "--font-inter", label: "Inter", class: '[font-family:var(--font-inter)]' },
  montserrat: { value: "--font-montserrat", label: "Montserrat", class: '[font-family:var(--font-montserrat)]' },
  roboto: { value: "--font-roboto", label: "Roboto", class: '[font-family:var(--font-roboto)]' },
  poppins: { value: "--font-poppins", label: "Poppins", class: '[font-family:var(--font-poppins)]' },
  oxygen: { value: "--font-oxygen", label: "Oxygen", class: '[font-family:var(--font-oxygen)]' },
  "noto-sans": { value: "--font-noto-sans", label: "Noto Sans", class: '[font-family:var(--font-noto-sans)]' },
  "roboto-mono": { value: "--font-roboto-mono", label: "Roboto Mono", class: '[font-family:var(--font-roboto-mono)]' },
  "dancing-script": { value: "--font-dancing-script", label: "Dancing Script", class: '[font-family:var(--font-dancing-script)]' },
  "exo-2": { value: "--font-exo-2", label: "Exo 2", class: '[font-family:var(--font-exo-2)]' },
  "lobster-two": { value: "--font-lobster-two", label: "Lobster Two", class: '[font-family:var(--font-lobster-two)]' },
  caveat: { value: "--font-caveat", label: "Caveat", class: '[font-family:var(--font-caveat)]' },
  "shadows-into-light": { value: "--font-shadows-into-light", label: "Shadows Into Light", class: '[font-family:var(--font-shadows-into-light)]' },
};

export const REDUCE_MOTION_OPTIONS = {
  system: { value: "system", label: "Match system" },
  on: { value: "on", label: "Reduce motion" },
  off: { value: "off", label: "Full motion" },
} as const;

export type ReduceMotionMode = (typeof REDUCE_MOTION_OPTIONS)[keyof typeof REDUCE_MOTION_OPTIONS]["value"];

export const DEFAULT_A11Y = {
  highContrast: false,
  reduceMotion: "system" as ReduceMotionMode,
  underlineLinks: false,
  alwaysShowFocusRing: false,
} as const;

export type A11ySettings = {
  highContrast: boolean;
  reduceMotion: ReduceMotionMode;
  underlineLinks: boolean;
  alwaysShowFocusRing: boolean;
};

export const SPACING_SIZES = {
  tight: {
    value: "0.15rem",
    label: "Tight",
    description: "Minimal spacing for compact layouts",
  },
  compact: {
    value: "0.2rem",
    label: "Compact",
    description: "Reduced spacing for dense content",
  },
  normal: {
    value: "0.25rem",
    label: "Normal",
    description: "Standard spacing for most layouts",
  },
  comfortable: {
    value: "0.3rem",
    label: "Comfortable",
    description: "Increased spacing for better readability",
  },
  relaxed: {
    value: "0.35rem",
    label: "Relaxed",
    description: "Generous spacing for a calm feel",
  },
  loose: {
    value: "0.4rem",
    label: "Loose",
    description: "Maximum spacing for minimal layouts",
  },
};