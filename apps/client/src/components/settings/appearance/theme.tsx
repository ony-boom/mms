import { useTheme } from "@/hooks/use-theme";
import { Computer, Moon, Sun } from "lucide-react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

export function ThemeSettings() {
  const { setTheme, theme } = useTheme();

  const handleThemeChange = (value: typeof theme | "") => {
    if (!value) return;
    setTheme(value);
  };

  return (
    <div className="flex items-center justify-between gap-2">
      <span>Theme</span>

      <ToggleGroup
        type="single"
        variant="outline"
        size="sm"
        onValueChange={handleThemeChange}
        value={theme}
      >
        <ToggleGroupItem value="system" aria-label="System theme">
          <Computer />
        </ToggleGroupItem>

        <ToggleGroupItem value="light" aria-label="Light theme">
          <Sun />
        </ToggleGroupItem>

        <ToggleGroupItem value="dark" aria-label="Dark theme">
          <Moon />
        </ToggleGroupItem>
      </ToggleGroup>
    </div>
  );
}
