import { Dialog, DialogContent, DialogTitle } from "./ui/dialog";
import { ComponentProps } from "react";

export function SettingsDialog(props: SettingsDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="bg-background">
        <DialogTitle>Settings</DialogTitle>
      </DialogContent>
    </Dialog>
  );
}

export type SettingsDialogProps = ComponentProps<typeof Dialog>;
