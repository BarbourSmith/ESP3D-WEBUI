import {
	displayNone,
	getChecked,
	id,
	setChecked,
	setHTML,
	get_icon_svg,
	opentab,
	creditsdlg,
	cameratab,
	configtab,
	changepassworddlg,
	showpreferencesdlg,
	trx_text_item,
	logindlg,
	DisconnectLogin,
	setupdlg,
	settingstab,
} from "./common.js";

const navBarMainTabLink = (event) => opentab(event, "maintab", "mainuitabscontent", "mainuitablinks");
const navBarCamTabLink = (event) => opentab(event, "cameratab", "mainuitabscontent", "mainuitablinks");
const navBarConfigTabLink = (event) => opentab(event, "configtab", "mainuitabscontent", "mainuitablinks");
const navBarSettingTabLink = (event) => opentab(event, "settingstab", "mainuitabscontent", "mainuitablinks");
const navBarTabletTabLink = (event) => opentab(event, "tablettab", "mainuitabscontent", "mainuitablinks");

const navBarLogout = () => confirmdlg(trx_text_item("Disconnection requested"), trx_text_item("Please confirm disconnection."), DisconnectLogin);

/** Set up the event handlers for the navbar */
const navbar = () => {
	id("toggleLockUI").addEventListener("click", ontoggleLock);

	id("showPreferencesDlg").addEventListener("click", showpreferencesdlg);
	id("showSetupDlg").addEventListener("click", setupdlg);
	id("showCreditsDlg").addEventListener("click", creditsdlg);

	// Note: for `maintab` see dashtab.html
	id("maintablink").addEventListener("click", navBarMainTabLink);
	id("camtablink").addEventListener("click", navBarCamTabLink);
	// id("configtablink").addEventListener("click", navBarConfigTabLink);
	id("settingtablink").addEventListener("click", navBarSettingTabLink);
	id("tablettablink").addEventListener("click", navBarTabletTabLink);

	id("password_menu").addEventListener("click", changepassworddlg);
	id("showLoginDlg").addEventListener("click", logindlg);
	id("logout_menu").addEventListener("click", navBarLogout);

	const iconOptions = { t: "translate(50,1200) scale(1,-1)" };
	const buildTabLinkItem = (icon, label) => `${get_icon_svg(icon, iconOptions)}<span>${trx_text_item(label)}</span>`;
	// const buildConfigTabLinkItem = (icon, label) => `${get_icon_svg(icon, iconOptions)}<span id='tab_printer_configuration'><span>${trx_text_item(label)}</span></span>`;
	setHTML("maintablink", buildTabLinkItem("tasks", ""));
	setHTML("camtablink", buildTabLinkItem("facetime-video", "Camera"));
	// setHTML("configtablink", buildTabLinkItem("wrench", "Printer"));
	setHTML("settingtablink", buildTabLinkItem("scale", "FluidNC"));
	// setHTML("tablettablink", get_icon_svg("scale", iconOptions}));

	const iconDDOptions = iconOptions;
	iconDDOptions.color = "#337AB7";
	setHTML("dropdownSetup", get_icon_svg("align-justify", iconDDOptions));
	setHTML("dropdownAuth", `${get_icon_svg("align-justify", iconDDOptions)}<span id="current_ID"></span><span id="current_auth_level"></span>`);

	const buildDropDownItem = (title, icon) => `<span class="pull-right">${trx_text_item(title)}</span><span class="pull-left">${get_icon_svg(icon, iconOptions)}</span><span class="clearfix"></span>`
	// setHTML("FW_github", buildDropDownItem("Firmware", "cog"));
	// setHTML("UI_github", buildDropDownItem("Interface", "eye-open"));
	setHTML("showPreferencesDlg", buildDropDownItem("Preferences", "star"));
	setHTML("showSetupDlg", buildDropDownItem("Setup", "edit"));
	setHTML("showCreditsDlg", buildDropDownItem("Credits", "thumbs-up"));

	setHTML("password_menu", buildDropDownItem("Password", "lock"));
	setHTML("showLoginDlg", buildDropDownItem("Login", "login"));
	setHTML("logout_menu", buildDropDownItem("Log out", "log-out"));

	cameratab();
	configtab();
	settingstab();
};

const enableItem = (itemName) => {
	const itemElem = id(itemName);
	if (!itemElem) {
		return;
	}

	itemElem.disabled = false;
};

const disable_items = (item, state) => {
	if (!item) {
		return;
	}
	const liste = item.getElementsByTagName("*");
	for (let i = 0; i < liste.length; i++) {
		liste[i].disabled = state;
	}
}

const ontoggleLock = (forcevalue) => {
	if (typeof forcevalue !== "undefined") {
		setChecked("lock_UI", forcevalue);
	}

	const jogUIElem = id("JogUI");
	if (getChecked("lock_UI") !== "false") {
		setHTML("lock_UI_btn_txt", trx_text_item("Unlock interface"));
		disable_items(id("maintab"), true);
		disable_items(id("configtab"), true);
		enableItem("progress_btn");
		enableItem("clear_monitor_btn");
		enableItem("monitor_enable_verbose_mode");
		enableItem("monitor_enable_autoscroll");
		enableItem("settings_update_fw_btn");
		enableItem("settings_restart_btn");
		if (jogUIElem) {
			disable_items(jogUIElem, false);
			displayNone("JogUI");
		}
	} else {
		setHTML("lock_UI_btn_txt", trx_text_item("Lock interface"));
		disable_items(id("maintab"), false);
		disable_items(id("configtab"), false);
		enableItem("settings_update_fw_btn");
		enableItem("settings_restart_btn");
		if (jogUIElem) {
			jogUIElem.style.pointerEvents = "auto";
		}
	}
};

export { navbar, ontoggleLock };
