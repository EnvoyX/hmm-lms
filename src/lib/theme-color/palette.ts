export const THEME_TOKENS = [
  "background",
  "foreground",
  "card",
  "card-foreground",
  "popover",
  "popover-foreground",
  "primary",
  "primary-foreground",
  "secondary",
  "secondary-foreground",
  "muted",
  "muted-foreground",
  "accent",
  "accent-foreground",
  "destructive",
  "border",
  "input",
  "ring",
  "chart-1",
  "chart-2",
  "chart-3",
  "chart-4",
  "chart-5",
  "sidebar",
  "sidebar-foreground",
  "sidebar-primary",
  "sidebar-primary-foreground",
  "sidebar-accent",
  "sidebar-accent-foreground",
  "sidebar-border",
  "sidebar-ring",
  "navy",
  "success",
  "warning",
  "info",
  "error",
] as const;

export type ThemeToken = (typeof THEME_TOKENS)[number];
export type ThemePalette = Record<ThemeToken, string>;
type ColorMode = "light" | "dark";
type HarmonyStrategy = "analogous" | "split-complementary" | "triadic" | "complementary";

const DEFAULT_SEED = "#6366f1";

type Hsl = { h: number; s: number; l: number };

const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

const normalizeHue = (hue: number): number => {
  const normalized = hue % 360;
  return normalized < 0 ? normalized + 360 : normalized;
};

const hashSeed = (seed: string): number => {
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return hash >>> 0;
};

const mulberry32 = (seed: number) => {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const normalizeHex = (hex: string): string => {
  const clean = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]{3,8}$/.test(clean)) {
    return DEFAULT_SEED;
  }

  if (clean.length === 3) {
    const [r, g, b] = clean.split("");
    return `#${r}${r}${g}${g}${b}${b}`.toLowerCase();
  }

  return `#${clean.slice(0, 6)}`.toLowerCase();
};

const hexToRgb = (hex: string): { r: number; g: number; b: number } => {
  const normalized = normalizeHex(hex).replace("#", "");
  const int = Number.parseInt(normalized, 16);
  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
};

const rgbToHex = (r: number, g: number, b: number): string => {
  const toHex = (value: number) => clamp(Math.round(value), 0, 255).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

const rgbToHsl = (r: number, g: number, b: number): Hsl => {
  const rNorm = r / 255;
  const gNorm = g / 255;
  const bNorm = b / 255;

  const max = Math.max(rNorm, gNorm, bNorm);
  const min = Math.min(rNorm, gNorm, bNorm);
  const delta = max - min;

  let h = 0;
  const l = (max + min) / 2;
  const s = delta === 0 ? 0 : delta / (1 - Math.abs(2 * l - 1));

  if (delta !== 0) {
    if (max === rNorm) h = ((gNorm - bNorm) / delta) % 6;
    else if (max === gNorm) h = (bNorm - rNorm) / delta + 2;
    else h = (rNorm - gNorm) / delta + 4;
    h *= 60;
  }

  return { h: normalizeHue(h), s: s * 100, l: l * 100 };
};

const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
  const sat = clamp(s, 0, 100) / 100;
  const lig = clamp(l, 0, 100) / 100;
  const hue = normalizeHue(h);

  const c = (1 - Math.abs(2 * lig - 1)) * sat;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = lig - c / 2;

  let rPrime = 0;
  let gPrime = 0;
  let bPrime = 0;

  if (hue < 60) [rPrime, gPrime, bPrime] = [c, x, 0];
  else if (hue < 120) [rPrime, gPrime, bPrime] = [x, c, 0];
  else if (hue < 180) [rPrime, gPrime, bPrime] = [0, c, x];
  else if (hue < 240) [rPrime, gPrime, bPrime] = [0, x, c];
  else if (hue < 300) [rPrime, gPrime, bPrime] = [x, 0, c];
  else [rPrime, gPrime, bPrime] = [c, 0, x];

  return {
    r: (rPrime + m) * 255,
    g: (gPrime + m) * 255,
    b: (bPrime + m) * 255,
  };
};

const hslToHex = (hsl: Hsl): string => {
  const { r, g, b } = hslToRgb(hsl.h, hsl.s, hsl.l);
  return rgbToHex(r, g, b);
};

const shiftHue = (base: Hsl, delta: number): Hsl => ({ ...base, h: normalizeHue(base.h + delta) });

const tune = (base: Hsl, patch: Partial<Hsl>): Hsl => ({
  h: normalizeHue(patch.h ?? base.h),
  s: clamp(patch.s ?? base.s, 0, 100),
  l: clamp(patch.l ?? base.l, 0, 100),
});

