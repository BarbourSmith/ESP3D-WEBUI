import {
    Monitor_check_autoscroll,
    Monitor_check_verbose_mode,
    get_icon_svg,
    prefDefs,
    conErr,
    displayBlock,
    displayFlex,
    displayNone,
    checkValue,
    getChecked,
    getValue,
    id,
    setChecked,
    stdErrMsg,
    clear_drop_menu,
    closeModal,
    setactiveModal,
    showModal,
    alertdlg,
    confirmdlg,
    camera_GetAddress,
    buildFieldId,
    getPref,
    getPrefValue,
    preferences,
    build_file_filter_list,
    onAutoReportIntervalChange,
    reportNone,
    grblpanel,
	httpCmd,
    SendFileHttp,
    SendGetHttp,
    build_language_list,
    ontoggleLock,
    trans_text_item,
    handlePing,
    PreferencesModified,
    BuildFormDataFiles,
    BuildPreferencesJson,
    LoadPreferencesJson,
    translate_text,
    CheckForHttpCommLock,
} from "./common.js";

//Preferences dialog

const buildElem = (elem, contents, classVal) => {
    const elemPanel = document.createElement(elem);
    if (classVal) {
        elemPanel.setAttribute("class", classVal);
    }
    elemPanel.innerHTML = contents;
    return elemPanel;
};

const buildDiv = (contents, classVal) => buildElem("div", contents, classVal);
const buildTable = (contents, classVal) => buildElem("table", contents, classVal);

const buildDivPanel = (contents) => buildDiv(`<div class="panel-heading">${contents}</div>`, "panel panel-default");

const buildTdIcon = (icon) => `<td>${get_icon_svg(icon)}&nbsp;</td>`;
const buildTdLabel = (key, value) => `<td><span>${trans_text_item(value.label || key, true)}:&nbsp;</span></td>`;
const buildTdInp = (inpFld, key, value) => `<td><div class="input-group has-control">${inpFld}${buildSpnErrFld(key, value)}</div></td>`;
const buildSpnErrFld = (key, value) => `<span id="${buildFieldId(key, value)}_icon" class="form-control-feedback ico_feedback"></span>`;

const buildFieldIdAttr = (key, value) => `id="${buildFieldId(key, value)}"`;
const buildMinMaxAttr = (value) => `${typeof value.min !== "undefined" ? ` min="${value.min}"` : ""}${typeof value.max !== "undefined" ? ` max="${value.max}"` : ""}`;
const buildPlaceholderAttr = (value) => value.placeholder ? `placeholder="${value.placeholder}" translateph` : "";

const setGroupId = (elem, fId) => elem.setAttribute("id", `${fId}_group`);

/** Build an input within a label for a checkbox element */
const buildCheckBox = (key, value) => {
    const inpCheckBox = `<input type="checkbox" ${buildFieldIdAttr(key, value)}/>`;
    return `<label>${inpCheckBox}${trans_text_item(value.label || key, true)}</label>`;
};

/** Generate a panel controlled by a checkbox */
const buildPanel = (key, value, parentElem, isFirstLevel = false) => {
    const fId = buildFieldId(key, value);
    const inpCheckBox = buildCheckBox(key, value);
    const panelCheckBox = isFirstLevel
        ? buildDivPanel(`<div class="checkbox">${inpCheckBox}</div>`)
        : buildDiv(inpCheckBox, "checkbox");

    setGroupId(panelCheckBox, fId);
    parentElem.append(panelCheckBox);

    // prefDefs is tested for, but we do expect it always to be present
    if ("prefDefs" in value) {
        const pBody = buildDiv("", "panel-body");
        if ("panel" in value) {
            pBody.setAttribute("id", value.panel);
        }
        panelCheckBox.append(pBody);
        id(fId).addEventListener("click", (event) => togglePanel(fId, value.panel));
        // Loop around for the child elements
        buildDialog(pBody, value.prefDefs);
    }
};

/** Generate a checkbox that represents a boolean value */
const buildBoolean = (key, value, parentElem) => {
    const fId = buildFieldId(key, value);
    const panelCheckBox = buildDiv(buildCheckBox(key, value), "checkbox");

    setGroupId(panelCheckBox, fId);
    parentElem.append(panelCheckBox);
    id(fId).addEventListener("click", (event) => handleCheckboxClick(fId));
};

