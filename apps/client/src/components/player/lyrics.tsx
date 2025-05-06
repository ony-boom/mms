import { cn } from "@/lib/utils";
import { Button } from "../ui/button";
import { Lrc, Runner } from "lrc-kit";
import { LyricsResponse } from "@/api/types";
import { useShallow } from "zustand/react/shallow";
import { useAudioRef } from "@/hooks/use-audio-ref";
import { useApiClient } from "@/hooks/use-api-client";
import { usePlayerStore } from "@/stores/player/store";
import {
  useMemo,
  useRef,
  useEffect,
  memo,
  ReactNode,
  HTMLProps,
  useState,
  useCallback,
} from "react";

const SyncedLyrics = memo(({ lrc }: SyncedLyricsProps) => {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  const runner = useMemo(() => new Runner(lrc), [lrc]);
  const lyricsRef = useRef<Record<number, HTMLParagraphElement>>({});
  const containerRef = useRef<HTMLDivElement>(null);

  const audioRef = useAudioRef();
  const { position, isPlaying } = usePlayerStore(
    useShallow((state) => ({
      position: state.position,
      isPlaying: state.isPlaying,
    })),
  );

  useEffect(() => {
    if (audioRef.current) {
      runner.timeUpdate(position);
      setActiveIndex(runner.curIndex());
    }
  }, [audioRef, position, runner]);

  useEffect(() => {
    const activeLyric = lyricsRef.current[activeIndex];

    if (activeLyric && isPlaying && containerRef.current) {
      activeLyric.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
  }, [activeIndex, isPlaying]);

  useEffect(() => {
    const audioElement = audioRef.current;

    const handleRunnerUpdate = (event: Event) => {
      const audioElement = event.target as HTMLAudioElement;
      runner.timeUpdate(audioElement.currentTime);
      setActiveIndex(runner.curIndex());
    };

    audioElement?.addEventListener("timeupdate", handleRunnerUpdate);

    return () => {
      audioElement?.removeEventListener("timeupdate", handleRunnerUpdate);
    };
  }, [audioRef, runner]);

  const handleLyricsClick = useCallback(
    (time: number) => {
      if (audioRef.current) audioRef.current.currentTime = time;
    },
    [audioRef],
  );

  return (
    <div ref={containerRef} className="space-y-2 md:space-y-4">
      {lrc.lyrics.map((lyric, index) => {
        const isActive = index === activeIndex;

        return (
          <p
            ref={(el) => {
              if (el) lyricsRef.current[index] = el;
            }}
            title={isActive ? "" : "Click to seek to this position"}
            className={cn(
              "text-foreground/50 cursor-pointer transition-all md:leading-10",
              { "text-foreground md:text-4xl": isActive },
            )}
            key={`lyric-${index}-${lyric.timestamp}`}
            onClick={() => !isActive && handleLyricsClick(lyric.timestamp)}
          >
            {lyric.content}
          </p>
        );
      })}
    </div>
  );
});

const LyricsContainer = ({
  children,
  className = "",
}: LyricsContainerProps) => (
  <div className={cn("lyrics-gradient p-4 pt-0 md:p-12", className)}>
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
        "flex w-max flex-col items-center pt-0 text-xl font-black md:space-y-4 md:text-3xl",
        props.className,
      )}
    >
      <SyncedLyrics lrc={lrc!} />
    </LyricsContainer>
  );
});

interface LyricsContainerProps {
  children: ReactNode;
  className?: string;
}

interface SyncedLyricsProps {
  lrc: Lrc;
}
