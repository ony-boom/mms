import { useColorFlow } from "@/hooks/use-color-flow";
import { useTheme } from "@/hooks/use-theme";
import Color from "color";
import { ReactNode, useEffect, useMemo, useRef, useCallback } from "react";

const useCssVarSetter = () => {
  const styleElementRef = useRef<HTMLStyleElement | null>(null);

  if (typeof window !== "undefined" && !styleElementRef.current) {
    const styleElement = document.createElement("style");
    styleElement.setAttribute("id", "theme-variables");
    document.head.appendChild(styleElement);
    styleElementRef.current = styleElement;
  }

  return useCallback((vars: Record<string, string>) => {
    if (!styleElementRef.current) return;

    requestAnimationFrame(() => {
      let cssText = ":root {";
      Object.entries(vars).forEach(([key, value]) => {
        cssText += `${key}: ${value};`;
      });
      cssText += "}";

      styleElementRef.current!.textContent = cssText;
    });
  }, []);
};

const useSystemTheme = () => {
  const darkModeMediaQuery = useMemo(
    () =>
      typeof window !== "undefined"
        ? window.matchMedia("(prefers-color-scheme: dark)")
        : null,
    [],
  );

  return useMemo(
    () => (darkModeMediaQuery?.matches ? "dark" : "light"),
    [darkModeMediaQuery?.matches],
  );
};

type ColorMode = "light" | "dark";

export function WithColorFlow({ children }: { children: ReactNode }) {
  const mdc = useColorFlow();
  const { theme } = useTheme();
  const systemTheme = useSystemTheme();
  const setCssVars = useCssVarSetter();

  const mode: ColorMode = theme === "system" ? systemTheme : theme;

  const cssVars = useMemo(() => {
    if (!mdc || !mdc[mode]) return {};

    const colors = mdc[mode];
    const borderValue = Color(colors.onBackground).alpha(0.1).hsl().string();

    return {
      "--color-background": colors.background,
      "--color-foreground": colors.onBackground,
      "--color-primary": colors.primary,
      "--color-destructive": colors.error,
      "--color-popover": colors.background,
      "--color-popover-foreground": colors.onBackground,
      "--color-primary-foreground": colors.onPrimary,
      "--color-accent-foreground": colors.onBackground,
      "--color-secondary": colors.secondary,
      "--color-secondary-foreground": colors.onSecondary,
      "--color-accent": Color(colors.primary).alpha(0.1).hsl().string(),
      "--color-input": borderValue,
      "--color-border": borderValue,
    };
  }, [mdc, mode]);

  useEffect(() => {
    if (Object.keys(cssVars).length > 0) {
      setCssVars(cssVars as Record<string, string>);
    }
  }, [cssVars, setCssVars]);

  return <>{children}</>;
}
