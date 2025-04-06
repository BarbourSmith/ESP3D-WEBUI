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

const BuildColorSelectionBtn = (divId, actions, colClass) => {
	const btnId = `${divId}_btn`;

	const content = [
		`<button id='${btnId}' class='btn ${colClass}'>&nbsp;`,
		iconDownTri(),
		"</button>"
	];
	actions.push({ id: btnId, type: "click", method: showhide_drop_menu });

	return content.join("");
}

function build_color_selection(index, actions) {
	const entry = macrodlg_macrolist[index];
	const menu_pos = index > 3 ? "dropmenu-content-up" : "dropmenu-content-down";

	const mColId = `macro_color_line_${index}`;

	const content = [
		`<div id='${mColId}' class='dropdownselect'>`,
		BuildColorSelectionBtn(mColId, actions, entry.class),
		`<div class='dropmenu-content ${menu_pos}' style='min-width:auto; padding-left: 4px;padding-right: 4px;'>`,
	];
	for (const col of ["default", "primary", "info", "warning", "danger"]) {
		const btnColId = `macro_select_color_${index}_${col}_btn`;
		content.push(`<button id='${btnColId}' data-index="${index}" data-color="${col}" class='btn btn-${col}'>&nbsp;</button>`);
		actions.push({ id: btnColId, type: "click", method: macro_select_color });
	}
	content.push("</div>", "</div>");

	return content.join("");
}

const BuildTargetSelectionBtn = (divId, actions, target) => {
	const btnId = `${divId}_btn`;

	const content = [
		`<button id='${btnId}' class='btn btn-default' style='min-width:5em;'>`,
		`<span>${target}</span>`,
		iconDownTri(),
		"</button>"
	];
	actions.push({ id: btnId, type: "click", method: showhide_drop_menu });

	return content.join("");
}

function build_target_selection(index, actions) {
	const entry = macrodlg_macrolist[index];
	const menu_pos = index > 3 ? "dropmenu-content-up" : "dropmenu-content-down";

	const mTrgId = `macro_target_line_${index}`;

	const content = [
		`<div id='${mTrgId}' class='dropdownselect'>`,
		BuildTargetSelectionBtn(mTrgId, actions, entry.target),
		`<div class='dropmenu-content ${menu_pos}' style='min-width:auto'>`
	];
	for (const trg of ["ESP", "SD", "URI"]) {
		const aTrgId = `macro_select_target_${index}_${trg}_link`;
		content.push(`<a id='${aTrgId}' data-index="${index}" data-target="${trg}" href=#>${trg}</a>`);
		actions.push({ id: aTrgId, type: "click", method: macro_select_target });
	}
	content.push("</div>", "</div>");

	return content.join("");
}

const BuildGlyphSelectionBtn = (divId, actions, colClass, glyph) => {
	const btnId = `${divId}_btn`;

	const content = [
		`<button id='${btnId}' class='btn ${colClass}'>`,
		`<span>${get_icon_svg(glyph)}</span>&nbsp;`,
		iconDownTri(),
		"</button>"
	];
	actions.push({ id: btnId, type: "click", method: showhide_drop_menu });

	return content.join("");
}

function build_glyph_selection(index, actions) {
	const entry = macrodlg_macrolist[index];
	const menu_pos = index > 3 ? "dropmenu-content-up" : "dropmenu-content-down";

	const mGlpId = `macro_glyph_line_${index}`;

	const content = [
		`<div id='${mGlpId}' class='dropdownselect'>`,
		BuildGlyphSelectionBtn(mGlpId, actions, entry.class, entry.glyph),
		`<div class='dropmenu-content ${menu_pos}' style='min-width:30em'>`
	];

	let ix = 0;
	for (const glyph in list_icon) {
		if (glyph === "plus") {
			continue;
		}
		const btnGlpId = `macro_glyph_select_${index}_${ix}_btn`;
		content.push(`<button id='${btnGlpId}' data-index="${index}" data-glyph="${glyph}" class='btn btn-default btn-xs'><span>${get_icon_svg(glyph)}</span></button>`);
		actions.push({ id: btnGlpId, type: "click", method: macro_select_glyph });
		ix++;
	}
	content.push("</div>", "</div>");
	return content.join("");
}

function build_filename_selection(index, actions) {
	const entry = macrodlg_macrolist[index];
	const noFilename = entry.filename.length === 0;
	const mflId = `macro_filename_line_${index}`;

	const content = [
		`<span id='macro_filename_input_line_${index}' class='form-group ${noFilename ? "has-error has-feedback" : ""}'>`,
		`<input id='${mflId}' data-index="${index}" type='text' style='width:9em' class='form-control' value='${entry.filename}' aria-describedby='inputStatus_line${index}'>`,
		`<span id='icon_macro_status_line_${index}' style='color:#a94442; position:absolute;bottom:4px;left:7.5em;${noFilename ? "display:none" : ""}'>${get_icon_svg("remove")}</span>`,
		"</input>",
		"</span>"
	];

	actions.push({ id: mflId, type: "keyup", method: macro_filename_OnKeyUp });
	actions.push({ id: mflId, type: "change", method: on_macro_filename });

	return content.join("");
}

