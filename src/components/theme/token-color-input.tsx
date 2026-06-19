import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

type TokenColorInputProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
};

export function TokenColorInput({ label, value, onChange }: TokenColorInputProps) {
  return (
    <div className="space-y-2">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <div className="flex items-center gap-2">
        <Input
          type="color"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          className="h-9 w-14 cursor-pointer p-1"
          aria-label={`${label} picker`}
        />
        <Input value={value} onChange={(event) => onChange(event.target.value)} className="font-mono text-xs" />
      </div>
    </div>
  );
}