const relativeLuminance = (hex: string): number => {
  const { r, g, b } = hexToRgb(hex);
  const toLinear = (channel: number): number => {
    const normalized = channel / 255;
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4;
  };
  const rLinear = toLinear(r);
  const gLinear = toLinear(g);
  const bLinear = toLinear(b);

  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear;
};

const contrastRatio = (a: string, b: string): number => {
  const lumA = relativeLuminance(a);
  const lumB = relativeLuminance(b);
  const [lighter, darker] = lumA > lumB ? [lumA, lumB] : [lumB, lumA];
  return (lighter + 0.05) / (darker + 0.05);
};

const pickReadableText = (background: string, minContrast = 4.5): string => {
  const white = "#ffffff";
  const black = "#111827";
  const whiteContrast = contrastRatio(background, white);
  const blackContrast = contrastRatio(background, black);

  if (whiteContrast >= minContrast || whiteContrast >= blackContrast) return white;
  return black;
};

const withContrast = (hex: string, text: string, minContrast: number): string => {
  if (contrastRatio(hex, text) >= minContrast) return hex;

  const currentRgb = hexToRgb(hex);
  let adjusted = rgbToHsl(currentRgb.r, currentRgb.g, currentRgb.b);
  const makeDarker = text.toLowerCase() === "#ffffff";

  for (let i = 0; i < 25; i += 1) {
    adjusted = tune(adjusted, { l: adjusted.l + (makeDarker ? -2.5 : 2.5) });
    const next = hslToHex(adjusted);
    if (contrastRatio(next, text) >= minContrast) {
      return next;
    }
  }

  return hex;
};

const pickHarmony = (random: () => number): HarmonyStrategy => {
  const roll = random();
  if (roll < 0.34) return "analogous";
  if (roll < 0.58) return "split-complementary";
  if (roll < 0.82) return "triadic";
  return "complementary";
};

const getHarmonyOffsets = (strategy: HarmonyStrategy): { accent: number; chart: number[] } => {
  switch (strategy) {
    case "analogous":
      return { accent: 24, chart: [0, 30, -30, 55, -55] };
    case "split-complementary":
      return { accent: 150, chart: [0, 150, 210, 35, -35] };
    case "triadic":
      return { accent: 120, chart: [0, 120, 240, 60, 180] };
    case "complementary":
      return { accent: 180, chart: [0, 180, 30, -30, 210] };
    default:
      return { accent: 24, chart: [0, 30, -30, 55, -55] };
  }
};

