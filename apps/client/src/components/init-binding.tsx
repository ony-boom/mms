/* eslint-disable @typescript-eslint/no-explicit-any */
import { fetchData, postToServer } from "@/lib/api-utils";
import { socket } from "@/lib/socket";
import { useLoginStore } from "@/stores/login";
import { useEffect } from "react";
import { toast } from "sonner";

async function startApp() {
  const connectResponse = await fetchData("connect");
  const spotifyStatus = connectResponse.spotifyEnabled ? "enabled" : "disabled";

  if (connectResponse.deezerAvailable === "no-network") {
    document.getElementById("deezer_not_reachable")?.classList.remove("hide");
  }
  if (connectResponse.deezerAvailable === "no") {
    document.getElementById("deezer_not_available")?.classList.remove("hide");
  }

  useLoginStore.getState().setSpotifyStatus(spotifyStatus);

  let arl = localStorage.getItem("arl");
  let accessToken = localStorage.getItem("accessToken");

  if (connectResponse.singleUser) {
    if (connectResponse.singleUser.arl) arl = connectResponse.singleUser.arl;
    if (connectResponse.singleUser.accessToken)
      accessToken = connectResponse.singleUser.accessToken;
  }

  if (connectResponse.autologin) {
    const accountNum = localStorage.getItem("accountNum");

    async function login(arl: string, accountNum: number) {
      arl = arl.trim();
      let result;

      if (accountNum !== 0) {
        result = await postToServer("loginArl", {
          arl,
          force: true,
          child: accountNum || 0,
        });
      } else {
        result = await postToServer("loginArl", { arl });
      }

      return result;
    }

    if (arl) {
      let result = await login(arl, Number(accountNum));
      if (result.status === 0 && accessToken) {
        const { arl: newArl } = await postToServer("loginWithCredentials", {
          accessToken,
        });
        if (newArl && newArl !== arl) {
          arl = newArl;
          useLoginStore.getState().setARL(newArl, true);
        }
        result = await login(newArl, Number(accountNum));
      }
      loggedIn(result);
    }
  } else {
    loggedIn({ status: 3, user: connectResponse.currentUser, arl });
  }
}

function loggedIn(data: { status: number; user: any; arl: string | null }) {
  const { status, user } = data;
  const loginStore = useLoginStore.getState();

  switch (status) {
    case 3:
      // Login ok
      loginStore.login(data);
      break;
    case 2:
      // Already logged in
      loginStore.setUser(user);
      break;
    case 0:
      // Login failed
      loginStore.removeARL();
      break;
    default:
      console.warn("Unexpected login status:", status);
      break;
  }
}

/* ===== Socketio listeners ===== */

// Debug messages for socketio
socket.on("restoringQueue", function () {
  toast("restoringQueue");
});

socket.on("cancellingCurrentItem", function (uuid: string) {
  toast(`cancellingCurrentItem ${uuid}`);
});

socket.on("currentItemCancelled", function ({ uuid }: { uuid: string }) {
  toast(`currentItemCancelled ${uuid}`);
});

socket.on("startAddingArtist", function (data: { name: string; id: string }) {
  toast(`startAddingArtist ${data.name}`);
});

socket.on("finishAddingArtist", function (data: { name: string; id: string }) {
  toast(`finishAddingArtist ${data.name}`);
});

socket.on("startConvertingSpotifyPlaylist", function (id: string) {
  toast(`startConvertingSpotifyPlaylist ${id}`);
});

socket.on("finishConvertingSpotifyPlaylist", function (id: string) {
  toast(`finishConvertingSpotifyPlaylist ${id}`);
});

socket.on("errorMessage", function (error: Error) {
  toast(error.message);
});

socket.on("queueError", function (queueItem: any) {
  if (queueItem.errid) {
    toast(`${queueItem.link} - errors.ids.${queueItem.errid}`);
  } else {
    toast(queueItem.link + " - " + queueItem.error);
  }
});

socket.on("alreadyInQueue", function (data: { title: string }) {
  toast(`alreadyInQueue ${data.title}`);
});

socket.on("queueErrorNotLoggedIn", function () {
  toast("loginNeededToDownload");
});

const bitrateLabels = {
  15: "360 HQ",
  14: "360 MQ",
  13: "360 LQ",
  9: "FLAC",
  3: "320kbps",
  1: "128kbps",
  8: "128kbps",
  0: "MP3",
};

socket.on(
  "queueErrorCantStream",
  function (bitrate: keyof typeof bitrateLabels) {
    toast(`queueErrorCantStream ${bitrateLabels[bitrate]}`);
  },
);

socket.on(
  "startGeneratingItems",
  function (data: { total: number; uuid: string }) {
    toast(`toasts.startGeneratingItems ${data.total}`);
  },
);

socket.on(
  "finishGeneratingItems",
  function (data: { total: number; uuid: string }) {
    toast(`toasts.finishGeneratingItems ${data.total}}`);
  },
);

socket.on(
  "toast",
  (data: { msg: string; icon: string; dismiss: boolean; id: string }) => {
    const { msg } = data;
    toast(msg);
  },
);

interface BindingSetupProps {
  children?: React.ReactNode;
}

export const InitBinding: React.FC<BindingSetupProps> = ({ children }) => {
  useEffect(function initApp() {
    startApp();
  }, []);

  return <div>{children}</div>;
};
