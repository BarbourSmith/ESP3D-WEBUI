import {
	Common,
	M,
	get_Position,
	SendPrinterCommand,
	refreshSettings,
	saveMaslowYaml,
	hideModal,
	loadedValues,
	setValue,
} from "./common.js";

/** Maslow Status */
let maslowStatus = { homed: false, extended: false, state: 0 };

/** This keeps track of when we saw the last heartbeat from the machine */
//I think this is not used anymore and can be removed now
let lastHeartBeatTime = new Date().getTime();

const err = "error: ";
const MaslowErrMsgKeyValueCantUse = `${err}Could not use supplied key-value pair.`;
const MaslowErrMsgNoKey = `${err}No key supplied for value.`;
const MaslowErrMsgNoValue = `${err}No value supplied for key.`;
const MaslowErrMsgNoMatchingKey = `${err}Could not find key for value in reference table.`;
const MaslowErrMsgKeyValueSuffix = "This is probably a programming error\nKey-Value pair supplied was:";

/*
* Updates the dynamic buttons to reflect the current state of the machine
UNKNOWN 0
    -Retract All
    -Apply Tension

RETRACTING 1
    -No buttons

RETRACTED 2
    -Retract All
    -Extend All

EXTENDING 3
    -No Buttons

EXTENDEDOUT 4 //Extended is a reserved word
    -Retract All
    -Apply Tension
    -Calibrate

TAKING_SLACK 5
    -No buttons

CALIBRATION_IN_PROGRESS 6
    -No buttons

READY_TO_CUT 7
    -Retract All
    -Apply Tension
    -Release Tension
*/
const updateDynamicButtons = () => {

	const stateLabel = document.getElementById("state-label");

	const retractButton = document.getElementById("tablettab_cal_retract");
	const extendButton = document.getElementById("tablettab_cal_extend");
	const tenseButton = document.getElementById("tablettab_cal_tense");
	const relaxButton = document.getElementById("tablettab_cal_relax");
	const calibrateButton = document.getElementById("tablettab_cal_calibrate");

	const greenBackground = "#4aa85c"
	const greyBackground = "#a0a0a0"

	switch (maslowStatus.state) {
		case 0: 
			stateLabel.innerHTML = "State: Unknown";

			//Set the retract and extend buttons to have a green background 
			retractButton.style.backgroundColor = greenBackground;
			extendButton.style.backgroundColor = greenBackground;

			tenseButton.style.backgroundColor = greyBackground;
			relaxButton.style.backgroundColor = greyBackground;
			calibrateButton.style.backgroundColor = greyBackground;
			break;
		case 1:
			stateLabel.innerHTML = "State: Retracting";

			retractButton.style.backgroundColor = greyBackground;
			extendButton.style.backgroundColor = greyBackground;
			tenseButton.style.backgroundColor = greyBackground;
			relaxButton.style.backgroundColor = greyBackground;
			calibrateButton.style.backgroundColor = greyBackground;

			break;
		case 2:
			stateLabel.innerHTML = "State: Retracted";

			retractButton.style.backgroundColor = greenBackground;
			extendButton.style.backgroundColor = greenBackground;

			tenseButton.style.backgroundColor = greyBackground;
			relaxButton.style.backgroundColor = greyBackground;
			calibrateButton.style.backgroundColor = greyBackground;

			break;
		case 3:
			stateLabel.innerHTML = "State: Extending";
			
			retractButton.style.backgroundColor = greyBackground;
			extendButton.style.backgroundColor = greyBackground;
			tenseButton.style.backgroundColor = greyBackground;
			relaxButton.style.backgroundColor = greyBackground;
			calibrateButton.style.backgroundColor = greyBackground;
			break;
		case 4:
			stateLabel.innerHTML = "State: Extended";

			retractButton.style.backgroundColor = greenBackground;
			tenseButton.style.backgroundColor = greenBackground;
			calibrateButton.style.backgroundColor = greenBackground;
			extendButton.style.backgroundColor = greenBackground;
			
			relaxButton.style.backgroundColor = greyBackground;

			break;
		case 5:
			stateLabel.innerHTML = "State: Taking Slack";

			retractButton.style.backgroundColor = greyBackground;
			extendButton.style.backgroundColor = greyBackground;
			tenseButton.style.backgroundColor = greyBackground;
			relaxButton.style.backgroundColor = greyBackground;
			calibrateButton.style.backgroundColor = greyBackground;
			break;
		case 6:
			stateLabel.innerHTML = "State: Calibrating";

			retractButton.style.backgroundColor = greyBackground;
			extendButton.style.backgroundColor = greyBackground;
			tenseButton.style.backgroundColor = greyBackground;
			relaxButton.style.backgroundColor = greyBackground;
			calibrateButton.style.backgroundColor = greyBackground;
			break;
		case 7:
			stateLabel.innerHTML = "State: Ready to Cut";

			retractButton.style.backgroundColor = greenBackground;
			relaxButton.style.backgroundColor = greenBackground;

			extendButton.style.backgroundColor = greyBackground;
			tenseButton.style.backgroundColor = greyBackground;
			calibrateButton.style.backgroundColor = greyBackground;

			break;
		default:
			stateLabel.innerHTML = "State: Unknown";

			retractButton.style.backgroundColor = greenBackground;
			extendButton.style.backgroundColor = greyBackground;
			tenseButton.style.backgroundColor = greyBackground;
			relaxButton.style.backgroundColor = greyBackground;
			calibrateButton.style.backgroundColor = greyBackground;
			break;
	}
}