const createPalette = (seedHex: string, mode: ColorMode, strategy: HarmonyStrategy, random: () => number): ThemePalette => {
  const baseRgb = hexToRgb(seedHex);
  const base = rgbToHsl(baseRgb.r, baseRgb.g, baseRgb.b);
  const harmony = getHarmonyOffsets(strategy);

  const baseSatBoost = mode === "dark" ? 8 : 0;
  const primary = tune(base, {
    s: clamp(base.s + baseSatBoost, 25, 88),
    l: mode === "dark" ? 62 : 46,
  });
  const primaryHex = hslToHex(primary);
  const primaryText = pickReadableText(primaryHex);
  const safePrimary = withContrast(primaryHex, primaryText, 4.5);

  const bg = tune(base, {
    s: mode === "dark" ? clamp(base.s * 0.2, 4, 16) : clamp(base.s * 0.18, 2, 12),
    l: mode === "dark" ? 14 : 97,
  });
  const bgHex = hslToHex(bg);
  const fgHex = pickReadableText(bgHex, 10);

  const secondary = tune(base, {
    s: mode === "dark" ? clamp(base.s * 0.32, 8, 24) : clamp(base.s * 0.36, 6, 24),
    l: mode === "dark" ? 22 : 93,
  });

  const accentBase = shiftHue(base, harmony.accent + (random() > 0.6 ? 0 : (random() - 0.5) * 24));
  const accent = tune(accentBase, {
    s: clamp(base.s + (mode === "dark" ? 4 : -2), 30, 85),
    l: mode === "dark" ? 52 : 80,
  });
  const accentHex = hslToHex(accent);
  const accentText = pickReadableText(accentHex);

  const muted = tune(base, {
    s: mode === "dark" ? clamp(base.s * 0.22, 5, 14) : clamp(base.s * 0.2, 3, 10),
    l: mode === "dark" ? 24 : 91,
  });
  const border = tune(base, {
    s: mode === "dark" ? clamp(base.s * 0.24, 5, 16) : clamp(base.s * 0.28, 4, 18),
    l: mode === "dark" ? 31 : 86,
  });
  const ring = tune(base, {
    s: clamp(base.s + 6, 28, 90),
    l: mode === "dark" ? 64 : 54,
  });

  const sidebar = tune(base, {
    h: base.h + (mode === "dark" ? 4 : 8),
    s: clamp(base.s * 0.55, 18, 46),
    l: mode === "dark" ? 18 : 31,
  });
  const sidebarHex = hslToHex(sidebar);
  const sidebarText = pickReadableText(sidebarHex, 7);

  const chart = harmony.chart.map((offset, index) =>
    hslToHex(
      tune(shiftHue(base, offset), {
        s: clamp(base.s + (index % 2 === 0 ? 8 : -3), 28, 88),
        l: mode === "dark" ? 62 - index * 3 : 54 + index * 4,
      }),
    ),
  );

  const success = hslToHex(
    tune(shiftHue(base, 120), {
      s: clamp(base.s + 2, 32, 82),
      l: mode === "dark" ? 62 : 46,
    }),
  );
  const warning = hslToHex(
    tune(shiftHue(base, 58), {
      s: clamp(base.s + 10, 40, 90),
      l: mode === "dark" ? 62 : 52,
    }),
  );
  const info = hslToHex(
    tune(shiftHue(base, 200), {
      s: clamp(base.s, 28, 84),
      l: mode === "dark" ? 64 : 50,
    }),
  );
  const destructive = hslToHex(
    tune({ h: 8, s: 78, l: mode === "dark" ? 62 : 52 }, {}),
  );

  const palette: ThemePalette = {
    background: bgHex,
    foreground: fgHex,
    card: mode === "dark" ? hslToHex(tune(bg, { l: 18 })) : "#ffffff",
    "card-foreground": fgHex,
    popover: mode === "dark" ? hslToHex(tune(bg, { l: 17 })) : "#ffffff",
    "popover-foreground": fgHex,
    primary: safePrimary,
    "primary-foreground": pickReadableText(safePrimary),
    secondary: hslToHex(secondary),
    "secondary-foreground": pickReadableText(hslToHex(secondary), mode === "dark" ? 6 : 5),
    muted: hslToHex(muted),
    "muted-foreground": mode === "dark" ? "#cbd5e1" : "#475569",
    accent: accentHex,
    "accent-foreground": accentText,
    destructive: destructive,
    border: hslToHex(border),
    input: hslToHex(border),
    ring: hslToHex(ring),
    "chart-1": chart[0] ?? safePrimary,
    "chart-2": chart[1] ?? accentHex,
    "chart-3": chart[2] ?? hslToHex(shiftHue(primary, 120)),
    "chart-4": chart[3] ?? hslToHex(shiftHue(primary, 180)),
    "chart-5": chart[4] ?? hslToHex(shiftHue(primary, 240)),
    sidebar: sidebarHex,
    "sidebar-foreground": sidebarText,
    "sidebar-primary": safePrimary,
    "sidebar-primary-foreground": pickReadableText(safePrimary),
    "sidebar-accent": accentHex,
    "sidebar-accent-foreground": accentText,
    "sidebar-border": hslToHex(tune(border, { l: mode === "dark" ? 35 : 85 })),
    "sidebar-ring": hslToHex(ring),
    navy: sidebarHex,
    success,
    warning,
    info,
    error: destructive,
  };

  return palette;
};

export type GeneratedPaletteSet = {
  seedColor: string;
  strategy: HarmonyStrategy;
  light: ThemePalette;
  dark: ThemePalette;
};

export const generatePaletteFromSeed = (
  seedInput: string,
  strategyInput?: HarmonyStrategy,
): GeneratedPaletteSet => {
  const seedColor = normalizeHex(seedInput);
  const random = mulberry32(hashSeed(seedColor));
  const strategy = strategyInput ?? pickHarmony(random);
  return {
    seedColor,
    strategy,
    light: createPalette(seedColor, "light", strategy, random),
    dark: createPalette(seedColor, "dark", strategy, random),
  };
};

export const generateRandomSeed = (): string => {
  const random = mulberry32(Math.floor(Date.now() % 1000000000));
  const hue = Math.floor(random() * 360);
  const sat = 56 + random() * 30;
  const lig = 44 + random() * 20;
  return hslToHex({ h: hue, s: sat, l: lig });
};

export const createRandomPalette = (): GeneratedPaletteSet => {
  const seed = generateRandomSeed();
  return generatePaletteFromSeed(seed);
};

export const sanitizeColorValue = (value: string): string => normalizeHex(value);
