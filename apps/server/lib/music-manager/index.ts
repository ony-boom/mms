import { glob } from "glob";
import pLimit from "p-limit";
import * as fs from "node:fs";
import * as path from "node:path";
import * as mm from "music-metadata";
import * as crypto from "node:crypto";
import EventEmitter from "node:events";
import { config } from "~~/config";
import { TrackSaver } from "./track-saver";
import { startWatcher } from "./watcher";
import { prisma, StateKey } from "~~/prisma";
import throttle from "lodash.throttle";

class MusicLibraryManager extends EventEmitter {
  private readonly BATCH_SIZE = 50;
  private readonly trackSaver = new TrackSaver();
  private readonly supportedExtensions = ["mp3", "flac", "wav", "ogg"];
  private readonly globPattern = `${config.musicPath}/**/*.{${this.supportedExtensions.join(",")}}`;
  private watcherCleanup: (() => void) | null = null;

  constructor() {
    super();
    this.initListeners();
  }

  initWatcher() {
    this.watcherCleanup = startWatcher();
  }

  private initListeners(): void {
    try {
      this.on("update", async (path: string) => {
        if (!this.isMusicFile(path)) return;

        const waitForDownload = async (filePath: string): Promise<void> => {
          let initialSize = (await fs.promises.stat(filePath)).size;

          const checkSize = throttle(async () => {
            const newSize = (await fs.promises.stat(filePath)).size;
            if (initialSize !== newSize) {
              initialSize = newSize;
              return false;
            }
            return true;
          }, 1000);

          while (!(await checkSize())) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }
        };
        await waitForDownload(path);
        await this.trackSaver.updateTrack(path);
      });

      this.on("remove", async (path: string) => {
        await this.trackSaver.removeTrack(path);
      });
    } catch {
      this.watcherCleanup?.();
    }
  }

  async *loadTracks(): AsyncGenerator<LoadedMetadata> {
    const tracks = await glob(this.globPattern, { nodir: true, stat: true });
    const batchCount = Math.ceil(tracks.length / this.BATCH_SIZE);
    const limit = pLimit(50);

    await this.trackSaver.deleteDeletedTracks(tracks);

    for (let i = 0; i < batchCount; i++) {
      const start = i * this.BATCH_SIZE;
      const end = Math.min(start + this.BATCH_SIZE, tracks.length);
      const batch = tracks.slice(start, end);

      const metadataPromises = batch.map((track, index) =>
        limit(async () => {
          try {
            const { common } = await mm.parseFile(track);
            const dateAdded = await fs.promises
              .stat(track)
              .then((stat) => stat.birthtime);

            const currentIndex = start + index;
            return {
              ...common,
              dateAdded,
              path: track,
              state: {
                current: currentIndex + 1,
                total: tracks.length,
                done: currentIndex === tracks.length - 1,
              },
            };
          } catch (error) {
            const message = `Error loading track at ${track}: ${(error as Error).message}`;
            throw new Error(message);
          }
        }),
      );

      const metadataBatch = await Promise.all(metadataPromises);
      await this.trackSaver.saveTracks(metadataBatch);

      for (const metadata of metadataBatch) {
        yield metadata;
      }
    }
  }

  async getDirectoryHash() {
    const hash = crypto.createHash("sha256");

    async function traverseDirectory(directory: string) {
      const entries = await fs.promises.readdir(directory, {
        withFileTypes: true,
      });

      for (const entry of entries) {
        const entryPath = path.join(directory, entry.name);

        if (entry.isDirectory()) {
          await traverseDirectory(entryPath);
        } else {
          const stats = await fs.promises.stat(entryPath);
          hash.update(entryPath + stats.mtimeMs);
        }
      }
    }

    await traverseDirectory(config.musicPath);
    return hash.digest("hex");
  }

  async getCover(coverPath: string) {
    return fs.promises.readFile(coverPath);
  }

  private isMusicFile(path: string) {
    return this.supportedExtensions.includes(path.split(".").pop()!);
  }

  async shouldReloadTracks() {
    const storedHash = (
      await prisma.state.findUnique({
        where: { key: StateKey.DirectoryHash },
      })
    )?.value;
    const currentHash = await this.getDirectoryHash();
    return {
      shouldReload: storedHash !== currentHash,
      currentHash,
    };
  }

  async updateDirectoryHash(hash: string) {
    await prisma.state.upsert({
      update: { value: hash },
      where: { key: StateKey.DirectoryHash },
      create: { key: StateKey.DirectoryHash, value: hash },
    });
  }
}

export type LoadedMetadata = mm.IAudioMetadata["common"] & {
  path: string;
  state: {
    current: number;
    total: number;
    done: boolean;
  };
  dateAdded: Date;
};

export const musicLibrary = new MusicLibraryManager();
