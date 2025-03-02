import debounce from "lodash.debounce";
import { PlayerStateProperties } from "@/stores/player/types.ts";

const DB_NAME = "player-store";
const DB_VERSION = 1;

const STORES = {
  POSITION: "position-state",
  PLAYLISTS: "playlists",
  SETTINGS: "player-settings",
} as const;

type StoredState = {
  state: PlayerStateProperties;
};

let dbPromise: Promise<IDBDatabase>;

const initDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      Object.values(STORES).forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          db.createObjectStore(storeName);
        }
      });
    };
  });
};

const idbOperation = async <T>(
  storeName: string,
  mode: IDBTransactionMode,
  operation: (store: IDBObjectStore) => IDBRequest<T>,
): Promise<T> => {
  const db = await (dbPromise || (dbPromise = initDB()));
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    const request = operation(store);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result as T);
  });
};

export const createDebouncedStorage = () => {
  const debouncedUpdatePosition = debounce(
    async (position: number) => {
      await idbOperation(STORES.POSITION, "readwrite", (store) =>
        store.put(position, "position"),
      );
    },
    1000,
    { maxWait: 2000 },
  );

  return {
    getItem: async (): Promise<StoredState> => {
      try {
        const [position, playlists, settings] = await Promise.all([
          idbOperation(STORES.POSITION, "readonly", (store) =>
            store.get("position"),
          ).catch(() => 0),
          idbOperation(STORES.PLAYLISTS, "readonly", (store) =>
            store.get("playlists"),
          ).catch(() => []),
          idbOperation(STORES.SETTINGS, "readonly", (store) =>
            store.get("settings"),
          ).catch(() => ({})),
        ]);


        return {
          state: {
            position: position || 0,
            playlists: playlists ? new Map(playlists) : new Map(),
            ...(settings || {
              src: undefined,
              isPlaying: false,
              currentTrackId: undefined,
              isShuffle: false,
              shuffleOrder: [],
            }),
          },
        };
      } catch (error) {
        console.error("Error reading from IndexedDB:", error);
        return { state: {} as PlayerStateProperties };
      }
    },

    setItem: async (_name: string, newValue: StoredState) => {
      try {
        const { position, playlists, ...settings } = newValue.state;

        if (position !== undefined) {
          await debouncedUpdatePosition(position);
        }

        const playlistsArray = Array.from(playlists.entries());
        await idbOperation(STORES.PLAYLISTS, "readwrite", (store) =>
          store.put(playlistsArray, "playlists"),
        );

        await idbOperation(STORES.SETTINGS, "readwrite", (store) =>
          store.put(settings, "settings"),
        );
      } catch (error) {
        console.error("Error writing to IndexedDB:", error);
      }
    },

    removeItem: async () => {
      try {
        await Promise.all(
          Object.values(STORES).map((storeName) =>
            idbOperation(storeName, "readwrite", (store) => store.clear()),
          ),
        );
      } catch (error) {
        console.error("Error clearing IndexedDB:", error);
      }
    },
  };
};
