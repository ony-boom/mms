export const GET_LYRICS = /* GraphQL */ `
  query GetLyrics($trackId: ID!) {
    lyrics(trackId: $trackId) {
      isSync
      text
    }
  }
`;
