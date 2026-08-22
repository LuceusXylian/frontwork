import { denoPlugins } from "jsr:@luca/esbuild-deno-loader@0.11.1";
import * as esbuild from "npm:esbuild@0.20.2";
import { EnvironmentStage, FrontworkInit } from './frontwork.ts';

async function find_project_file(names: string[]): Promise<string | undefined> {
    const cwd = Deno.cwd();
    for (const name of names) {
        const path = `${cwd}/${name}`;
        try {
            if ((await Deno.stat(path)).isFile) return path;
        } catch {
            continue;
        }
    }
    return undefined;
}



export async function frontwork_bundler(init: FrontworkInit, entryPoints: string[], distdir_js: string) {
    const is_dev = init.stage === EnvironmentStage.Development;

    await Deno.mkdir(distdir_js, { recursive: true });

    // Delete in outdir all files that end with ".js" or  ".js.map"
    for await (const entry of Deno.readDir(distdir_js)) {
        if (entry.isFile && (entry.name.endsWith(".js") || entry.name.endsWith(".js.map"))) {
            await Deno.remove(`${distdir_js}/${entry.name}`);
        }
    }

    const configPath = await find_project_file(["deno.jsonc", "deno.json"]);
    const lockPath = await find_project_file(["deno.lock"]);

    await esbuild.build({
        plugins: [...denoPlugins({ configPath, lockPath })],
        entryPoints: entryPoints,
        outdir: distdir_js,
        bundle: true,
        platform: "browser",
        splitting: init.module_splitting,
        format: init.module_splitting? "esm" : "iife",
        target: "esnext",
        minify: !is_dev,
        sourcemap: is_dev,
        treeShaking: true,
    });
    await esbuild.stop();
}