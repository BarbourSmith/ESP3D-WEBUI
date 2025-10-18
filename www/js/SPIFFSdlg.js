//import - get_icon_svg, conErr, stdErrMsg, displayBlock, displayNone, id, setValue, setHTML, closeModal, setactiveModal, showModal, alertdlg, confirmdlg, inputdlg, SendFileHttp, SendGetHttp, translate_text_item, Monitor_output_Update

let SPIFFS_currentpath = "/";
let SPIFFS_currentfile = "";
let SPIFFS_upload_ongoing = false;

const SPIFSSDialogClose = () => closeSPIFFSDialog("cancel");
const SPIFFSSelectClick = () => id("SPIFFS_select").click();
const SPIFFSSelectFilesClick = () => id("SPIFFS_select_files").click();

/** SPIFFS dialog */
const SPIFFSdlg = (root) => {
	const modal = setactiveModal("SPIFFSdlg.html");
	if (modal == null) {
		return;
	}

	id("SPIFFS_span_close").addEventListener("click", SPIFSSDialogClose);
	id("SPIFFS_select").addEventListener("change", checkSPIFFSfiles);
	id("SPIFFS_select_files").addEventListener("click", SPIFFSSelectClick);
	id("SPIFFS_file_name").addEventListener("mouseup", SPIFFSSelectFilesClick);
	id("SPIFFS_uploadbtn").addEventListener("click", SPIFFS_UploadFile);
	id("SPIFFS_create_dir_btn").addEventListener("click", SPIFFS_Createdir);
	id("SPIFFS_btn_close").addEventListener("click", SPIFSSDialogClose);
	id("refreshSPIFFSbtn").addEventListener("click", refreshSPIFFS);

	if (typeof root !== "undefined") {
		SPIFFS_currentpath = root;
	}
	setValue("SPIFFS_select", "");
	setHTML("SPIFFS_file_name", translate_text_item("No file chosen"));
	displayNone("SPIFFS_uploadbtn");
	displayNone("SPIFFS_prg");
	displayNone("uploadSPIFFSmsg");
	displayNone("SPIFFS_select_files");
	showModal();
	refreshSPIFFS();
};

function closeSPIFFSDialog(msg) {
	if (SPIFFS_upload_ongoing) {
		alertdlg(translate_text_item("Busy..."), translate_text_item("Upload is ongoing, please wait and retry."));
		return;
	}
	closeModal(msg);
}

const buildTable = (content) => `<table>${content}</table>`;
const buildTr = (content) => `<tr>${content}</tr>`;

function SPIFFSselect_dir(event) {
	event.stopPropagation();
	const directoryname = event.currentTarget.dataset.path;
	const needTraillingSlash = directoryname.endsWith("/") ? "" : "/";
	SPIFFS_currentpath = directoryname + needTraillingSlash;
	SPIFFSSendCommand("list", "all");
}

/** Builds the SPIFFS nav bar, adds it to the parent element, and sets up the event handlers */
const SPIFFSnavbar = () => {
	const tlist = SPIFFS_currentpath.split("/");
	let path = "/";
	let nb = 1;

	const actions = [];

	const bIdD = "SPIFFS_btn_dir_";

	const spanRoot = "<span class='tooltip-text'>Go to root directory</span>";
	let content = `<td class='tooltip'>${spanRoot}<button id="${bIdD}_root" data-path="/" class="btn btn-primary">/</button></td>`;
	actions.push({ id: `${bIdD}_root`, method: SPIFFSselect_dir });
	while (nb < tlist.length - 1) {
		path += `${tlist[nb]}/`;
		const bId = `${bIdD}${nb}`;
		content += `<td><button id=${bId} data-path="${path}" class="btn btn-link">${tlist[nb]}</button></td><td>/</td>`;
		actions.push({ id: bId, method: SPIFFSselect_dir });
		nb++;
	}

	setHTML("SPIFFS_path", buildTable(buildTr(content)));
	AddActionHandlers(actions);
};

function SPIFFS_Createdir() {
	inputdlg(translate_text_item("Please enter directory name"), translate_text_item("Name:"), processSPIFFS_Createdir);
}

function processSPIFFS_Createdir(answer) {
	if (answer.length > 0) {
		SPIFFSSendCommand("createdir", answer.trim());
	}
}

function processSPIFFSDelete(answer) {
	if (answer === "yes") {
		SPIFFSSendCommand("delete", SPIFFS_currentfile);
	}
	SPIFFS_currentfile = "";
}

function SPIFFSDelete(event) {
	event.stopPropagation();
	SPIFFS_currentfile = event.currentTarget.dataset.path;
	confirmdlg(translate_text_item("Please Confirm"), translate_text_item("Confirm deletion of file: ") + SPIFFS_currentfile, processSPIFFSDelete);
}

