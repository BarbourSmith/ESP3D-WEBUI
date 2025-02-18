import type { BuildConfig } from "bun";
import { platform } from "bun-utilities/os";
import { readdir } from "node:fs/promises";
import path from "node:path";
import loadHTML from "./bun_loadhtml";
import limitedLanguage from "./bun_limitedLanguage";

const getOutDir = (config: BuildConfig) => ("outdir" in config && config.outdir) ? config.outdir : "./dist";
/** Get the full path of the index.html file in the output dir */
const getIndexPath = (config: BuildConfig) => path.join(import.meta.dir, getOutDir(config), "index.html");

const cleanDist = async (config: BuildConfig) => {
	const outdir = getOutDir(config);
	const fullOutDir = path.join(import.meta.dir, outdir);
	console.log(`Cleaning the output directory ${fullOutDir}`);
	const files = await readdir(fullOutDir, { recursive: true });
	for (const f of files.sort((a, b) => b.length - a.length)) {
		const ff = path.join(fullOutDir, f)
		try {
			await Bun.file(ff).delete();
		} catch (error) {
			console.warn(`Can't remove directories, such as ${ff} .... yet`);
		}
	}
};

const addBuildDate = (fileContents: string) => {
	const regex = /this\.web_ui_version\s*=\s*['"](?<uiversion>.*)['"]/;
	const subst = `this.web_ui_version="$<uiversion> (BuildDate: ${new Date().toUTCString()})"`;
	return fileContents.replace(regex, subst);
}

const build = async (config: BuildConfig) => {
	await Bun.build({
		entrypoints: ("entrypoints" in config && config.entrypoints) ? config.entrypoints : ["./www/index.html"],
		outdir: getOutDir(config),
		define: ("define" in config && config.define) ? config.define : { language: "en" },
		target: "browser",
		format: "esm",
		splitting: false,
		naming: "[dir]/[name].[ext]",
		minify: { whitespace: true, syntax: true, identifiers: false },
		plugins: [
			loadHTML,
			limitedLanguage,
		],
	});
};

const mergeInline = async (config: BuildConfig, contType: string, regexType: RegExp, tag: string) => {
	const indexInPath = getIndexPath(config);
	const indexFile = Bun.file(indexInPath);
	const decoder = new TextDecoder();
	const indexBuff = await indexFile.arrayBuffer();
	let indexContents = decoder.decode(indexBuff);
	const outputContents = [];

	console.log(`Merging ${contType} into ${indexInPath}`);
	const typeResults = [...indexContents.matchAll(regexType)];
	if (typeResults.length) {
		for (let jx = 0; jx < typeResults.length; jx++) {
			const tsr = typeResults[jx];
			const tPath = path.join(getOutDir(config), tsr[1]);
			const tFile = Bun.file(tPath);
			const tExists = await tFile.exists();
			if (tExists) {
				const tBuff = await tFile.arrayBuffer();
				const tText = decoder.decode(tBuff);
				const splitContents = indexContents.split(tsr[0]);
				outputContents.push(splitContents[0]);
				outputContents.push(`<${tag}>`);
				outputContents.push(tText);
				outputContents.push(`</${tag}>`);
				outputContents.push(splitContents[1]);
				indexContents = splitContents[1];
			}
		}
	} else {
		outputContents.push(indexContents);
		console.warn(`Did not find a ${contType} link in ${indexInPath} . This was unexpected.`);
	}

	await Bun.write(indexInPath, outputContents.join("\n"));
}

/** One final replacement to effectively merge all the css and js together in the html */
const mergeInlineScript = async (config: BuildConfig) => {
	await mergeInline(config, "CSS", /\<link\s+rel\s*=\s*['"]stylesheet['"].*href\s*=\s*['"](?<cssFile>.*?)['"](\/)?\>/igm, "style");
	await mergeInline(config, "JS", /<script\s+type\s*=\s*['"]module['"].*src\s*=\s*['"](?<jsFile>.*)['"]><\/script>/igm, "script");
}

const compress = async (config: BuildConfig) => {
	const indexInPath = getIndexPath(config);
	const indexOutPath = `${indexInPath}.gz`;
	const indexFile = Bun.file(indexInPath);
	const data = await indexFile.arrayBuffer();
	const compressed = Bun.gzipSync(data, { level: 9 });
	Bun.write(indexOutPath, compressed);
};

console.log("Running the build");
const baseConfig: BuildConfig = { entrypoints: ["./www/index.html"], outdir: "./dist", define: { language: "en" } };
await cleanDist(baseConfig);
await build(baseConfig);
await mergeInlineScript(baseConfig);
await compress(baseConfig);
