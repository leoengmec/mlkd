export default function SelectDropdown({ label, value, onChange, options, icon, className = "" }) {
  return (
    <div className={`space-y-1.5 ${className}`}>
      <label className="text-sm font-semibold font-heading text-foreground flex items-center gap-2">
        {icon && <span>{icon}</span>}
        {label}
      </label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-2 rounded-xl border border-input bg-background font-body text-sm focus:outline-none focus:ring-2 focus:ring-primary"
      >
        <option value="">Selecione uma opção</option>
        {options.map((opt) => (
          <option key={opt.value || opt} value={opt.value || opt}>
            {opt.label || opt}
          </option>
        ))}
      </select>
    </div>
  );
}