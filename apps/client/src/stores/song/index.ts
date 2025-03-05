import { create } from 'zustand';

export interface SongMetadata {
    title: string;
    artist: string;
    album: string;
    year?: number;
    genre?: string;
    duration?: number;
    modified: boolean;
}

interface SongMetadataStore {
    metadata: SongMetadata;
    isOpenEdition: boolean;
    originalMetadata: SongMetadata;
    setMetadata: (metadata: SongMetadata) => void;
    updateField: (field: keyof SongMetadata, value: string) => void;
    resetChanges: () => void;
    showSongEdition: (v: string) => void;
    closeSongEdition: () => void;
    trackId?: string;
}

export const useSongMetadataStore = create<SongMetadataStore>((set) => ({
    metadata: {
        title: '',
        artist: '',
        album: '',
        modified: false,
    },
    originalMetadata: {
        title: '',
        artist: '',
        album: '',
        modified: false
    },
    trackId: undefined,
    isOpenEdition: false,
    setMetadata: (metadata: SongMetadata) => 
        set(() => ({
            metadata: { ...metadata, modified: false },
            originalMetadata: { ...metadata, modified: false }
        })),

    showSongEdition: (trackId?: string) => {
        set({
            trackId,
            isOpenEdition: !!trackId,
        })
    },
    closeSongEdition: () => {
        set({isOpenEdition: false})
    },
    updateField: (field: keyof SongMetadata, value: string) =>
        set((state) => ({
            metadata: {
                ...state.metadata,
                [field]: value,
                modified: JSON.stringify(state.originalMetadata) !== JSON.stringify({
                    ...state.metadata,
                    [field]: value
                })
            }
        })),
    resetChanges: () =>
        set((state) => ({
            metadata: { ...state.originalMetadata }
        }))
}));
