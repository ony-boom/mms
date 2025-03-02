import { ReactNode } from "react";
import { cn } from "@/lib/utils.ts";

export function PageTitle({
  title,
  menu,
  sticky,
}: {
  title: ReactNode;
  menu?: ReactNode;
  sticky?: boolean;
}) {
  return (
    <nav
      className={cn(
        "bg-background z-30 flex items-center justify-between py-3",
        sticky && "sticky top-0",
      )}
    >
      <h1 className="text-primary text-lg font-bold">{title}</h1>

      {menu && menu}
    </nav>
  );
}
