import { createDb } from "~~/lib/db/createDb";

export default defineNitroPlugin(async () => {
  await createDb();
});
