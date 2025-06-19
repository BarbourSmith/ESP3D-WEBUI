import { prefDefs, HTMLDecode, trx_text_item } from "./common.js";

// Add in the validation function definitions to the prefDefs
prefDefs.enable_grbl_panel.prefDefs.autoreport_interval.valFunc = (value) => {
	const vInt = Number.parseInt(value);
	return !Number.isNaN(vInt) && (vInt === 0 || (vInt >= 50 && vInt <= 30000))
		? ""
		: trx_text_item("Value of auto-report must be 0 or between 50ms and 30000ms !!");
};

prefDefs.enable_files_panel.prefDefs.f_filters.valFunc = (value) => {
	const extPat = /^[a-z0-9;]*$/i;
	return value.match(extPat) ? "" : trx_text_item("Only alphanumeric chars separated by ; for extensions filters !!");
};

/** Return the `fieldId`, if defined, otherwise return the `key` */
const buildFieldId = (key, value) => value.fieldId || key;

/** Build a complete set of preferences from the prefDefs.
 * Useful for initialisation of preferences.json
 * * `defValue` - is the original value as defined in the prefDefs above
 * * `fileValue` - is the value as currently stored in the value (or that soon will be if the preferences are being saved)
 * * `value` - is the value as currently set and in use in the UI
 */
const buildPrefsFromDefs = (prefLevel = prefDefs) => {
	const prefs = {};
	for (const [key, value] of Object.entries(prefLevel)) {
		prefs[key] = {
			valueType: value.valueType,
			defValue: value.defValue,
			fileValue: value.defValue,
			value: value.defValue,
			fieldId: buildFieldId(key, value),
		};

		if (value.valueType === "enctext") {
			// all values are stored as HTML encoded text
			prefs[key].defValue = HTMLDecode(prefs[key].defValue);
			prefs[key].fileValue = HTMLDecode(prefs[key].fileValue);
			prefs[key].value = HTMLDecode(prefs[key].value);
		}

		if ("prefDefs" in value) {
			// Transfer the child level values back to this parent level
			for (const [cKey, cValue] of Object.entries(buildPrefsFromDefs(value.prefDefs))) {
				prefs[cKey] = cValue;
			}
		}
	}

	return prefs;
};

/** Get the named preference object */
const getPref = (prefName) => {
	let pref = preferences[prefName];
	if (!pref) {
		// try to find it by looking for the fieldId
		for (const [key, value] of Object.entries(preferences)) {
			if (value.fieldId === prefName) {
				pref = value;
				break;
			}
		}
	}
	if (!pref) {
		console.error(stdErrMsg("Unknown Preference", `'${prefName}' not found as a preference key or as the fieldId within a preference value`));
		return undefined;
	}
	return pref;
};

/** Get the part of the prefDefs structure identified by the name supplied.
 * If the name is not found then undefined is returned
 */
const getPrefDefPath = (prefName) => {
	const prefPath = prefName
		.trim()
		.replace(".", ".prefDefs.")
		.replace(".prefDefs.prefDefs.", ".prefDefs.");
	let pref = prefDefs;
	for (let ix = 0; ix < prefPath.length; ix++) {
		if (typeof pref[prefPath[ix]] === "undefined") {
			return undefined;
		}
		pref = pref[prefPath[ix]];
	}
	return pref;
};

/** Get the named preference value, or undefined */
const getPrefValue = (prefName) => getPref(prefName)?.value;

/** Set the preference item to the supplied value.
 * Returns true for success, false for failure - usually because the preference item does not exist
 */
const setPrefValue = (prefName, value) => {
	const pref = getPrefDefPath(prefName);
	if (!pref) {
		return false;
	}
	// TODO: test the typeof the value is compatible with the valueType
	pref.value = value;
	return true;
};

/** The actual preferences as used throught the app */
const preferences = buildPrefsFromDefs(prefDefs);

/** Helper method to get the `enable_ping` preference value */
const enable_ping = () => getPrefValue("enable_ping");

/** Determine if the preferences have been modified */
const PreferencesModified = () => {
	let isModified = false;

	for (const [prefName, value] of Object.entries(preferences)) {
		const key = prefName === "language_list" ? "language" : prefName;
		if (value.fileValue !== value.value) {
			isModified = true;
			break;
		}
	}

	return isModified;
}

/** Build the flat preferences json structure from the preferences */
const BuildPreferencesJson = () => {
	const preferenceslist = [];

	for (const [prefName, value] of Object.entries(preferences)) {
		const key = prefName === "language_list" ? "language" : prefName;
		if (value.fileValue !== value.value) {
			value.fileValue = value.value;
		}

		preferenceslist.push(`"${key}":"${value.fileValue}"`);
	}

	return `[{\n${preferenceslist.join(",\n")}\n}]`;
}

/** Load the flat preferences json structure into the preferences */
const LoadPreferencesJson = (preferenceslist = "") => {
	if (!preferenceslist) {
		return;
	}

	let prefs;

	try {
		prefs = JSON.parse(preferenceslist)[0];
	} catch (e) {
		console.error("Parsing error:", e);
		return;
	}

	for (const [key, value] of Object.entries(preferences)) {
		if (!(key in prefs)) {
			continue;
		}
		const prefName = (key === "language") ? "language_list" : key;
		switch (value.valueType) {
			case "panel":
			case "bool":
				if (typeof prefs[key] === "boolean") {
					setPrefValue(prefName, `${prefs[key]}`);
				}
				if (typeof prefs[key] === "string") {
					setPrefValue(prefName, prefs[key].toLowerCase() === "false" || !prefs[key] ? "false" : "true");
				}
				break;
			case "int":
				if (typeof prefs[key] === "number") {
					setPrefValue(prefName, prefs[key]);
				}
				if (typeof prefs[key] === "string") {
					const vInt = Number.parseInt(prefs[key]);
					if (!Number.isNaN(vInt)) {
						setPrefValue(prefName, vInt);
					}
				}
				break;
			case "float":
				if (typeof prefs[key] === "number") {
					setPrefValue(prefName, prefs[key]);
				}
				if (typeof prefs[key] === "string") {
					const vFloat = Number.parseFloat(prefs[key]);
					if (!Number.isNaN(vFloat)) {
						setPrefValue(prefName, vFloat);
					}
				}
				break;
			case "text":
			case "select":
				setPrefValue(prefName, prefs[key]);
				break;
			case "enctext":
				setPrefValue(prefName, HTMLDecode(prefs[key]));
				break;
			default:
				console.log(`${key}: ${JSON.stringify(value)}`);
				break;
		}
	}
}

export {
	buildFieldId,
	enable_ping,
	getPref,
	getPrefValue,
	setPrefValue,
	preferences,
	PreferencesModified,
	BuildPreferencesJson,
	LoadPreferencesJson,
};
