import { cn } from "@/lib/utils";

export default function BooleanToggle({ label, value, onChange, icon }) {
  return (
    <div className="space-y-2">
      <span className="text-sm font-semibold font-heading text-foreground flex items-center gap-2">
        {icon && <span className="text-lg">{icon}</span>}
        {label}
      </span>
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => onChange(true)}
          className={cn(
            "flex-1 py-3 rounded-lg font-heading font-bold text-sm transition-all duration-200 border-2",
            value === true
              ? "bg-green-500 text-white border-green-500 shadow-lg shadow-green-500/25 scale-105"
              : "bg-card text-muted-foreground border-border hover:border-green-300"
          )}
        >
          ✅ Sim
        </button>
        <button
          type="button"
          onClick={() => onChange(false)}
          className={cn(
            "flex-1 py-3 rounded-lg font-heading font-bold text-sm transition-all duration-200 border-2",
            value === false
              ? "bg-red-400 text-white border-red-400 shadow-lg shadow-red-400/25 scale-105"
              : "bg-card text-muted-foreground border-border hover:border-red-300"
          )}
        >
          ❌ Não
        </button>
      </div>
    </div>
  );
}