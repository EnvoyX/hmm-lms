// ~/components/admin/comparison-card.tsx
import { Card, CardContent } from "~/components/ui/card";
import { type LucideIcon } from "lucide-react";

interface ComparisonCardProps {
  title: string;
  primaryValue: number;
  primaryLabel: string;
  secondaryValue: number;
  secondaryLabel: string;
  icon: LucideIcon;
}

export function ComparisonCard({
  title,
  primaryValue,
  primaryLabel,
  secondaryValue,
  secondaryLabel,
  icon: Icon,
}: ComparisonCardProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div className="rounded-full p-3 bg-primary/10">
            <Icon className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <div className="flex items-baseline gap-3">
              <div>
                <span className="text-2xl font-bold">{primaryValue}</span>
                <span className="text-xs text-muted-foreground ml-1">{primaryLabel}</span>
              </div>
              <div className="text-muted-foreground">•</div>
              <div>
                <span className="text-xl font-semibold text-muted-foreground">{secondaryValue}</span>
                <span className="text-xs text-muted-foreground ml-1">{secondaryLabel}</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
