import { Deezer } from "@repo/deezer-sdk";
import { deezSessionMap } from "../../../deemixApp.js";
import { type ApiHandler } from "../../../types.js";

const path: ApiHandler["path"] = "/getUserTracks";

const handler: ApiHandler["handler"] = async (req, res) => {
  if (!deezSessionMap[req.session.id])
    deezSessionMap[req.session.id] = new Deezer();
  const dz = deezSessionMap[req.session.id];
  let data;

  if (dz.loggedIn) {
    data = await dz.gw.get_my_favorite_tracks({ limit: -1 });
  } else {
    data = { error: "notLoggedIn" };
  }
  res.send(data);
};

const apiHandler: ApiHandler = { path, handler };

export default apiHandler;
