export * from "./types";
import { defaultApi, rest } from "./clients";

export const apiClients = {
  default: defaultApi,
  rest,
};
