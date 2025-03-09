import { ImageOff } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ArtistImage({ src, alt, isLoading }: ArtistImageProps) {
  return (
    <div className="grid h-64 place-items-center overflow-hidden rounded-md">
      {isLoading ? (
        <Skeleton className="h-full w-full" />
      ) : src ? (
        <img src={src} alt={alt} className="w-full object-center" />
      ) : (
        <p>
          <ImageOff className="text-foreground/60" />
        </p>
      )}
    </div>
  );
}
type ArtistImageProps = {
  src: string | undefined;
  alt: string;
  isLoading: boolean;
};

