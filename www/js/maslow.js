// When we can change to proper ESM - uncomment this
// import M from "constants";

/** Maslow Status */
let maslowStatus = { homed: false, extended: false };

/** This keeps track of when we saw the last heartbeat from the machine */
let lastHeartBeatTime = new Date().getTime();

const err = "error: ";
// When we can change to proper ESM - prefix these const strings and functions with 'export' (minus the quotes of course)
const MaslowErrMsgKeyValueCantUse = `${err}Could not use supplied key-value pair.`;
const MaslowErrMsgNoKey = `${err}No key supplied for value.`;
const MaslowErrMsgNoValue = `${err}No value supplied for key.`;
const MaslowErrMsgNoMatchingKey = `${err}Could not find key for value in reference table.`;
const MaslowErrMsgKeyValueSuffix = "This is probably a programming error\nKey-Value pair supplied was:";

/** Perform maslow specific-ish info message handling */
const maslowInfoMsgHandling = (msg) => {
    if (msg.startsWith('MINFO: ')) {
        maslowStatus = JSON.parse(msg.substring(7));
        return true;
    }

    if (msg.startsWith('[MSG:INFO: Heartbeat')) {
        lastHeartBeatTime = new Date().getTime();
        return true;
    }

    //Catch the calibration complete message and alert the user
    if (msg.startsWith('[MSG:INFO: Calibration complete')) {
        alert('Calibration complete. You do not need to do calibration ever again unless your frame changes size. You might want to store a backup of your maslow.yaml file in case you need to restore it later.');
        return true;
    }

    return false;
}

/** Perform maslow specific-ish error message handling */
const maslowErrorMsgHandling = (msg) => {
    if (!msg.startsWith("error:")) {
        // Nothing to see here - move along
        return "";
    }

    // And extra information for certain error codes
    const msgExtra = {
        "8": " - Command requires idle state. Unlock machine?",
        "152": " - Configuration is invalid. Maslow.yaml file may be corrupt. Turning off and back on again can often fix this issue.",
        "153": " - Configuration is invalid. ESP32 probably did a panic reset. Config changes cannot be saved. Try restarting",
    };

    return `${msg}${msgExtra[msg.split(":")[1]] || ""}`;
}

/** Handle Maslow specific configuration messages
 * These would have all started with `$/Maslow_` which is expected to have been stripped away before calling this function
 */
const maslowMsgHandling = (msg) => {
    const keyValue = msg.split("=");
    const errMsgSuffix = `${MaslowErrMsgKeyValueSuffix}${msg}`;
    if (keyValue.length != 2) {
        return maslowErrorMsgHandling(`${MaslowErrMsgKeyValueCantUse} ${errMsgSuffix}`);
    }
    const key = keyValue[0] || "";
    const value = (keyValue[1] || "").trim();
    if (!key) {
        return maslowErrorMsgHandling(`${MaslowErrMsgNoKey} ${errMsgSuffix}`);
    }
    if (!value) {
        return maslowErrorMsgHandling(`${MaslowErrMsgNoValue} ${errMsgSuffix}`);
    }

    const stdAction = (id, value) => {
        document.getElementById(id).value = value;
        loadedValues[id] = value;
    }
    const stdDimensionAction = (value) => parseFloat(value);
    const nullAction = () => { };

    const msgExtra = {
        "calibration_grid_size": (value) => stdAction("gridSize", value),
        "calibration_grid_width_mm_X": (value) => stdAction("gridWidth", value),
        "calibration_grid_height_mm_Y": (value) => stdAction("gridHeight", value),
        "Retract_Current_Threshold": (value) => stdAction("retractionForce", value),
        "vertical": (value) => stdAction("machineOrientation", value === "false" ? "horizontal" : "vertical"),
        "Extend_Dist": (value) => stdAction("extendDist", value),
        "trZ": (value) => {initialGuess.tr.z = stdDimensionAction(value)},
        "tlX": (value) => {initialGuess.tl.x = stdDimensionAction(value)},
        "tlY": (value) => {initialGuess.tl.y = stdDimensionAction(value)},
        "tlZ": (value) => {initialGuess.tl.z = stdDimensionAction(value)},
        "brX": (value) => {initialGuess.br.x = stdDimensionAction(value)},
        "brY": (value) => nullAction(),
        "brZ": (value) => {initialGuess.br.z = stdDimensionAction(value)},
        "blX": (value) => nullAction(),
        "blY": (value) => nullAction(),
        "blZ": (value) => {initialGuess.bl.z = stdDimensionAction(value)},
        "Acceptable_Calibration_Threshold": (value) => {acceptableCalibrationThreshold = stdDimensionAction(value)},
    }
    const action = msgExtra[key] || "";
    if (!action) {
        return maslowErrorMsgHandling(`error: Could not find key for value in reference table. ${errMsgSuffix}`);
    }
    action(value);

    // Success - return an empty string
    return "";
}

