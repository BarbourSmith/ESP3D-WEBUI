import index from "./www/index.html" with { type: "text/html" };

import EEPROMFake from "./EEPROMDummyResponse.json" with { type: "json" };

const server = Bun.serve({
	port: 3000,
	// Add HTML imports to `static`
	static: {
		"/index.html": index,
		"/index.html#": index,

		"/favicon.ico": new Response(await Bun.file("./favicon.ico").bytes(), {
			headers: { "Content-Type": "image/x-icon" },
		}),
	},
	// Enable development mode for:
	// - Detailed error messages
	// - Rebuild on request
	development: true,
	async fetch(req) {
		const url = new URL(req.url);

		const fileExists = async (path: string) => {
			const checkFile = Bun.file(path);
			return (await checkFile.exists()) ? await checkFile.bytes() : null;
		};

		const sendFile = async (path: string, contentType = "text/plain") => {
			const checkFile = await fileExists(path);
			if (checkFile) {
				return new Response(checkFile, { headers: { "Content-Type": contentType } });
			}
			const errText = `404 requesting '${url.pathname}' translated to '${path}`;
			console.error(errText);
			// Note that the following statusText is unlikely to show up in the browser's dev/debug window
			return new Response(null, { status: 404, statusText: errText });
		};

		if (url.pathname === "/command") {
			// Set up some dummy responses for local testing

			const searchParams = url.searchParams;
			const plain = searchParams.get("plain");
			const commandText = searchParams.get("commandText");

			if (plain) {
				switch (plain) {
					case "[ESP800]": {
						const body =
							"FW version: FakeFluidNC v0.654 # FW target:grbl-embedded  # FW HW:Direct SD  # primary sd:/sd # secondary sd:none  # authentication:no # webcommunication: Sync: 81:192.168.1.100 # hostname:maslow # axis:3";
						return new Response(body, { status: 200 });
					}
					case "[ESP400]": {
						const body = JSON.stringify(EEPROMFake);
						return new Response(body, { status: 200 });
					}
					default:
						console.info(url);
						break;
				}
			}
			if (commandText) {
				switch (commandText) {
					case "$Report/Interval=50": {
						const body = "Error";
						return new Response(body, { status: 200 });
					}
					case "[ESP200]":
						console.info("[ESP200]: Checking if previously sent file uploaded");
						return new Response("", { status: 200 });
					default:
						console.info(`Command: ${commandText}`);
						return new Response("", { status: 200 });
				}
			}
		}

		if (url.pathname === "/upload") {
			// Something file related - SD storage
			const searchParams = url.searchParams;
			const path = searchParams.get("path");

			if (req.method === "GET") {
				const dummyFileList = {
					"files": [
						{ "name": "CoasterHolesPartBoard-gcc.nc", "shortname": "CoasterHolesPartBoard-gcc.nc", "size": "3515", "datetime": "" },
						{ "name": "CoasterHolesFullBoard.nc", "shortname": "CoasterHolesFullBoard.nc", "size": "52622", "datetime": "" }
					], "path": "", "total": "119.00 MB", "used": "57.00 KB", "occupation": "0", "status": "Ok"
				};
				return new Response(JSON.stringify(dummyFileList), { status: 200, headers: { "Content-Type": "application/json" } });
			}
			console.log(req);
			return new Response("", { status: 200 });
		}

		if (url.pathname === "/files") {
			// Something file related - regular storage
			const searchParams = url.searchParams;
			const action = searchParams.get("action");
			const path = searchParams.get("path");

			if (action === "list") {
				const dummyFileList = {
					"files": [
						{ "name": "config-bak.yaml", "shortname": "config-bak.yaml", "size": "3585", "datetime": "" },
						{ "name": "favicon.ico", "shortname": "favicon.ico", "size": "1150", "datetime": "" },
						{ "name": "index.html.gz", "shortname": "index.html.gz", "size": "113340", "datetime": "" },
						{ "name": "maslow.yaml", "shortname": "maslow.yaml", "size": "3546", "datetime": "" }
					],
					"path": "", "total": "192.00 KB", "used": "132.00 KB", "occupation": "68", "status": "Ok"
				};
				return new Response(JSON.stringify(dummyFileList), { status: 200, headers: { "Content-Type": "application/json" } });
			}
		}

		const checkFileBase = `./www${url.pathname}`;

		// Handle the special files
		if (checkFileBase.endsWith("langUtils.js")) {
			// The language utilities JS file, that brings all the translated languages together
			// We'll be adding all of the required imports to this, for it to have all languages

			const checkFile = Bun.file(checkFileBase);
			if (await checkFile.exists()) {
				const langUtilsFile = [];
				/** This should correspiond exactly with `language_list in `langUtils.js` */
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
					langUtilsFile.push(`import ${lang[1]} from "./language/${lang[0]}.json" with {type: "json"};`);
				}
				// Add in the original file
				langUtilsFile.push(await checkFile.text());
				return new Response(langUtilsFile.join("\n"), { headers: { "Content-Type": "text/javascript" } });
			}
		}

		if (checkFileBase.endsWith(".svg")) {
			console.debug(`Want SVG at '${checkFileBase}`);
			return sendFile(checkFileBase, "text/svg+xml");
		}

		// Handle the regular file and mime types to send
		const regSendFiles = {
			".html": "text/html",
			".js": "text/javascript",
			".json": "application/json",
			".css": "text/css",
		};
		for (const [fileExt, mimeType] of Object.entries(regSendFiles)) {
			if (checkFileBase.endsWith(fileExt)) {
				return sendFile(checkFileBase, mimeType);
			}
		}

		if (checkFileBase.includes("/js/")) {
			let checkFileName = `${checkFileBase}.js`;
			let checkFile = await fileExists(checkFileName);
			if (!checkFile) {
				checkFileName = `${checkFileBase}.ts`;
				checkFile = await fileExists(checkFileName);
			}
			if (checkFile) {
				return new Response(checkFile, { headers: { "Content-Type": "text/javascript" } });
			}
		}
		return new Response(null, { status: 404, statusText: `404 for your '${url.pathname}' request` });
	},
});

// FW version: FluidNC v0.87 (Maslow-Main-ec171155-dirty) # FW target:grbl-embedded  # FW HW:Direct SD  # primary sd:/sd # secondary sd:none  # authentication:no # webcommunication: Sync: 81:192.168.1.100 # hostname:maslow # axis:3

console.log(`Listening on ${server.url} ...`);
