import { useEffect } from "react";
import { useLoginStore } from "@/stores/login";
import { fetchData, postToServer } from "@/api/downloader/utils";
import { login } from "@/api/downloader/auth";

interface BindingSetupProps {
  children?: React.ReactNode;
}

export const InitBinding: React.FC<BindingSetupProps> = ({ children }) => {
  useEffect(() => {
    (async function () {
      // Fetch connection data
      const connectResponse = await fetchData("connect");
      const spotifyStatus = connectResponse.spotifyEnabled
        ? "enabled"
        : "disabled";
      useLoginStore.getState().setSpotifyStatus(spotifyStatus);

      // Get stored credentials
      const arl =
        connectResponse.singleUser?.arl || localStorage.getItem("arl");
      const accessToken =
        connectResponse.singleUser?.accessToken ||
        localStorage.getItem("accessToken");

      // Skip login if autologin is disabled
      if (!connectResponse.autologin || !arl) {
        return;
      }

      // Try login with ARL first
      const result = await login(arl);

      // If login failed and we have an access token, try login with credentials
      if (result.status !== 0 || !accessToken) {
        return;
      }

      // Try login with credentials
      const credentialsResponse = await postToServer("loginWithCredentials", {
        accessToken,
      });
      const newArl = credentialsResponse.arl;

      // If we got a new ARL and it's different, update it and login again
      if (newArl && newArl !== arl) {
        useLoginStore.getState().setARL(newArl, true);
        await login(newArl);
      }
    })();
  }, []);

  return <>{children}</>;
};
