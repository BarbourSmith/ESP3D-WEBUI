/** Imports everything else, and re-exports them, helping to flatten out all of the myriad circular dependencies
 * Also has its own class `common` that can funtion as an alternative to globals
 */
// The following must be imported first, and in this order
import { M } from "./constants.js";
import {
	elemsByClass,
	conErr,
	stdErrMsg,
	getChecked,
	setChecked,
	getValue,
	setValue,
	getText,
	setText,
	setTextContent,
	setClassName,
	setHTML,
	HTMLEncode,
	HTMLDecode,
	id,
	browser_is,
} from "./util.js";
import { displayBlock, displayFlex, displayTable, displayInitial, displayInline, displayNone, displayUndoNone } from "./utilDisplay.js";
import { numpad } from "./numpad.js";
import { checkValue, valueIsFloat, valueStartsWith } from "./utilValidation.js";
import { httpCmd, httpCmdType, BuildFormDataFiles, buildHttpLoginCmd, buildHttpFilesCmd, buildHttpFileCmd, buildHttpFileGetCmd, buildHttpCommandCmd } from "./httpCmdBuilders.js";

import { alertdlg } from "./alertdlg.js";
import {
	CALIBRATION_EVENT_NAME,
	findMaxFitness,
} from "./calculatesCalibrationStuff.js";
import { cameratab, camera_GetAddress } from "./camera.js";
import {
	init_command_panel,
	Monitor_check_autoscroll,
	Monitor_check_verbose_mode,
	Monitor_output_Update,
} from "./commands.js";
import {
	Apply_config_override,
	Delete_config_override,
	refreshconfig,
	getESPconfigSuccess,
} from "./config.js";
import { configtab } from "./configtab.js";
import { confirmdlg } from "./confirmdlg.js";
import { connectdlg } from "./connectdlg.js";
import {
	ControlsPanel,
	get_Position,
	init_controls_panel,
	on_autocheck_position,
} from "./controls.js";
import { creditsdlg } from "./creditsdlg.js";
import { clear_drop_menu } from "./dropmenu.js";
import {
	build_file_filter_list,
	BuildFileUploadFormData,
	files_currentPath,
	files_file_list,
	files_list_success,
	files_select_upload,
	init_files_panel,
} from "./files.js";
import {
	getAxisFromValue,
	build_axis_selection,
	control_changeaxis,
	grblHandleMessage,
	grbl_reset,
	init_grbl_panel,
	onAutoReportIntervalChange,
	onstatusIntervalChange,
	onprobemaxtravelChange,
	onprobefeedrateChange,
	onproberetractChange,
	onprobetouchplatethicknessChange,
	reportNone,
	tryAutoReport,
	reportPolled,
	SendRealtimeCmd,
	StartProbeProcess,
	MPOS,
	WPOS,
	AxisFeedRate,
	setSpindleSpeed,
} from "./grbl.js";
import { grblpanel } from "./grblpanel.js";
import { clear_cmd_list, SendFileHttp, SendGetHttp, CheckForHttpCommLock } from "./http.js";
import { get_icon_svg, list_icon } from "./icons.js";
import { Set_page_title, update_UI_firmware_target, initUI } from "./initUI.js";
import { inputdlg } from "./inputdlg.js";
import { build_language_list, translate_text_item } from "./langUtils.js";
import { DisconnectLogin, logindlg } from "./logindlg.js";
import { showmacrodlg } from "./macrodlg.js";
import {
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
} from "./maslow.js";
import {
	listmodal,
	closeModal,
	getactiveModal,
	setactiveModal,
	showModal,
} from "./modaldlg.js";
import { navbar, ontoggleLock } from "./navbar.js";
import { changepassworddlg } from "./passworddlg.js";
import { prefDefs } from "./prefDefs.js";
import {
	buildFieldId,
	enable_ping,
	getPref,
	getPrefValue,
	setPrefValue,
	preferences,
	PreferencesModified,
	BuildPreferencesJson,
	LoadPreferencesJson,
} from "./prefUtils.js";
import {
	getpreferenceslist,
	initpreferences,
	showpreferencesdlg,
	SavePreferences,
} from "./preferencesdlg.js";
import { SendPrinterCommand } from "./printercmd.js";
import { restartdlg } from "./restartdlg.js";
import { scanwifidlg } from "./scanwifidlg.js";
import {
	build_control_from_pos,
	build_HTML_setting_list,
	define_esp_role,
	define_esp_role_from_pos,
	defval,
	get_index_from_eeprom_pos,
	refreshSettings,
	restart_esp,
	saveMaslowYaml,
} from "./settings.js";
import { settingstab } from "./settingstab.js";
import { setupdlg } from "./setupdlg.js";
import { Interpreter } from "./simple-interpreter.js";
import { parseLine } from "./simple-parser.js";
import { Toolpath } from "./simple-toolpath.js";
import {
	CancelCurrentUpload,
	handlePing,
	EventListenerSetup,
	pageID,
	process_socket_response,
	startSocket,
} from "./socket.js";
import { SPIFFSdlg } from "./SPIFFSdlg.js";
import { statusdlg } from "./statusdlg.js";
import { opentab } from "./tabs.js";
import {
	loadedValues,
	openModal,
	hideModal,
	goAxisByValue,
	onCalibrationButtonsClick,
	saveJogDists,
	saveSerialMessages,
	showGCode,
	tabletInit,
	tabletGrblState,
	tabletShowMessage,
	tabletUpdateModal,
} from "./tablet.js";
import { drawTPBtns } from "./tabletControls.js";
import { arrayToXYZ, refreshGcode, tpDisplayer, tpInit } from "./toolpath-displayer.js";
import { translate_text, trx_text_item } from "./translate.js";
import { UIdisableddlg } from "./UIdisableddlg.js";
import { updatedlg } from "./updatedlg.js";

