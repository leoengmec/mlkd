import { Slider } from "@/components/ui/slider";

const getColor = (value) => {
  if (value <= 3) return "text-red-500";
  if (value <= 6) return "text-amber-500";
  if (value <= 8) return "text-secondary";
  return "text-green-500";
};

const getEmoji = (value) => {
  if (value <= 2) return "😢";
  if (value <= 4) return "😕";
  if (value <= 6) return "😐";
  if (value <= 8) return "😊";
  return "🤩";
};

export default function RatingSlider({ label, value, onChange, icon }) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold font-heading text-foreground flex items-center gap-2">
          {icon && <span className="text-lg">{icon}</span>}
          {label === "NPS Geral" ? "Nota Geral" : label}
        </span>
        <div className="flex items-center gap-1.5">
          <span className="text-lg">{getEmoji(value)}</span>
          <span className={`text-xl font-bold font-heading ${getColor(value)}`}>
            {value}
          </span>
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={(v) => onChange(v[0])}
        max={10}
        min={0}
        step={1}
        className="w-full"
      />
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>0</span>
        <span>5</span>
        <span>10</span>
      </div>
    </div>
  );
}