import { build } from "./build";
import { compile } from "nexe";
import path from "node:path";
import { serverDir } from "../constants";

async function packageApp() {
  await build();

  await compile({
    name: "mms",
    input: path.join(serverDir, ".output", "server", "index.mjs"),
    build: true,
    resources: [
      path.join(serverDir, ".output", "public"),
      path.join(serverDir, ".output", "server"),
    ],
  });
}

packageApp().catch(console.error);
