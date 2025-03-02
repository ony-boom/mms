import type { IAudioMetadata } from "music-metadata";

declare module "music-metadata" {
  export function parseFile(path: string): Promise<IAudioMetadata>;
}
