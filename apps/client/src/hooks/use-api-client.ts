import { useContext } from "react";
import type { Api } from "@/api/Api";
import { apiClients } from "@/api/clients";
import { ApiContext } from "@/context/api-context";

export const useApiClient = (): Api => {
  const apiContext = useContext(ApiContext);

  return apiClients[apiContext.apiClientName];
};