function SPIFFSDeleteDir(event) {
	event.stopPropagation();
	SPIFFS_currentfile = event.currentTarget.dataset.path;
	confirmdlg(translate_text_item("Please Confirm"), translate_text_item("Confirm deletion of directory: ") + SPIFFS_currentfile, processSPIFFSDeleteDir);
}

function processSPIFFSDeleteDir(answer) {
	if (answer === "yes") {
		SPIFFSSendCommand("deletedir", SPIFFS_currentfile);
	}
	SPIFFS_currentfile = "";
}

function SPIFFSRename(event) {
	event.stopPropagation();
	old_file_name = event.currentTarget.dataset.path;
	inputdlg(translate_text_item("New file name"), translate_text_item("Name:"), processSPIFFSRename, old_file_name);
}

function processSPIFFSRename(new_file_name) {
	if (!new_file_name) {
		return;
	}
	const cmd = buildHttpFilesCmd({ action: "rename", path: SPIFFS_currentpath, filename: old_file_name, newname: new_file_name });
	SendGetHttp(cmd, SPIFFSsuccess, SPIFFSfailed);
}

const testResponse = [
	'{"files":[',
	'{"name":"config.html.gz","size":"4.76 KB"},',
	'{"name":"index.html.gz","size":"21.44 KB"},',
	'{"name":"favicon.ico","size":"1.12 KB"},',
	'{"name":"config.htm","size":"19.65 KB"},',
	'{"name":"config2.htm","size":"19.98 KB"},',
	'{"name":"Testname","size":"-1"},',
	'{"name":"index2.html.gz","size":"28.89 KB"}',
	'],"path":"/","status":"Ok","total":"2.81 MB","used":"118.88 KB","occupation":"4"}',
];

function SPIFFSSendCommand(action, filename) {
	//removeIf(production)
	SPIFFSsuccess(testResponse.join(""));
	return;
	//endRemoveIf(production)
	id("SPIFFS_loader").style.visibility = "visible";
	const cmd = buildHttpFilesCmd({ action: action, path: SPIFFS_currentpath, filename: filename });
	console.log(cmd);
	SendGetHttp(cmd, SPIFFSsuccess, SPIFFSfailed);
}

function SPIFFSsuccess(response) {
	//console.log(response);
	const jsonresponse = JSON.parse(response);
	id("SPIFFS_loader").style.visibility = "hidden";
	displayBlock("refreshSPIFFSbtn");
	displayBlock("SPIFFS_select_files");
	if (response) {
		try {
			const jsonresponse = JSON.parse(response);
			SPIFFSdispatchfilestatus(jsonresponse);
		} catch (error) {
			console.error(`Could not parse '${response}' as JSON. ${error}`);
		}
	}
}

function SPIFFSfailed(error_code, response) {
	id("SPIFFS_loader").style.visibility = "hidden";
	displayBlock("refreshSPIFFSbtn");
	displayBlock("refreshSPIFFSbtn");
	alertdlg(translate_text_item("Error"), stdErrMsg(error_code, response));
	conErr(error_code, response);
}

function SPIFFSbutton(btnId, btnClass, icon, path) {
	const btnContent = `<button id="${btnId}" data-path="${path}" class="btn ${btnClass} btn-xs" style='padding: 5px 5px 0px 5px;'>${get_icon_svg(icon)}</button>`;
	return `<td width='0%' style='vertical-align:middle'>${btnContent}</td>`;
}

const SPIFFSanchor = (btnId, btnClass, icon, url) => {
	const aContent = `<a id="${btnId}" class="btn ${btnClass} btn-xs" href="${url}" download="${url}" style='padding: 5px 5px 0px 5px;'>${get_icon_svg(icon)}</a>`;
	return `<td width='0%' style='vertical-align:middle'>${aContent}</td>`;
}

const buildSPIFFSTotalBar = (jsonresponse) => {
	let content = `${translate_text_item("Total:")} ${jsonresponse.total}`;
	content += `&nbsp;&nbsp;|&nbsp;&nbsp;${translate_text_item("Used:")} ${jsonresponse.used}&nbsp;`;
	content += `<meter min='0' max='100' high='90' value='${jsonresponse.occupation}'></meter>&nbsp;${jsonresponse.occupation}%`;
	if (jsonresponse.status !== "Ok") {
		content += `<br/>${translate_text_item(jsonresponse.status)}`;
	}

	return content;
};

const upDirAndRelist = (event) => {
	event.stopPropagation();
	SPIFFS_currentpath = event.currentTarget.dataset.path;
	SPIFFSSendCommand("list", "all");
};

