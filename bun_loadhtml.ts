import type { BunPlugin } from "bun";

const loadAndReplaceSVG = async (hText: string, childFilePath: string, spaces = "  ") => {
	let svgCheckText = hText;

	const regexSVG = /\<img\s+src\s*=\s*['"](?<svgpath>.*\.svg)['"].*><\/img>/gim;
	const findSVGResults = [...svgCheckText.matchAll(regexSVG)];
	if (!findSVGResults.length) {
		return svgCheckText;
	}

	console.info(`${spaces}Found SVGs in ${childFilePath}`);
	for (let jx = 0; jx < findSVGResults.length; jx++) {
		const svr = findSVGResults[jx];
		const svgPath = svr[1].replace("../images/", "./www/images/");
		const svgFile = Bun.file(svgPath);
		const svgExists = await svgFile.exists();
		if (svgExists) {
			const decoder = new TextDecoder();
			const svgBuff = await svgFile.arrayBuffer();
			svgCheckText = svgCheckText.replace(svr[0], decoder.decode(svgBuff));
		}
	}

	return svgCheckText;
}

const loadAndReplaceHTML = async (filePath: string, fileContents: string, spaces = "  ") => {
	const fcLower = fileContents.toLowerCase();
	const hasLoadHTML = fcLower.includes("loadhtml");
	const hasSVG = fcLower.includes(".svg");
	if (!hasLoadHTML && !hasSVG) {
		// Leave the file as-is - and move on
		// console.log(`${spaces}No 'loadhtml' or '.svg' in '${filePath}'`);
		return fileContents;
	}

	let fcProcessed = fileContents;

	if (hasLoadHTML) {
		// console.log(`${spaces}Processing '${filePath}' for included HTML files`);
		// Remove the script that does the html loading - we won't need it after bundling
		const regexScript = /\<script.*loadhtml.*>\<\/script>/gim;
		const fcNoLoad = fileContents.replace(regexScript, "");

		// Now find all of the places where the above script was used
		const regexHTML = /\<div\s+id\s*=\s*['"](?<htmlpath>.*\.html)['"]\s*class.*loadhtml.*><\/div>/gm;
		const loadHTMLResults = [...fcNoLoad.matchAll(regexHTML)];
		if (!loadHTMLResults.length) {
			// Leave the file as-is-ish - and move on
			return fcNoLoad;
		}

		// Finally replace the original `div` with the actual file
		const decoder = new TextDecoder();
		let fcReplLoad = fcNoLoad;
		for (let ix = 0; ix < loadHTMLResults.length; ix++) {
			const lhr = loadHTMLResults[ix];
			const childFilePath = lhr[1].replace("./sub/", "./www/sub/");
			// console.info(`${spaces}Processing included HTML ${childFilePath}`);
			const hFile = Bun.file(childFilePath);
			const hBuff = await hFile.arrayBuffer();
			const hText = await loadAndReplaceSVG(decoder.decode(hBuff), childFilePath, `${spaces}  `);
			fcReplLoad = fcReplLoad.replace(lhr[0], hText);

			if (hText.includes("loadhtml")) {
				fcReplLoad = await loadAndReplaceHTML(childFilePath, fcReplLoad, `${spaces}  `);
			}
		}

		fcProcessed = fcReplLoad;
	}

	return fcProcessed;
};

const loadHTML: BunPlugin = {
	name: "Load HTML",
	setup(build) {
		build.onLoad({ filter: /\.(html|htm)$/ }, async ({ path }) => {
			const decoder = new TextDecoder();
			console.info(`Loading ${path} for 'load HTML' processing`);
			const fcBuff = await Bun.file(path).arrayBuffer();
			const fcRep = await loadAndReplaceHTML(path, decoder.decode(fcBuff));
			return {
				contents: fcRep,
				loader: "html",
			};
		});
	},
};

export default loadHTML;