/** Generate a mini table for various numeric inputs */
const buildNumeric = (key, value, parentElem) => {
    const fId = buildFieldId(key, value);
    const inpNFld = `<input type="number" ${buildFieldIdAttr(key, value)}${buildMinMaxAttr(value)} class="form-control ${value.inpClass || ""}"/>`;
    const inpNTd = buildTdInp(inpNFld, key, value);

    const unitTd = `<td><div class="input-group"><input class="hide_it" /><span class="input-group-addon form_control" translate>${value.units}</span></div></td>`;

    const inpNTable = buildTable(
        `<tr>${buildTdLabel(key, value)}${inpNTd}${unitTd}</tr>`,
    );
    setGroupId(inpNTable, fId);
    // Check for feedrate that might not be visible
    if (fId.endsWith("_feedrate")) {
        if (["a_feedrate", "b_feedrate", "c_feedrate"].includes(fId)) {
            inpNTable.setAttribute("class", "hide_it topmarginspace");
        }
    }

    parentElem.append(inpNTable);
    id(fId).addEventListener("change", (event) => {
        if (CheckValue(fId, value)) {
            handleInputChange(fId);
        }
    });
};

/** Generate a mini table for text inputs */
const buildText = (key, value, parentElem) => {
    const fId = buildFieldId(key, value);
    const inpTFld = `<input type="text" ${buildFieldIdAttr(key, value)} class="form-control ${value.inpClass || ""}" ${buildPlaceholderAttr(value)}/>`;
    const inpTTd = `<td><div class="input-group has-control">${inpTFld}${buildSpnErrFld(value, key)}</div></td>`;

    const inpTTable = buildTable(`<tr>${buildTdLabel(key, value)}${inpTTd}</tr>`);
    setGroupId(inpTTable, fId);

    parentElem.append(inpTTable);
    id(fId).addEventListener("change", (event) => {
        if (CheckValue(fId, value)) {
            handleInputChange(fId);
        }
    });
};

/** Generate a mini table for language list selects */
const buildSelect = (key, value, parentElem) => {
    const fId = buildFieldId(key, value);
    const selLang = getPrefValue("language_list");
    const inpSTable = buildTable(
        `<tr>${buildTdIcon("flag")}<td>${build_language_list(fId, selLang)}</td></tr>`,
    );
    // Use the key for the containing table, instead of the fId, which has been used for the select
    inpSTable.setAttribute("id", key);
    setGroupId(inpSTable, fId);

    parentElem.append(inpSTable);
    id(fId).addEventListener("change", (event) => {
        if (CheckValue(fId, value)) {
            handleInputChange(fId);
        }
    });
};

/** Build the dialog from the prefDefs metadata */
const buildDialog = (parentElem, definitions, isFirstLevel = false) => {
    for (const [key, value] of Object.entries(definitions)) {
        const fId = buildFieldId(key, value);
        // Check if the dialog has already been built
        if (id(fId)) {
            return;
        }
        switch (value.valueType) {
            case "panel":
                buildPanel(key, value, parentElem, isFirstLevel);
                break;
            case "bool":
                buildBoolean(key, value, parentElem);
                break;
            case "int":
            case "float":
                buildNumeric(key, value, parentElem);
                break;
            case "enctext":
            case "text":
                buildText(key, value, parentElem);
                break;
            case "select":
                buildSelect(key, value, parentElem);
                break;
            default:
                console.log(`${key}: ${JSON.stringify(value)}`);
                break;
        }
    }
};

/** Set the values into the dialog, and then for any checkbox, trigger the default behaviour */
const setDialog = (prefs) => {
    for (const [key, value] of Object.entries(prefs)) {
        // It is possible for the field element to not exist based on what happens in buildDialog
        const fElem = id(value.fieldId);
        switch (value.valueType) {
            case "panel":
            case "bool":
                if (fElem) {
                    // Set the `checked` attribute of a checkbox to the default value
                    // - note that `checked` does not change, once set, it functions as the starting default value.
                    // The actual value is in the checkbox `value`
                    fElem.checked =
                        "defValue" in value
                            ? typeof value.defValue === "string" && value.defValue.toLowerCase() === "false"
                                ? false
                                : !!value.defValue
                            : false;
                    // Because `click`ing the checkbox will toggle it (one way or another) we click it twice
                    fElem.value =
                        typeof value.value === "string" && value.value.toLowerCase() === "false"
                            ? "false"
                            : `${!!value.value}`;
                    fElem.click();
                    fElem.click();
                }
                break;
            case "int":
            case "float":
            case "text":
            case "select":
                if (fElem) {
                    fElem.value = value.value;
                }
                break;
            case "enctext":
                if (fElem) {
                    fElem.value = value.value;
                }
                break;
            default:
                console.log(`${key}: ${JSON.stringify(value)}`);
                break;
        }
    }
};