/** Perform maslow specific-ish info message handling */
const maslowInfoMsgHandling = (msg) => {
	if (msg.startsWith('MINFO: ')) {
		try {
			maslowStatus = JSON.parse(msg.substring(7));
		} catch (error) {
			console.error("Parsing the 'MINFO' message failed, the maslow status has not been changed. This is probably a programmer error.");
		}
		return true;
	}

	if (msg.startsWith('[MSG:INFO: Heartbeat')) {
		lastHeartBeatTime = new Date().getTime();
		return true;
	}

	//Parse state messages like [MSG:INFO: Current state: 0]
	if (msg.startsWith("[MSG:INFO: Current state:")) {
		const m = msg.match(/Current state:\s*(\d+)/);
		if (m) {
			const state = Number(m[1]);
			maslowStatus.state = state;
			updateDynamicButtons();
		}
		return true;
	}

	//Catch the calibration complete message and alert the user...this locks up the UI which is bad...should be handled better
	if (msg.startsWith("[MSG:INFO: Calibration complete")) {
		alert(
			"Calibration complete. You do not need to do calibration ever again unless your frame changes size. You might want to store a backup of your maslow.yaml file in case you need to restore it later.",
		);
		return true;
	}

	return false;
};

/** Perform maslow specific-ish error message handling */
const maslowErrorMsgHandling = (msg) => {
	if (!msg.startsWith("error:")) {
		// Nothing to see here - move along
		return "";
	}

	// And extra information for certain error codes
	const msgExtra = {
		8: " - Command requires idle state. Unlock machine?",
		152: " - Configuration is invalid. Maslow.yaml file may be corrupt. Turning off and back on again can often fix this issue.",
		153: " - Configuration is invalid. ESP32 probably did a panic reset. Config changes cannot be saved. Try restarting",
	};

	return `${msg}${msgExtra[msg.split(":")[1]] || ""}`;
};

/** Is the machine orientation 'vertical' (the default) */
const isVert = (value) => value === "horizontal" ? "false" : "true";
/** What orientation is the machine? */
const vertIs = (value) => value === "false" ? "horizontal" : "vertical";

const cfgDef = {
	vertical: { name: "machineOrientation", type: "A", fnVal: isVert, fnDisp: vertIs },
	calibration_grid_size: { name: "gridSize", type: "A" },
	calibration_grid_width_mm_X: { name: "gridWidth", type: "A" },
	calibration_grid_height_mm_Y: { name: "gridHeight", type: "A" },
	Retract_Current_Threshold: { name: "retractionForce", type: "A" },
	Calibration_Current_Threshold: { name: "calibrationForce", type: "A" },
	Acceptable_Calibration_Threshold: { name: "acceptableCalibrationThreshold", type: "A" },
	Extend_Dist: { name: "extendDist", type: "A" },
	beltEndExtension: { name: "beltEndExtension", type: "A" },
	armLength: { name: "armLength", type: "A" },
	trX: { name: "initialGuess.tr.x", type: "D" },
	trY: { name: "initialGuess.tr.y", type: "D" },
	trZ: { name: "initialGuess.tr.z", type: "D" },
	tlX: { name: "initialGuess.tl.x", type: "D" },
	tlY: { name: "initialGuess.tl.y", type: "D" },
	tlZ: { name: "initialGuess.tl.z", type: "D" },
	brX: { name: "initialGuess.br.x", type: "D" },
	brY: { name: "initialGuess.br.y", type: "Null" },
	brZ: { name: "initialGuess.br.z", type: "D" },
	blX: { name: "initialGuess.bl.x", type: "Null" },
	blY: { name: "initialGuess.bl.y", type: "Null" },
	blZ: { name: "initialGuess.bl.z", type: "D" },
};

/** Handle Maslow specific configuration messages
 * These would have all started with `$/Maslow_` which is expected to have been stripped away before calling this function
 */
