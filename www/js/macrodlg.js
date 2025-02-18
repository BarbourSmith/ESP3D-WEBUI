import {
	Common,
	get_icon_svg,
	list_icon,
	displayBlock,
	displayNone,
	id,
	BuildFormDataFiles,
	setHTML,
	clear_drop_menu,
	hide_drop_menu,
	showhide_drop_menu,
	closeModal,
	setactiveModal,
	showModal,
	alertdlg,
	confirmdlg,
	httpCmd,
	SendFileHttp,
	trx_text_item,
	CheckForHttpCommLock,
} from "./common.js";

//Macro dialog
let macrodlg_macrolist = [];

function showmacrodlg(closefn) {
	const modal = setactiveModal("macrodlg.html", closefn);
	if (modal == null) {
		return;
	}

	id("macrodlg.html").addEventListener("click", clear_drop_menu);
	id("MacroDialogClose").addEventListener("click", closeMacroDialog);
	id("MacroDialogCancel").addEventListener("click", closeMacroDialog);
	id("MacroDialogSave").addEventListener("click", SaveNewMacroList);

	build_dlg_macrolist_ui();
	displayNone("macrodlg_upload_msg");
	showModal();
}

const iconDownTri = () => get_icon_svg("triangle-bottom", { h: '0.8em', w: '0.8em', s: 'pointer-events:none', t: 'translate(50,1200) scale(1, -1)' });

function build_color_selection(index, actions) {
	let content = "";
	const entry = macrodlg_macrolist[index];
	const menu_pos = index > 3 ? "dropmenu-content-up" : "dropmenu-content-down";
	content += `<div id='macro_color_line${index}' class='dropdownselect'>`;
	content += `<button id='macro_color_line${index}_btn' class='btn ${entry.class}'>&nbsp;`;
	content += iconDownTri();
	content += "</button>";
	actions.push({ id: `macro_color_line${index}_btn`, type: "click", method: showhide_drop_menu });
	content += `<div class='dropmenu-content ${menu_pos}' style='min-width:auto; padding-left: 4px;padding-right: 4px;'>`;
	// biome-ignore lint/complexity/noForEach: <explanation>
	["default", "primary", "info", "warning", "danger"].forEach((col) => {
		content += `<button id='macro_select_color_${col}${index}_btn' class='btn btn-${col}'>&nbsp;</button>`;
		actions.push({ id: `macro_select_color_${col}${index}_btn`, type: "click", method: (event) => macro_select_color(event, col, index) });
	});
	content += "</div>";
	content += "</div>";
	return content;
}

function build_target_selection(index, actions) {
	let content = "";
	const entry = macrodlg_macrolist[index];
	const menu_pos = index > 3 ? "dropmenu-content-up" : "dropmenu-content-down";
	content += `<div id='macro_target_line${index}' class='dropdownselect'>`;
	content += `<button id='macro_target_line${index}_btn' class='btn btn-default' style='min-width:5em;'><span>${entry.target}</span>`;
	content += iconDownTri();
	content += "</button>";
	actions.push({ id: `macro_target_line${index}_btn`, type: "click", method: showhide_drop_menu });
	content += `<div class='dropmenu-content ${menu_pos}' style='min-width:auto'>`;
	content += `<a id='macro_select_targetESP${index}_link' href=#>ESP</a>`;
	content += `<a id='macro_select_targetSD${index}_link' href=#>SD</a>`;
	content += `<a id='macro_select_targetURI${index}_link' href=#>URI</a>`;
	actions.push({ id: `macro_select_targetESP${index}_link`, type: "click", method: (event) => macro_select_target(event, "ESP", index) });
	actions.push({ id: `macro_select_targetSD${index}_link`, type: "click", method: (event) => macro_select_target(event, "SD", index) });
	actions.push({ id: `macro_select_targetURI${index}_link`, type: "click", method: (event) => macro_select_target(event, "URI", index) });

	content += "</div>";
	content += "</div>";
	return content;
}

function build_glyph_selection(index, actions) {
	let content = "";
	const entry = macrodlg_macrolist[index];
	const menu_pos = index > 3 ? "dropmenu-content-up" : "dropmenu-content-down";
	content += `<div id='macro_glyph_line${index}' class='dropdownselect'>`;
	content += `<button id='macro_glyph_line${index}_btn' class='btn ${entry.class}'><span>${get_icon_svg(entry.glyph)}</span>&nbsp;`;
	content += iconDownTri();
	content += "</button>";
	actions.push({ id: `macro_glyph_line${index}_btn`, type: "click", method: showhide_drop_menu });
	content += `<div class='dropmenu-content ${menu_pos}' style='min-width:30em'>`;
	for (const key in list_icon) {
		if (key === "plus") {
			continue;
		}
		const btnId = `macro_glyph_select${index}${key}_btn`;
		content += `<button id='${btnId}' class='btn btn-default btn-xs'><span>${get_icon_svg(key)}</span></button>`;
		actions.push({ id: btnId, type: "click", method: (event) => macro_select_glyph(event, key, index) });
	}
	content += "</div>";
	content += "</div>";
	return content;
}

