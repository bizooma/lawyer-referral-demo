import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

export function MultiCheckList({
  options,
  value,
  onChange,
  columns = 2,
}: {
  options: readonly string[] | string[];
  value: string[];
  onChange: (next: string[]) => void;
  columns?: number;
}) {
  const toggle = (opt: string) =>
    onChange(value.includes(opt) ? value.filter((v) => v !== opt) : [...value, opt]);
  return (
    <div className={`grid gap-2`} style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}>
      {options.map((opt) => (
        <Label key={opt} className="flex items-center gap-2 font-normal cursor-pointer">
          <Checkbox checked={value.includes(opt)} onCheckedChange={() => toggle(opt)} />
          <span className="text-sm">{opt.replace(/_/g, " ")}</span>
        </Label>
      ))}
    </div>
  );
}
