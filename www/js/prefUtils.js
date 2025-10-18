let preferenceslist = [];

const checkFields = {
    show_camera_panel: "enable_camera",
    autoload_camera_panel: "auto_load_camera",
    enable_DHT: "enable_DHT",
    enable_lock_UI: "enable_lock_UI",
    enable_ping: "enable_ping",
    show_control_panel: "enable_control_panel",
    show_grbl_panel: "enable_grbl_panel",
    show_grbl_probe_tab: "enable_grbl_probe_panel",
    show_files_panel: "enable_files_panel",
    has_tft_sd: "has_TFT_SD",
    has_tft_usb: "has_TFT_USB",
    show_commands_panel: "enable_commands_panel",
    preferences_autoscroll: "enable_autoscroll",
    preferences_verbose_mode: "enable_verbose_mode",
};

const intFields = {
    preferences_autoReport_Interval: "preferenceslist[0].autoReport_interval",
    preferences_pos_Interval_check: "preferenceslist[0].interval_positions",
    preferences_status_Interval_check: "preferenceslist[0].interval_status",
};

/** This does not include axis velocity fields */
const floatFields = {
    preferences_probemaxtravel: "preferenceslist[0].probemaxtravel",
    preferences_probefeedrate: "preferenceslist[0].probefeedrate",
    preferences_proberetract: "preferenceslist[0].proberetract",
    preferences_probetouchplatethickness: "preferenceslist[0].probetouchplatethickness",
};

const checkBlocks = {
    show_files_panel: "files_preferences",
    show_grbl_panel: "grbl_preferences",
    show_camera_panel: "camera_preferences",
    show_control_panel: "control_preferences",
    show_commands_panel: "cmd_preferences",
    show_grbl_probe_tab: "grbl_probe_preferences",
};

const isPreferencesListDefined = () => (typeof preferenceslist !== "undefined" && Array.isArray(preferenceslist) && preferenceslist.length > 0 && preferenceslist?.is_default !== "true");

const GetPreferencesList = () => {
    console.info("Getting the preferences list")
    preferenceslist = [];
    //removeIf(production)
    const response = JSON.stringify(default_preferenceslist);
    processPreferencesGetSuccess(response);
    return;
    //endRemoveIf(production)
    const cmd = buildHttpFileGetCmd(preferences_file_name);
    SendGetHttp(cmd, processPreferencesGetSuccess, processPreferencesGetFailed);
}

const processPreferencesGetSuccess = (response) => {
    Preferences_build_list(response);
}

const processPreferencesGetFailed = (error_code, response) => {
    conErr(error_code, response);
    Preferences_build_list("");
}

const Preferences_build_list = (response_text) => {
    preferenceslist = [];
    try {
        const prefTest = response_text ? response_text : JSON.stringify(default_preferenceslist)
        preferenceslist = JSON.parse(prefTest);
    } catch (e) {
        console.error("Preferences parsing error:", e);
        preferenceslist = default_preferenceslist;
    }
}

/** Determine if the preferences have been modified */
const PreferencesModified = () => {
    if (!preferenceslist[0].length) {
        // Nothing got loaded, so nothing could have been modified
        return false;
    }

    const defKeys = Object.keys(default_preferenceslist[0]);

    //check dialog compare to global state
    for (let ix = 0; ix < defKeys.length; ix++) {
        if (!(defKeys[ix] in preferenceslist[0])) {
            // If anything has been 'undefined' then we assume modification
            return true;
        }
    }

    for (const chkMap in checkFields) {
        if (getChecked(chkMap) !== (preferenceslist[0][checkFields[chkMap]])) {
            return true;
        }
    }

    for (const intMap in intFields) {
        if (getValueInt(intMap) !== Number.parseInt(preferenceslist[0][intFields[intMap]])) {
            return true;
        }
    }

    for (const floatMap in floatFields) {
        if (getValueFloat(floatMap) !== Number.parseFloat(preferenceslist[0][floatFields[floatMap]])) {
            return true;
        }
    }

    //camera address
    if (getValue('preferences_camera_webaddress') !== HTMLDecode(preferenceslist[0].camera_address)) {
        return true;
    }

    //xy feedrate
    if (getValueFloat('preferences_control_xy_velocity') !== Number.parseFloat(preferenceslist[0].xy_feedrate)) {
        return true;
    }
    //z feedrate
    if (grblaxis > 2 && getValueFloat('preferences_control_z_velocity') !== Number.parseFloat(preferenceslist[0].z_feedrate)) {
        return true;
    }
    //a feedrate
    if (grblaxis > 3 && getValueFloat('preferences_control_a_velocity') !== Number.parseFloat(preferenceslist[0].a_feedrate)) {
        return true;
    }
    //b feedrate
    if (grblaxis > 4 && getValueFloat('preferences_control_b_velocity') !== Number.parseFloat(preferenceslist[0].b_feedrate)) {
        return true;
    }
    //c feedrate
    if (grblaxis > 5 && getValueFloat('preferences_control_c_velocity') !== Number.parseFloat(preferenceslist[0].c_feedrate)) {
        return true;
    }
    //file filters
    return (getValue('preferences_filters') !== preferenceslist[0].f_filters);
}

/** Display the element as a block or none */
const displayBlockOrNone = (elemName, enable) => {
    if (enable) {
        displayBlock(elemName);
    } else {
        displayNone(elemName);
    }
};

const toggleCheckBlock = (event) => {
    const checkBox = event.currentTarget;
    const chkId = checkBox.id;
    prefs_toggledisplay(chkId);
}

const toggleCheckBox = (event) => {
    const checkBox = event.currentTarget;
    const chkId = checkBox.id;
    prefs_togglebox(chkId);
}

const prefs_togglebox = (id_source) => {
    const currentValue = getChecked(id_source);
    const newValue = ["on", "true"].includes(currentValue) ? 'false' : 'true';
    setChecked(id_source, newValue);
}

/** Toggles the checkbox value, and also its associated block of preferences */
function prefs_toggledisplay(id_source) {
    prefs_togglebox(id_source);
    displayBlockOrNone(checkBlocks[id_source], getChecked(id_source) === 'true');
}

const setCheckboxes = () => {
    for (const chkMap in checkFields) {
        setCheckedDefault(chkMap, preferenceslist[0]?.[checkFields[chkMap]]);

        // Now click / toggle it twice
        if (chkMap in checkBlocks) {
            prefs_toggledisplay(chkMap);
            prefs_toggledisplay(chkMap);
        } else {
            const checkbox = id(chkMap);
            checkbox.click();
            checkbox.click();
        }
    }
}