function build_filename_selection(index, actions) {
	const entry = macrodlg_macrolist[index];
	const noFilename = entry.filename.length === 0;
	const mflId = `macro_filename_line_${index}`;

	let content = `<span id='macro_filename_input_line_${index}' class='form-group ${noFilename ? "has-error has-feedback" : ""}'>`;
	content += `<input type='text' id='${mflId}' style='width:9em' class='form-control' value='${entry.filename}'  aria-describedby='inputStatus_line${index}'>`;
	content += `<span id='icon_macro_status_line_${index}' style='color:#a94442; position:absolute;bottom:4px;left:7.5em;${noFilename ? "display:none" : ""}'>${get_icon_svg("remove")}</span>`;
	content += "</input></span>";

	actions.push({ id: mflId, type: "keyup", method: (event) => macro_filename_OnKeyUp(index) });
	actions.push({ id: mflId, type: "change", method: (event) => on_macro_filename(event, index) });

	return content;
}

function build_dlg_macrolist_line(index) {
	let content = "";
	const actions = [];
	const entry = macrodlg_macrolist[index];

	const buildTdVertMiddle = (content) =>
		`<td style='vertical-align:middle'>${content}</td>`;

	const noEC = entry.class === "";
	const btnClass = `btn btn-xs ${noEC ? "btn-default" : "btn-danger"}`;
	const btnStyle = `padding-top: 3px;padding-left: ${noEC ? "4" : "2"}px;padding-right: ${noEC ? "2" : "3"}px;padding-bottom: 0px;`;
	const btnId = `macro_reset_btn_${index}`;
	content += buildTdVertMiddle(
		`<button id='${btnId}' class='${btnClass}' style='${btnStyle}>${get_icon_svg(noEC ? "plus" : "trash")}</button>`,
	);
	actions.push({ id: btnId, type: "click", method: (event) => macro_reset_button(index) });
	if (noEC) {
		content += "<td colspan='5'></td>";
	} else {
		const inpId = `macro_name_line_${index}`;
		const entryName = entry.name && entry.name !== "&nbsp;" ? entry.name : "";
		content += buildTdVertMiddle(
			`<input type='text' id='${inpId}' style='width:4em' class='form-control' value='${entryName}'/>`,
		);
		actions.push({ id: inpId, type: "change", method: (event) => on_macro_name(event, index) });
		content += buildTdVertMiddle(build_glyph_selection(index, actions));
		content += buildTdVertMiddle(build_color_selection(index, actions));
		content += buildTdVertMiddle(build_target_selection(index, actions));
		content += buildTdVertMiddle(build_filename_selection(index, actions));
	}

	setHTML(`macro_line_${index}`, content);
	// biome-ignore lint/complexity/noForEach: <explanation>
	actions.forEach((action) => {
		const elem = id(action.id);
		if (elem) {
			elem.addEventListener(action.type, action.method);
		}
	});
}

function macro_filename_OnKeyUp(index) {
	const group = id(`macro_filename_input_line_${index}`);
	const value = getValueTrimmed(`macro_filename_line_${index}`);
	if (value) {
		group.classList.remove("has-feedback");
		group.classList.remove("has-error");
		displayNone(`icon_macro_status_line_${index}`);
	} else {
		displayBlock(`icon_macro_status_line_${index}`);
		group.classList.add("has-error");
		group.classList.add("has-feedback");
	}
	return true;
}

function on_macro_filename(event, index) {
	const entry = macrodlg_macrolist[index];
	const filename = event.value.trim();
	entry.filename = event.value;
	if (filename.length === 0) {
		alertdlg(trx_text_item("Out of range"), trx_text_item("File name cannot be empty!"));
	}
	build_dlg_macrolist_line(index);
}

function on_macro_name(event, index) {
	const entry = macrodlg_macrolist[index];
	const macroname = event.value.trim();
	entry.name = macroname.length > 0 ? event.value : "&nbsp;";
}

