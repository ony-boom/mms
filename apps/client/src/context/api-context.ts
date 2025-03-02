import { apiClients } from "@/api";
import { createContext } from "react";

export const ApiContext = createContext<{
  apiClientName: keyof typeof apiClients;
}>({
  apiClientName: "default",
});
