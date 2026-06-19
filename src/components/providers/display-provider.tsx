"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  STORED_DATA_NAME,
  DEFAULT_A11Y,
  FONT_FAMILIES,
  FONT_SIZES,
  SPACING_SIZES,
  type A11ySettings,
  type ReduceMotionMode,
} from "./constants";

type Spacing = keyof typeof SPACING_SIZES;
type FontSize = keyof typeof FONT_SIZES;
type FontFamily = keyof typeof FONT_FAMILIES;

type ThemeSettings = {
  spacing: Spacing;
  fontSize: FontSize;
  fontFamily: FontFamily;
  a11y: A11ySettings;
};

type ThemeProviderState = {
  spacing: Spacing;
  setSpacing: (spacing: Spacing) => void;
  fontSize: FontSize;
  setFontSize: (fontSize: FontSize) => void;
  fontFamily: FontFamily;
  setFontFamily: (fontFamily: FontFamily) => void;
  highContrast: boolean;
  setHighContrast: (value: boolean) => void;
  reduceMotion: ReduceMotionMode;
  setReduceMotion: (value: ReduceMotionMode) => void;
  underlineLinks: boolean;
  setUnderlineLinks: (value: boolean) => void;
  alwaysShowFocusRing: boolean;
  setAlwaysShowFocusRing: (value: boolean) => void;
  reset: () => void;
};

const initialState: ThemeProviderState = {
  spacing: "normal",
  setSpacing: () => null,
  fontSize: "medium",
  setFontSize: () => null,
  fontFamily: "geist",
  setFontFamily: () => null,
  highContrast: DEFAULT_A11Y.highContrast,
  setHighContrast: () => null,
  reduceMotion: DEFAULT_A11Y.reduceMotion,
  setReduceMotion: () => null,
  underlineLinks: DEFAULT_A11Y.underlineLinks,
  setUnderlineLinks: () => null,
  alwaysShowFocusRing: DEFAULT_A11Y.alwaysShowFocusRing,
  setAlwaysShowFocusRing: () => null,
  reset: () => null,
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

function mergeA11y(partial: Partial<A11ySettings> | undefined): A11ySettings {
  if (!partial) return { ...DEFAULT_A11Y };
  return {
    highContrast: typeof partial.highContrast === "boolean" ? partial.highContrast : DEFAULT_A11Y.highContrast,
    reduceMotion: isReduceMotionMode(partial.reduceMotion) ? partial.reduceMotion : DEFAULT_A11Y.reduceMotion,
    underlineLinks: typeof partial.underlineLinks === "boolean" ? partial.underlineLinks : DEFAULT_A11Y.underlineLinks,
    alwaysShowFocusRing:
      typeof partial.alwaysShowFocusRing === "boolean" ? partial.alwaysShowFocusRing : DEFAULT_A11Y.alwaysShowFocusRing,
  };
}

function isReduceMotionMode(v: unknown): v is ReduceMotionMode {
  return v === "system" || v === "on" || v === "off";
}

function applyA11yHtmlClasses(
  root: HTMLElement,
  a11y: A11ySettings,
  systemPrefersReducedMotion: boolean,
): void {
  const shouldReduce = a11y.reduceMotion === "on" || (a11y.reduceMotion === "system" && systemPrefersReducedMotion);
  const forceFullMotion = a11y.reduceMotion === "off";

  root.classList.toggle("a11y-high-contrast", a11y.highContrast);
  root.classList.toggle("a11y-underline-links", a11y.underlineLinks);
  root.classList.toggle("a11y-strong-focus", a11y.alwaysShowFocusRing);
  root.classList.toggle("a11y-reduce-motion-active", shouldReduce);
  root.classList.toggle("a11y-prefers-full-motion", forceFullMotion);
}

export function DisplaySettingProvider({ children }: { children: React.ReactNode }) {
  const [spacing, setSpacing] = useState<Spacing>("normal");
  const [fontSize, setFontSize] = useState<FontSize>("medium");
  const [fontFamily, setFontFamily] = useState<FontFamily>("geist");
  const [a11y, setA11y] = useState<A11ySettings>({ ...DEFAULT_A11Y });
  const [systemPrefersReducedMotion, setSystemPrefersReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const mql = window.matchMedia("(prefers-reduced-motion: reduce)");
    setSystemPrefersReducedMotion(mql.matches);
    const onChange = () => setSystemPrefersReducedMotion(mql.matches);
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORED_DATA_NAME);
      if (!raw) return;
      const parsed = JSON.parse(raw) as Partial<ThemeSettings> & { a11y?: Partial<A11ySettings> };

      if (parsed.spacing && SPACING_SIZES[parsed.spacing]) setSpacing(parsed.spacing);
      if (parsed.fontSize && FONT_SIZES[parsed.fontSize]) setFontSize(parsed.fontSize);
      if (parsed.fontFamily && FONT_FAMILIES[parsed.fontFamily]) setFontFamily(parsed.fontFamily);
      setA11y(mergeA11y(parsed.a11y));
    } catch (error) {
      console.error("Failed to parse theme settings from localStorage", error);
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    applyA11yHtmlClasses(root, a11y, systemPrefersReducedMotion);
  }, [a11y, systemPrefersReducedMotion]);

  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty("--spacing", SPACING_SIZES[spacing].value);
    root.style.fontSize = `${FONT_SIZES[fontSize].value}px`;
    root.style.setProperty("--default-font", `var(${FONT_FAMILIES[fontFamily].value})`);

    const settings: ThemeSettings = { spacing, fontSize, fontFamily, a11y };
    localStorage.setItem(STORED_DATA_NAME, JSON.stringify(settings));
  }, [spacing, fontSize, fontFamily, a11y]);

  function reset() {
    setFontFamily("geist");
    setFontSize("medium");
    setSpacing("normal");
    setA11y({ ...DEFAULT_A11Y });
  }

  const value = useMemo(
    () => ({
      spacing,
      setSpacing,
      fontSize,
      setFontSize,
      fontFamily,
      setFontFamily,
      highContrast: a11y.highContrast,
      setHighContrast: (v: boolean) => setA11y((p) => ({ ...p, highContrast: v })),
      reduceMotion: a11y.reduceMotion,
      setReduceMotion: (v: ReduceMotionMode) => setA11y((p) => ({ ...p, reduceMotion: v })),
      underlineLinks: a11y.underlineLinks,
      setUnderlineLinks: (v: boolean) => setA11y((p) => ({ ...p, underlineLinks: v })),
      alwaysShowFocusRing: a11y.alwaysShowFocusRing,
      setAlwaysShowFocusRing: (v: boolean) => setA11y((p) => ({ ...p, alwaysShowFocusRing: v })),
      reset,
    }),
    [spacing, fontSize, fontFamily, a11y],
  );

  return <ThemeProviderContext.Provider value={value}>{children}</ThemeProviderContext.Provider>;
}

export const useDisplaySetting = () => {
  const context = useContext(ThemeProviderContext);
  if (context === undefined) {
    throw new Error("useDisplaySetting must be used within a DisplaySettingProvider");
  }
  return context;
};