/** Selected values that were globals, now set up as members of a singleton */
class Common {
	constructor() {
		if (Common.instance instanceof Common) {
			// biome-ignore lint/correctness/noConstructorReturn: <explanation>
			return Common.instance;
		}

		// See calculatesCalibrationStuff.js
		this.acceptableCalibrationThreshold = 0.5;
		/** Establish initial guesses for the corners */
		this.initialGuess = {
			tl: { x: 0, y: 2000 },
			tr: { x: 3000, y: 2000 },
			bl: { x: 0, y: 0 },
			br: { x: 3000, y: 0 },
			fitness: 100000000,
		};

		this.web_ui_version = "0.88";

		/** See connectdlg.js */
		this.fwData = {
			fw_version: "",
			target_firmware: "",
			direct_sd: false,
			primary_sd: "/ext/",
			secondary_sd: "/sd/",
			ESP3D_authentication: false,
			async_webcommunication: false,
			websocket_port: 0,
			websocket_ip: "",
			esp_hostname: "ESP3D WebUI",
			grblaxis: 3,
			success: true,
		}

		/** See controls.js */
		this.control_macrolist = [];

		/** See file.js */
		this.gCodeFilename = "";

		/** See grbl.js */
		this.calibrationResults = {};
		this.grblzerocmd = "X0 Y0 Z0";
		this.reportType = 'none';
		this.spindleTabSpindleSpeed = 1;
		this.modal = {
			modes: "",
			plane: "G17",
			units: "G21",
			wcs: "G54",
			distance: "G90",
		};
		this.MPOS = [0, 0, 0];
		this.WPOS = [0, 0, 0];
		this.axisNames = ["x", "y", "z", "a", "b", "c"];

		/** See http.js */
		this.http_communication_locked = false;
		this.xmlhttpupload;

		/** See loadHTML.js - coming soon */
		this.loadedHTML = [];

		/** See preferencesdlg.js */
		this.enable_ping = true;
		/** This clunker piece of code works with/against `this.language` below */
		this.language_save = "en";

		/** See printercmd.js */
		this.grbl_errorfn = null;
		this.grbl_processfn = null;

		/** See settings.js */
		this.current_setting_filter = "nvs";
		this.setup_is_done = false;
		this.do_not_build_settings = false;

		this.SETTINGS_AP_MODE = 1;
		this.SETTINGS_STA_MODE = 2;
		this.SETTINGS_FALLBACK_MODE = 3;

		/** See setupdlg.js */
		this.EP_STA_SSID = "Sta/SSID";
		this.EP_STA_PASSWORD = "Sta/Password";
		this.EP_WIFI_MODE = "WiFi/Mode";
		this.EP_AP_SSID = "AP/SSID";
		this.EP_AP_PASSWORD = "AP/Password";
		this.EP_IS_DIRECT_SD = 850;
		this.EP_PRIMARY_SD = 851;
		this.EP_SECONDARY_SD = 852;
		this.EP_DIRECT_SD_CHECK = 853;

		/** Apparently unused ? */
		this.EP_STA_IP_MODE = "Sta/IPMode";
		this.EP_STA_IP_VALUE = "Sta/IP";
		this.EP_STA_GW_VALUE = "Sta/Gateway";
		this.EP_STA_MK_VALUE = "Sta/Netmask";
		this.EP_AP_IP_VALUE = "AP/IP";
		this.EP_BAUD_RATE = 112;
		this.EP_AUTH_TYPE = 119;
		this.EP_TARGET_FW = 461;

		/** Id of the interval timer */
		this.interval_ping = -1;

		/** See SPIFFSdlg.js */
		this.SPIFFS_currentpath = "/";

		/** see tablet.js */
		this.gCodeDisplayable = false;

		/** see translate.js */
		/** This clunker piece of code works with/against `this.language_save` above */
		this.language = 'en';

		/** See util.js */
		this.last_ping = 0;

		this.esp_error_code = 0;
		this.esp_error_message = "";

		// Use Object.freeze(this.whatever) if you need something to stay unchanged

		Common.instance = this;
	}
}

