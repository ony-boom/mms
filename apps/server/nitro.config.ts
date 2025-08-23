//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-02-22",
  serveStatic: "node",
  routeRules: {
    "/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin":
          process.env.NODE_ENV === "development" ? "http://localhost:5173" : "", // Specific origin instead of "*"
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization", // Be more specific
        "Access-Control-Allow-Credentials": "true", // Add this for credentials
      },
    },
  },
});
