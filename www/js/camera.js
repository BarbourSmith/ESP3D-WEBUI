import {
	displayBlock,
	displayNone,
	displayTable,
	id,
	getPrefValue,
	setPrefValue,
	SavePreferences,
	setHTML,
	get_icon_svg,
	setValue,
	valueStartsWith,
} from "./common.js";

/** Set up the event handlers for the camera tab */
const cameratab = () => {
	id("camera_webaddress").addEventListener("keyup", camera_OnKeyUp);

	id("cameratab_loadframe").addEventListener("click", camera_loadframe);
	id("cameratab_getaddress").addEventListener("click", camera_GetAddress);
	id("cameratab_saveaddress").addEventListener("click", camera_saveaddress);
	id("camera_detach_button").addEventListener("click", camera_detachcam);

	const iconOptions = { t: "translate(50,1200) scale(1,-1)" };
	setHTML("cameratab_loadframe", get_icon_svg("share-alt", iconOptions));
	setHTML("cameratab_getaddress", get_icon_svg("open", iconOptions));
	setHTML("cameratab_saveaddress", get_icon_svg("save", iconOptions));
	setHTML("camera_detach_button", get_icon_svg("new window", iconOptions));
};

function cameraformataddress() {
	let saddress = getValueTrimmed("camera_webaddress");
	const saddressl = saddress.toLowerCase();
	if (saddress) {
		const matchAddr = valueStartsWith(saddressl, ["https://", "http://", "rtp://", "rtps://", "rtp://"]);
		if (!matchAddr) {
			saddress = `http://${saddress}`;
		}
	}
	setValue("camera_webaddress", saddress);
}

function camera_loadframe() {
	const saddress = getValueTrimmed("camera_webaddress");
	if (saddress.length === 0) {
		id("camera_frame").src = "";
		displayNone(["camera_frame_display", "camera_detach_button"]);
	} else {
		cameraformataddress();
		id("camera_frame").src = getValue("camera_webaddress");
		displayBlock("camera_frame_display");
		displayTable("camera_detach_button");
	}
}

function camera_OnKeyUp(event) {
	if (event.keyCode === 13) {
		camera_loadframe();
	}
	return true;
}

function camera_saveaddress() {
	cameraformataddress();
	setPrefValue("camera_address", id("camera_webaddress").value);
	SavePreferences();
}

function camera_detachcam() {
	const webaddress = id("camera_frame").src;
	id("camera_frame").src = "";
	displayNone(["camera_frame_display", "camera_detach_button"]);
	window.open(webaddress);
}

function camera_GetAddress() {
	setValue("camera_webaddress", getPrefValue("camera_address") || "");
}

export { cameratab, camera_GetAddress };
