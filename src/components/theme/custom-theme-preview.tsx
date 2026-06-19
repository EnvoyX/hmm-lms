import type { ThemePalette } from "~/lib/theme-color/palette";

export function CustomThemePreview({ palette }: { palette: ThemePalette }) {
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-5 gap-2">
        <div className="h-10 rounded-md border" style={{ backgroundColor: palette.background }} />
        <div className="h-10 rounded-md border" style={{ backgroundColor: palette.foreground }} />
        <div className="h-10 rounded-md border" style={{ backgroundColor: palette.primary }} />
        <div className="h-10 rounded-md border" style={{ backgroundColor: palette.accent }} />
        <div className="h-10 rounded-md border" style={{ backgroundColor: palette.secondary }} />
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div className="rounded border p-2 text-xs" style={{ backgroundColor: palette.card, color: palette["card-foreground"] }}>
          Card
        </div>
        <div className="rounded border p-2 text-xs" style={{ backgroundColor: palette.muted, color: palette["muted-foreground"] }}>
          Muted
        </div>
        <div className="rounded border p-2 text-xs" style={{ backgroundColor: palette.sidebar, color: palette["sidebar-foreground"] }}>
          Sidebar
        </div>
        <div className="rounded border p-2 text-xs" style={{ backgroundColor: palette["chart-1"], color: palette["primary-foreground"] }}>
          Chart
        </div>
      </div>
    </div>
  );
}
