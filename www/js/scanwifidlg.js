import {
	get_icon_svg,
	conErr,
	stdErrMsg,
	displayBlock,
	displayNone,
	id,
	getValue,
	setValue,
	setHTML,
	closeModal,
	setactiveModal,
	showModal,
	httpCmdType,
	buildHttpCommandCmd,
	SendGetHttp,
	trx_text_item,
} from "./common.js";

let ssid_item_scanwifi = -1;
let ssid_subitem_scanwifi = -1;

const scanWiFiDlgCancel = () => closeModal("cancel");

/** scanwifi dialog */
const scanwifidlg = (item, subitem) => {
	const modal = setactiveModal("scanwifidlg.html", scanwifidlg_close);
	if (modal == null) {
		return;
	}

	id("scanWiFiDlgCancel").addEventListener("click", scanWiFiDlgCancel);
	id("scanWiFiDlgClose").addEventListener("click", scanWiFiDlgCancel);
	id("refresh_scanwifi_btn").addEventListener("click", refresh_scanwifi);

	const iconOptions = {t: "translate(50,1200) scale(1,-1)"};
	setHTML("refresh_scanwifi_btn", get_icon_svg("refresh", iconOptions));

	ssid_item_scanwifi = item;
	ssid_subitem_scanwifi = subitem;
	showModal();
	refresh_scanwifi();
};

function refresh_scanwifi() {
	displayBlock(["AP_scan_loader", "AP_scan_status"]);
	displayNone(["AP_scan_list", "refresh_scanwifi_btn"]);
	setHTML("AP_scan_status", trx_text_item("Scanning"));
	const cmd = buildHttpCommandCmd(httpCmdType.plain, "[ESP410]");
	SendGetHttp(cmd, getscanWifiSuccess, getscanWififailed);
}

function process_scanWifi_answer(response_text) {
	let result = true;
	let content = "";
	const actions = [];
	try {
		const response = JSON.parse(response_text);
		if (typeof response.AP_LIST === "undefined") {
			result = false;
		} else {
			const aplist = response.AP_LIST;
			//console.log("found " + aplist.length + " AP");
			aplist.sort((a, b) => Number.parseInt(a.SIGNAL) - Number.parseInt(b.SIGNAL));
			for (let i = aplist.length - 1; i >= 0; i--) {
				const protIcon = aplist[i].IS_PROTECTED === "1" ? get_icon_svg("lock") : "";
				const escapedSSID = aplist[i].SSID.replace("'", "\\'").replace('"', '\\"',);
				const btnId = `scanWiFiDlg_btn_select_${i}`;
				content += "<tr>";
				content += `<td style='vertical-align:middle'>${aplist[i].SSID}</td>`;
				content += `<td style='text-align:center;vertical-align:middle;'>${aplist[i].SIGNAL}%</td>`;
				content += `<td style='text-align:center;vertical-align:middle'>${protIcon}</td>`;
				content += `<td><button id="${btnId}" class='btn btn-primary'>${get_icon_svg("ok")}</button></td>`;
				content += "</tr>";
				actions.push({ id: btnId, type: "click", method: select_ap_ssid, index: escapedSSID });
			}
		}
	} catch (e) {
		console.error("Parsing error:", e);
		result = false;
	}
	setHTML("AP_scan_data", content);

	for (const action of actions) {
		const elem = id(action.id);
		if (elem) {
			elem.addEventListener("click", (event) => action.method(action.index));
		}
	};

	return result;
}

function select_ap_ssid(ssid_name) {
	const settingName = `setting_${ssid_item_scanwifi}_${ssid_subitem_scanwifi}`;
	const val = getValue(settingName);
	setValue(settingName, ssid_name);
	id(settingName).focus();
	if (val !== ssid_name) {
		setsettingchanged(ssid_item_scanwifi, ssid_subitem_scanwifi);
	}
	closeModal("Ok");
}

function getscanWifiSuccess(response) {
	if (!process_scanWifi_answer(response)) {
		getscanWififailed(406, trx_text_item("Wrong data"));
		return;
	}
	displayNone(["AP_scan_loader", "AP_scan_status"]);
	displayBlock(["AP_scan_list", "refresh_scanwifi_btn"]);
}

function getscanWififailed(error_code, response) {
	conErr(error_code, response);
	displayNone("AP_scan_loader");
	displayBlock(["AP_scan_status", "refresh_scanwifi_btn"]);
	setHTML("AP_scan_status", stdErrMsg(error_code, response, trx_text_item("Failed")));
}

function scanwifidlg_close(response) {
	//console.log(response);
}

export { scanwifidlg };
