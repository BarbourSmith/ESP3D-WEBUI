// import conErr, displayBlock, displayInline, displayNone, id, closeModal, setactiveModal, showModal, SendGetHttp, logindlg, EventListenerSetup, startSocket,

// Connection state to prevent multiple concurrent connection attempts
let connectionInProgress = false;

/** Connect Dialog */
const connectdlg = (getFw = false) => {
	// Prevent multiple concurrent connection attempts
	if (connectionInProgress && getFw) {
		console.log("Connection already in progress, skipping duplicate attempt");
		return;
	}

	const modal = setactiveModal("connectdlg.html");
	if (modal == null) {
		return;
	}

	showModal();

	if (getFw) {
		connectionInProgress = true;
		retryconnect();
	}
};

const getFWdata = (response) => {
	const tlist = response.split("#");
	//FW version:0.9.200 # FW target:smoothieware # FW HW:Direct SD # primary sd:/ext/ # secondary sd:/sd/ # authentication: yes
	if (tlist.length < 3) {
		return false;
	}
	//FW version
	let sublist = tlist[0].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	fw_version = sublist[1].toLowerCase().trim();
	//FW target
	sublist = tlist[1].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	target_firmware = sublist[1].toLowerCase().trim();
	//FW HW
	sublist = tlist[2].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	const sddirect = sublist[1].toLowerCase().trim();
	direct_sd = sddirect === "direct sd";
	//primary sd
	sublist = tlist[3].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	primary_sd = sublist[1].toLowerCase().trim();

	//secondary sd
	sublist = tlist[4].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	secondary_sd = sublist[1].toLowerCase().trim();

	//authentication
	sublist = tlist[5].split(":");
	if (sublist.length !== 2) {
		return false;
	}
	ESP3D_authentication = sublist[0].trim() === "authentication" && sublist[1].trim() === "yes";
	//async communications
	if (tlist.length > 6) {
		sublist = tlist[6].split(":");
		if (
			sublist[0].trim() === "webcommunication" &&
			sublist[1].trim() === "Async"
		) {
			async_webcommunication = true;
		} else {
			async_webcommunication = false;
			websocket_port = sublist[2].trim();
			if (sublist.length > 3) {
				websocket_ip = sublist[3].trim();
			} else {
				console.log("No IP for websocket, use default");
				websocket_ip = document.location.hostname;
			}
		}
	}
	if (tlist.length > 7) {
		sublist = tlist[7].split(":");
		if (sublist[0].trim() === "hostname") esp_hostname = sublist[1].trim();
	}

	if (tlist.length > 8) {
		sublist = tlist[8].split(":");
		if (sublist[0].trim() === "axis") {
			grblaxis = Number.parseInt(sublist[1].trim());
		}
	}

	EventListenerSetup();
	startSocket();

	return true;
};

const connectfailed = (error_code, response) => {
	connectionInProgress = false; // Clear connection state on failure
	displayBlock("connectbtn");
	displayBlock("failed_connect_msg");
	displayNone("connecting_msg");

	id("connectbtn").addEventListener("click", retryconnect);

	conErr(error_code, response, "FW identification error");
};

const connectsuccess = (response) => {
	connectionInProgress = false; // Clear connection state on success
	if (getFWdata(response)) {
		console.log(`FW identification:${response}`);
		// Check version compatibility after successful firmware identification
		checkVersionCompatibility();
		if (ESP3D_authentication) {
			closeModal("Connection successful");
			displayInline("menu_authentication");
			logindlg(initUI, true);
		} else {
			displayNone("menu_authentication");
			initUI();
		}
	} else {
		console.log(response);
		connectfailed(406, "Wrong data");
	}
};

const retryconnect = () => {
	connectionInProgress = true; // Set connection state when retrying
	displayNone("connectbtn");
	displayNone("failed_connect_msg");
	displayBlock("connecting_msg");

	id("connectbtn").removeEventListener("click", retryconnect);

	const cmd = buildHttpCommandCmd(httpCmdType.plain, "[ESP800]");
	SendGetHttp(cmd, connectsuccess, connectfailed);
};

// Helper function to force close connection dialog if it's stuck
const forceCloseConnectionDialog = () => {
	const connectModal = id("connectdlg.html");
	if (connectModal && connectModal.style.display !== "none") {
		console.log("Force closing stuck connection dialog");
		closeModal("Force closed");
	}
	connectionInProgress = false;
};