function SPIFFSdispatchfilestatus(jsonresponse) {
	setHTML("SPIFFS_status", buildSPIFFSTotalBar(jsonresponse));

	let content = "";
	const actions = [];
	if (SPIFFS_currentpath !== "/") {
		const pos = SPIFFS_currentpath.lastIndexOf("/", SPIFFS_currentpath.length - 2);
		const previouspath = SPIFFS_currentpath.slice(0, pos + 1);
		const rowId = "SPIFFS_row_up_dir";
		content += `<tr id="${rowId}" data-path="${previouspath}" style="cursor:pointer;"><td >${get_icon_svg("level-up")}</td><td colspan='4'> Up..</td></tr>`;
		actions.push({ id: rowId, method: upDirAndRelist });
	}
	jsonresponse.files.sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

	const bIdF = "SPIFFS_btn_file_";
	for (let i = 0; i < jsonresponse.files.length; i++) {
		if (String(jsonresponse.files[i].size) === "-1") {
			continue;
		}
		//first display files
		const filesize = jsonresponse.files[i].size;
		const pathname = jsonresponse.path;
		const filename = jsonresponse.files[i].name;
		let filecontent = `<td style='vertical-align:middle; color:#5BC0DE'>${get_icon_svg("file")}</td>`;
		// filecontent += "<td width='100%' style='vertical-align:middle'><a href=\"" + pathname + filename + "\" target=_blank download><button  class=\"btn btn-link no_overflow\">" + filename + "</button></a></td>"
		filecontent += `<td width='100%' style='vertical-align:middle'>${filename}</td>`;
		filecontent += `<td nowrap  style='vertical-align:middle; text-align:right'>${filesize}</td>`;
		filecontent += SPIFFSanchor(`${bIdF}download_${i}`, "btn-default", "download", pathname + filename);
		filecontent += SPIFFSbutton(`${bIdF}delete_${i}`, "btn-danger", "trash", filename);
		filecontent += SPIFFSbutton(`${bIdF}rename_${i}`, "btn-default", "wrench", filename);
		content += buildTr(filecontent);

		actions.push({ id: `${bIdF}delete_${i}`, method: SPIFFSDelete });
		actions.push({ id: `${bIdF}rename_${i}`, method: SPIFFSRename });
	}

	//then display directories
	const bIdD = "SPIFFS_btn_dir_";
	for (let i = 0; i < jsonresponse.files.length; i++) {
		if (String(jsonresponse.files[i].size) !== "-1") {
			continue;
		}
		const dirname = jsonresponse.files[i].name;
		const selectDirBtn = `<button id="${bIdD}select_${i}" data-path="${SPIFFS_currentpath}${dirname}" class="btn btn-link">${dirname}</button>`;
		actions.push({ id: `${bIdD}select_${i}`, method: SPIFFSselect_dir });
		let dircontent = `<td style='vertical-align:middle ; color:#5BC0DE'>${get_icon_svg("folder-close")}</td>`;
		dircontent += `<td width='100%' style='vertical-align:middle'>${selectDirBtn}</td>`;
		dircontent += "<td nowrap style='vertical-align:middle'></td>"; // No size field
		dircontent += "<td></td>"; // Spacer for nonexistent download button
		dircontent += SPIFFSbutton(`${bIdD}delete_${i}`, "btn-danger", "trash", dirname);
		dircontent += SPIFFSbutton(`${bIdD}rename_${i}`, "btn-default", "wrench", dirname);
		content += buildTr(dircontent);

		actions.push({ id: `${bIdD}delete_${i}`, method: SPIFFSDeleteDir });
		actions.push({ id: `${bIdD}rename_${i}`, method: SPIFFSRename });
	}

	setHTML("SPIFFS_file_list", content);
	AddActionHandlers(actions);

	SPIFFSnavbar();
}

function refreshSPIFFS() {
	setValue("SPIFFS_select", "");
	setHTML("uploadSPIFFSmsg", "");
	setHTML("SPIFFS_file_name", translate_text_item("No file chosen"));
	displayNone("SPIFFS_uploadbtn");
	displayNone("refreshSPIFFSbtn");
	displayNone("SPIFFS_select_files");
	//removeIf(production)
	SPIFFSsuccess(testResponse.join(""));
	return;
	//endRemoveIf(production)
	SPIFFSSendCommand("list", "all");
}

function checkSPIFFSfiles() {
	const files = id("SPIFFS_select").files;
	displayNone("uploadSPIFFSmsg");
	// No need to display the upload button because we will click it automatically
	// displayFiles('SPIFFS_uploadbtn');
	if (files.length > 0) {
		if (files.length === 1) {
			setHTML("SPIFFS_file_name", files[0].name);
		} else {
			const tmp = translate_text_item("$n files");
			setHTML("SPIFFS_file_name", tmp.replace("$n", files.length));
		}
		id("SPIFFS_uploadbtn").click();
	} else {
		setHTML("SPIFFS_file_name", translate_text_item("No file chosen"));
	}
}

