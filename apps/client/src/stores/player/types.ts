export type Track = {
  id: string;
  src: string;
};

export interface PlayerStateProperties {
  src?: string;
  volume: number;
  position: number;
  isPlaying: boolean;
  duration: number;
  playlists: Map<string, string>;
  playlistOrder: string[];
  playingIndex: number;
  currentTrackId?: string;
  isShuffle: boolean;
  shuffleOrder: string[];
  muted: boolean;
}

export interface PlayerStateActions {
  setSrc: (src: string) => void;
  setPosition: (position: number) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setDuration: (duration: number) => void;
  setPlaylists: (playlists: Track[]) => void;
  getCurrentPlaylist: () => Track[];
  setPlayingIndex: (index: number) => void;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  playNext: () => void;
  playPrev: () => void;
  playAfter: (track: Track) => void;
  hasPrev: () => boolean;
  hasNext: () => boolean;
  toggleShuffle: (value?: boolean, shuffleAll?: boolean) => void;
  playTrackAtIndex: (index: number) => void;
  playAtRandom: () => void;
  getCurrentIndex: () => number;
  getCurrentTrack: () => Track | undefined;
  addToQueue: (track: Track) => void;
  setVolume: (volume: number) => void;
  setMuted: (muted: boolean) => void;
}

export type PlayerState = PlayerStateProperties & PlayerStateActions;
