import { createDb } from "~~/lib/db/createDb";

export default defineNitroPlugin(async () => {
  if (!process.env.SESSION_SECRET) {
    console.error("Session Secret not set.");
    process.exit(1);
  }
  await createDb();
});
