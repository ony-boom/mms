import { Deezer } from "@repo/deezer-sdk";
import { deezSessionMap } from "../../../deemixApp.js";
import { type ApiHandler } from "../../../types.js";

const path: ApiHandler["path"] = "/getUserFavorites";

const handler: ApiHandler["handler"] = async (req, res) => {
  if (!deezSessionMap[req.session.id])
    deezSessionMap[req.session.id] = new Deezer();
  const dz = deezSessionMap[req.session.id];

  let result: any = {};

  if (dz.loggedIn) {
    const userID = dz.currentUser.id;

    result.playlists = await dz.gw.get_user_playlists(userID, { limit: -1 });
    result.albums = await dz.gw.get_user_albums(userID, { limit: -1 });
    result.artists = await dz.gw.get_user_artists(userID, { limit: -1 });
    // TODO: Lazy load favourites when navigating to relevant tab
    result.tracks = await dz.gw.get_my_favorite_tracks({ limit: 100 });
    result.lovedTracks = `https://deezer.com/playlist/${dz.currentUser.loved_tracks}`;
  } else {
    result = { error: "notLoggedIn" };
  }
  res.send(result);
};

const apiHandler: ApiHandler = { path, handler };

export default apiHandler;