// Handle visibility change to fix stuck connection dialog when tab doesn't have focus
const handleVisibilityChange = () => {
	// Only act when tab becomes visible again
	if (!document.hidden) {
		// Small delay to allow any pending operations to complete
		setTimeout(() => {
			const connectModal = id("connectdlg.html");
			// Check if connection dialog is still showing but connection is no longer in progress
			// and main UI is already loaded (indicating successful connection)
			if (connectModal && 
				connectModal.style.display !== "none" && 
				!connectionInProgress && 
				id("main_ui") && 
				!id("main_ui").classList.contains("hide_it")) {
				console.log("Tab regained focus - force closing stuck connection dialog");
				forceCloseConnectionDialog();
			}
		}, 100);
	}
};

// Set up the visibility change listener when the page loads
if (typeof document !== "undefined") {
	document.addEventListener("visibilitychange", handleVisibilityChange);
}

/** 
 * Check compatibility between firmware version and WebUI version
 * Shows warning popup if versions appear incompatible
 */
const checkVersionCompatibility = () => {
	// Skip check if either version is not available
	if (!fw_version || !web_ui_version || fw_version === "" || web_ui_version === "") {
		console.log("Version compatibility check skipped: missing version information");
		return;
	}

	// Extract git describe format versions for comparison
	const fwGitVersion = extractGitDescribeVersion(fw_version);
	const uiGitVersion = extractGitDescribeVersion(web_ui_version);
	
	console.log(`Checking version compatibility: FW=${fwGitVersion}, UI=${uiGitVersion}`);
	
	// Add version check info to serial messages log
	if (typeof addMessage === 'function') {
		addMessage(`Version Check: FW=${fwGitVersion}, UI=${uiGitVersion}`, true, false);
	}
	
	// Check if version warnings are suppressed
	const suppressedVersions = getVersionSuppressionPreference();
	if (suppressedVersions) {
		if (suppressedVersions === "do_not_alert") {
			console.log("Version warnings are permanently disabled");
			if (typeof addMessage === 'function') {
				addMessage(`Version warnings are disabled by user preference`, true, false);
			}
			return;
		}
		
		// Check if we're still on the same versions that were suppressed
		if (suppressedVersions.fw === fwGitVersion && suppressedVersions.ui === uiGitVersion) {
			console.log("Version warning suppressed for these versions");
			if (typeof addMessage === 'function') {
				addMessage(`Version warning suppressed until next release`, true, false);
			}
			return;
		}
	}
	
	// Check if versions are compatible
	if (!areGitVersionsCompatible(fwGitVersion, uiGitVersion)) {
		const warningTitle = "Version Compatibility Warning";
		const warningMessage = `<p><strong>Firmware and WebUI versions may not be compatible:</strong></p>
			<p>• Firmware version: <code>${fwGitVersion}</code></p>
			<p>• WebUI version: <code>${uiGitVersion}</code></p>
			<p><br/>This may cause unexpected behavior or missing features. Consider updating to matching versions.</p>`;
		
		// Add warning to serial messages log
		if (typeof addMessage === 'function') {
			addMessage(`WARNING: Version mismatch detected! FW: ${fwGitVersion} vs UI: ${uiGitVersion}`, true, false);
		}
		
		// Show warning dialog with a longer delay to ensure UI initialization is complete
		// and any existing modals are closed
		setTimeout(() => {
			// Force close any existing modals first
			const activeModal = getactiveModal ? getactiveModal() : null;
			if (activeModal) {
				closeModal("Version check - closing previous modal");
			}
			
			// Then show the version warning with custom buttons
			showVersionWarningDialog(warningTitle, warningMessage, fwGitVersion, uiGitVersion);
		}, 3000); // 3 second delay to allow full UI initialization
		
		console.warn("Version compatibility warning shown:", { fwGitVersion, uiGitVersion });
	} else {
		console.log("Version compatibility check passed");
		// Add success message to serial log
		if (typeof addMessage === 'function') {
			addMessage(`Version compatibility check PASSED`, true, false);
		}
	}
};

/**
 * Extract git describe version from firmware or UI version string
 * Examples:
 *   - "FluidNC v3.6.7 (Devt-5692a7c1-dirty)" -> "v3.6.7-devt-5692a7c1-dirty"
 *   - "github.com/BarbourSmith/ESP3D-WEBUI@v1.14-1-g472d4ea" -> "v1.14-1-g472d4ea"
 *   - "v1.14-6-g7fe778c0" -> "v1.14-6-g7fe778c0"
 */
