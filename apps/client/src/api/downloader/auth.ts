import { postToServer } from "./utils";
import { useQuery, UseQueryOptions } from "@tanstack/react-query";
import { CACHE_KEY } from "../constant";
import { fetchData } from "./utils";
import { useLoginStore } from "@/stores/login";

export async function login(arl: string) {
  arl = arl.trim();
  return await postToServer("loginArl", { arl });
}

export function useConnect(
  opts?: Omit<UseQueryOptions, "queryFn" | "queryKey">,
) {
  return useQuery({
    ...opts,
    queryKey: [CACHE_KEY.CONNECT],
    queryFn: async () => {
      const connectResponse = await fetchData("connect");

      const spotifyStatus = connectResponse.spotifyEnabled
        ? "enabled"
        : "disabled";

      useLoginStore.getState().setSpotifyStatus(spotifyStatus);

      const arl =
        connectResponse.singleUser?.arl || localStorage.getItem("arl");
      const accessToken =
        connectResponse.singleUser?.accessToken ||
        localStorage.getItem("accessToken");

      if (!connectResponse.autologin || !arl) {
        // Handle the case when autologin is not enabled or ARL is not available
        throw new Error("Autologin not enabled or ARL is missing");
      }

      // Try login with ARL first
      const result = await login(arl);

      if (result.status !== 0 || !accessToken) {
        return { spotifyStatus };
      }

      const credentialsResponse = await postToServer("loginWithCredentials", {
        accessToken,
      });

      const newArl = credentialsResponse.arl;

      if (newArl && newArl !== arl) {
        useLoginStore.getState().setARL(newArl, true);
        await login(newArl);
      }

      return {
        arl: newArl || arl,
        accessToken,
        spotifyStatus,
      };
    },
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
  });
}
