import { useState, useEffect } from "react";

export function useHighContrast() {
  const [enabled, setEnabled] = useState(() => {
    return localStorage.getItem("high-contrast") === "true";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (enabled) {
      root.classList.add("high-contrast");
    } else {
      root.classList.remove("high-contrast");
    }
    localStorage.setItem("high-contrast", enabled);
  }, [enabled]);

  // Apply on mount from saved preference
  useEffect(() => {
    if (localStorage.getItem("high-contrast") === "true") {
      document.documentElement.classList.add("high-contrast");
    }
  }, []);

  return { enabled, toggle: () => setEnabled(v => !v) };
}