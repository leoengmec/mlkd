import { Check } from "lucide-react";

export default function MultiSelect({ label, value = [], onChange, options, icon }) {
  const toggle = (opt) => {
    const val = opt.value || opt;
    if (value.includes(val)) {
      onChange(value.filter((v) => v !== val));
    } else {
      onChange([...value, val]);
    }
  };

  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold font-heading text-foreground flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <div className="flex flex-wrap gap-2">
        {options.map((opt) => {
          const val = opt.value || opt;
          const label = opt.label || opt;
          const isSelected = value.includes(val);
          return (
            <button
              key={val}
              onClick={() => toggle(opt)}
              className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-heading font-semibold transition-all ${
                isSelected
                  ? "bg-primary text-primary-foreground shadow-md"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              {isSelected && <Check className="w-4 h-4" />}
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}