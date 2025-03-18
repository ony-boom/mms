import { createDb } from "~~/lib/createDb";

export default defineNitroPlugin(async () => {
  await createDb();
});
