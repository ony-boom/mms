export type ArtistWikiSummary = {
  htmlSummary: string;
};

export type LasFmArtistInfoRawResponse = {
  artist: {
    bio: {
      summary: string;
      content: string;
    };
  };
};
