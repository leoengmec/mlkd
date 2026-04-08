import { useHighContrast } from "../hooks/useHighContrast";
import { Sun, Moon } from "lucide-react";

export default function HighContrastToggle({ variant = "default" }) {
  const { enabled, toggle } = useHighContrast();

  if (variant === "sidebar") {
    return null;










  }

  // Floating button for public pages
  return (
    <div className="fixed bottom-20 right-4 z-50 group">
      <button
        onClick={toggle}
        title={enabled ? "Desativar alto contraste" : "Ativar alto contraste (WCAG AA)"}
        aria-label={enabled ? "Desativar alto contraste" : "Ativar alto contraste"}
        className="w-10 h-10 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
        {enabled ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
      <span className="absolute right-12 top-1/2 -translate-y-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
        Alto contraste
      </span>
    </div>
  );

}