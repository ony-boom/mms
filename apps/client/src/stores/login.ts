import { create } from "zustand";
import { fetchData } from "@/lib/api-utils";

interface User {
  id: string | null;
  name: string;
  picture: string;
  country?: string;
  can_stream_lossless?: boolean;
  can_stream_hq?: boolean;
}

interface SpotifyUser {
  id: string | null;
  name: string | null;
  picture: string | null;
}

interface LoginState {
  arl: string;
  accessToken: string;
  status: number | null;
  user: User;
  spotifyUser: SpotifyUser;
  spotifyStatus: "enabled" | "disabled";
  clientMode: boolean;

  // Derived states
  isLoggedIn: boolean;
  isLoggedWithSpotify: boolean;

  // Actions
  login: (data: { status: number; user: User; arl: string | null }) => void;
  logout: () => void;
  setARL: (arl: string, saveOnLocalStorage?: boolean) => void;
  setAccessToken: (accessToken: string, saveOnLocalStorage?: boolean) => void;
  removeARL: () => void;
  removeAccessToken: () => void;
  setUser: (user: User) => void;
  setClientMode: (clientMode: boolean) => void;
  setSpotifyStatus: (spotifyStatus: "enabled" | "disabled") => void;
  setSpotifyUserId: (spotifyUserId: string | null) => void;
  refreshSpotifyStatus: () => Promise<void>;
}

export const useLoginStore = create<LoginState>((set, get) => ({
  arl: localStorage.getItem("arl") || "",
  accessToken: localStorage.getItem("accessToken") || "",
  status: null,
  user: {
    id: null,
    name: "",
    picture: "",
  },
  spotifyUser: {
    id: localStorage.getItem("spotifyUser"),
    name: null,
    picture: null,
  },
  spotifyStatus: "disabled",
  clientMode: false,

  // Derived states
  get isLoggedIn() {
    return !!get().arl;
  },
  get isLoggedWithSpotify() {
    const state = get();
    return !!state.spotifyUser.id && state.spotifyStatus === "enabled";
  },

  // Actions
  login: ({ status, user, arl }) => {
    set({ user, status });
    get().setARL(arl || "");
  },

  logout: () => {
    localStorage.removeItem("arl");
    localStorage.removeItem("accessToken");

    // Reset the store to initial state
    set({
      arl: "",
      accessToken: "",
      status: null,
      user: {
        id: null,
        name: "",
        picture: "",
      },
      spotifyUser: {
        id: null,
        name: null,
        picture: null,
      },
      spotifyStatus: "disabled",
      clientMode: false,
    });
  },

  setARL: (arl, saveOnLocalStorage = true) => {
    set({ arl });

    if (saveOnLocalStorage) {
      localStorage.setItem("arl", arl);
    }
  },

  setAccessToken: (accessToken, saveOnLocalStorage = true) => {
    set({ accessToken });

    if (saveOnLocalStorage) {
      localStorage.setItem("accessToken", accessToken);
    }
  },

  removeARL: () => {
    set({ arl: "" });
    localStorage.removeItem("arl");
  },

  removeAccessToken: () => {
    set({ accessToken: "" });
    localStorage.removeItem("accessToken");
  },

  setUser: (user) => {
    set({ user });
  },

  setClientMode: (clientMode) => {
    set({ clientMode });
  },

  setSpotifyStatus: (spotifyStatus) => {
    set({ spotifyStatus });
  },

  setSpotifyUserId: (spotifyUserId) => {
    set((state) => ({
      spotifyUser: {
        ...state.spotifyUser,
        id: spotifyUserId,
      },
    }));
  },

  refreshSpotifyStatus: async () => {
    const status = await fetchData("spotifyStatus");
    set({ spotifyStatus: status.spotifyEnabled ? "enabled" : "disabled" });
  },
}));
