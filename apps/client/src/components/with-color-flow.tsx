import { ReactNode, useEffect, useMemo } from "react";
import { useColorFlow, useTheme } from "@/hooks";
import { hexFromArgb, rgbaFromArgb } from "@material/material-color-utilities";

function setCssVar(vars: string, value: string): void;
function setCssVar(vars: Record<string, string>): void;
function setCssVar(
  vars: string | Record<string, string>,
  value?: string,
): void {
  if (typeof vars === "string") {
    document.documentElement.style.setProperty(vars, value!);
  } else {
    Object.entries(vars).forEach(([key, value]) => {
      document.documentElement.style.setProperty(key, value);
    });
  }
}

export function WithColorFlow({ children }: { children: ReactNode }) {
  const colorFlow = useColorFlow();
  const { theme } = useTheme();

  const currentTheme: "dark" | "light" = useMemo(() => {
    if (theme === "system") {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return theme;
  }, [theme]);

  useEffect(() => {
    if (!colorFlow) return;
    const color = colorFlow.schemes[currentTheme];
    const acccentRgba = rgbaFromArgb(color.primary);
    const borderRgba = rgbaFromArgb(color.onBackground);

    acccentRgba.a = 0.1;
    borderRgba.a = 0.1;

    const borderLikeValue = `rgba(${borderRgba.r}, ${borderRgba.g}, ${borderRgba.b}, ${borderRgba.a})`;
    setCssVar({
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
      "--color-accent": `rgba(${acccentRgba.r}, ${acccentRgba.g}, ${acccentRgba.b}, ${acccentRgba.a})`,
      "--color-border": borderLikeValue,
      "--color-input": borderLikeValue,
    });
  }, [colorFlow, currentTheme]);

  return <>{children}</>;
}
