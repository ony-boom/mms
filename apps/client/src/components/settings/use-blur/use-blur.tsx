import { useId } from "react";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useSettingsStore } from "@/stores/settings";

export function UseBlur() {
  const switchId = useId();
  const { useBlurForPlayerBackground, setUseBlurForPlayerBackground } =
    useSettingsStore();

  const handleCheckedChange = (checked: boolean) => {
    setUseBlurForPlayerBackground(checked);
  };

  return (
    <div className="flex items-center justify-between">
      <Label htmlFor={switchId}>Use Blur for Player Background</Label>
      <Switch
        onCheckedChange={handleCheckedChange}
        checked={useBlurForPlayerBackground}
        id={switchId}
      />
    </div>
  );
}
