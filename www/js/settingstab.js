import {
	Common,
	id,
	build_HTML_setting_list,
	refreshSettings,
	restart_esp,
	setHTML,
	get_icon_svg,
	SPIFFSdlg,
	statusdlg,
	updatedlg,
} from "./common.js";

const settingsTabnvs_setting_filter = () => build_HTML_setting_list("nvs");
const settingsTabtree_setting_filter = () => build_HTML_setting_list("tree");

const settingsTabsettings_SPIFFS_btn = () => SPIFFSdlg("/");

const settingsTabsettings_refresh_btn = () => {
const common = new Common();
	refreshSettings(common.current_setting_filter);
}

/** Set up the event handlers for the settings tab */
const settingstab = () => {
	id("nvs_setting_filter").addEventListener("click", settingsTabnvs_setting_filter);
	id("tree_setting_filter").addEventListener("click", settingsTabtree_setting_filter);

	id("settings_status_btn").addEventListener("click", statusdlg);
	id("settings_SPIFFS_btn").addEventListener("click", settingsTabsettings_SPIFFS_btn);
	id("settings_update_fw_btn").addEventListener("click", updatedlg);
	id("settings_restart_btn").addEventListener("click", restart_esp);

	id("settings_refresh_btn").addEventListener("click", settingsTabsettings_refresh_btn);

	const iconOptions = { t: "translate(50,1200) scale(1,-1)" };
	setHTML("settings_status_btn", get_icon_svg("th-list", iconOptions));
	setHTML("settings_update_fw_btn", get_icon_svg("cloud-download", iconOptions));
	setHTML("settings_restart_btn", get_icon_svg("off", iconOptions));
	setHTML("settings_refresh_btn", get_icon_svg("refresh", iconOptions));
	setHTML("settings_SPIFFS_btn", get_icon_svg("folder-open", iconOptions));
};

export { settingstab };
