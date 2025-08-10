import { Button } from "../ui/button";
import { Settings } from "lucide-react";
import { ComponentProps, useState } from "react";
import { SettingsDialog } from "./settings-dilog";

export function SettingsButton(props: SettingsButtonProps) {
  const [open, setOpen] = useState(false);

  const handleOpenChange = (open: boolean) => {
    setOpen(open);
  };

  const handleSettingsButtonClick = () => {
    handleOpenChange(true);
  };

  return (
    <>
      <SettingsDialog modal onOpenChange={handleOpenChange} open={open} />
      <Button
        size="icon"
        onClick={handleSettingsButtonClick}
        variant="ghost"
        {...props}
      >
        <Settings />
      </Button>
    </>
  );
}

export type SettingsButtonProps = ComponentProps<typeof Button>;