/** Initialise the preferences dialog */
const initpreferences = () => {
    buildDialog(id("preferences_body"), prefDefs, true);
    setDialog(preferences);

    // And handlers for the other parts of the app
    setupNavbarHandlers();
    setupPreferenceHandlers();
    setupControlsHandlers();
    setupFilesHandlers();
    setupGRBLHandlers();
    setupCommandsHandlers();

    // Do final setup for other parts of the app
    setupNavbar();
    setupPreference();
    setupControls();
    setupGRBL();
    setupFiles();
    setupCommands();
};

const displayBlockOrNone = (elemName, enable) => {
    if (enable) {
        displayBlock(elemName);
    } else {
        displayNone(elemName);
    }
};

const navbar_lockUI = (enable) => {
    displayBlockOrNone("lock_ui_btn", enable);
    ontoggleLock(enable);
};

const navbar_enableDHT = (enable) => {
    displayBlockOrNone("DHT_humidity", enable);
    displayBlockOrNone("DHT_temperature", enable);
};

const navbar_enableCamTab = (enable) => {
    if (typeof id("camtab") === "undefined") {
        return;
    }

    let camoutput = false;

    displayBlockOrNone("camtablink", enable);
    if (enable) {
        camera_GetAddress();
        if (getPrefValue("auto_load_camera")) {
            camera_loadframe();
            camoutput = true;
        }
    } else {
        id("tablettablink").click();
    }

    if (!camoutput) {
        id("camera_frame").src = "";
        displayNone(["camera_frame_display", "camera_detach_button"]);
    }
};

/** Initial setup of the navbar from the preferences coming from the file */
const setupNavbar = () => {
    navbar_lockUI(getPrefValue("enable_lock_UI"));
    navbar_enableDHT(getPrefValue("enable_DHT"));
    navbar_enableCamTab(getPrefValue("show_camera_panel"));
};

const prefsDlgenable_lock_UI = () => navbar_lockUI(getPrefValue("enable_lock_UI"));
const prefsDlgenable_DHT = () => navbar_enableDHT(getPrefValue("enable_DHT"));
const prefsDlgshow_camera_panel = () =>  navbar_enableCamTab(getPrefValue("show_camera_panel"));
const setupNavbarHandlers = () => {
    id("enable_lock_UI").addEventListener("change", prefsDlgenable_lock_UI);
    id("enable_DHT").addEventListener("change", prefsDlgenable_DHT);
    id("show_camera_panel").addEventListener("change", prefsDlgshow_camera_panel);
};

const language_pref = (value) => {
    translate_text(value);
};

/** Initial setup of other preferences coming from the file */
const setupPreference = () => {
    language_pref(getPrefValue("language_preferences"));
};

const prefsDlglanguage = () => language_pref(getPrefValue("language_preferences"));
const setupPreferenceHandlers = () => {
    id("language_preferences").addEventListener("change", prefsDlglanguage);
};

const controls_showControlsPanel = (enable) => {
    displayBlockOrNone("control_preferences", enable);
};

/** Initial setup of the Controls Panel from the preferences coming from the file */
const setupControls = () => {
    controls_showControlsPanel(getPrefValue("show_control_panel"));
};

const prefsDlgshow_control_panel = () => controls_showControlsPanel(getPrefValue("show_control_panel"));
const setupControlsHandlers = () => {
    id("show_control_panel").addEventListener("change", prefsDlgshow_control_panel);
};

const grbl_showGRBLPanel = (enable) => {
    displayBlockOrNone("grblPanel", enable);
    if (enable) {
        grblpanel();
    } else {
        reportNone(false);
    }
};

const grbl_ReportIntervalChange = (changed) => {
    if (changed) {
        onAutoReportIntervalChange();
    }
};

const grbl_showProbeTab = (enable) => {
    displayBlockOrNone("grblprobetablink", enable);
    if (!enable) {
        id("grblcontroltablink").click();
    }
};

/** Initial setup of the GRBL Panel from the preferences coming from the file */
const setupGRBL = () => {
    grbl_showGRBLPanel(getPrefValue("show_grbl_panel"));
    grbl_ReportIntervalChange(getPrefValue("autoreport_interval") || getPrefValue("interval_status"));
    grbl_showProbeTab(getPrefValue("show_grbl_probe_tab"));
};

