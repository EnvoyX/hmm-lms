"use client"

import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

export const THEMES = [
  'light', 'dark',
  'teal', 'dark-teal',
  'rose', 'dark-rose',
  'zinc', 'dark-zinc',
  'vivid-pop', 'dark-vivid-pop',
  'aurora-mix', 'dark-aurora-mix',
  'custom', 'dark-custom',
]

export function ThemeProvider({ children, ...props }: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider themes={THEMES} {...props}>{children}</NextThemesProvider>
}
