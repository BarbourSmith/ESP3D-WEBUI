import {
	Common,
	conErr,
	stdErrMsg,
	displayBlock,
	displayNone,
	id,
	setHTML,
	closeModal,
	get_icon_svg,
	getactiveModal,
	setactiveModal,
	showModal,
	httpCmdType,
	buildHttpCommandCmd,
	SendGetHttp,
	trx_text_item,
} from "./common.js";

const statusDlgCancel = () => closeModal("cancel");

/** status dialog */
const statusdlg = () => {
	const modal = setactiveModal("statusdlg.html");
	if (modal == null) {
		return;
	}

	id("status_dlg_close").addEventListener("click", statusDlgCancel);
	id("status_dlg_btn_close").addEventListener("click", statusDlgCancel);
	id("status_dlg_refreshstatus").addEventListener("click", refreshstatus);

	const iconOptions = {t: "translate(50,1200) scale(1,-1)"};
	setHTML("status_dlg_refreshstatus", get_icon_svg("refresh", iconOptions));

	showModal();
	refreshstatus();
};

const buildSettingData = (response) => {
	const common = new Common();
	const tresponse = response.split("\n").map((item) => item.trim()).filter((item) => item);
	tresponse.push(`WebUI version:${common.web_ui_version}`);
	tresponse.push(`Browser:${navigator.userAgent}`);
	const dataDef = tresponse.map((item) => {
		const data = item.split(":").map((d) => d.trim());
		return {"name": data[0], "value": data.slice(1).join(":")};
	});
	return dataDef;
}

const buildSettingList = (dataDef) => {
	const settingList = ["<dl>"];
	for (let i = 0; i < dataDef.length; i++) {
		const data = dataDef[i];
		settingList.push(`<dt>${trx_text_item(data.name)}</dt><dd class='text-info'>${data.value || ""}</dd>`);
	}
	settingList.push("</dl>");
	return settingList.join("\n");
}

function statussuccess(response) {
	displayBlock("refreshstatusbtn");
	displayNone("status_loader");

	const modal = getactiveModal();
	if (modal == null) {
		return;
	}
	
	const text = modal.element.getElementsByClassName("modal-text")[0];

	const dataDef = buildSettingData(response);
	text.innerHTML = buildSettingList(dataDef);
}

function statusfailed(error_code, response) {
	displayBlock(["refreshstatusbtn", "status_msg"]);
	displayNone("status_loader");
	const errMsg = stdErrMsg(error_code, response);
	conErr(errMsg);
	setHTML("status_msg", errMsg);
}

function refreshstatus() {
	displayNone(["refreshstatusbtn", "status_loader"]);
	const modal = getactiveModal();
	if (modal == null) {
		return;
	}

	const text = modal.element.getElementsByClassName("modal-text")[0];
	text.innerHTML = "";
	displayNone("status_msg");

	const cmd = buildHttpCommandCmd(httpCmdType.plain, "[ESP420]plain");
	SendGetHttp(cmd, statussuccess, statusfailed);
}

export { statusdlg };
