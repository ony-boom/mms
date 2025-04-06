import { useState } from "react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "motion/react";
import { cn } from "@/lib/utils";
import { Skeleton } from "../ui/skeleton";

type ArtistBioProps = {
  description: string | undefined;
  loading: boolean;
};

export function ArtistBio({ description, loading }: ArtistBioProps) {
  const [openSummary, setOpenSummary] = useState(false);

  return (
    <div className="relative">
      <div className="relative">
        {loading ? (
          <div>
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/12" />
            <Skeleton className="h-4 w-6/12" />
          </div>
        ) : (
          description && (
            <motion.div
              layout
              initial={{ height: 0 }}
              animate={{
                height: openSummary ? "100%" : 64,
                transition: {
                  type: "tween",
                  duration: 0.3,
                },
              }}
              data-scroller={true}
              className={cn("max-h-48 overflow-hidden leading-8 select-none", {
                "overflow-y-auto": openSummary,
              })}
              dangerouslySetInnerHTML={{ __html: description }}
            />
          )
        )}

        <AnimatePresence>
          {!openSummary && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="from-background pointer-events-none absolute right-0 bottom-0 left-0 h-12 bg-gradient-to-t to-transparent"
            />
          )}
        </AnimatePresence>
      </div>

      {description && (
        <Button
          size="sm"
          variant="link"
          onClick={() => setOpenSummary((prev) => !prev)}
          className="ml-auto block p-0"
        >
          {openSummary ? "Read less" : "Read more"}
        </Button>
      )}
    </div>
  );
}
