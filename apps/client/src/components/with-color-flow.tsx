import { useColorFlow, useTheme } from "@/hooks";
import { ReactNode, useEffect, useMemo, useRef, useCallback } from "react";
import { hexFromArgb, rgbaFromArgb } from "@material/material-color-utilities";

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

export function WithColorFlow({ children }: { children: ReactNode }) {
  const colorFlow = useColorFlow();
  const { theme } = useTheme();
  const systemTheme = useSystemTheme();
  const setCssVars = useCssVarSetter();

  const prevColorsRef = useRef<string | null>(null);

  const currentTheme: "dark" | "light" = useMemo(() => {
    return theme === "system" ? systemTheme : theme;
  }, [theme, systemTheme]);

  useEffect(() => {
    if (!colorFlow) return;

    const color = colorFlow.schemes[currentTheme];

    const colorKey = `${color.primary}-${color.background}-${color.onBackground}-${currentTheme}`;

    if (prevColorsRef.current === colorKey) return;
    prevColorsRef.current = colorKey;

    const accentRgba = rgbaFromArgb(color.primary);
    accentRgba.a = 0.1;
    const accentValue = `rgba(${accentRgba.r}, ${accentRgba.g}, ${accentRgba.b}, ${accentRgba.a})`;

    const borderRgba = rgbaFromArgb(color.onBackground);
    borderRgba.a = 0.1;
    const borderValue = `rgba(${borderRgba.r}, ${borderRgba.g}, ${borderRgba.b}, ${borderRgba.a})`;

    const cssVars = {
      "--color-background": hexFromArgb(color.background),
      "--color-foreground": hexFromArgb(color.onBackground),
      "--color-primary": hexFromArgb(color.primary),
      "--color-destructive": hexFromArgb(color.error),
      "--color-popover": hexFromArgb(color.background),
      "--color-accent-foreground": hexFromArgb(color.onBackground),
      "--color-popover-foreground": hexFromArgb(color.onBackground),
      "--color-secondary": hexFromArgb(color.secondaryContainer),
      "--color-primary-foreground": hexFromArgb(color.onPrimary),
      "--color-secondary-foreground": hexFromArgb(color.onSecondaryContainer),
      "--color-accent": accentValue,
      "--color-border": borderValue,
      "--color-input": borderValue,
    };

    setCssVars(cssVars);
  }, [colorFlow, currentTheme, setCssVars]);

  return <>{children}</>;
}
