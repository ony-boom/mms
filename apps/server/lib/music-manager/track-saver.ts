import fs from "node:fs";
import * as uuid from "uuid";
import * as mm from "music-metadata";
import { basename } from "node:path";
import { config } from "@repo/config";
import { prisma } from "~~/prisma";
import { type LoadedMetadata } from ".";

export class TrackSaver {
  async getCoverPath(
    pictures: mm.IPicture[] | undefined,
    albumId: string,
  ): Promise<string | null> {
    const cover = mm.selectCover(pictures);

    if (!cover) return null;
    const ext = cover.format.split("/")[1] ?? config.defaultCoverExtension;
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
      // More robust album identifier
      const albumTitle = (metadata.album || trackTitle).trim().toLowerCase();
      const artistName = (
        metadata.albumartist ||
        metadata.artist ||
        "Various Artists"
      )
        .trim()
        .toLowerCase();
      const albumIdentifier = `${albumTitle}-${artistName}`;

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
        where: { id: uuid.v5(name, uuid.v5.DNS) },
        update: {},
        create: {
          id: uuid.v5(name, uuid.v5.DNS),
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

      const trackData = {
        title: trackTitle,
        album: { connect: { id: albumId } },
        dateAdded: metadata.dateAdded,
        artists: {
          connect: trackArtists.map((artist) => ({ id: artist.id })),
        },
      };

      return prisma.track.upsert({
        where: { path: metadata.path },
        update: trackData,
        create: {
          ...trackData,
          path: metadata.path,
        },
      });
    });

    await Promise.all(trackUpserts);
  }

  async updateTrack(path: string) {
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
    // Use Set for O(1) lookup instead of O(n) with array.includes()
    const trackPathSet = new Set(tracksPath);

    // Only select the path field to reduce memory usage
    const existingTracks = await prisma.track.findMany({
      select: { path: true },
    });

    const deletedPaths = existingTracks
      .map((track) => track.path)
      .filter((path) => !trackPathSet.has(path));

    // Batch delete to reduce number of queries
    if (deletedPaths.length > 0) {
      await Promise.all(deletedPaths.map((path) => this.removeTrack(path)));
    }
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
        albumId: true,
        album: {
          select: {
            id: true,
            coverPath: true,
            _count: {
              select: {
                tracks: true,
              },
            },
          },
        },
      },
    });

    if (tracks.length === 0) {
      return;
    }

    // Group tracks by album to avoid redundant queries
    const albumsToCheck = new Map<
      string,
      { coverPath: string | null; trackCount: number }
    >();
    for (const track of tracks) {
      if (!albumsToCheck.has(track.album.id)) {
        albumsToCheck.set(track.album.id, {
          coverPath: track.album.coverPath,
          trackCount: track.album._count.tracks,
        });
      }
    }

    await prisma.track.deleteMany({
      where: {
        path: {
          in: tracks.map((track) => track.path),
        },
      },
    });

    // Only delete covers for albums that will have no tracks left after deletion
    const coverDeletions: Promise<void>[] = [];
    for (const [albumId, albumInfo] of albumsToCheck) {
      const tracksToDeleteFromThisAlbum = tracks.filter(
        (t) => t.albumId === albumId,
      ).length;
      if (
        albumInfo.trackCount === tracksToDeleteFromThisAlbum &&
        albumInfo.coverPath
      ) {
        coverDeletions.push(this.deleteCover(albumInfo.coverPath));
      }
    }

    if (coverDeletions.length > 0) {
      await Promise.all(coverDeletions);
    }

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
