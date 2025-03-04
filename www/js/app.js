import {
	connectdlg,
	displayNone,
	id,
	ControlsPanel,
	navbar,
	tabletInit,
} from "./common.js";

let failSafe = 10;

function loadApp() {
	console.log("Connect to board");

	const startUp = {
		connect: { msg: "", fldId: "connectdlg.html", errMsg: "Error loading connect dialog:" },
		controls: { msg: "", fldId: "controlPanel", errMsg: "Error loading controls panel:" },
		navBar: { msg: "", fldId: "navbar", errMsg: "Error loading navigation bar:" },
		tabletTab: { msg: "", fldId: "tablettab", errMsg: "Error loading tablet tab:" }
	};

	const doPanelStartUp = (panel) => {
		if (panel.msg || !id(panel.fldId) || typeof panel.fn !== "function") {
			return;
		}

		//to check if javascript is disabled like in android preview
		displayNone("loadingmsg");

		panel.msg = "loading";
		try {
			panel.fn(true);
			panel.msg = "loaded";
		} catch (err) {
			console.error(panel.errMsg, err);
			panel.msg = "failed";
		}
	}

	let startUpInt = setInterval(() => {
		// Because things might not be fully resolved yet, we define the function references in here
		try {
			startUp.connect.fn = connectdlg;
			startUp.controls.fn = ControlsPanel;
			startUp.navBar.fn = navbar;
			startUp.tabletTab.fn = tabletInit;
		} catch (error) {
			console.warn("Error setting up function references:", error);
			// Ensure that we always break out of this
			failSafe--;
			return;
		}


		// Check for various key HTML panels and load them up
		doPanelStartUp(startUp.connect);
		doPanelStartUp(startUp.controls);
		doPanelStartUp(startUp.navBar);
		doPanelStartUp(startUp.tabletTab);

		if ((startUp.connect.msg && startUp.controls.msg && startUp.navBar.msg && startUp.tabletTab.msg) || failSafe <= 0) {
			clearInterval(startUpInt);
			startUpInt = null;
		}

		// Ensure that we always break out of this
		failSafe--;
	}, 500,);
}

window.addEventListener("load", (event) => {
	// Wait half a second before firing up
	setTimeout(() => { loadApp(); }, 1000);
});