const maslowMsgHandling = (msg) => {
	const common = new Common();
	const keyValue = msg.split("=");
	const errMsgSuffix = `${MaslowErrMsgKeyValueSuffix}${msg}`;
	if (keyValue.length !== 2) {
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
		const val = ("fnDisp" in cfgVal && typeof cfgVal.fnDisp === "function") ? cfgVal.fnDisp(value) : value;
		setValue(id, val);
		loadedValues(id, value);
	};

	const stdDimensionAction = (value) => Number.parseFloat(value);

	const cfgVal = cfgDef[key];
	if (typeof cfgVal !== "object") {
		return maslowErrorMsgHandling(`error: Could not find key '${key}' in the reference table. ${errMsgSuffix}`);
	}
	switch (cfgVal.type) {
		case "A":
			stdAction(cfgVal.name, value);
			break;
		case "D": {
			let dimEnt = common;
			if (!cfgVal.name) {
				// Well this is dangerous - so let's not do anything we'll regret very quickly
				return maslowErrorMsgHandling(`error: No 'name' value specified for '${key}' in the reference table. ${errMsgSuffix}`);
			}
			// Traverse through to the required entity
			for (const namePart of cfgVal.name.split(".")) {
				if (!(namePart in dimEnt)) {
					dimEnt[namePart] = null;
				}
				dimEnt = dimEnt[namePart];
			};
			dimEnt = stdDimensionAction(value);
		}
			break;
		default:
			// do nothing - a 'null' action
			break;
	}

	// Success - return an empty string
	return "";
};

const checkHomed = () => {
	if (!maslowStatus.homed) {
		const err_msg = `${M} does not know belt lengths. Please retract and extend before continuing.`;
		alert(err_msg);

		// Write to the console too, in case the system alerts are not visible
		const msgWindow = id('messages');
		if (msgWindow) {
			msgWindow.textContent = `${msgWindow.textContent}\n${err_msg}`;
			msgWindow.scrollTop = msgWindow.scrollHeight;
		}
	}

	return maslowStatus.homed;
};

/** Short hand convenience call to SendPrinterCommand with some preset values.
 * Uses the global function get_position, which is also a SendPrinterCommand with presets
 */
const sendCommand = (cmd) => {
	SendPrinterCommand(cmd, true, get_Position);
};

// The following functions are all defined as global functions, and are used by tablettab.html and other places
// They rely on the global function SendPrinterCommand defined in printercmd.js

/** Get all of the config (not corner) keys in the confiiguration definition */
const allConfigKeys = () => Object.keys(cfgDef).filter((key) => cfgDef[key].type === "A");

/** Used to populate the config popup when it loads */
const loadConfigValues = () => {
	for (const key of allConfigKeys()) {
		const cmd = `$/${M}_${key}`;
		SendPrinterCommand(cmd);
	};
};

/** Load all of the corner values */
const loadCornerValues = () => {
	for (const key of Object.keys(cfgDef).filter((key) => cfgDef[key].type === "D")) {
		const cmd = `$/${M}_${key}`;
		SendPrinterCommand(cmd);
	};
};

const saveConfigValues = () => {
	// Get all of the config data as entered, and as already loaded
	for (const key of allConfigKeys()) {
		const cfgVal = cfgDef[key];
		cfgVal.val = getValue(cfgVal.name);
		cfgVal.loadedVal = loadedValues(cfgVal.name);
	};

	const gridSpacingWidth = cfgDef.calibration_grid_width_mm_X.val / (cfgDef.calibration_grid_size.val - 1);
	const gridSpacingHeight = cfgDef.calibration_grid_height_mm_Y.val / (cfgDef.calibration_grid_size.val - 1);

	//If the grid spacing is going to be more than 200 don't save the values
	if (gridSpacingWidth > 260 || gridSpacingHeight > 260) {
		alert("Grid spacing is too large. Please reduce the grid size or increase the number of points.");
		return;
	}

	// Save the individual values
	for (const key of allConfigKeys) {
		const cfgVal = cfgDef[key];
		const value = typeof cfgVal.val === "undefined"
			? cfgVal.loadedVal
			: ("fnVal" in cfgVal && typeof cfgVal.fnVal === "function") ? cfgVal.fnVal(cfgVal.val) : cfgVal.val;
		if (value !== cfgVal.loadedVal) {
			const cmd = `$/${M}_${key}=${value}`;
			sendCommand(cmd);
		}
	};

	const common = new Common();
	refreshSettings(common.current_setting_filter);
	saveMaslowYaml();
	loadCornerValues();

	hideModal("configuration-popup");
};

export {
	MaslowErrMsgKeyValueCantUse,
	MaslowErrMsgNoKey,
	MaslowErrMsgNoValue,
	MaslowErrMsgNoMatchingKey,
	MaslowErrMsgKeyValueSuffix,
	maslowInfoMsgHandling,
	maslowErrorMsgHandling,
	maslowMsgHandling,
	checkHomed,
	sendCommand,
	loadConfigValues,
	loadCornerValues,
	saveConfigValues,
};
