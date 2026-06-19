// components/ThemeSwitch.tsx (Corrected)

"use client"

import { useId, useEffect, useState } from "react"
import { MoonIcon, SunIcon } from "lucide-react"
import { useTheme } from "next-themes"
import { Switch } from "~/components/ui/switch"

export default function ThemeSwitch() {
  const id = useId()
  const { setTheme, theme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    // Render a placeholder to prevent layout shift
    return <div className="h-7 w-[58px] rounded-full bg-input/50" />
  }

  // Determine if the current theme is a 'dark' variant
  const isDark = theme === 'dark' || theme?.startsWith('dark-');

  const toDarkTheme = (baseTheme: string): string => {
    if (baseTheme === "light") return "dark";
    return `dark-${baseTheme}`;
  };

  const toLightTheme = (baseTheme: string): string => {
    if (baseTheme === "dark") return "light";
    return baseTheme;
  };

  const handleThemeChange = (checked: boolean) => {
    // 'checked' is true for Light mode (sun icon)
    // 'checked' is false for Dark mode (moon icon)

    const currentBaseTheme = theme?.replace('dark-', '') ?? 'light'

    if (checked) setTheme(toLightTheme(currentBaseTheme))
    else setTheme(toDarkTheme(currentBaseTheme))
  }

  return (
    <div>
      <div className="relative inline-grid h-7 grid-cols-[1fr_1fr] items-center text-sm font-medium">
        <Switch
          id={id}
          checked={!isDark}
          onCheckedChange={handleThemeChange}
          className="peer data-[state=unchecked]:bg-input/50 absolute inset-0 h-[inherit] w-auto [&_span]:z-10 [&_span]:h-full [&_span]:w-1/2 [&_span]:transition-transform [&_span]:duration-300 [&_span]:ease-[cubic-bezier(0.16,1,0.3,1)] [&_span]:data-[state=checked]:translate-x-full"
        />
        <span className="pointer-events-none relative ms-0.5 flex min-w-6 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:invisible peer-data-[state=unchecked]:translate-x-full">
          <MoonIcon size={16} aria-hidden="true" />
        </span>
        <span className="peer-data-[state=checked]:text-background pointer-events-none relative me-0.5 flex min-w-6 items-center justify-center text-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] peer-data-[state=checked]:-translate-x-full peer-data-[state=unchecked]:invisible">
          <SunIcon size={16} aria-hidden="true" />
        </span>
      </div>
    </div>
  )
}