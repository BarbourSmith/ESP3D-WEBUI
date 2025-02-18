import loadHTML from "./bun_loadhtml";
import { platform } from "bun-utilities/os";
import { minifySync } from "@swc/html";

const cleanDist = () => {
	console.log("No file delete function in bun yet. So no `cleanDist`");

	console.log(Bun.env.npm_lifecycle_script);
	console.log(import.meta.dir);
};

const pathDiv = (path: string) => path.replaceAll("\\", platform() !== "windows" ? "/" : "\\\\");

const limitedLanguageImports = async (fileContents: string, inclLang: string[] = ["en"]) => {
	const langUtilsFile = [];
	/** This should correspond exactly with `language_list in `langUtils.js` */
	const language_list = [
		["de", "germantrans"],
		["en", "englishtrans"],
		["es", "spanishtrans"],
		["fr", "frenchtrans"],
		["it", "italiantrans"],
		["ja", "japanesetrans"],
		["hu", "hungariantrans"],
		["pl", "polishtrans"],
		["ptbr", "ptbrtrans"],
		["ru", "russiantrans"],
		["tr", "turkishtrans"],
		["uk", "ukrtrans"],
		["zh_CN", "zh_CN_trans"],
	];
	for (let ix = 0; ix < language_list.length; ix++) {
		const lang = language_list[ix];
		if (inclLang.includes(lang[0])) {
			const absPath = pathDiv(`${import.meta.dir}\\www\\js\\language\\${lang[0]}.json`);
			langUtilsFile.push(`import ${lang[1]} from "${absPath}" with {type: "json"};`);
		}
	}
	// Add in the original file
	langUtilsFile.push(fileContents);

	return langUtilsFile.join("\n");
};

/** Change all import filepaths to their absolute version */
const absolutifyImports = async (fileContents: string) => {
	const regexImp = /}\s*from\s*['"](?<imppath>.*)['"]\;/gm;
	const impResults = [...fileContents.matchAll(regexImp)];
	if (!impResults.length) {
		// Leave the file as-is - and move on
		return fileContents;
	}

	let fcAbsImp = fileContents;
	const repPath = `${import.meta.dir}\\www\\js\\`;
	for (let ix = 0; ix < impResults.length; ix++) {
		const ir = impResults[ix];
		const impFilePath = pathDiv(ir[1].replace("./", repPath));
		fcAbsImp = fcAbsImp.replace(ir[1], impFilePath);
		console.log(`Replaced '${ir[1]}' with '${impFilePath}'`);
	}
	return fcAbsImp;
};

const addBuildDate = (fileContents: string) => {
	const regex = /this\.web_ui_version\s*=\s*['"](?<uiversion>.*)['"]/;
	const subst = `this.web_ui_version="$<uiversion> (BuildDate: ${new Date().toUTCString()})"`;
	return fileContents.replace(regex, subst);
}

/** Strip all import filepaths on the assumption that they are already imported */
const stripImports = async (fileContents: string) => {
	const regexImp = /^import\s*{(.|\s)*?}\s*from\s*['"].*['"]\;/gm;
	const impResults = [...fileContents.matchAll(regexImp)];
	if (!impResults.length) {
		// Leave the file as-is - and move on
		return fileContents;
	}

	let fcImp = fileContents;
	for (let ix = 0; ix < impResults.length; ix++) {
		const ir = impResults[ix];
		fcImp = fcImp.replace(ir[0], "");
	}
	return fcImp;
};

			// 			switch (jsFile) {
			// 				case "loadHTML.js":
			// 					console.warn(
			// 						`Skipping processing of JS/TS file '${file.path}'. This file is only used when doing debug runs.`,
			// 					);
			// 					break;
			// 				case "langUtils.js": {
			// 					const fcLang = await limitedLanguageImports(await file.content);
			// 					processor.writeFile(file.path, fcLang);
			// 					break;
			// 				}
			// 				case "common.js": {
			// 					const fcAbsImp = await absolutifyImports(await file.content);
			// 					processor.writeFile(file.path, addBuildDate(fcAbsImp));
			// 					break;
			// 				}
			// 				case "app.js": {
			// 					const fcImp = await stripImports(await file.content);
			// 					processor.writeFile(file.path, fcImp);
			// 					break;
			// 				}
			// 			}

const build = async () => {
	await Bun.build({
		entrypoints: ["./www/index.html", "./www/js/app.js"],
		outdir: "./dist",
		target: "browser",
		format: "esm",
		splitting: false,
		naming: "[dir]/[name].[ext]",
		minify: { whitespace: true, syntax: true, identifiers: false },
		plugins: [
			loadHTML,
		],
	});
};

/** One final replacement to effectively merge common.js and app.js together in the html */
const mergeInlineScript = async () => {
	const indexFile = Bun.file("./dist/index.html");
	const data = (await indexFile.text()).replace('</script><script type="module">window.onload', ";window.onload");
	// Keep a record of our changes
	Bun.write("./dist/index.html", data);
}

const compress = async () => {
	const indexFile = Bun.file("./dist/index.html");
	const data = await indexFile.arrayBuffer();
	// const { code, map } = minifySync(data, {
	// 		// filename?: string;
	// 		// iframeSrcdoc?: boolean;
	// 		scriptingEnabled: true,
	// 		// forceSetHtml5Doctype?: boolean;
	// 		collapseWhitespaces: "all",
	// 		removeEmptyMetadataElements: true,
	// 		removeComments: true,
	// 		// preserveComments?: string[],
	// 		minifyConditionalComments: true,
	// 		removeEmptyAttributes: true,
	// 		removeRedundantAttributes: "all",
	// 		collapseBooleanAttributes: true,
	// 		normalizeAttributes: true,
	// 		minifyJson: true,
	// 		// TODO improve me after typing `@swc/css`
	// 		minifyJs: true,
	// 		minifyCss: true,
	// 		// minifyAdditionalScriptsContent?: [string, MinifierType][];
	// 		// minifyAdditionalAttributes?: [string, MinifierType][];
	// 		// sortSpaceSeparatedAttributeValues?: boolean;
	// 		// // sortAttributes?: boolean;
	// 		// tagOmission?: boolean;
	// 		// selfClosingVoidElements?: boolean;
	// 		// quotes?: boolean;
	// });
	const compressed = Bun.gzipSync(data, { level: 9 });
	Bun.write("./dist/index.html.gz", compressed);
};

console.log("Running the build");
cleanDist();
await build();
await mergeInlineScript();
await compress();
