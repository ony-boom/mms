export const FAVORITE_TRACK = /* GraphQL */ `
  mutation FavoriteTrack($trackId: ID!, $value: Boolean!) {
    favoriteTrack(trackId: $trackId, value: $value) {
      id
      isFavorite
    }
  }
`;
