import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { ComponentProps } from "react";

export function SettingsDialog(props: SettingsDialogProps) {
  return (
    <Dialog {...props}>
      <DialogContent className="bg-background max-h-[400px]">
        <DialogHeader>
          <DialogTitle>Settings</DialogTitle>
        </DialogHeader>

        <Accordion type="single" collapsible>
          <AccordionItem value="appearance">
            <AccordionTrigger>
              <h3 className="font-bold">Appearance</h3>
            </AccordionTrigger>
            <AccordionContent>
              Appearance settings will go here.
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}

export type SettingsDialogProps = ComponentProps<typeof Dialog>;
