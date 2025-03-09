export type ArtistWikiSummary = {
  htmlSummary: string;
  description: string;
};

export type LasFmArtistInfoRawResponse = {
  artist: {
    bio: {
      summary: string;
      content: string;
    };
  };
};
