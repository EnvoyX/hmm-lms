"use client";

import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  createRandomPalette,
  generatePaletteFromSeed,
  sanitizeColorValue,
  type ThemePalette,
  type ThemeToken,
} from "~/lib/theme-color/palette";

const STORAGE_KEY = "hmm-lms-custom-theme";

type CustomThemeStore = {
  seedColor: string;
  strategy: string;
  light: ThemePalette;
  dark: ThemePalette;
};

type CustomThemeState = CustomThemeStore & {
  setSeedColor: (seedColor: string) => void;
  generateFromSeed: (seedColor: string) => void;
  rollRandomPalette: () => void;
  updateTokenOverride: (mode: "light" | "dark", token: ThemeToken, value: string) => void;
  resetCustomTheme: () => void;
};

const defaultPalette = generatePaletteFromSeed("#6366f1");

const initialState: CustomThemeState = {
  ...defaultPalette,
  setSeedColor: () => undefined,
  generateFromSeed: () => undefined,
  rollRandomPalette: () => undefined,
  updateTokenOverride: () => undefined,
  resetCustomTheme: () => undefined,
};

const CustomThemeContext = createContext<CustomThemeState>(initialState);

const applyPaletteVariables = (palette: ThemePalette, mode: "light" | "dark"): void => {
  const root = document.documentElement;
  Object.entries(palette).forEach(([token, value]) => {
    root.style.setProperty(`--custom-${mode}-${token}`, value);
  });
};

export function CustomThemeProvider({ children }: { children: React.ReactNode }) {
  const [paletteSet, setPaletteSet] = useState<CustomThemeStore>(defaultPalette);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;

      const parsed = JSON.parse(raw) as Partial<CustomThemeStore>;
      if (!parsed.seedColor || !parsed.light || !parsed.dark) return;

      setPaletteSet({
        seedColor: sanitizeColorValue(parsed.seedColor),
        strategy: parsed.strategy ?? defaultPalette.strategy,
        light: parsed.light,
        dark: parsed.dark,
      });
    } catch (error) {
      console.error("Unable to load custom palette from localStorage", error);
    }
  }, []);

  useEffect(() => {
    applyPaletteVariables(paletteSet.light, "light");
    applyPaletteVariables(paletteSet.dark, "dark");
    localStorage.setItem(STORAGE_KEY, JSON.stringify(paletteSet));
  }, [paletteSet]);

  const value = useMemo<CustomThemeState>(
    () => ({
      ...paletteSet,
      setSeedColor: (seedColor: string) => {
        setPaletteSet((prev) => ({ ...prev, seedColor: sanitizeColorValue(seedColor) }));
      },
      generateFromSeed: (seedColor: string) => {
        setPaletteSet(generatePaletteFromSeed(seedColor));
      },
      rollRandomPalette: () => {
        setPaletteSet(createRandomPalette());
      },
      updateTokenOverride: (mode: "light" | "dark", token: ThemeToken, value: string) => {
        const nextColor = sanitizeColorValue(value);
        setPaletteSet((prev) => ({
          ...prev,
          [mode]: {
            ...prev[mode],
            [token]: nextColor,
          },
        }));
      },
      resetCustomTheme: () => {
        setPaletteSet(defaultPalette);
      },
    }),
    [paletteSet],
  );

  return <CustomThemeContext.Provider value={value}>{children}</CustomThemeContext.Provider>;
}

export const useCustomTheme = (): CustomThemeState => {
  const context = useContext(CustomThemeContext);
  if (!context) {
    throw new Error("useCustomTheme must be used within CustomThemeProvider");
  }

  return context;
};
