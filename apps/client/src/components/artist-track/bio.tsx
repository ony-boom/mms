import { useState } from "react";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "motion/react";

type ArtistBioProps = {
  description: string | undefined;
};

export function ArtistBio({ description }: ArtistBioProps) {
  const [openSummary, setOpenSummary] = useState(false);

  if (!description) {
    return <div>No bio available</div>;
  }

  return (
    <div className="relative">
      <div className="relative">
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
          className="max-h-96 overflow-hidden leading-6"
          dangerouslySetInnerHTML={{ __html: description }}
        />

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

      <Button
        size="sm"
        variant="link"
        onClick={() => setOpenSummary((prev) => !prev)}
        className="ml-auto block p-0"
      >
        {openSummary ? "Close" : "Read more"}
      </Button>
    </div>
  );
}
