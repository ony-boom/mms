import { build } from "./build";

async function packageApp() {
  await build();
}

packageApp().catch(console.error);