const build_dlg_macrolist_ui = () => {
	const common = new Common();
	let content = "";
	macrodlg_macrolist = [];
	for (let i = 0; i < 9; i++) {
		macrodlg_macrolist.push(common.control_macrolist[i]);
		content += `<tr style='vertical-align:middle' id='macro_line_${i}'>`;
		content += "</tr>";
	}

	setHTML("dlg_macro_list", content);
	for (let i = 0; i < 9; i++) {
		build_dlg_macrolist_line(i);
	}
}

function macro_reset_button(index) {
	const entry = macrodlg_macrolist[index];
	if (entry.class === "") {
		entry.name = `M${1 + entry.index}`;
		entry.glyph = "star";
		entry.filename = `/macro${1 + entry.index}.g`;
		entry.target = "ESP";
		entry.class = "btn-default";
	} else {
		entry.name = "";
		entry.glyph = "";
		entry.filename = "";
		entry.target = "";
		entry.class = "";
	}
	build_dlg_macrolist_line(index);
}

function macro_select_color(event, color, index) {
	const entry = macrodlg_macrolist[index];
	hide_drop_menu(event);
	entry.class = `btn btn-${color}`;
	build_dlg_macrolist_line(index);
}

function macro_select_target(event, target, index) {
	const entry = macrodlg_macrolist[index];
	hide_drop_menu(event);
	entry.target = target;
	build_dlg_macrolist_line(index);
}

const macro_select_glyph = (event, glyph, index) => {
	const entry = macrodlg_macrolist[index];
	hide_drop_menu(event);
	entry.glyph = glyph;
	build_dlg_macrolist_line(index);
}

const closeMacroDialog = () => {
	const common = new Common();
	let modified = false;
	const fieldsTest = ["filename", "name", "glyph", "class", "target"];
	for (let i = 0; i < 9; i++) {
		const macEntry = macrodlg_macrolist[i];
		const conEntry = common.control_macrolist[i];
		if (
			fieldsTest.some(
				(fieldName) => macEntry[fieldName] !== conEntry[fieldName],
			)
		) {
			modified = true;
			break;
		}
	}
	if (modified) {
		confirmdlg(trx_text_item("Data modified"), trx_text_item("Do you want to save?"), process_macroCloseDialog);
	} else {
		closeModal("cancel");
	}
};

function process_macroCloseDialog(answer) {
	if (answer === "no") {
		//console.log("Answer is no so exit");
		closeModal("cancel");
	} else {
		// console.log("Answer is yes so let's save");
		SaveNewMacroList();
	}
}

function SaveNewMacroList() {
	if (CheckForHttpCommLock()) {
		return;
	}

	for (let i = 0; i < 9; i++) {
		const mItem = macrodlg_macrolist[i];
		if (mItem.filename.length === 0 && mItem.class !== "") {
			alertdlg(trx_text_item("Out of range"), trx_text_item("File name cannot be empty!"));
			return;
		}
	}

	const macroFilename = "/macrocfg.json";
	const file = BuildFormDataFiles(macroFilename, [JSON.stringify(macrodlg_macrolist, null, " ")], { type: "application/json" });

	const formData = new FormData();
	formData.append("path", "/");
	formData.append("myfile[]", file, macroFilename);

	SendFileHttp(httpCmd.files, formData, macroUploadsuccess, macroUploadfailed);
}

// function macrodlgUploadProgressDisplay(oEvent) {
// 	if (oEvent.lengthComputable) {
// 		const percentComplete = (oEvent.loaded / oEvent.total) * 100;
// 		id("macrodlg_prg").value = percentComplete;
// 		setHTML("macrodlg_upload_percent", percentComplete.toFixed(0));
// 		displayBlock("macrodlg_upload_msg");
// 	} else {
// 		// Impossible because size is unknown
// 	}
// }

const macroUploadsuccess = (response) => {
	const common = new Common();
	common.control_macrolist = [];
	for (let i = 0; i < 9; i++) {
		let entry;
		if (macrodlg_macrolist.length !== 0) {
			entry = {
				name: macrodlg_macrolist[i].name,
				glyph: macrodlg_macrolist[i].glyph,
				filename: macrodlg_macrolist[i].filename,
				target: macrodlg_macrolist[i].target,
				class: macrodlg_macrolist[i].class,
				index: macrodlg_macrolist[i].index,
			};
		} else {
			entry = {
				name: "",
				glyph: "",
				filename: "",
				target: "",
				class: "",
				index: i,
			};
		}
		common.control_macrolist.push(entry);
	}
	displayNone("macrodlg_upload_msg");
	closeModal("ok");
}

function macroUploadfailed(error_code, response) {
	alertdlg(trx_text_item("Error"), trx_text_item("Save macro list failed!"));
	displayNone("macrodlg_upload_msg");
}

export { showmacrodlg };
