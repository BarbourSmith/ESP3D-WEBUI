import {
	Common,
	conErr,
	stdErrMsg,
	id,
	displayBlock,
	displayNone,
	setValue,
	setHTML,
	closeModal,
	setactiveModal,
	showModal,
	alertdlg,
	confirmdlg,
	httpCmd,
	SendFileHttp,
	SendGetHttp,
	trx_text_item,
	CheckForHttpCommLock,
} from "./common.js";

let update_ongoing = false;

const updateDlgCancel = () => closeUpdateDialog("cancel");
const updateDlgSelect = () => document.getElementById("fw_select").click();
const updateDlgFileMouseUp = () => document.getElementById("fw_select_files").click();

/** update dialog */
const updatedlg = () => {
	const modal = setactiveModal("updatedlg.html");
	if (modal == null) {
		return;
	}

	id("updateDlgCancel").addEventListener("click", updateDlgCancel);
	id("updateDlgClose").addEventListener("click", updateDlgCancel);

	id("fw_select").addEventListener("change", checkupdatefile);
	id("fw_select_files").addEventListener("click", updateDlgSelect);
	id("fw_file_name").addEventListener("mouseup", updateDlgFileMouseUp);
	id("uploadfw_button").addEventListener("click", UploadUpdatefile);

	setHTML("fw_file_name", trx_text_item("No file chosen"));
	displayNone(["prgfw", "uploadfw-button"]);
	setHTML("updatemsg", "");
	setValue("fw-select", "");
	setHTML("fw_update_dlg_title", trx_text_item("ESP3D Update").replace("ESP3D", "FluidNC"));
	showModal();
};

function closeUpdateDialog(msg) {
	if (update_ongoing) {
		alertdlg(trx_text_item("Busy..."), trx_text_item("Update is ongoing, please wait and retry."));
		return;
	}
	closeModal(msg);
}

function checkupdatefile() {
	displayNone("updatemsg");
	const files = id("fw_select").files;
	switch (files.length) {
		case 0:
			displayNone("uploadfw-button");
			setHTML("fw_file_name", trx_text_item("No file chosen"));
			break;
		case 1:
			displayBlock("uploadfw_button");
			setHTML("fw_file_name", files[0].name);
			break;
		default:
			displayBlock("uploadfw-button");
			setHTML("fw_file_name", trx_text_item("$n files").replace("$n", files.length));
			break;
	}
}

function UploadUpdatefile() {
	confirmdlg(trx_text_item("Please confirm"), trx_text_item("Update Firmware ?"), StartUploadUpdatefile);
}

function StartUploadUpdatefile(response) {
	if (response !== "yes") {
		return;
	}
	if (CheckForHttpCommLock()) {
		return;
	}

	const fileList = [];
	const files = id("fw_select").files;
	const formData = new FormData();
	for (let i = 0; i < files.length; i++) {
		const file = files[i];
		const arg = `/${file.name}S`;
		fileList.push(file.name);
		//append file size first to check updload is complete
		formData.append(arg, file.size);
		formData.append("myfile[]", file, `/${file.name}`);
		console.info(`Preparing ${fullFilename} for upload`);
	}
	displayNone(["fw-select_form", "uploadfw-button"]);
	update_ongoing = true;
	displayBlock(["updatemsg", "prgfw"]);
	setHTML("updatemsg", `${trx_text_item("Uploading")} ${fileList.join(" ")}`);

	SendFileHttp(httpCmd.fwUpdate, formData, UpdateProgressDisplay, updatesuccess, updatefailed);
}

function updatesuccess(response) {
	setHTML("updatemsg", trx_text_item("Restarting, please wait...."));
	setHTML("fw_file_name", "");
	let i = 0;
	// biome-ignore lint/style/useConst: <explanation>
	let interval;
	const x = id("prgfw");
	x.max = 10;
	interval = setInterval(() => {
		i = i + 1;
		const x = id("prgfw");
		x.value = i;
		setHTML(
			"updatemsg",
			`${trx_text_item("Restarting, please wait....")} ${41 - i} ${trx_text_item("seconds")}`,
		);
		if (i > x.max) {
			update_ongoing = false;
			clearInterval(interval);
			location.reload();
		}
	}, 1000);
	//console.log(response);
}

function updatefailed(error_code, response) {
	displayBlock("fw_select_form");
	displayNone(["prgfw", "uploadfw_button"]);
	setHTML("fw_file_name", trx_text_item("No file chosen"));
	displayNone("uploadfw_button");
	setValue("fw_select", "");

	const common = new Common();
	if (common.esp_error_code !== 0) {
		alertdlg(trx_text_item("Error"), stdErrMsg(`(${common.esp_error_code})`, common.esp_error_message));
		setHTML("updatemsg", trx_text_item("Upload failed : ") + common.esp_error_message);
		common.esp_error_code = 0;
	} else {
		alertdlg(trx_text_item("Error"), stdErrMsg(error_code, response));
		setHTML("updatemsg", stdErrMsg(error_code, response, trx_text_item("Upload failed")));
	}

	conErr(error_code, response);
	update_ongoing = false;
	SendGetHttp(httpCmd.fwUpdate);
}

export { updatedlg };
