import { build } from "./build";
import { compile } from "nexe";
import * as path from "node:path";
import { serverDir } from "../constants";

async function packageApp() {
  await build();

  await compile({
    name: "mms",
    build: true,
    // TODO: find a way to make this more dynamic
    python: "/usr/bin/python3",
    // TODO: add more targets
    targets: [{ arch: "x64", platform: "linux", version: "20.18.3" }],
    input: path.join(serverDir, ".output", "server", "index.mjs"),
    remote: 'https://github.com/urbdyn/nexe_builds/releases/download/0.4.0/',
    verbose: true,
    resources: [
      path.join(serverDir, ".output", "public"),
      path.join(serverDir, ".output", "public"),
      path.join(serverDir, ".output", "nitro.json"),
    ],
  });
}

packageApp().catch(console.error);
