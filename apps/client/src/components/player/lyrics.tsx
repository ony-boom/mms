import { Lrc, Lyric } from "lrc-kit";
import { cn } from "@/lib/utils";
import { motion } from "motion/react";
import { LyricsResponse } from "@/api";
import { usePlayerStore } from "@/stores";
import { useMemo, useRef, useEffect, memo, ReactNode } from "react";
import { useApiClient, useAudioRef } from "@/hooks";
import { Button } from "../ui/button";
import { Minimize2 as Minimize } from "lucide-react";
import { useShallow } from "zustand/react/shallow";

interface SyncedLyricsProps {
  lrc: Lyric[];
}

const SyncedLyrics = ({ lrc }: SyncedLyricsProps) => {
  const audioRef = useAudioRef();
  const { position, isPlaying } = usePlayerStore(
    useShallow((state) => ({
      position: state.position,
      isPlaying: state.isPlaying,
    })),
  );

  const activeLyricRef = useRef<HTMLParagraphElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    observerRef.current = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (!entry.isIntersecting && activeLyricRef.current && isPlaying) {
          activeLyricRef.current.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      },
      { threshold: 0.9 },
    );

    if (activeLyricRef.current) {
      observerRef.current.observe(activeLyricRef.current);
    }

    return () => observerRef.current?.disconnect();
  }, [position, isPlaying]);

  const handleLyricsClick = (time: number) => {
    if (audioRef.current) audioRef.current.currentTime = time;
  };

  return lrc.map((lyric, index) => {
    const nextTimestamp = lrc[index + 1]?.timestamp ?? Infinity;
    const isActive = position >= lyric.timestamp && position < nextTimestamp;

    return (
      <p
        title={isActive ? "" : "Click to seek to this position"}
        ref={isActive ? activeLyricRef : null}
        className={cn(
          "text-foreground/50 w-max max-w-6xl cursor-pointer leading-10 transition-all",
          { "text-foreground text-4xl": isActive },
        )}
        key={lyric.timestamp}
        onClick={() => !isActive && handleLyricsClick(lyric.timestamp)}
      >
        {lyric.content}
      </p>
    );
  });
};

interface LyricsHeaderProps {
  onClose: () => void;
}

const LyricsHeader = ({ onClose }: LyricsHeaderProps) => (
  <div className="sticky top-2 flex justify-end px-12 py-2">
    <Button onClick={onClose} variant="ghost" size="icon">
      <Minimize className="h-6 w-6" />
    </Button>
  </div>
);

interface LyricsContainerProps {
  children: ReactNode;
  className?: string;
}

const LyricsContainer = ({
  children,
  className = "",
}: LyricsContainerProps) => (
  <div className={cn("p-12 pt-0", className)}>{children}</div>
);

export interface LyricsProps {
  onClose: () => void;
}

export const Lyrics = memo(({ onClose }: LyricsProps) => {
  const currentTrackId = usePlayerStore((state) => state.currentTrackId);
  const { useTrackLyrics, useTracks } = useApiClient();
  const { data, isLoading } = useTrackLyrics(currentTrackId!);
  const { data: trackData } = useTracks({ id: currentTrackId });

  const lyrics: LyricsResponse = useMemo(
    () => data || { isSync: false, text: "" },
    [data],
  );

  const lrc = useMemo(() => {
    if (!lyrics.text) return null;
    if (lyrics.isSync) return Lrc.parse(lyrics.text);

    const tryParse = Lrc.parse(lyrics.text);
    return tryParse.lyrics.length ? tryParse : lyrics.text;
  }, [lyrics]);

  const handleGoogleSearch = () => {
    const track = trackData?.at(0);
    if (!track) return;

    const url = new URL("https://www.google.com/search");
    const artist = track.artists.map((artist) => artist.name).join(", ");
    url.searchParams.append("q", `${artist} ${track.title} lyrics`);
    window.open(url.toString(), "_blank");
  };

  const renderContent = () => {
    if (isLoading) {
      return (
        <LyricsContainer className="flex h-full w-full place-items-center text-xl font-black">
          <p className="w-full text-center">
            Fetching lyrics for you, just a moment...
          </p>
        </LyricsContainer>
      );
    }

    if (!lyrics.text) {
      return (
        <LyricsContainer className="flex h-full w-full place-items-center text-xl font-black">
          <p className="w-full text-center">
            Looks like we don't have the lyrics for this one
            <br />
            <Button onClick={handleGoogleSearch} variant="link">
              Search on Google
            </Button>
          </p>
        </LyricsContainer>
      );
    }

    if (typeof lrc === "string") {
      return (
        <LyricsContainer className="space-y-2 text-xl">
          {lyrics.text.split("\n").map((line, index) => (
            <p key={index}>{line}</p>
          ))}
        </LyricsContainer>
      );
    }

    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="w-full space-y-4 overflow-auto p-12 pt-0 text-3xl font-black"
      >
        <SyncedLyrics lrc={lrc?.lyrics!} />
      </motion.div>
    );
  };

  return (
    <>
      <LyricsHeader onClose={onClose} />
      {renderContent()}
    </>
  );
});
