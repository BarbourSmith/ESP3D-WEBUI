import type { BunPlugin } from "bun";

const loadHTML: BunPlugin = {
	name: "Load HTML",
	setup(build) {
		console.info("In setup");
		build.onLoad({ filter: /\.(html|htm)$/, namespace: "html" }, ({ path, namespace, loader }) => {
			console.info("here");
			console.info(`Got path:${path}, namespace:${namespace}, loader:${loader}`);
			return {
				contents: `export default ${JSON.stringify(process.env)}`,
				loader: "js",
			};
		});
	},
};

export default loadHTML;