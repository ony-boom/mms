import { Deezer } from "@repo/deezer-sdk";
import { deezSessionMap } from "../../../deemixApp.js";
import { type ApiHandler } from "../../../types.js";

const path: ApiHandler["path"] = "/search";

const emptyResult = {
  data: [],
  total: 0,
  type: "",
  error: "",
};

const handler: ApiHandler["handler"] = async (req, res) => {
  if (!deezSessionMap[req.session.id])
    deezSessionMap[req.session.id] = new Deezer();
  const dz = deezSessionMap[req.session.id];

  const term = String(req.query.term);
  const type = String(req.query.type);
  const start = parseInt(String(req.query.start));
  const nb = parseInt(String(req.query.nb));

  let data;

  try {
    switch (type) {
      case "track":
        data = await dz.api.search_track(term, { limit: nb, index: start });
        break;
      case "album":
        data = await dz.api.search_album(term, { limit: nb, index: start });
        break;
      case "artist":
        data = await dz.api.search_artist(term, { limit: nb, index: start });
        break;
      case "playlist":
        data = await dz.api.search_playlist(term, { limit: nb, index: start });
        break;
      case "radio":
        data = await dz.api.search_radio(term, { limit: nb, index: start });
        break;
      case "user":
        data = await dz.api.search_user(term, { limit: nb, index: start });
        break;
      default:
        data = await dz.api.search(term, { limit: nb, index: start });
        break;
    }
  } catch (e: any) {
    data = { ...emptyResult };
    data.error = e.message;
  }

  data.type = type;
  res.send(data);
};

const apiHandler: ApiHandler = { path, handler };

export default apiHandler;
