import { promises as fs } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const INDEX_PATH = resolve(__dirname, "../public/index.html");

let cachedHtml: string | null = null;

export default defineEventHandler(async (event) => {
  const method = event.node.req.method ?? "GET";
  if (method !== "GET" && method !== "HEAD") return;

  const { pathname } = getRequestURL(event);

  if (pathname.startsWith("/api") || pathname.startsWith("/_")) return;
  if (/\.[a-zA-Z0-9]{1,8}$/.test(pathname)) return;

  const accept = getRequestHeader(event, "accept") ?? "";
  if (!accept.includes("text/html")) return;

  try {
    const html =
      cachedHtml ?? (cachedHtml = await fs.readFile(INDEX_PATH, "utf8"));
    setResponseHeader(event, "Content-Type", "text/html; charset=utf-8");
    setResponseStatus(event, 200);
    return html;
  } catch (e) {
    console.error("Failed to serve index.html:", e);
    return;
  }
});
