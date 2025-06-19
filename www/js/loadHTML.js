import { Common } from "./common.js";

const getHMTLIdsToLoad = (node, htmlElemIdsToLoad) => {
	if (node.nodeType !== Node.ELEMENT_NODE) {
		return;
	}
	for (const elem of node.getElementsByClassName("loadhtml")) {
		htmlElemIdsToLoad.push(elem.id);
	}
};

/** The `elemId` should equate to a correct path for the html file to be loaded */
const loadHTML = (elemId) => {
	fetch(elemId)
		.then((response) => response.text())
		.then((data) => {
			const origDiv = document.getElementById(elemId);
			origDiv.innerHTML = data;
			const newElems = origDiv.childNodes;
			const htmlElemIdsToLoad = [];
			while (newElems.length > 1) {
				getHMTLIdsToLoad(newElems[0], htmlElemIdsToLoad);
				origDiv.parentElement.insertBefore(newElems[0], origDiv);
			}
			if (newElems.length) {
				getHMTLIdsToLoad(newElems[0], htmlElemIdsToLoad);
				origDiv.parentNode.replaceChild(newElems[0], origDiv);
			}
			for (const elem_Id of htmlElemIdsToLoad) {
				loadHTML(elem_Id);
			}
			const common = new Common();
			common.loadedHTML.push(elemId);
		});
};

/** Load up the HTML identified via a div with the correct class replacing the div at its current location */
window.addEventListener("DOMContentLoaded", (event) => {
	const common = new Common();
	common.loadedHTML.push("In dev mode");
	const htmlToLoad = document.getElementsByClassName("loadhtml");
	for (const elem of htmlToLoad) {
		loadHTML(elem.id);
	}
});
