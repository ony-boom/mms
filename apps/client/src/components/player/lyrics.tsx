import { Lrc, Lyric } from "lrc-kit";
import { cn } from "@/lib/utils";
import { LyricsResponse } from "@/api";
import { usePlayerStore } from "@/stores";
import { useMemo, useRef, useEffect, memo, ReactNode, HTMLProps } from "react";
import { useApiClient, useAudioRef } from "@/hooks";
import { Button } from "../ui/button";
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
        if (!entry?.isIntersecting && activeLyricRef.current && isPlaying) {
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
          "text-foreground/50 cursor-pointer leading-10 transition-all",
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

interface LyricsContainerProps {
  children: ReactNode;
  className?: string;
}

const LyricsContainer = ({
  children,
  className = "",
}: LyricsContainerProps) => (
  <div
    data-scroller={true}
    className={cn("lyrics-gradient p-12 pt-0", className)}
  >
    {children}
  </div>
);

export const Lyrics = memo((props: HTMLProps<HTMLDivElement>) => {
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

  if (isLoading) {
    return (
      <LyricsContainer
        {...props}
        className={cn(
          "flex h-full w-full place-items-center text-xl font-black",
          props.className,
        )}
      >
        <p className="w-full text-center">
          Fetching lyrics for you, just a moment...
        </p>
      </LyricsContainer>
    );
  }

  if (!lyrics.text) {
    return (
      <LyricsContainer
        {...props}
        className={cn(
          "flex h-full w-full place-items-center text-xl font-black",
          props.className,
        )}
      >
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
      <LyricsContainer
        {...props}
        className={cn("space-y-2 overflow-auto text-xl", props.className)}
      >
        {lyrics.text.split("\n").map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </LyricsContainer>
    );
  }

  return (
    <LyricsContainer
      {...props}
      className={cn(
        "w-max space-y-4 overflow-auto pt-0 text-3xl font-black",
        props.className,
      )}
    >
      <SyncedLyrics lrc={lrc!.lyrics} />
    </LyricsContainer>
  );
});
