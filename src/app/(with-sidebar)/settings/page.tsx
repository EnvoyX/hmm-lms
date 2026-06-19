"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Button } from "~/components/ui/button"
import { Label } from "~/components/ui/label"
import { useTheme } from "next-themes"
import { Type, Palette, Layout, Dice5, Contrast } from "lucide-react"
import { useDisplaySetting } from '~/components/providers/display-provider'
import { FONT_FAMILIES, FONT_SIZES, SPACING_SIZES, REDUCE_MOTION_OPTIONS, type ReduceMotionMode } from '~/components/providers/constants'
import { Switch } from "~/components/ui/switch"
import { Separator } from '~/components/ui/separator'
import { cn } from '~/lib/utils'
import NotificationSettings from './notifications'
import { Input } from "~/components/ui/input"
import { useCustomTheme } from "~/components/providers/custom-theme-provider"
import { CustomThemePreview } from "~/components/theme/custom-theme-preview"
import { TokenColorInput } from "~/components/theme/token-color-input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "~/components/ui/tabs"

export default function SettingsPage() {
  const { theme, setTheme } = useTheme()
  const {
    spacing,
    fontFamily,
    fontSize,
    setFontFamily,
    setFontSize,
    setSpacing,
    reset,
    highContrast,
    setHighContrast,
    reduceMotion,
    setReduceMotion,
    underlineLinks,
    setUnderlineLinks,
    alwaysShowFocusRing,
    setAlwaysShowFocusRing,
  } = useDisplaySetting();
  const { seedColor, light, dark, generateFromSeed, rollRandomPalette, updateTokenOverride, resetCustomTheme } =
    useCustomTheme();
  const [seedInput, setSeedInput] = useState(seedColor);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const isDark = theme?.startsWith('dark');
  const themes = {
    default: {
      label: "Default",
      light: 'light',
      dark: 'dark'
    },
    teal: {
      label: "Teal",
      light: 'teal',
      dark: 'dark-teal'
    },
    rose: {
      label: "Rose",
      light: 'rose',
      dark: 'dark-rose'
    },
    zinc: {
      label: "Zinc",
      light: 'zinc',
      dark: 'dark-zinc'
    },
    vividPop: {
      label: "Vivid Pop",
      light: "vivid-pop",
      dark: "dark-vivid-pop",
    },
    auroraMix: {
      label: "Aurora Mix",
      light: "aurora-mix",
      dark: "dark-aurora-mix",
    },
    custom: {
      label: "Custom",
      light: "custom",
      dark: "dark-custom",
    },
  }

  const activeThemeFamily =
    Object.entries(themes).find(([, value]) => theme === value.light || theme === value.dark)?.[0] ?? "default";

  useEffect(() => {
    setSeedInput(seedColor);
  }, [seedColor]);

  const advancedTokens = [
    { label: "Background", token: "background" },
    { label: "Foreground", token: "foreground" },
    { label: "Primary", token: "primary" },
    { label: "Primary Foreground", token: "primary-foreground" },
    { label: "Accent", token: "accent" },
    { label: "Accent Foreground", token: "accent-foreground" },
    { label: "Sidebar", token: "sidebar" },
    { label: "Sidebar Foreground", token: "sidebar-foreground" },
    { label: "Ring", token: "ring" },
    { label: "Success", token: "success" },
  ] as const;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Header */}
      <div className="">
        <p className="text-muted-foreground mt-2">Customize your experience with personalized preferences</p>
      </div>

      <NotificationSettings />

      <div className="grid gap-6 lg:grid-cols-3 lg:items-start">

        {/* Theme Settings */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Palette className="h-5 w-5" />
              Theme
            </CardTitle>
            <CardDescription>Choose your preferred color scheme</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select
              value={activeThemeFamily}
              onValueChange={(themeFamily) => {
                const selectedTheme = themes[themeFamily as keyof typeof themes];
                setTheme(isDark ? selectedTheme.dark : selectedTheme.light);
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a theme" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(themes).map(([key, value]) => (
                  <SelectItem key={value.label} value={key} className={cn('text-primary hover:text-primary-foreground', isDark ? value.dark : value.light)}>
                    <span>{value.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {activeThemeFamily !== "custom" ? (
              <div className="w-full grid grid-cols-5 gap-1 rounded-md p-0.5 ring-1 ring-border/60">
                <div className="h-10 w-full rounded-md bg-background" />
                <div className="h-10 w-full rounded-md bg-foreground" />
                <div className="h-10 w-full rounded-md bg-primary" />
                <div className="h-10 w-full rounded-md bg-accent" />
                <div className="h-10 w-full rounded-md bg-secondary" />
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-seed">Base color</Label>
                  <p className="text-xs text-muted-foreground">Adjust the color or randomize. Updates apply to your custom theme as you go.</p>
                  <div className="flex gap-2">
                    <Input
                      id="custom-seed"
                      type="color"
                      value={seedInput}
                      onChange={(event) => {
                        const v = event.target.value
                        setSeedInput(v)
                        generateFromSeed(v)
                        setTheme(isDark ? "dark-custom" : "custom")
                      }}
                      className="h-9 w-14 shrink-0 cursor-pointer p-1"
                    />
                    <Input
                      value={seedInput}
                      onChange={(event) => setSeedInput(event.target.value)}
                      onBlur={() => {
                        if (/^#[0-9A-Fa-f]{6}$/.test(seedInput.trim())) {
                          generateFromSeed(seedInput.trim())
                          setTheme(isDark ? "dark-custom" : "custom")
                        } else {
                          setSeedInput(seedColor)
                        }
                      }}
                      className="min-w-0 font-mono"
                      placeholder="#6366f1"
                    />
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full sm:w-auto"
                  onClick={() => {
                    rollRandomPalette()
                    setTheme(isDark ? "dark-custom" : "custom")
                  }}
                >
                  <Dice5 className="h-4 w-4" />
                  Random palette
                </Button>

                <CustomThemePreview palette={isDark ? dark : light} />

                <div className="space-y-3 rounded-md border p-3">
                  <Button variant="outline" className="w-full" onClick={() => setShowAdvanced((prev) => !prev)}>
                    {showAdvanced ? "Hide advanced colors" : "Advanced colors"}
                  </Button>

                {showAdvanced ? (
                  <Tabs defaultValue="light">
                    <TabsList>
                      <TabsTrigger value="light">Light</TabsTrigger>
                      <TabsTrigger value="dark">Dark</TabsTrigger>
                    </TabsList>
                    <TabsContent value="light" className="grid gap-3 pt-2">
                      {advancedTokens.map((item) => (
                        <TokenColorInput
                          key={`light-${item.token}`}
                          label={item.label}
                          value={light[item.token]}
                          onChange={(value) => updateTokenOverride("light", item.token, value)}
                        />
                      ))}
                    </TabsContent>
                    <TabsContent value="dark" className="grid gap-3 pt-2">
                      {advancedTokens.map((item) => (
                        <TokenColorInput
                          key={`dark-${item.token}`}
                          label={item.label}
                          value={dark[item.token]}
                          onChange={(value) => updateTokenOverride("dark", item.token, value)}
                        />
                      ))}
                    </TabsContent>
                  </Tabs>
                ) : null}

                <Button
                  variant="destructive"
                  onClick={() => {
                    resetCustomTheme();
                    setSeedInput("#6366f1");
                  }}
                >
                  Reset custom palette
                </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Typography Settings */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Type className="h-5 w-5" />
              Typography
            </CardTitle>
            <CardDescription>Adjust font settings for better readability</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Font Size */}
              <div className="space-y-3">
                <Label htmlFor="font-size">Font Size</Label>
                <Select value={fontSize} onValueChange={(nFS) => setFontSize(nFS as typeof fontSize)}>
                  <SelectTrigger id="font-size">
                    <SelectValue placeholder="Select font size" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FONT_SIZES).map(([name, { value, label }]) => (
                      <SelectItem key={value + '-font-size'} value={name}>
                        {label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Font Family */}
              <div className="space-y-3">
                <Label htmlFor="font-family">Font Family</Label>
                <Select value={fontFamily} onValueChange={(nFF) => setFontFamily(nFF as typeof fontFamily)}>
                  <SelectTrigger id="font-family">
                    <SelectValue placeholder="Select font family" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(FONT_FAMILIES).map(([name, font]) => (
                      <SelectItem key={font.value + '-font-family'} value={name}>
                        <span className={font.class}>{font.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Preview Text */}
            <div className="space-y-3">
              <Label>Preview</Label>
              <div className="rounded-lg border p-4 bg-muted/50">
                <p className="text-sm text-muted-foreground mb-2">Sample text:</p>
                <p style={{ fontSize: `${fontSize}px` }}>
                  The quick brown fox jumps over the lazy dog. This is how your text will appear with the current
                  settings.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Layout Spacing Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Layout className="h-5 w-5" />
            Layout Spacing
          </CardTitle>
          <CardDescription>Adjust the overall spacing and density of the interface</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-3">
              <Label htmlFor="spacing">Spacing Density</Label>
              <Select value={spacing} onValueChange={(nSS) => setSpacing(nSS as typeof spacing)}>
                <SelectTrigger id="spacing">
                  <SelectValue placeholder="Select spacing" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(SPACING_SIZES).map(([name, option]) => (
                    <SelectItem key={option.value + '-spacing'} value={name}>
                      <div>
                        <div className="font-medium">{option.label}</div>
                        <div className="text-xs text-muted-foreground">{option.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="sm:col-span-2 lg:col-span-2">
              <Label>Current Spacing</Label>
              <div className="rounded-lg border p-4 bg-muted/50 mt-3">
                <div className="space-y-2">
                  <div className="h-4 bg-primary/20 rounded"></div>
                  <div className="h-4 bg-primary/20 rounded w-3/4"></div>
                  <div className="h-4 bg-primary/20 rounded w-1/2"></div>
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  This preview shows how elements will be spaced with the &quot;
                  {SPACING_SIZES[spacing].label}&quot; setting.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Accessibility + Language */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card className="md:col-span-2 lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Contrast className="h-5 w-5" />
              Accessibility
            </CardTitle>
            <CardDescription>Display and motion preferences (saved in this browser only)</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="a11y-high-contrast" className="text-base">
                  High contrast
                </Label>
                <p className="text-xs text-muted-foreground">Stronger borders and focus colors</p>
              </div>
              <Switch
                id="a11y-high-contrast"
                checked={highContrast}
                onCheckedChange={setHighContrast}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="a11y-reduce-motion">Motion</Label>
              <Select value={reduceMotion} onValueChange={(v) => setReduceMotion(v as ReduceMotionMode)}>
                <SelectTrigger id="a11y-reduce-motion">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.values(REDUCE_MOTION_OPTIONS).map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="a11y-underline-links" className="text-base">
                  Underline links
                </Label>
                <p className="text-xs text-muted-foreground">Make link text easier to spot</p>
              </div>
              <Switch
                id="a11y-underline-links"
                checked={underlineLinks}
                onCheckedChange={setUnderlineLinks}
              />
            </div>

            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label htmlFor="a11y-focus-ring" className="text-base">
                  Stronger focus indicator
                </Label>
                <p className="text-xs text-muted-foreground">Thicker outline when using keyboard</p>
              </div>
              <Switch
                id="a11y-focus-ring"
                checked={alwaysShowFocusRing}
                onCheckedChange={setAlwaysShowFocusRing}
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Language</CardTitle>
            <CardDescription>Coming soon - Interface language preferences</CardDescription>
          </CardHeader>
        </Card>
      </div>

      <Separator />

      <div className="flex justify-end">
        <Button className='cursor-pointer' onClick={() => {
          reset();
          setTheme(isDark ? 'dark' : 'light')
        }}>
          Reset
        </Button>
      </div>
    </div>
  )
}
