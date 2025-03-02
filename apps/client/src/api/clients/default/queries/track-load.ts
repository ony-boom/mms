export const TRACK_LOAD = /*GraphQL*/ `
  subscription {
    loadedTrack {
      current
      total
    }
  }
`;

export const LOAD_TRACK = /*GraphQL*/  `
    mutation {
        loadTracks
    }
`;
