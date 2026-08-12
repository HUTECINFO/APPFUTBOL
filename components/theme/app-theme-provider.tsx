"use client";

import { useEffect } from "react";
import { brandCssVariables } from "@/lib/theme";

export interface AppThemeConfig {
  colorPrimario?: string;
  colorSecundario?: string;
  compact?: boolean;
}

const STORAGE_KEY = "appfutbol-app-theme";

function readTheme(): AppThemeConfig | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function applyAppTheme(config: AppThemeConfig | null) {
  if (typeof document === "undefined") return;
  const root = document.documentElement;
  if (config?.colorPrimario || config?.colorSecundario) {
    const vars = brandCssVariables({
      colorPrimario: config?.colorPrimario,
      colorSecundario: config?.colorSecundario,
    });
    Object.entries(vars).forEach(([key, value]) => {
      if (typeof value === "string") root.style.setProperty(key, value);
    });
  }
  if (config?.compact) {
    root.classList.add("compact-mode");
  } else {
    root.classList.remove("compact-mode");
  }
}

export function AppThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const theme = readTheme();
    if (theme) applyAppTheme(theme);
  }, []);

  return <>{children}</>;
}

export function saveAppTheme(config: AppThemeConfig) {
  if (typeof window !== "undefined") {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  }
  applyAppTheme(config);
}
