// Type definitions for the configuration file
// It may be just this musicPath for now, but it's good to have a file for this
export type ConfigFile = {
  musicPath: string;
};

export type Config = ConfigFile & {
  coverPath: string;
};
