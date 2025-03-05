import { PrismaClient } from '@prisma/client';
import { config } from '@repo/config';
import { error } from 'node:console';
import fs from 'node:fs';
import path from 'node:path';

const prisma = new PrismaClient()

interface MetadataPayload {
    title?: string;
    artist?: string;
    album?: string;
    cover?: string;
    year?: number;
    genre?: string;
}


export default defineEventHandler(async (event) => {
    const trackId = getRouterParam(event, "trackId");
    const payload = await readBody<MetadataPayload>(event);
    if (!payload.title && !payload.artist) {
        setResponseStatus(event, 400);
        return { error: "Title or artist required" };
    }
    try {
        const savedTrack = await saveTracks(payload, trackId);
        fs.unlink(path.join(config.musicPath, savedTrack.title), (error) => {
            setResponseStatus(event, 500);
            return {
                message: `Something wrong happen caused by :: ${error.message}`
            }
        });
        return {
            message: "Updated successfully",
            data: { savedTrack },
        };
    } catch (e) {
        setResponseStatus(event, 500);
        return {
            message: `error on saveTrack caused by e:: ${e}`
        };
    }
});

const buildCoverSave = (payload: MetadataPayload, albumId) => {
    if (payload.cover) {
        const base64Data = payload.cover.replace(/^data:image\/\w+;base64,/, '');
        const buffer = Buffer.from(base64Data, 'base64');
        const imagePath = path.join(config.coverPath, `${albumId}.jpeg`);
        fs.writeFileSync(imagePath, buffer);
        return imagePath;
    }
    return '';
}

const saveTracks = async (payload: MetadataPayload, trackId: string) => {
    return await prisma.$transaction(async (prisma) => {
        const { title, artist: artistName, album: albumName } = payload;
        const track = await prisma.track.findFirst({
            where: { id: trackId},
            include: {
                album: true,
                artists: true,
            }
        })

        // Search for an existing artist
        const foundArtist = await prisma.artist.findFirst({
            where: {name: artistName}
        })

        // Vérifier si l'artiste existe, sinon le créer
        const artist = await prisma.artist.upsert({
            where: { id: foundArtist?.id || '-1'},
            update: {},
            create: {
                name: artistName,
            },
        });

        
        // Search for an existing album
        const foundAlbum = await prisma.album.findFirst({
            where:{
                title: albumName
            }
        });
        const coverUrl = buildCoverSave(payload, track.albumId);


        // Vérifier si l'album existe, sinon le créer et l'associer à l'artiste
        const album = await prisma.album.upsert({
            where: { id: foundAlbum?.id || '-1'},
            update: {
                coverPath: coverUrl,
                artists: {
                    connect: {
                        id: artist.id
                    }
                }
            },
            create: {
                title: payload.album,
                coverPath: coverUrl || null,
                artists: {
                    connect: { id: artist.id },
                },
            },
        });

        // Créer le track et l'associer à l'album et à l'artiste
        const newTrack = await prisma.track.update({
            where: { id: trackId},
            data: {
                title,
                album: {
                    connect: { id: album.id },
                },
                artists: {
                    connect: { id: artist.id },
                },
            },
        });

        const updatedTrack = await prisma.track.findFirst({
            where:{id: newTrack.id},
            include: {
                artists: true,
                album: true,
            }
        })

        return updatedTrack;
    });
};