function SPIFFSUploadProgressDisplay(oEvent) {
	if (oEvent.lengthComputable) {
		const percentComplete = (oEvent.loaded / oEvent.total) * 100;
		setValue("SPIFFS_prg", percentComplete);
		setHTML("uploadSPIFFSmsg", `${translate_text_item("Uploading")} ${SPIFFS_currentfile} ${percentComplete.toFixed(0)}%`);
		
		// Log progress to serial messages at 10% intervals
		const percent = Math.floor(percentComplete);
		if (percent % 10 === 0 && percent !== SPIFFSUploadProgressDisplay.lastLoggedPercent) {
			SPIFFSUploadProgressDisplay.lastLoggedPercent = percent;
			Monitor_output_Update(`[SPIFFS Upload] ${percent}% (${(oEvent.loaded / 1024 / 1024).toFixed(2)} MB / ${(oEvent.total / 1024 / 1024).toFixed(2)} MB)\n`);
		}
	} else {
		// Impossible because size is unknown
	}
}
SPIFFSUploadProgressDisplay.lastLoggedPercent = -1;

function SPIFFS_UploadFile() {
	if (CheckForHttpCommLock()) {
		return;
	}

	const files = id("SPIFFS_select").files;
	const fileList = [];
	for (const file of files) {
		fileList.push(file.name);
	}
	const formData = BuildFileUploadFormData(SPIFFS_currentpath, files);

	// Reset progress logging
	SPIFFSUploadProgressDisplay.lastLoggedPercent = -1;
	
	// Log upload start
	const fileName = fileList.join(", ");
	const totalSize = Array.from(files).reduce((sum, f) => sum + f.size, 0);
	Monitor_output_Update(`[SPIFFS Upload] Starting upload of ${fileName} (${(totalSize / 1024 / 1024).toFixed(2)} MB)\n`);

	// Disable ping monitoring during SPIFFS upload
	disablePingForUpload();

	displayNone("SPIFFS_select_form");
	displayNone("SPIFFS_uploadbtn");
	displayBlock("uploadSPIFFSmsg");
	displayBlock("SPIFFS_prg");
	SPIFFS_upload_ongoing = true;
	setHTML("uploadSPIFFSmsg", `${translate_text_item("Uploading")} ${fileList.join(" ")}`);
	SendFileHttp(httpCmd.files, formData, SPIFFSUploadProgressDisplay, SPIFFSUploadsuccess, SPIFFSUploadfailed);
}

function SPIFFSUploadsuccess(response) {
	// Restore ping monitoring after SPIFFS upload completes
	restorePingAfterUpload();
	
	// Log upload completion
	Monitor_output_Update("[SPIFFS Upload] Upload completed successfully\n");
	
	setValue("SPIFFS_select", "");
	setHTML("SPIFFS_file_name", translate_text_item("No file chosen"));
	displayBlock("SPIFFS_select_form");
	displayNone("SPIFFS_prg");
	displayNone("SPIFFS_uploadbtn");
	setHTML("uploadSPIFFSmsg", "");
	displayBlock("refreshSPIFFSbtn");
	SPIFFS_upload_ongoing = false;
	if (response) {
		try {
			const jsonresponse = JSON.parse(response.replace('"status":"Ok"', '"status":"Upload done"'));
			SPIFFSdispatchfilestatus(jsonresponse);
		} catch (error) {
			console.error(`Could not parse '${response}' as JSON. ${error}`);
		}
	}
}

function SPIFFSUploadfailed(error_code, response) {
	// Restore ping monitoring after SPIFFS upload fails
	restorePingAfterUpload();
	
	// Log upload failure
	Monitor_output_Update(`[SPIFFS Upload] Upload failed: ${error_code}\n`);
	
	displayBlock("SPIFFS_select_form");
	displayNone("SPIFFS_prg");
	displayBlock("SPIFFS_uploadbtn");
	setHTML("uploadSPIFFSmsg", "");
	displayNone("uploadSPIFFSmsg");
	displayBlock("refreshSPIFFSbtn");
	conErr(stdErrMsg(error_code, response));
	if (esp_error_code !== 0) {
		alertdlg(translate_text_item("Error"), stdErrMsg(`(${esp_error_code})`, esp_error_message));
		setHTML("SPIFFS_status", translate_text_item("Error : ") + esp_error_message);
		esp_error_code = 0;
	} else {
		alertdlg(translate_text_item("Error"), stdErrMsg(error_code, response));
		setHTML("SPIFFS_status", stdErrMsg(error_code, response, translate_text_item("Upload failed")));
	}
	SPIFFS_upload_ongoing = false;
	refreshSPIFFS();
}
