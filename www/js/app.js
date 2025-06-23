var ESP3D_authentication = false;
var async_webcommunication = false;
var websocket_port = 0;
var websocket_ip = '';
var esp_hostname = 'ESP3D WebUI';
var EP_HOSTNAME;
var EP_STA_SSID;
var EP_STA_PASSWORD;
var EP_STA_IP_MODE;
var EP_STA_IP_VALUE;
var EP_STA_GW_VALUE;
var EP_STA_MK_VALUE;
var EP_WIFI_MODE;
var EP_AP_SSID;
var EP_AP_PASSWORD;
var EP_AP_IP_VALUE;
var EP_BAUD_RATE = 112;
var EP_AUTH_TYPE = 119;
var EP_TARGET_FW = 461;
var EP_IS_DIRECT_SD = 850;
var EP_PRIMARY_SD = 851;
var EP_SECONDARY_SD = 852;
var EP_DIRECT_SD_CHECK = 853;
var SETTINGS_AP_MODE = 1;
var SETTINGS_STA_MODE = 2;
var SETTINGS_FALLBACK_MODE = 3;
var last_ping = 0;
var enable_ping = true;
var esp_error_message = '';
var esp_error_code = 0;

//Check for IE
//Edge
//Chrome
function browser_is(bname) {
	const ua = navigator.userAgent;
	switch (bname) {
		case 'IE':
			if (ua.indexOf('Trident/') !== -1) return true;
			break;
		case 'Edge':
			if (ua.indexOf('Edge') !== -1) return true;
			break;
		case 'Chrome':
			if (ua.indexOf('Chrome') !== -1) return true;
			break;
		case 'Firefox':
			if (ua.indexOf('Firefox') !== -1) return true;
			break;
		case 'MacOSX':
			if (ua.indexOf('Mac OS X') !== -1) return true;
			break;
		default:
			return false;
	}
	return false;
}

// Function to detect if user is in a captive portal (limited connectivity state)
function isCaptivePortal() {
	const hostname = window.location.hostname;
	
	// If hostname is 'maslow.local', user has proper connectivity
	if (hostname === 'maslow.local') {
		return false;
	}
	
	// Check if hostname is an IP address (IPv4 pattern)
	const ipv4Pattern = /^(\d{1,3}\.){3}\d{1,3}$/;
	if (ipv4Pattern.test(hostname)) {
		return false;
	}
	
	// If hostname is anything else, user is likely in captive portal
	return true;
}

// Function to show captive portal warning modal
function showCaptivePortalWarning() {
	const message = "You appear to be using a browser popup with limited connectivity. File uploading and downloading may not work properly. For full functionality, please open your browser and navigate directly to maslow.local or the machine's IP address.";
	
	// Create the modal dynamically
	const modal = document.createElement('div');
	modal.id = 'captive-portal-warning-modal';
	modal.style.cssText = `
		position: fixed;
		top: 50%;
		left: 50%;
		transform: translate(-50%, -50%);
		background-color: #fff3cd;
		padding: 20px;
		border: 1px solid #ffeaa7;
		border-radius: 5px;
		box-shadow: 0 4px 8px rgba(0,0,0,0.1);
		z-index: 1000;
		max-width: 400px;
		text-align: center;
	`;
	
	const messageElement = document.createElement('p');
	messageElement.textContent = message;
	messageElement.style.cssText = `
		margin: 0 0 15px 0;
		color: #856404;
	`;
	
	const closeButton = document.createElement('button');
	closeButton.textContent = 'I Understand';
	closeButton.style.cssText = `
		margin-top: 10px;
		padding: 8px 16px;
		cursor: pointer;
		background-color: #ffc107;
		border: none;
		border-radius: 3px;
		color: #212529;
		font-weight: bold;
	`;
	closeButton.onclick = function() {
		document.body.removeChild(modal);
	};
	
	modal.appendChild(messageElement);
	modal.appendChild(closeButton);
	document.body.appendChild(modal);
}

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
			
			// Check for captive portal after UI is loaded
			if (isCaptivePortal()) {
				// Add a small delay to ensure UI is fully rendered before showing the warning
				setTimeout(() => {
					showCaptivePortalWarning();
				}, 500);
			}
		}

		// Ensure that we always break out of this
		failSafe--;
	}, 500,);
}

window.addEventListener("load", (event) => {
	// Wait half a second before firing up
	setTimeout(() => { loadApp(); }, 1000);
});