// Version update notification handler
// Listens for firmware version update messages and displays lightweight popup
// The firmware (FluidNC) checks for updates based on maslow.yaml settings

/** Show popup notifying user of new version (called by firmware message handler) */
const showNewVersionPopup = (latestVersion) => {
    // Check if user has dismissed this version
    const dismissedVersion = GetPrefOrDefault("dismissed_version");
    if (dismissedVersion && dismissedVersion === latestVersion) {
        console.log(`Version ${latestVersion} has been dismissed`);
        return;
    }

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
    message.innerHTML = `A new version is available:<br/>
        <strong>${latestVersion}</strong><br/><br/>
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
