import * as esbuild from "https://deno.land/x/esbuild@v0.20.1/mod.js";
import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.9";

esbuild.build({
  plugins: [...denoPlugins()],
  entryPoints: ["src/main.client.ts"],
  outfile: "dist/development-web/main.client.js",
  bundle: true,
  platform: "browser",
  format: "esm",
  target: "esnext",
  minify: true,
  sourcemap: false,
  treeShaking: true,
});
await esbuild.stop();