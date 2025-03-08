import { useEffect } from "react";
import { motion, useAnimation } from "motion/react";
import { usePlayerStore } from "@/stores/player/store";

export function WaveBars() {
  const isPlaying = usePlayerStore((state) => state.isPlaying);
  const controls = useAnimation();

  useEffect(() => {
    if (isPlaying) {
      controls.start((i) => ({
        height: ["10%", "80%", "40%", "60%", "20%", "90%"],
        transition: {
          duration: 1.6,
          repeat: Infinity,
          repeatType: "mirror",
          ease: "easeInOut",
          delay: i * 0.2, // Add a delay to create an alternating effect
        },
      }));
    } else {
      controls.stop();
    }
  }, [isPlaying, controls]);

  return (
    <div className="flex h-6 items-end gap-1">
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className="bg-primary w-[2px]"
          animate={controls}
          custom={index} // Pass the index to customize the animation for each bar
        />
      ))}
    </div>
  );
}
