export const GET_TRACKS = /*GraphQL*/ `
    query GetTracks($where: TrackWhereInput, $sortBy: TrackSortByInput) {
        tracks(where: $where, sortBy: $sortBy) {
            id
            title
            path
            isFavorite
            artists {
                id
                name
            }
        }
    }
`;
