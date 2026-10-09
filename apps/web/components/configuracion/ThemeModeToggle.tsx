"use client";

import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { KAN_THEME_MODE_STORAGE_KEY } from "@/lib/kan/theme";

// Mismo pub-sub casero que ThemeAccentPicker.tsx — el script inline de
// app/layout.tsx y este módulo son los únicos dos lugares que tocan la clase
// "dark" de <html> por este motivo.
let listeners: Array<() => void> = [];

function subscribe(listener: () => void): () => void {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

function getServerSnapshot(): "dark" | "light" {
  return "dark";
}

function getClientSnapshot(): "dark" | "light" {
  return window.localStorage.getItem(KAN_THEME_MODE_STORAGE_KEY) === "light" ? "light" : "dark";
}

/**
 * Toggle de modo claro/oscuro (/configuracion → Apariencia) — oscuro es el
 * default; "light" es la única preferencia que se persiste explícitamente
 * (ver KAN_THEME_MODE_INLINE_SCRIPT, que ya la aplicó antes de pintar).
 */
export function ThemeModeToggle() {
  const mode = useSyncExternalStore(subscribe, getClientSnapshot, getServerSnapshot);

  function select(next: "dark" | "light") {
    document.documentElement.classList.toggle("dark", next === "dark");
    if (next === "dark") {
      window.localStorage.removeItem(KAN_THEME_MODE_STORAGE_KEY);
    } else {
      window.localStorage.setItem(KAN_THEME_MODE_STORAGE_KEY, "light");
    }
    listeners.forEach((listener) => listener());
  }

  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Modo de apariencia">
      {(
        [
          { id: "dark" as const, label: "Oscuro", Icon: Moon },
          { id: "light" as const, label: "Claro", Icon: Sun },
        ]
      ).map(({ id, label, Icon }) => {
        const isActive = mode === id;
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={() => select(id)}
            className={`flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-fast active:scale-95 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
              isActive
                ? "border-accent bg-gradient-accent-soft text-ink"
                : "border-line text-ink-muted hover:border-line-strong"
            }`}
          >
            <Icon className="h-4 w-4" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  );
}
