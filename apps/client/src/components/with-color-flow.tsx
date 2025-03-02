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
    acccentRgba.a = 0.1;

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
      "--color-border": hexFromArgb(color.secondary),
    });
  }, [colorFlow, currentTheme]);

  return <>{children}</>;
}