export {
	Common,
	// from alertdlg.js
	alertdlg,
	// from calculatesCalibrationStuff.js
	CALIBRATION_EVENT_NAME,
	findMaxFitness,
	// from camera.js
	cameratab,
	camera_GetAddress,
	// from commands.js
	init_command_panel,
	Monitor_check_autoscroll,
	Monitor_check_verbose_mode,
	Monitor_output_Update,
	// from config.js
	Apply_config_override,
	Delete_config_override,
	refreshconfig,
	getESPconfigSuccess,
	// from configtab.js
	configtab,
	// from confirmdlg.js
	confirmdlg,
	// from connectdlg.js
	connectdlg,
	// from constants.js
	M,
	// from controls.js
	ControlsPanel,
	get_Position,
	init_controls_panel,
	on_autocheck_position,
	// from creditsdlg.js
	creditsdlg,
	// from dropmenu.js
	clear_drop_menu,
	// files.js
	build_file_filter_list,
	BuildFileUploadFormData,
	files_currentPath,
	files_file_list,
	files_list_success,
	files_select_upload,
	init_files_panel,
	// from grbl.js
	getAxisFromValue,
	build_axis_selection,
	control_changeaxis,
	grblHandleMessage,
	grbl_reset,
	init_grbl_panel,
	onAutoReportIntervalChange,
	onstatusIntervalChange,
	onprobemaxtravelChange,
	onprobefeedrateChange,
	onproberetractChange,
	onprobetouchplatethicknessChange,
	reportNone,
	tryAutoReport,
	reportPolled,
	SendRealtimeCmd,
	StartProbeProcess,
	MPOS,
	WPOS,
	AxisFeedRate,
	setSpindleSpeed,
	// from grblpanel.js
	grblpanel,
	// from httpCmdBuilders.js
	httpCmd, httpCmdType, BuildFormDataFiles, buildHttpLoginCmd, buildHttpFilesCmd, buildHttpFileCmd, buildHttpFileGetCmd, buildHttpCommandCmd,
	// from http.js
	clear_cmd_list,
	SendFileHttp,
	SendGetHttp,
	CheckForHttpCommLock,
	// from icons.js
	get_icon_svg,
	list_icon,
	// from "./initUI.js";
	Set_page_title, update_UI_firmware_target, initUI,
	// from inputdlg.js
	inputdlg,
	// from langUtils.js
	build_language_list,
	translate_text_item,
	// from logindlg.js
	DisconnectLogin,
	logindlg,
	// from macrodlg.js
	showmacrodlg,
	// from maslow.js
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
	// from modaldlg.js
	listmodal,
	closeModal,
	getactiveModal,
	setactiveModal,
	showModal,
	// from navbar.js
	navbar,
	ontoggleLock,
	// from numpad.js
	numpad,
	// from passworddlg.js
	changepassworddlg,
	// from prefDefs.js
	prefDefs,
	// from prefUtils.js
	buildFieldId,
	enable_ping,
	getPref,
	getPrefValue,
	setPrefValue,
	preferences,
	PreferencesModified,
	BuildPreferencesJson,
	LoadPreferencesJson,
	// from preferencesdlg.js
	getpreferenceslist,
	initpreferences,
	showpreferencesdlg,
	SavePreferences,
	// from printercmd.js
	SendPrinterCommand,
	// from restartdlg.js
	restartdlg,
	// from scanwifidlg.js
	scanwifidlg,
	// from settings.js
	build_control_from_pos,
	build_HTML_setting_list,
	define_esp_role,
	define_esp_role_from_pos,
	defval,
	get_index_from_eeprom_pos,
	refreshSettings,
	restart_esp,
	saveMaslowYaml,
	// from setupdlg.js
	setupdlg,
	// from settingstab.js
	settingstab,
	// from "./simple-parser.js";
	parseLine,
	// from "./simple-interpreter.js";
	Interpreter,
	// from simple-toolpath.js
	Toolpath,
	// from socket.js
	CancelCurrentUpload,
	handlePing,
	EventListenerSetup,
	pageID,
	process_socket_response,
	startSocket,
	// from SPIFFSdlg.js
	SPIFFSdlg,
	// from statusdlg.js
	statusdlg,
	// from tabs.js
	opentab,
	// from tablet.js
	loadedValues,
	openModal,
	hideModal,
	goAxisByValue,
	onCalibrationButtonsClick,
	saveJogDists,
	saveSerialMessages,
	showGCode,
	tabletInit,
	tabletGrblState,
	tabletShowMessage,
	tabletUpdateModal,
	// from "./tabletControls.js";
	drawTPBtns,
	// from "./toolpath-displayer.js";
	arrayToXYZ, refreshGcode, tpDisplayer, tpInit,
	// from translate.js
	translate_text, trx_text_item,
	// from UIdisableddlg.js
	UIdisableddlg,
	// from updatedlg.js
	updatedlg,
	// from util.js
	elemsByClass,
	conErr,
	stdErrMsg,
	getChecked,
	setChecked,
	getValue,
	setValue,
	getText,
	setText,
	setTextContent,
	setClassName,
	setHTML,
	HTMLEncode,
	HTMLDecode,
	id,
	browser_is,
	// from utilDisplay.js
	displayBlock, displayFlex, displayTable, displayInitial, displayInline, displayNone, displayUndoNone,
	// from utilValidation.js
	checkValue,
	valueIsFloat,
	valueStartsWith,
};
