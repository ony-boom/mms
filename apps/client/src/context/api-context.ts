import { createContext } from "react";
import { apiClients } from "@/api/clients";

export const ApiContext = createContext<{
  apiClientName: keyof typeof apiClients;
}>({
  apiClientName: "rest",
});