function build_dlg_macrolist_line(index) {
	const actions = [];
	const entry = macrodlg_macrolist[index];

	const buildTdVertMiddle = (content) => `<td style='vertical-align:middle'>${content}</td>`;

	const noEC = entry.class === "";
	const btnClass = `btn btn-xs ${noEC ? "btn-default" : "btn-danger"}`;
	const btnStyle = `padding-top: 3px;padding-left: ${noEC ? "4" : "2"}px;padding-right: ${noEC ? "2" : "3"}px;padding-bottom: 0px;`;
	const btnId = `macro_reset_btn_${index}`;
	const content = [buildTdVertMiddle(`<button id='${btnId}' data-index="${index}" class='${btnClass}' style='${btnStyle}>${get_icon_svg(noEC ? "plus" : "trash")}</button>`)];
	actions.push({ id: btnId, type: "click", method: macro_reset_button });
	if (noEC) {
		content.push("<td colspan='5'></td>");
	} else {
		const inpId = `macro_name_line_${index}`;
		const entryName = entry.name && entry.name !== "&nbsp;" ? entry.name : "";
		content.push(buildTdVertMiddle(`<input id='${inpId}' data-index="${index}" type='text' style='width:4em' class='form-control' value='${entryName}'/>`));
		actions.push({ id: inpId, type: "change", method: on_macro_name });
		for (const buildFn of [build_glyph_selection, build_color_selection, build_target_selection, build_filename_selection]) {
			content.push(buildTdVertMiddle(buildFn(index, actions)));
		}
	}

	setHTML(`macro_line_${index}`, content.join(""));
	for (const action of actions) {
		const elem = id(action.id);
		if (elem) {
			elem.addEventListener(action.type, action.method);
		} else {
			console.warn(`Element ${action.id} not found`);
		}
	};
}

function macro_filename_OnKeyUp(event) {
	event.stopPropagation();
	const index = event.currentTarget.dataset.index;

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

function on_macro_filename(event) {
	event.stopPropagation();
	const index = event.currentTarget.dataset.index;

	const entry = macrodlg_macrolist[index];
	const filename = event.currentTarget.value.trim();
	if (filename.length === 0) {
		alertdlg(trx_text_item("Out of range"), trx_text_item("File name cannot be empty!"));
	}

	entry.filename = filename;

	build_dlg_macrolist_line(index);
}

function on_macro_name(event) {
	event.stopPropagation();
	const index = event.currentTarget.dataset.index;

	const entry = macrodlg_macrolist[index];
	const macroname = event.currentTarget.value.trim();
	entry.name = macroname.length > 0 ? event.currentTarget.value : "&nbsp;";
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

function macro_reset_button(event) {
	event.stopPropagation();
	const index = event.currentTarget.dataset.index;

	const incIndex = 1 + index;

	const entry = macrodlg_macrolist[index];
	if (entry.class === "") {
		entry.name = `M${incIndex}`;
		entry.glyph = "star";
		entry.filename = `/macro${incIndex}.g`;
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

const hide_drop_menu = (target) => {
	const item = get_parent_by_class(target, "dropmenu-content");
	if (typeof item !== 'undefined' && item.classList.contains('show')) {
		item.classList.remove('show');
	}
}

const showhide_drop_menu = (event) => {
	const item = get_parent_by_class(event.target, "dropdownselect");
	if (item === null) {
		return;
	}
	const menu = item.getElementsByClassName("dropmenu-content")[0];
	if (typeof menu !== 'undefined') {
		menu.classList.toggle("show");
	}
}

const macro_select_color = (event) => {
	event.stopPropagation();
	const color = event.currentTarget.dataset.color;
	const index = event.currentTarget.dataset.index;

	const entry = macrodlg_macrolist[index];
	hide_drop_menu(event.target);
	entry.class = `btn btn-${color}`;
	build_dlg_macrolist_line(index);
}

const macro_select_target = (event) => {
	// event.stopPropagation();
	const trg = event.currentTarget.dataset.target;
	const index = event.currentTarget.dataset.index;

	const entry = macrodlg_macrolist[index];
	hide_drop_menu(event.target);
	entry.target = trg;
	build_dlg_macrolist_line(index);
}

const macro_select_glyph = (event) => {
	const glyph = event.currentTarget.dataset.glyph;
	const index = event.currentTarget.dataset.index;

	const entry = macrodlg_macrolist[index];
	hide_drop_menu(event.target);
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
		closeModal("cancel");
	} else {
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
	common.control_macrolist.length = 0;
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
