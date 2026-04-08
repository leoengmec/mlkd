import { useHighContrast } from "../hooks/useHighContrast";
import { Sun, Moon } from "lucide-react";

export default function HighContrastToggle({ variant = "default" }) {
  const { enabled, toggle } = useHighContrast();

  if (variant === "sidebar") {
    return null;










  }

  // Floating button for public pages
  return (
    <button
      onClick={toggle}
      title={enabled ? "Desativar alto contraste" : "Ativar alto contraste (WCAG AA)"}
      aria-label={enabled ? "Desativar alto contraste" : "Ativar alto contraste"}
      className="fixed bottom-20 right-4 z-50 w-10 h-10 rounded-full bg-gray-800 text-white shadow-lg flex items-center justify-center hover:scale-110 transition-transform">
      
      {enabled ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </button>);

}