import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";
import { ComponentProps } from "react";
import { ThemeSettings } from "./appearance/theme";
import { DbReloadButton } from "./general/db-reload-button";

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
              <ThemeSettings />
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="general">
            <AccordionTrigger>
              <h3 className="font-bold">General</h3>
            </AccordionTrigger>
            <AccordionContent>
              <DbReloadButton />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </DialogContent>
    </Dialog>
  );
}

export type SettingsDialogProps = ComponentProps<typeof Dialog>;
