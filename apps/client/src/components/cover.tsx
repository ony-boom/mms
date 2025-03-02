import { useState, ImgHTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface CoverProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
}

export function Cover({
  src,
  alt,
  className = "",
  ...imgProps
}: CoverProps) {
  const [isLoaded, setIsLoaded] = useState(false);

  const handleImageLoad = () => {
    setIsLoaded(true);
  };

  return (
    <>
      <img
        {...imgProps}
        loading="lazy"
        src={src}
        alt={alt}
        onLoad={handleImageLoad}
        className={cn(
          "object-cover aspect-square",
          isLoaded ? "animate-fade-in opacity-100" : "opacity-0",
          className,
        )}
      />
    </>
  );
}