const checkHomed = () => {
    if (!maslowStatus.homed) {
        const err_msg = `${M} does not know belt lengths. Please retract and extend before continuing.`;
        alert(err_msg);

        // Write to the console too, in case the system alerts are not visible
        const msgWindow = document.getElementById('messages')
        msgWindow.textContent = `${msgWindow.textContent}\n${err_msg}`;
        msgWindow.scrollTop = msgWindow.scrollHeight;
    }

    return maslowStatus.homed;
}

/** Short hand convenience call to SendPrinterCommand with some preset values.
 * Uses the global function get_position, which is also a SendPrinterCommand with presets
 */
const sendCommand = (cmd) => {
    SendPrinterCommand(cmd, true, get_Position);
}

// The following functions are all defined as global functions, and are used by tablettab.html and other places
// They rely on the global function SendPrinterCommand defined in printercmd.js

/** Used to populate the config popup when it loads */
function loadConfigValues() {
    SendPrinterCommand(`$/${M}_vertical`);
    SendPrinterCommand(`$/${M}_calibration_grid_width_mm_X`);
    SendPrinterCommand(`$/${M}_calibration_grid_height_mm_Y`);
    SendPrinterCommand(`$/${M}_calibration_grid_size`);
    SendPrinterCommand(`$/${M}_Retract_Current_Threshold`);
    SendPrinterCommand(`$/${M}_trX`);
    SendPrinterCommand(`$/${M}_trY`);
    SendPrinterCommand(`$/${M}_Acceptable_Calibration_Threshold`);
    SendPrinterCommand(`$/${M}_Extend_Dist`);
}

/** Load all of the corner values */
function loadCornerValues() {
    SendPrinterCommand(`$/${M}_tlX`);
    SendPrinterCommand(`$/${M}_tlY`);
    SendPrinterCommand(`$/${M}_trX`);
    SendPrinterCommand(`$/${M}_trY`);
    SendPrinterCommand(`$/${M}_brX`);
}

/** Save the Maslow configuration values */
function saveConfigValues() {
    let gridWidth = document.getElementById('gridWidth').value;
    let gridHeight = document.getElementById('gridHeight').value;
    let gridSize = document.getElementById('gridSize').value;
    let retractionForce = document.getElementById('retractionForce').value;
    let machineOrientation = document.getElementById('machineOrientation').value;
    let extendDist = document.getElementById('extendDist').value;

    var gridSpacingWidth = gridWidth / (gridSize - 1);
    var gridSpacingHeight = gridHeight / (gridSize - 1);

    //If the grid spacing is going to be more than 200 don't save the values
    if (gridSpacingWidth > 260 || gridSpacingHeight > 260) {
        alert('Grid spacing is too large. Please reduce the grid size or increase the number of points.');
        return;
    }

    if (gridWidth != loadedValues['gridWidth']) {
        sendCommand(`$/${M}_calibration_grid_width_mm_X=${gridWidth}`);
    }
    if (gridHeight != loadedValues['gridHeight']) {
        sendCommand(`$/${M}_calibration_grid_height_mm_Y=${gridHeight}`);
    }
    if (gridSize != loadedValues['gridSize']) {
        sendCommand(`$/${M}_calibration_grid_size=${gridSize}`);
    }
    if (retractionForce != loadedValues['retractionForce']) {
        sendCommand(`$/${M}_Retract_Current_Threshold=${retractionForce}`);
    }
    if (machineOrientation != loadedValues['machineOrientation']) {
        sendCommand(`$/${M}_vertical=${machineOrientation === 'horizontal' ? 'false' : 'true'}`);
    }
    if (extendDist != loadedValues['extendDist']) {
        sendCommand(`$/${M}_Extend_Dist=${extendDist}`);
    }

    refreshSettings(current_setting_filter);
    saveMaslowYaml();
    loadCornerValues();

    hideModal('configuration-popup');
}

