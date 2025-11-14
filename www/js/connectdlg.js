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
	// Skip check if feature is disabled in preferences
	if (preferenceslist && preferenceslist[0] && preferenceslist[0].enable_version_check !== 'true') {
		console.log("Version compatibility check disabled in preferences");
		return;
	}
	
	// Skip check if either version is not available
	if (!fw_version || !web_ui_version || fw_version === "" || web_ui_version === "") {
		console.log("Version compatibility check skipped: missing version information");
		return;
	}

	// Extract version information for comparison
	const fwVersionInfo = extractVersionInfo(fw_version);
	const uiVersionInfo = extractVersionInfo(web_ui_version);
	
	console.log(`Checking version compatibility: FW=${fw_version}, UI=${web_ui_version}`);
	
	// Add version check info to serial messages log
	if (typeof addMessage === 'function') {
		addMessage(`Version Check: FW=${fw_version}, UI=${web_ui_version}`, true, false);
	}
	
	// Check if versions are compatible
	if (!areVersionsCompatible(fwVersionInfo, uiVersionInfo)) {
		const warningTitle = "Version Compatibility Warning";
		const warningMessage = `<p><strong>Firmware and WebUI versions may not be compatible:</strong></p>
			<p>• Firmware version: <code>${fw_version}</code></p>
			<p>• WebUI version: <code>${web_ui_version}</code></p>
			<p><br/>This may cause unexpected behavior or missing features. Consider updating to matching versions.</p>`;
		
		// Add warning to serial messages log
		if (typeof addMessage === 'function') {
			addMessage(`WARNING: Version mismatch detected! FW: ${fw_version} vs UI: ${web_ui_version}`, true, false);
		}
		
		// Show warning dialog with a longer delay to ensure UI initialization is complete
		// and any existing modals are closed
		setTimeout(() => {
			// Force close any existing modals first
			const activeModal = getactiveModal ? getactiveModal() : null;
			if (activeModal) {
				closeModal("Version check - closing previous modal");
			}
			
			// Then show the version warning
			alertdlg(warningTitle, warningMessage);
		}, 3000); // 3 second delay to allow full UI initialization
		
		console.warn("Version compatibility warning shown:", { fw_version, web_ui_version });
	} else {
		console.log("Version compatibility check passed");
		// Add success message to serial log
		if (typeof addMessage === 'function') {
			addMessage(`Version compatibility check PASSED`, true, false);
		}
	}
};

/**
 * Extract version information from version string
 * Handles various version formats (semantic versioning, git hashes, etc.)
 */
const extractVersionInfo = (versionString) => {
	if (!versionString) return { type: "unknown", version: "" };
	
	const version = versionString.toLowerCase().trim();
	
	// Check for git hash pattern (github.com/repo@hash) first, as it's most specific
	const gitHashMatch = version.match(/github\.com\/[^@]+@([a-f0-9]+)/);
	if (gitHashMatch) {
		return {
			type: "git",
			hash: gitHashMatch[1],
			full: version
		};
	}
	
	// Check for simple git hash (7+ hex characters) - in firmware or elsewhere
	const simpleHashMatch = version.match(/[a-f0-9]{7,}/);
	if (simpleHashMatch) {
		return {
			type: "git",
			hash: simpleHashMatch[0],
			full: version
		};
	}
	
	// Check for semantic versioning pattern (x.y.z)
	const semverMatch = version.match(/(\d+)\.(\d+)\.(\d+)/);
	if (semverMatch) {
		// Also check if there's a git hash in the same string (e.g., "v3.6.7 (devt-abc1234)")
		const hashInSemver = version.match(/[a-f0-9]{7,}/);
		if (hashInSemver) {
			return {
				type: "mixed",  // Contains both semver and git hash
				major: parseInt(semverMatch[1]),
				minor: parseInt(semverMatch[2]),
				patch: parseInt(semverMatch[3]),
				hash: hashInSemver[0],
				full: version
			};
		}
		return {
			type: "semver",
			major: parseInt(semverMatch[1]),
			minor: parseInt(semverMatch[2]),
			patch: parseInt(semverMatch[3]),
			full: version
		};
	}
	
	return {
		type: "other",
		full: version
	};
};

/**
 * Determine if two versions are compatible
 */
const areVersionsCompatible = (fwVersion, uiVersion) => {
	// If either version type is unknown, assume compatible to avoid false positives
	if (fwVersion.type === "unknown" || uiVersion.type === "unknown") {
		return true;
	}
	
	// If both are semantic versions, check major.minor compatibility
	if (fwVersion.type === "semver" && uiVersion.type === "semver") {
		// Compatible if major and minor versions match
		return fwVersion.major === uiVersion.major && fwVersion.minor === uiVersion.minor;
	}
	
	// If both are git hashes, they should match for perfect compatibility
	if (fwVersion.type === "git" && uiVersion.type === "git") {
		// If hash prefixes match (first 7 chars), consider compatible
		const fwPrefix = fwVersion.hash.substring(0, 7);
		const uiPrefix = uiVersion.hash.substring(0, 7);
		return fwPrefix === uiPrefix;
	}
	
	// Handle mixed type (firmware with both semver and git hash)
	if (fwVersion.type === "mixed") {
		// If UI is git type, compare hashes
		if (uiVersion.type === "git") {
			const fwPrefix = fwVersion.hash.substring(0, 7);
			const uiPrefix = uiVersion.hash.substring(0, 7);
			return fwPrefix === uiPrefix;
		}
		// If UI is semver, compare semantic versions
		if (uiVersion.type === "semver") {
			return fwVersion.major === uiVersion.major && fwVersion.minor === uiVersion.minor;
		}
	}
	
	// If UI is mixed type
	if (uiVersion.type === "mixed") {
		// If FW is git type, compare hashes
		if (fwVersion.type === "git") {
			const fwPrefix = fwVersion.hash.substring(0, 7);
			const uiPrefix = uiVersion.hash.substring(0, 7);
			return fwPrefix === uiPrefix;
		}
		// If FW is semver, compare semantic versions
		if (fwVersion.type === "semver") {
			return fwVersion.major === uiVersion.major && fwVersion.minor === uiVersion.minor;
		}
	}
	
	// If different version types, check for exact string match
	if (fwVersion.full === uiVersion.full) {
		return true;
	}
	
	// For other mixed cases, be conservative and show warning
	return false;
};