const prefsDlgshow_grbl_panel = () => grbl_showGRBLPanel(getPrefValue("show_grbl_panel"));
const prefsDlgautoreport_interval = () => grbl_ReportIntervalChange(getPrefValue("autoreport_interval") || getPrefValue("interval_status"));
const prefsDlginterval_status = () => grbl_ReportIntervalChange(getPrefValue("autoreport_interval") || getPrefValue("interval_status"));
const prefsDlgshow_grbl_probe_tab = () => grbl_showProbeTab(getPrefValue("show_grbl_probe_tab"));
const setupGRBLHandlers = () => {
    id("show_grbl_panel").addEventListener("change", prefsDlgshow_grbl_panel);
    id("autoreport_interval").addEventListener("change", prefsDlgautoreport_interval);
    id("interval_status").addEventListener("change", prefsDlginterval_status);
    id("show_grbl_probe_tab").addEventListener("change", prefsDlgshow_grbl_probe_tab);
};

const files_showFilesPanel = (enable) => displayBlockOrNone("filesPanel", enable);

const files_refreshBtns = (enableSD, enableUSB) => {
    if (enableSD || enableUSB) {
        displayFlex("files_refresh_printer_sd_btn");
        displayNone("files_refresh_btn");
    } else {
        displayNone("files_refresh_printer_sd_btn");
        displayFlex("files_refresh_btn");
    }
};

const files_TFTSD = (enableSD, enableUSB) => {
    displayBlockOrNone("files_refresh_tft_sd", enableSD || enableUSB);
    files_refreshBtns(enableSD, enableUSB);
};

const files_TFTUSB = (enableSD, enableUSB) => {
    displayBlockOrNone("files_refresh_tft_usb", enableSD || enableUSB);
    files_refreshBtns(enableSD, enableUSB);
};

const files_filterList = (value) => build_file_filter_list(value);

/** Initial setup of the Files Dialog from the preferences coming from the file */
const setupFiles = () => {
    files_showFilesPanel(getPrefValue("show_files_panel"));
    files_TFTUSB(getPrefValue("has_TFT_SD"), getPrefValue("has_TFT_USB"));
    files_TFTUSB(getPrefValue("has_TFT_SD"), getPrefValue("has_TFT_USB"));
    files_filterList(getPrefValue("f_filters"));
};

const prefsDlgshow_files_panel = () => files_showFilesPanel(getPrefValue("show_files_panel"));
const prefsDlghas_TFT_SD = () => files_TFTSD(getPrefValue("has_TFT_SD"), getPrefValue("has_TFT_USB"));
const prefsDlghas_TFT_USB = () => files_TFTUSB(getPrefValue("has_TFT_SD"), getPrefValue("has_TFT_USB"));
const prefsDlgf_filters = () => files_filterList(getPrefValue("f_filters"));
const setupFilesHandlers = () => {
    id("show_files_panel").addEventListener("change", prefsDlgshow_files_panel);
    id("has_TFT_SD").addEventListener("change", prefsDlghas_TFT_SD);
    id("has_TFT_USB").addEventListener("change", prefsDlghas_TFT_USB);
    // TODO: Check if this one needs a debounce
    id("f_filters").addEventListener("change", prefsDlgf_filters);
};

const commands_showCommandsPanel = (enable) => displayBlockOrNone("commandsPanel", enable);

const commands_autoScroll = (enable) => {
    setChecked("monitor_enable_autoscroll", enable);
    if (enable) {
        Monitor_check_autoscroll();
    }
};

const commands_verboseMode = (enable) => {
    setChecked("monitor_enable_verbose_mode", enable);
    if (enable) {
        Monitor_check_verbose_mode();
    }
};

/** Initial setup of the Commands Panel from the preferences coming from the file */
const setupCommands = () => {
    commands_showCommandsPanel(getPrefValue("show_commands_panel"));
    commands_autoScroll(getPrefValue("enable_autoscroll"));
    commands_verboseMode(getPrefValue("enable_verbose_mode"));
};

const prefsDlgshow_commands_panel = () => commands_showCommandsPanel(getPrefValue("show_commands_panel"));
const prefsDlgenable_autoscroll = () => commands_autoScroll(getPrefValue("enable_autoscroll"));
const prefsDlgenable_verbose_mode = () => commands_verboseMode(getPrefValue("enable_verbose_mode"));
const setupCommandsHandlers = () => {
    id("show_commands_panel").addEventListener("change", prefsDlgshow_commands_panel);
    id("enable_autoscroll").addEventListener("change", prefsDlgenable_autoscroll);
    id("enable_verbose_mode").addEventListener("change", prefsDlgenable_verbose_mode);
};

/** Gets a Select, Text, Int or Float's new value after a change, and stores it in the preferences */
const handleInputChange = (fieldId) => {
    const newValue = getValue(fieldId);
    if (typeof newValue === "undefined") {
        console.error(stdErrMsg("Unknown Field", `'${fieldId}' not found as an input field with a value`));
        return undefined;
    }
    const pref = getPref(fieldId);
    pref.value = newValue;
    return newValue;
};

