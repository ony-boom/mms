import fs from "node:fs";
import * as uuid from "uuid";
import * as mm from "music-metadata";
import { basename } from "node:path";
import { config } from "~~/config";
import { prisma } from "~~/prisma";
import type { LoadedMetadata } from ".";

export class TrackSaver {
  async getCoverPath(
    pictures: mm.IPicture[] | undefined,
    albumId: string,
  ): Promise<string | null> {
    const cover = mm.selectCover(pictures);

    if (!cover) return null;
    const ext = cover.format.split("/")[1] ?? "jpg";
    const path = `${config.coverPath}/${albumId}.${ext}`;
    try {
      await fs.promises.access(path);
    } catch {
      await fs.promises.writeFile(path, cover.data);
    }
    return path;
  }

  async saveTracks(metadataBatch: LoadedMetadata[]) {
    const tracksByAlbum = this.groupTracksByAlbum(metadataBatch);
    const albumPromises = tracksByAlbum.map(([albumIdentifier, tracks]) =>
      this.processAlbum(albumIdentifier, tracks),
    );
    await Promise.all(albumPromises);
  }

  private groupTracksByAlbum(
    metadataBatch: LoadedMetadata[],
  ): [string, LoadedMetadata[]][] {
    const tracksByAlbum = new Map<string, LoadedMetadata[]>();
    for (const metadata of metadataBatch) {
      const trackTitle = metadata.title || basename(metadata.path);
      const albumIdentifier = `${metadata.album ?? trackTitle}-${metadata.albumartist || "Various Artists"}`;
      const tracks = tracksByAlbum.get(albumIdentifier) || [];
      tracks.push(metadata);
      tracksByAlbum.set(albumIdentifier, tracks);
    }
    return Array.from(tracksByAlbum.entries());
  }

  private async processAlbum(
    albumIdentifier: string,
    tracks: LoadedMetadata[],
  ) {
    const albumId = uuid.v5(albumIdentifier, uuid.v5.DNS);
    const existingAlbum = await prisma.album.findUnique({
      where: { id: albumId },
      include: { artists: true },
    });

    const coverPath =
      existingAlbum?.coverPath ||
      (tracks[0].picture
        ? await this.getCoverPath(tracks[0].picture, albumId)
        : null);
    const album = await prisma.album.upsert({
      where: { id: albumId },
      update: { coverPath: existingAlbum?.coverPath ? undefined : coverPath },
      create: {
        id: albumId,
        title: tracks[0].album || tracks[0].title || basename(tracks[0].path),
        coverPath,
      },
    });

    const artistMap = await this.upsertArtists(tracks, album.id);
    await this.upsertTracks(tracks, album.id, artistMap);
  }

  private async upsertArtists(
    tracks: LoadedMetadata[],
    albumId: string,
  ): Promise<Map<string, any>> {
    const uniqueArtists = new Set<string>();
    for (const track of tracks) {
      const artistNames = track.artist?.split(/,|, /g) ?? [];
      for (const name of artistNames) {
        uniqueArtists.add(name.trim());
      }
    }

    const artistUpserts = Array.from(uniqueArtists).map((name) =>
      prisma.artist.upsert({
        where: { id: uuid.v5(`${name}-${albumId}`, uuid.v5.DNS) },
        update: {},
        create: {
          id: uuid.v5(`${name}-${albumId}`, uuid.v5.DNS),
          name,
          albums: { connect: { id: albumId } },
        },
      }),
    );

    const artistRecords = await prisma.$transaction(artistUpserts);
    const artistMap = new Map();
    artistRecords.forEach((artist) => artistMap.set(artist.name, artist));
    return artistMap;
  }

  private async upsertTracks(
    tracks: LoadedMetadata[],
    albumId: string,
    artistMap: Map<string, any>,
  ) {
    const trackUpserts = tracks.map(async (metadata) => {
      const trackTitle = metadata.title || basename(metadata.path);
      const artistNames = metadata.artist?.split(/,|, /g) ?? [];
      const trackArtists = artistNames
        .map((name) => artistMap.get(name.trim()))
        .filter(Boolean);

      return prisma.track.upsert({
        where: { path: metadata.path },
        update: {},
        create: {
          title: trackTitle,
          path: metadata.path,
          album: { connect: { id: albumId } },
          dateAdded: metadata.dateAdded,
          artists: {
            connect: trackArtists.map((artist) => ({ id: artist.id })),
          },
        },
      });
    });

    await Promise.all(trackUpserts);
  }

  async updateTrack(path: string) {
    // @ts-ignore
    const { common } = await mm.parseFile(path);
    const dateAdded = await fs.promises
      .stat(path)
      .then((stat) => stat.birthtime);

    const metadata: LoadedMetadata = {
      ...common,
      dateAdded,
      path,
      state: {
        current: 1,
        total: 1,
        done: true,
      },
    };

    await this.saveTracks([metadata]);
  }

  async deleteDeletedTracks(tracksPath: string[]) {
    const existingTracks = await prisma.track.findMany();
    const existingPaths = existingTracks.map((track) => track.path);
    const deletedPaths = existingPaths.filter(
      (path) => !tracksPath.includes(path),
    );
    await Promise.all(deletedPaths.map((path) => this.removeTrack(path)));
  }

  private async cleanUpAfterDelete() {
    await prisma.artist.deleteMany({
      where: {
        tracks: {
          none: {},
        },
      },
    });

    await prisma.album.deleteMany({
      where: {
        tracks: {
          none: {},
        },
      },
    });
  }

  async removeTrack(path: string) {
    const tracks = await prisma.track.findMany({
      where: {
        path: {
          startsWith: path,
        },
      },
      select: {
        path: true,
        album: {
          select: {
            coverPath: true,
          },
        },
      },
    });

    await prisma.track.deleteMany({
      where: {
        path: {
          in: tracks.map((track) => track.path),
        },
      },
    });

    await Promise.all(
      tracks.map((track) => this.deleteCover(track.album.coverPath)),
    );

    await this.cleanUpAfterDelete();
  }

  async deleteCover(coverPath?: string | null) {
    if (!coverPath) return;
    try {
      await fs.promises.access(coverPath);
      await fs.promises.unlink(coverPath);
    } catch {}
  }
}
