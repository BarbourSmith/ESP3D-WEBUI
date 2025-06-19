import type { BunPlugin } from "bun";
import { platform } from "bun-utilities/os";

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

const limitedLanguage: BunPlugin = {
	name: "Limited Language Imports",
	setup(build) {
		const lang = build.config.define?.language || "en";
		console.info(`Limited language imports for:${lang}`)
		build.onLoad({ filter: /.*langutils\.js/i }, async ({ path, namespace, loader }) => {
			console.info(`Loading ${path} for 'limited language import' processing`);
			const decoder = new TextDecoder();
			const flBuff = await Bun.file(path).arrayBuffer();
			const flRep = await limitedLanguageImports(decoder.decode(flBuff), [lang]);
			return {
				contents: flRep,
				loader: "js",
			};
		});
	},
};

export default limitedLanguage;