import { Deezer } from "@repo/deezer-sdk";
import { deezSessionMap } from "@/deemixApp.js";
import { getLoginCredentials } from "@/helpers/loginStorage.js";
import { type ApiHandler } from "@/types.js";

const path: ApiHandler["path"] = "/connect";

const handler: ApiHandler["handler"] = async (req, res) => {
  if (!deezSessionMap[req.session.id])
    deezSessionMap[req.session.id] = new Deezer();
  const dz = deezSessionMap[req.session.id];
  const deemix = req.app.get("deemix");
  const isSingleUser = req.app.get("isSingleUser");

  const result = <any>{
    autologin: !dz.loggedIn,
    currentUser: dz.currentUser,
    deezerAvailable: await deemix.isDeezerAvailable(),
    spotifyEnabled: deemix.plugins.spotify.enabled,
    settingsData: deemix.getSettings(),
  };

  if (isSingleUser && result.autologin)
    result.singleUser = getLoginCredentials();

  if (result.settingsData.settings.autoCheckForUpdates)
    result.checkForUpdates = true;

  const queue = deemix.getQueue();

  if (Object.keys(queue.queue).length > 0) {
    result.queue = queue;
  }

  res.send(result);
};

const apiHandler: ApiHandler = { path, handler };

export default apiHandler;
