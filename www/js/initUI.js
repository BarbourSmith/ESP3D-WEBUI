import {
	Common,
	connectdlg,
	id,
	displayBlock,
	displayFlex,
	displayInitial,
	displayInline,
	displayNone,
	displayTable,
	displayUndoNone,
	setHTML,
	setValue,
	closeModal,
	init_command_panel,
	init_controls_panel,
	init_files_panel,
	init_grbl_panel,
	getpreferenceslist,
	initpreferences,
	build_axis_selection,
	tryAutoReport,
	grblpanel,
	build_HTML_setting_list,
	refreshSettings,
	setupdlg,
	get_icon_svg,
} from "./common.js";

/** Set the page's title */
const Set_page_title = (page_title = "") => {
	const common = new Common();
	if (page_title) {
		common.fwData.esp_hostname = page_title;
	}
	document.title = common.fwData.esp_hostname;
}

const hideAxiscontrols = () => {
	displayNone(["JogBar", "HomeZ", "control_z_position_display", "control_zm_position_row", "z_velocity_display"]);
	displayBlock("CornerZ");
}

const showAxiscontrols = () => {
	displayNone("CornerZ");
	displayBlock(["JogBar", "HomeZ", "control_z_position_display"]);
	displayTable("control_zm_position_row");
	displayInline("z_velocity_display");
}

const update_UI_firmware_target = () => {
	const common = new Common();
	initpreferences();
	setHTML("control_x_position_label", "X");
	setHTML("control_y_position_label", "Y");
	setHTML("control_z_position_label", "Z");
	showAxiscontrols();

	const fwName = "FluidNC";
	// displayNone(["configtablink", "auto_check_control", "progress_btn", "abort_btn", "motor_off_control"]);
	displayNone(["auto_check_control", "progress_btn", "abort_btn", "motor_off_control"]);
	setHTML("tab_title_configuration", "<span translate>GRBL configuration</span>");
	// setHTML("tab_printer_configuration", "<span translate>GRBL</span>");
	const fif = id("files_input_file");
	if (fif) {
		fif.accept = ".g,.gc,.gco,.gcode,.nc,.txt,.G,.GC,.GCO,.GCODE,.NC,.TXT";
	}
	displayInitial("zero_xyz_btn");
	displayInitial("zero_x_btn");
	displayInitial("zero_y_btn");
	if (common.fwData.grblaxis > 2) {
		//displayInitial('control_z_position_display');
		setHTML("control_z_position_label", "Zw");
	} else {
		hideAxiscontrols();
		displayNone("z_feedrate_group");
	}
	if (common.fwData.grblaxis > 3) {
		id("zero_xyz_btn_txt").innerHTML += "A";
		common.grblzerocmd += " A0";
		build_axis_selection();
		displayBlock(["a_feedrate_group", "control_a_position_display"]);
		id("positions_labels2").style.display = "inline-grid";
	}
	if (common.fwData.grblaxis > 4) {
		displayBlock(["control_b_position_display", "b_feedrate_group"]);
		id("zero_xyz_btn_txt").innerHTML += "B";
		common.grblzerocmd += " B0";
	}
	if (common.fwData.grblaxis > 5) {
		displayBlock(["control_c_position_display", "c_feedrate_group"]);
		id("zero_xyz_btn_txt").innerHTML += "C";
	} else {
		displayNone("control_c_position_display");
	}
	displayFlex("grblPanel");
	grblpanel();
	// id('FW_github').href = 'https://github.com/bdring/FluidNC';
	displayBlock("settings_filters");
	setHTML("control_x_position_label", "Xw");
	setHTML("control_y_position_label", "Yw");

	// Swap AP Mode and STA Mode
	common.SETTINGS_AP_MODE = 2;
	common.SETTINGS_STA_MODE = 1;

	setHTML("fwName", fwName);
	//SD image or not
	setHTML("showSDused", common.fwData.direct_sd ? get_icon_svg("sd-video", { t: "translate(50,1200) scale(1,-1)", color: "#777777" }) : "");

	return fwName;
}

const total_boot_steps = 5;
let current_boot_steps = 0;

const display_boot_progress = () => {
	current_boot_steps++;
	setValue("load_prg", Math.round((current_boot_steps * 100) / total_boot_steps));
}

/** InitUI step1 - try to connect to the ESP32 */
const initUI = () => {
	const common = new Common();
	console.log("Init UI - Step 1");

	// Start up connect dialog, don't try and get the FW data
	connectdlg(false);

	display_boot_progress();
	//check FW
	update_UI_firmware_target();
	//set title using hostname
	Set_page_title();
	//update UI version
	setHTML("UI_VERSION", common.web_ui_version);
	//update FW version
	setHTML("FW_VERSION", common.fwData.fw_version);
	// Get the element with id="defaultOpen" and click on it
	id("tablettablink").click();

	if (id("grblcontroltablink")) {
		id("grblcontroltablink").click();
	}

	initUI_2();

	setTimeout(tryAutoReport, 500); //Not sure why this needs a delay but it seems like a hack
}

/** InitUI step2 - get settings from ESP3D and start processing them */
function initUI_2() {
	console.log("Init UI - Step 2 - Get Settings");
	display_boot_progress();
	//query settings but do not update list in case wizard is showed
	refreshSettings(true);
	initUI_3();
}

/** InitUI step3 - Initialise the control and GRBL panels, get the preferences */
function initUI_3() {
	console.log("Init UI - Step 3 - Initialise the control and GRBL panels, get the preferences");
	display_boot_progress();
	GetPreferencesList();
	// Yet another hack to wait for the preferences to be set
	setTimeout(() => {
		//init panels
		init_controls_panel();
		// This is in preferencesdlg.js
		applypreferenceslist();
		init_grbl_panel();
		initUI_4();
	}, 1500);
}

/** InitUI step4 - Initialise the command and files panels, determine if the setup wizard needs to be run */
function initUI_4() {
	const common = new Common();
	console.log("Init UI - Step 4 - Initialise the command and files panels, determine if the setup wizard needs to be run");
	display_boot_progress();
	init_command_panel();
	init_files_panel(false);
	//check if we need setup
	if (common.fwData.target_firmware === "???") {
		console.log("Launch Setup");
		display_boot_progress();
		closeModal("Connection successful");
		setupdlg();
	} else {
		//wizard is done UI can be updated
		common.setup_is_done = true;
		common.do_not_build_settings = false;
		display_boot_progress();
		build_HTML_setting_list(common.current_setting_filter);
		closeModal();
	}
}

export { Set_page_title, update_UI_firmware_target, initUI };
