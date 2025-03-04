import { Deezer } from "@repo/deezer-sdk";
import { deezSessionMap } from "../../../deemixApp.js";
import { type ApiHandler } from "../../../types.js";

const path: ApiHandler["path"] = "/getHome";

let homeCache: any;

const handler: ApiHandler["handler"] = async (req, res) => {
  if (!deezSessionMap[req.session.id])
    deezSessionMap[req.session.id] = new Deezer();
  const dz = deezSessionMap[req.session.id];

  if (!homeCache) {
    homeCache = await dz.api.get_chart(0, { limit: 30 });
  }
  res.send(homeCache);
};

const apiHandler: ApiHandler = { path, handler };

export default apiHandler;
