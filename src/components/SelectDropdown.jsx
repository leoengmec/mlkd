import { useState } from "react";
import { Input } from "@/components/ui/input";

export default function SelectDropdown({ label, value, onChange, options, icon, className = "", onCustomInput }) {
  const [customText, setCustomText] = useState("");
  const isOtherSelected = value === "outro" || value?.startsWith("outro:");

  const handleChange = (e) => {
    const val = e.target.value;
    onChange(val);
    if (val !== "outro") {
      setCustomText("");
    }
  };

  const handleCustomChange = (text) => {
    setCustomText(text);
    onChange(text.trim() ? text : "");
  };

  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-sm font-semibold font-heading text-foreground flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <select
        value={isOtherSelected ? "outro" : value}
        onChange={handleChange}
        className="w-full px-4 py-2 rounded-xl border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Selecione uma opção</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
      {isOtherSelected && (
        <Input
          placeholder="Digite aqui..."
          value={customText}
          onChange={(e) => handleCustomChange(e.target.value)}
          className="rounded-xl"
          autoFocus
        />
      )}
    </div>
  );
}