import { deezSessionMap } from "@/deemixApp.js";
import { type ApiHandler } from "@/types.js";
import { Deezer } from "@repo/deezer-sdk";
import type { RequestHandler } from "express";

const path: ApiHandler["path"] = "/changeAccount";

interface ChangeAccountQuery {
  child: number;
}

const handler: RequestHandler<any, any, any, ChangeAccountQuery> = (
  req,
  res,
) => {
  if (!req.query || !req.query.child) {
    res
      .status(400)
      .send({ errorMessage: "No child specified", errorCode: "CA01" });
  }

  const { child: accountNum } = req.query;

  if (!deezSessionMap[req.session.id])
    deezSessionMap[req.session.id] = new Deezer();
  const dz = deezSessionMap[req.session.id];

  const accountData = dz.changeAccount(accountNum);

  res.status(200).send(accountData);
};

const apiHandler: ApiHandler = { path, handler };

export default apiHandler;