/** Gets the checkbox's current value, reverses it, and stores the reversed value in the preferences */
const handleCheckboxClick = (checkboxId) => {
    const currentValue = getChecked(checkboxId);
    const newValue = !(currentValue !== "false");
    const pref = getPref(checkboxId);
    pref.value = newValue;
    setChecked(checkboxId, newValue);
    return newValue;
};

const togglePanel = (checkboxId, panelId) => displayBlockOrNone(panelId, handleCheckboxClick(checkboxId));

const prefFile = "/preferences.json";
const getpreferenceslist = () => {
    const cmd = prefFile;
    SendGetHttp(cmd, processPreferencesGetSuccess, processPreferencesGetFailed);
}

const processPreferencesGetSuccess = (response) => {
    Preferences_build_list((response.indexOf("<HTML>") === -1) ? response : "");
}

const processPreferencesGetFailed = (error_code, response) => {
    conErr(error_code, response);
    Preferences_build_list();
}

const Preferences_build_list = (response_text = "") => {
    LoadPreferencesJson(response_text);
    handlePing();
}

const prefsDlgpreferencesdlg = (event) => clear_drop_menu(event);
const showpreferencesdlg = () => {
    const modal = setactiveModal("preferencesdlg.html");
    if (modal == null) {
        return;
    }

    initpreferences();

    id("preferencesdlg.html").addEventListener("click", prefsDlgpreferencesdlg);
    id("PreferencesDialogClose").addEventListener("click", closePreferencesDialog);
    id("PreferencesDialogCancel").addEventListener("click", closePreferencesDialog);
    id("PreferencesDialogSave").addEventListener("click", SavePreferences);

    displayNone("preferencesdlg_upload_msg");
    showModal();
};

const closePreferencesDialog = () => {
    if (PreferencesModified()) {
        confirmdlg(trans_text_item("Data modified"), trans_text_item("Do you want to save?"), process_preferencesCloseDialog);
    } else {
        closeModal("cancel");
    }
}

function process_preferencesCloseDialog(answer) {
    if (answer === "no") {
        //console.log("Answer is no so exit");
        translate_text(getPrefValue("language_list"));
        closeModal("cancel");
    } else {
        // console.log("Answer is yes so let's save");
        SavePreferences();
    }
}

const SavePreferences = () => {
    if (CheckForHttpCommLock()) {
        return;
    }

    console.log("save prefs");

    const blob = new Blob([BuildPreferencesJson()], { type: "application/json" });
    const file = new File([blob], prefFile);

    const formData = new FormData();
    formData.append("path", "/");
    formData.append("myfile[]", file, prefFile);

    SendFileHttp(httpCmd.files, formData, preferencesUploadsuccess, preferencesUploadfailed);
};

function preferencesUploadsuccess(response) {
    displayNone("preferencesdlg_upload_msg");
    handlePing();
    closeModal("ok");
}

function preferencesUploadfailed(error_code, response) {
    alertdlg(trans_text_item("Error"), trans_text_item("Save preferences failed!"));
}

const CheckValue = (fId, valueDef) => {
    let errorList = [];
    if (typeof valueDef === "undefined") {
        errorList.push(`No definition provided for the field '${fId}'. Its value cannot be checked`);
    } else {
        const elem = id(fId);
        const value = elem ? elem.value : valueDef.defValue;
        // Check for any specific test and use that in preference
        if ("valFunc" in valueDef) {
            const vfTest = valueDef.valFunc(value);
            if (vfTest) {
                errorList.push(vfTest);
            }
        } else {
            errorList.push(checkValue(value, valueDef));
        }
    }

    errorList = errorList.filter((err) => err);

    const elemIdGroup = id(`${fId}_group`);
    const elemIdIcon = id(`${fId}_icon`);
    if (!errorList.length) {
        if (elemIdGroup) {
            elemIdGroup.classList.remove("has-feedback");
            elemIdGroup.classList.remove("has-error");
        }
        if (elemIdIcon) {
            elemIdIcon.innerHTML = "";
        }
    } else {
        if (elemIdGroup) {
            // has-feedback hides the value so it is hard to fix it
            // elemIdGroup.classList.add("has-feedback");
            elemIdGroup.classList.add("has-error");
        }
        if (elemIdIcon) {
            // elemIdIcon.innerHTML = get_icon_svg("remove");
        }
        alertdlg(trans_text_item("Errors with settings & preferences"), errorList.join("\n"));
    }
    return errorList.length === 0;
};

export {
    getpreferenceslist,
    initpreferences,
    showpreferencesdlg,
    SavePreferences,
};
