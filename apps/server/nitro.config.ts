import nodeResolve from "@rollup/plugin-node-resolve";
import commonJs from "@rollup/plugin-commonjs";

//https://nitro.unjs.io/config
export default defineNitroConfig({
  srcDir: "server",
  compatibilityDate: "2025-02-22",

  serveStatic: "node",

  rollupConfig: {
    plugins: [
      nodeResolve({
        preferBuiltins: true,
      }),
      commonJs(),
    ],
  },

  routeRules: {
    "/**": {
      cors: true,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "*",
      },
    },
  },
});