const extractGitDescribeVersion = (versionString) => {
	if (!versionString) return "";
	
	const version = versionString.trim();
	
	// Check for github.com format: github.com/BarbourSmith/ESP3D-WEBUI@v1.14-1-g472d4ea
	const githubMatch = version.match(/github\.com\/[^@]+@(.+)$/);
	if (githubMatch) {
		return githubMatch[1];
	}
	
	// Check for FluidNC format: FluidNC v3.6.7 (Devt-5692a7c1-dirty)
	// Convert to git describe format: v3.6.7-devt-5692a7c1-dirty
	const fluidncMatch = version.match(/FluidNC\s+v?([\d.]+)\s*\(([\w-]+)\)/i);
	if (fluidncMatch) {
		return `v${fluidncMatch[1]}-${fluidncMatch[2].toLowerCase()}`;
	}
	
	// Check for FluidNC format without parentheses: FluidNC v3.6.7
	const fluidncSimpleMatch = version.match(/FluidNC\s+v?([\d.]+)/i);
	if (fluidncSimpleMatch) {
		return `v${fluidncSimpleMatch[1]}`;
	}
	
	// Otherwise assume it's already in git describe format
	return version;
};

/**
 * Determine if two git describe versions are compatible
 * Compatible only if they are exactly the same
 */
const areGitVersionsCompatible = (fwVersion, uiVersion) => {
	if (!fwVersion || !uiVersion) {
		return true; // If we can't extract versions, don't show warning
	}
	
	// Only exact match is compatible
	// v1.14 and v1.14-2-gabcd123 are NOT compatible (release vs development)
	// v1.14-2-gabcd123 and v1.14-3-gdef4567 are NOT compatible (different commits)
	return fwVersion === uiVersion;
};

/**
 * Get version suppression preference from preferenceslist
 * Returns either "do_not_alert" or an object with {fw, ui} versions, or null
 */
const getVersionSuppressionPreference = () => {
	if (!preferenceslist || !preferenceslist[0]) {
		return null;
	}
	
	const suppressed = preferenceslist[0].suppress_version_warning;
	if (!suppressed) {
		return null;
	}
	
	if (suppressed === "do_not_alert") {
		return "do_not_alert";
	}
	
	try {
		return JSON.parse(suppressed);
	} catch (e) {
		console.error("Failed to parse suppressed version:", e);
		return null;
	}
};

/**
 * Save version suppression preference to preferenceslist and file
 */
const saveVersionSuppressionPreference = (value) => {
	if (!preferenceslist || !preferenceslist[0]) {
		console.error("Cannot save version suppression: preferences not loaded");
		return;
	}
	
	if (value === "do_not_alert") {
		preferenceslist[0].suppress_version_warning = "do_not_alert";
	} else if (value && value.fw && value.ui) {
		preferenceslist[0].suppress_version_warning = JSON.stringify(value);
	} else {
		delete preferenceslist[0].suppress_version_warning;
	}
	
	// Save preferences to file
	SavePreferences(true);
};

/**
 * Show version warning dialog with custom buttons
 */
const showVersionWarningDialog = (title, message, fwVersion, uiVersion) => {
	const modal = setactiveModal("alertdlg.html");
	if (modal === null) {
		return;
	}

	const titleElem = modal.element.getElementsByClassName("modal-title")[0];
	const bodyElem = modal.element.getElementsByClassName("modal-text")[0];
	const footer = modal.element.getElementsByClassName("modal-footer")[0];
	
	titleElem.innerHTML = title;
	bodyElem.innerHTML = message;
	
	// Replace footer with custom buttons
	footer.innerHTML = `
		<button id="versionWarnDismiss" class="btn btn-default">Dismiss</button>
		<button id="versionWarnSuppress" class="btn btn-warning">Don't warn until next release</button>
	`;
	
	// Set up event listeners
	id("versionWarnDismiss").addEventListener("click", () => {
		closeModal("dismiss");
	});
	
	id("versionWarnSuppress").addEventListener("click", () => {
		saveVersionSuppressionPreference({ fw: fwVersion, ui: uiVersion });
		console.log("Version warning suppressed for:", { fw: fwVersion, ui: uiVersion });
		if (typeof addMessage === 'function') {
			addMessage(`Version warning suppressed until next release`, true, false);
		}
		closeModal("suppress");
	});
	
	// Also handle the X button
	const closeBtn = id("cancelAlertDlg");
	if (closeBtn) {
		closeBtn.addEventListener("click", () => {
			closeModal("cancel");
		});
	}
	
	showModal();
};
