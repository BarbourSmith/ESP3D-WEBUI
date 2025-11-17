// Version checking functionality for ESP3D-WEBUI
// Checks GitHub for new releases and shows a popup if a new version is available

/** Check if version checking is enabled and show popup if new version available */
const checkForNewVersion = () => {
    // Check if version checking is disabled in preferences
    const versionCheckPref = GetPrefOrDefault("version_check_enabled");
    if (versionCheckPref === "never") {
        console.log("Version checking disabled in preferences");
        return;
    }

    // Get the current WebUI version
    if (!web_ui_version || web_ui_version === "") {
        console.log("Cannot check for new version: current version unknown");
        return;
    }

    // Check if we've already dismissed this version
    const dismissedVersion = GetPrefOrDefault("dismissed_version");
    
    // Fetch latest release from GitHub
    fetchLatestRelease((latestVersion) => {
        if (!latestVersion) {
            console.log("Could not fetch latest version from GitHub");
            return;
        }

        // Check if user has dismissed this version
        if (dismissedVersion && dismissedVersion === latestVersion) {
            console.log(`Version ${latestVersion} has been dismissed`);
            return;
        }

        // Compare versions - show popup if new version is available
        if (isNewerVersion(latestVersion, web_ui_version)) {
            showNewVersionPopup(latestVersion);
        } else {
            console.log(`Current version ${web_ui_version} is up to date (latest: ${latestVersion})`);
        }
    });
};

/** Fetch the latest release version from GitHub */
const fetchLatestRelease = (callback) => {
    try {
        // Use GitHub API to get latest release
        // Note: Using a CORS proxy or direct API call depending on environment
        const apiUrl = "https://api.github.com/repos/MaslowCNC/ESP3D-WEBUI/releases/latest";
        
        const xhr = new XMLHttpRequest();
        xhr.open("GET", apiUrl, true);
        xhr.timeout = 5000; // 5 second timeout
        
        xhr.onload = function() {
            if (xhr.status === 200) {
                try {
                    const release = JSON.parse(xhr.responseText);
                    const version = release.tag_name || release.name || "";
                    callback(version);
                } catch (error) {
                    console.error("Error parsing GitHub release data:", error);
                    callback(null);
                }
            } else {
                console.log(`GitHub API returned status ${xhr.status}`);
                callback(null);
            }
        };
        
        xhr.onerror = function() {
            console.log("Network error fetching latest release");
            callback(null);
        };
        
        xhr.ontimeout = function() {
            console.log("Timeout fetching latest release");
            callback(null);
        };
        
        xhr.send();
    } catch (error) {
        console.error("Error fetching latest release:", error);
        callback(null);
    }
};

/** Compare two version strings to determine if newVersion is newer than currentVersion */
const isNewerVersion = (newVersion, currentVersion) => {
    // Strip 'v' prefix if present
    const cleanNew = newVersion.replace(/^v/, '');
    const cleanCurrent = currentVersion.replace(/^v/, '');
    
    // Extract semantic version parts
    const newParts = cleanNew.split(/[.-]/).map(part => parseInt(part) || 0);
    const currentParts = cleanCurrent.split(/[.-]/).map(part => parseInt(part) || 0);
    
    // Compare major.minor.patch
    for (let i = 0; i < Math.max(newParts.length, currentParts.length); i++) {
        const newPart = newParts[i] || 0;
        const currentPart = currentParts[i] || 0;
        
        if (newPart > currentPart) {
            return true;
        } else if (newPart < currentPart) {
            return false;
        }
    }
    
    return false; // Versions are equal
};

/** Show popup notifying user of new version */
const showNewVersionPopup = (latestVersion) => {
    // Create lightweight popup using minimal DOM manipulation
    const popup = document.createElement('div');
    popup.id = 'new-version-popup';
    popup.style.cssText = `
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: white;
        padding: 20px;
        border: 2px solid #3276c3;
        border-radius: 5px;
        box-shadow: 0 4px 8px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 400px;
        font-family: Arial, sans-serif;
    `;
    
    const title = document.createElement('h3');
    title.textContent = 'New Version Available';
    title.style.cssText = 'margin-top: 0; color: #3276c3;';
    
    const message = document.createElement('p');
    message.innerHTML = `A new version of ESP3D-WEBUI is available:<br/>
        <strong>Current:</strong> ${web_ui_version}<br/>
        <strong>Latest:</strong> ${latestVersion}<br/><br/>
        Visit the <a href="https://github.com/MaslowCNC/ESP3D-WEBUI/releases/latest" target="_blank">releases page</a> to download.`;
    
    const buttonContainer = document.createElement('div');
    buttonContainer.style.cssText = 'display: flex; gap: 10px; margin-top: 15px;';
    
    const dismissButton = document.createElement('button');
    dismissButton.textContent = "Don't warn again for this version";
    dismissButton.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        background-color: #f0f0f0;
        border: 1px solid #ccc;
        border-radius: 3px;
        flex: 1;
    `;
    dismissButton.onclick = function() {
        dismissVersion(latestVersion);
        closeNewVersionPopup();
    };
    
    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.cssText = `
        padding: 8px 12px;
        cursor: pointer;
        background-color: #3276c3;
        color: white;
        border: none;
        border-radius: 3px;
    `;
    closeButton.onclick = closeNewVersionPopup;
    
    buttonContainer.appendChild(dismissButton);
    buttonContainer.appendChild(closeButton);
    
    popup.appendChild(title);
    popup.appendChild(message);
    popup.appendChild(buttonContainer);
    
    // Add backdrop
    const backdrop = document.createElement('div');
    backdrop.id = 'new-version-backdrop';
    backdrop.style.cssText = `
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.5);
        z-index: 9999;
    `;
    backdrop.onclick = closeNewVersionPopup;
    
    document.body.appendChild(backdrop);
    document.body.appendChild(popup);
    
    console.log(`Showing new version popup: ${latestVersion}`);
};

/** Close and remove the new version popup */
const closeNewVersionPopup = () => {
    const popup = document.getElementById('new-version-popup');
    const backdrop = document.getElementById('new-version-backdrop');
    
    if (popup) {
        document.body.removeChild(popup);
    }
    if (backdrop) {
        document.body.removeChild(backdrop);
    }
};

/** Dismiss a specific version - store it in preferences */
const dismissVersion = (version) => {
    console.log(`Dismissing version ${version}`);
    
    // Update preferences with dismissed version
    if (typeof preferenceslist !== 'undefined' && preferenceslist.length > 0) {
        preferenceslist[0].dismissed_version = version;
        
        // Save preferences to file
        SavePreferences(true);
    }
};
