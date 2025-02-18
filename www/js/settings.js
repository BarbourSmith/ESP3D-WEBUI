import {
  Common,
  get_icon_svg,
  M,
  conErr,
  stdErrMsg,
  displayBlock,
  displayNone,
  id,
  browser_is,
  setChecked,
  setHTML,
  Set_page_title,
  scanwifidlg,
  update_UI_firmware_target,
  alertdlg,
  confirmdlg,
  init_files_panel,
  httpCmdType,
  buildHttpCommandCmd,
  SendGetHttp,
  trx_text_item,
  restartdlg,
  CheckForHttpCommLock,
  setClassName,
} from "./common.js";

/** setting_configList */
const scl = [];
let setting_error_msg = "";
let setting_lasti = -1;
let setting_lastj = -1;

const CONFIG_TOOLTIPS = {
  Maslow_vertical: `If the ${M} is oriented horizontally, set this to false`,
  Maslow_calibration_offset_X: "mm offset from the edge of the frame, X",
  Maslow_calibration_offset_Y: "mm offset from the edge of the frame, Y",
  Maslow_calibration_size_X: "Number of X points to use in calibration",
  Maslow_calibration_size_Y: "Number of Y points to use in calibration",
  Maslow_brX: "Bottom right anchor x (normally width in mm)",
  Maslow_brY: "Bottom right anchor y (normally 0)",
  Maslow_brZ: "Bottom right z (normally 117)",
  Maslow_tlX: "Top left anchor x (normally 0)",
  Maslow_tlY: "Top left anchor y (normally height in mm)",
  Maslow_tlZ: "Top left z (normally 144)",
  Maslow_trX: "Top right anchor x (normally width in mm)",
  Maslow_trY: "Top right anchor y (normally height in mm)",
  Maslow_trZ: "Top right z (normally 97)",
  Maslow_blX: "Bottom left anchor x (normally 0)",
  Maslow_blY: "Bottom left anchor y (normally 0)",
  Maslow_blZ: "Bottom left z (normally 75)",
  Maslow_Retract_Current_Threshold: `Sets how hard should ${M} pull on the belts to retract before considering them to be all the way in`,
  Maslow_Calibration_Current_Threshold: `Sets how hard should ${M} pull on the belts during the calibration process.`,
  Maslow_calibration_extend_top_y: "starting Y for top belts on extend all (-1000 to 1000) default 0",
  Maslow_calibration_extend_bottom_y: "starting Y for bottom belts on extend all (-1000 to 1000) default ",
};

const refreshSettings = (hide_setting_list) => {
  const common = new Common();
  if (CheckForHttpCommLock()) {
    return;
  }
  common.do_not_build_settings = typeof hide_setting_list === "undefined" ? false : !hide_setting_list;

  displayBlock("settings_loader");
  displayNone(["settings_list_content", "settings_status", "settings_refresh_btn"]);

  // Clear all of the elements in the array
  scl.length = 0;
  const cmd = buildHttpCommandCmd(httpCmdType.plain, "[ESP400]");
  SendGetHttp(cmd, getESPsettingsSuccess, getESPsettingsfailed);
};

/** Return the defaultValue for the setting at index `i` */
const defval = (i) => scl[i].defaultvalue;

/** Build a 'setting' id, any prefix (pf) if supplied should include an '_' at the end of its value */
const sId = (sEntry, j, pf = "") => `${pf}${sEntry.id}_${j}`;

/** Build a select option, includes ugly workaround for OSX Chrome and Safari.
 * Also note that the `translate` attribute is set to yes to instruct the browser to use its own translation
 * Therefore do NOT supply a span with translation details to this function e.g. from a call to `trx_text_item`
 */
const bOpt = (value, isSelected, label) =>
  `<option value='${value}' ${isSelected ? "selected " : ""}translate="yes">${label}${browser_is("MacOSX") ? "&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;" : ""}</option>\n`;

function build_select_flag_for_setting_list(sEntry, j) {
  let html = `<select class='form-control' id='${sId(sEntry, j)}'>`;
  const defVal = sEntry.defaultvalue;
  let tmp = defVal | getFlag(i, j);
  html += bOpt("1", tmp === defVal, "Disable");
  tmp = defVal & ~getFlag(i, j);
  html += bOpt("0", tmp === defVal, "Enable");
  html += "</select>";
  //console.log("default:" + defVal);
  //console.log(html);
  return html;
}

function build_select_for_setting_list(sEntry, j) {
  let html = `<select class='form-control input-min wauto' id='${sId(sEntry, j)}'>`;
  const defVal = sEntry.defaultvalue;
  for (let oi = 0; oi < sEntry.Options.length; oi++) {
    html += bOpt(
      sEntry.Options[oi].id,
      sEntry.Options[oi].id === defVal,
      sEntry.Options[oi].display,
    );
  }
  html += "</select>";
  //console.log("default:" + defVal);
  //console.log(html);
  return html;
}

function update_UI_setting() {
  const common = new Common();
  for (let i = 0; i < scl.length; i++) {
    const defVal = scl[i].defaultvalue;
    switch (scl[i].pos) {
      case "850":
        common.fwData.direct_sd = defVal === 1;
        update_UI_firmware_target();
        init_files_panel(false);
        break;
      case "130":
        //set title using hostname
        Set_page_title(defVal);
        break;
    }
  }
}

/** Build a span with the translated text */
const trx_span = (item_text) => {
    const translated_content = trx_text_item(item_text)
    return `<span english_content="${item_text}" translate>${translated_content}</span>`;
}

/** to generate setting editor in setting or setup */
const build_control_from_index = (i, actions, extra_set_function = (i) => { }) => {
  let content = "<table>";
  if (i < scl.length && i > -1) {
    const common = new Common();
    const nbsub = scl[i].type === "F" ? scl[i].Options.length : 1;
    for (let j = 0; j < nbsub; j++) {
      if (j > 0) {
        content += "<tr><td style='height:10px;'></td></tr>";
      }
      content += "<tr><td style='vertical-align: middle;'>";
      if (scl[i].type === "F") {
        content += trx_span(scl[i].Options[j].display);
        content += "</td><td>&nbsp;</td><td>";
      }

      const statId = sId(scl[i], j, "status_");
      content += `<div id='${statId}' class='form-group has-feedback' style='margin: auto;'>`;
      content += "<div class='item-flex-row'>";
      content += "<table><tr><td>";
      content += "<div class='input-group'>";
      content += "<div class='input-group-btn'>";
      // setting_revert_to_default() does not work for FluidNC, which cannot report default values
      // content += `<button id='btn_revert_setting_${statId}' class='btn btn-default btn-svg'>`;
      // actions.push({id: `btn_revert_setting_${statId}`, type: "click", method: (event) => setting_revert_to_default(i, j)});
      // content += get_icon_svg("repeat");
      // content += "</button>";
      content += "</div>";
      content += "<input class='hide_it'></input>";
      content += "</div>";
      content += "</td><td>";
      content += "<div class='input-group'>";
      content += "<span class='input-group-addon hide_it' ></span>";
      const sfId = sId(scl[i], j);
      if (scl[i].type === "F") {
        //flag
        //console.log(scl[i].label + " " + scl[i].type);
        //console.log(scl[i].Options.length);
        content += build_select_flag_for_setting_list(scl[i], j);
        actions.push({ id: sfId, type: "change", method: (event) => setting_checkchange(i, j) });
      } else if (scl[i].Options.length > 0) {
        //drop list
        content += build_select_for_setting_list(scl[i], j);
        actions.push({ id: sfId, type: "change", method: (event) => setting_checkchange(i, j) });
      } else {
        //text
        const defVal = scl[i].defaultvalue;
        const input_type = defVal.startsWith("******") ? "password" : "text";
        content += `<form><input id='${sfId}' type='${input_type}' class='form-control input-min' value='${defVal}'></form>`;
        actions.push({ id: sfId, type: "keyup", method: (event) => setting_checkchange(i, j) });
      }
      content += `<span id='${sId(scl[i], j, "icon_")}' class='form-control-feedback ico_feedback'></span>`;
      content += "<span class='input-group-addon hide_it' ></span>";
      content += "</div>";
      content += "</td></tr></table>";

      content += "<div class='input-group'>";
      content += "<input class='hide_it'></input>";
      content += "<div class='input-group-btn'>";
      const btnId = sId(scl[i], j, "btn_");
      content += `<button id='${btnId}' class='btn btn-default' translate english_content='Set'>${trx_text_item("Set")}</button>`;
      actions.push({
        id: btnId,
        type: "click",
        method: (event) => {
          settingsetvalue(i, j);
          extra_set_function(i);
        },
      });
      if (scl[i].pos === common.EP_STA_SSID) {
        const btnId = sId(scl[i], j, "scanwifi_");
        content += `<button id='${btnId}' class='btn btn-default btn-svg'>${get_icon_svg("search")}</button>`;
        actions.push({ id: btnId, type: "click", method: (event) => scanwifidlg(i, j) });
      }
      content += "</div>";
      content += "</div>";
      content += "</div>";
      content += "</div>";
      content += "</td></tr>";
    }
  }
  content += "</table>";
  return content;
};

/** get setting UI for specific component instead of parse all */
function get_index_from_eeprom_pos(pos) {
  for (let i = 0; i < scl.length; i++) {
    if (pos === scl[i].pos) {
      return i;
    }
  }

  // Indicates failure
  return -1;
}

const configFileName = "maslow.yaml";
const configSaveResultId = "maslow_save_result";

const build_control_from_pos = (pos, actions, extra) => build_control_from_index(get_index_from_eeprom_pos(pos), actions, extra);

/** Send a command to call Config/Overwrite.
 *
 * If the configuration is invalid, e.g. because the ESP32 performed a panic reset,
 * Then the error code 153 will be returned via the socket.
 * @see maslow.js maslowErrorMsgHandling()
 */
const saveMaslowYaml = () => {
  console.info(`Calling for a Config Overwrite to save the ${configFileName} file`);
  const cmd = buildHttpCommandCmd(httpCmdType.plain, "$CO");
  SendGetHttp(cmd, saveConfigSuccess, saveConfigFail);
}

const saveConfigClearMessage = () => setTimeout(() => { setHTML(configSaveResultId, ""); }, 5000)

const saveConfigSuccess = (response) => {
  setHTML(configSaveResultId, `"Save" ${configFileName} succeeded`);
  saveConfigClearMessage();
}

const saveConfigFail = (response) => {
  setHTML(configSaveResultId, `"Save" ${configFileName} failed`);
  saveConfigClearMessage();
}

/** Build the HTML for the list of settings */
const build_HTML_setting_list = (filter) => {
  const common = new Common();

  // this to prevent concurrent process to update after we clean content
  if (common.do_not_build_settings) {
    return;
  }

  const buildTR = (tds) => `<tr>${tds}</tr>`;
  const buildTD = (tc, colspan = 0) => `<td${colspan > 0 ? ` colspan="${colspan}"` : ""}>${tc}</td>`;

  const actions = [];

  let content = buildTR(buildTD('Click "Set" after changing a value to set it', 2));
  if (filter === "tree") {
    content += buildTR(buildTD(`Click "Save" to save any changes you make to ${configFileName}</br>Then click the "restart" icon above, to Restart FluidNC for the changes to take effect`, 2));
    const instr = buildTD(`"Save" to ${configFileName}`);
    const btnId = "maslow_save_btn";
    const btn = buildTD(`<button id="${btnId}" type="button" class="btn btn-success">Save</button><span id="${configSaveResultId}"></span>`);
    content += buildTR(instr + btn);
    actions.push({ id: btnId, type: "click", method: saveMaslowYaml });
  }

  common.current_setting_filter = filter;
  setChecked(`${common.current_setting_filter}_setting_filter`, true);

  for (let i = 0; i < scl.length; i++) {
    const fname = scl[i].F.trim().toLowerCase();
    if (fname === "network" || fname === filter || filter === "all") {
      let tr = `<tr><td style='vertical-align:middle'>${trx_span(scl[i].label)}`;
      const tooltip = CONFIG_TOOLTIPS[scl[i].label.substring(1)];
      if (tooltip) {
        tr += '<div class="tooltip" style="padding-left: 20px; margin-top: 10px;">';
        tr += '<svg width="16" height="16" fill="#3276c3" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 416.979 416.979" xml:space="preserve" stroke="#3276c3">';
        tr += '<g id="SVGRepo_bgCarrier" stroke-width="0"></g>';
        tr += '<g id="SVGRepo_tracerCarrier" stroke-linecap="round" stroke-linejoin="round"></g>';
        tr += '<g id="SVGRepo_iconCarrier"> <g> <path d="M356.004,61.156c-81.37-81.47-213.377-81.551-294.848-0.182c-81.47,81.371-81.552,213.379-0.181,294.85 c81.369,81.47,213.378,81.551,294.849,0.181C437.293,274.636,437.375,142.626,356.004,61.156z M237.6,340.786 c0,3.217-2.607,5.822-5.822,5.822h-46.576c-3.215,0-5.822-2.605-5.822-5.822V167.885c0-3.217,2.607-5.822,5.822-5.822h46.576 c3.215,0,5.822,2.604,5.822,5.822V340.786z M208.49,137.901c-18.618,0-33.766-15.146-33.766-33.765 c0-18.617,15.147-33.766,33.766-33.766c18.619,0,33.766,15.148,33.766,33.766C242.256,122.755,227.107,137.901,208.49,137.901z"></path> </g> </g>';
        tr += '</svg>';
        tr += `<span class="tooltip-text">${tooltip}</span>`;
        tr += '</div>';
      }
      tr += "</td>\n";
      tr += `<td style='vertical-align:middle'><table><tr><td>${build_control_from_index(i, actions)}</td></tr></table></td>\n`;
      tr += "</tr>\n";
      content += tr;
    }
  }

  // From settingstab
  setHTML("settings_list_data", content);
  // biome-ignore lint/complexity/noForEach: <explanation>
  actions.forEach((action) => {
    const elem = id(action.id);
    if (elem) {
      elem.addEventListener(action.type, action.method);
    }
  });
  if (filter === "tree") {
    // TODO: figure out what the correct 'result' should be here - this is a guess
    document.querySelector("#setting__meta_0").value = common.fwData.result;
  }
  // set calibration values if exists
  const calRes = common.calibrationResults;
  if (Object.keys(calRes).length) {
    document.querySelector("#setting__Maslow_brX_0").value = calRes.br.x;
    document.querySelector("#setting__Maslow_brY_0").value = calRes.br.y;
    document.querySelector("#setting__Maslow_tlX_0").value = calRes.tl.x;
    document.querySelector("#setting__Maslow_tlY_0").value = calRes.tl.y;
    document.querySelector("#setting__Maslow_trX_0").value = calRes.tr.x;
    document.querySelector("#setting__Maslow_trY_0").value = calRes.tr.y;
    document.querySelector("#setting__Maslow_blX_0").value = calRes.bl.x;
    document.querySelector("#setting__Maslow_blY_0").value = calRes.bl.y;
  }
  // set calibration values if exists END
};

function setting_check_value(value, i) {
  let valid = true;
  const entry = scl[i];
  //console.log("checking value");
  if (entry.type === "F") {
    return valid;
  }

  // is it part of a list?
  if (entry.Options.length > 0) {
    let in_list = false;
    for (let oi = 0; oi < entry.Options.length; oi++) {
      // console.log(`checking *${entry.Options[oi].id}* and *${value}*` );
      if (entry.Options[oi].id === value) {
        in_list = true;
        break;
      }
    }
    valid = in_list;
    if (!valid) {
      setting_error_msg = " in provided list";
    }
  }
  //check byte / integer
  if (["B", "I"].includes(entry.type)) {
    //cannot be empty
    const bIVal = value.trim();
    if (bIVal.length === 0) {
      valid = false;
    }
    // Check minimum and maximum
    if (Number.parseInt(entry.min_val) > Number.parseInt(value) || Number.parseInt(entry.max_val) < Number.parseInt(value)) {
      valid = false;
      setting_error_msg = ` between ${entry.min_val} and ${entry.max_val}`;
    }
    if (Number.isNaN(value)) {
      valid = false;
    }
  } else if (entry.type === "S") {
    if (entry.min_val > value.length || entry.max_val < value.length || value === "********") {
      valid = false;
      setting_error_msg = ` between ${entry.min_val} char(s) and ${entry.max_val} char(s) long, and not '********'`;
    }
  } else if (entry.type === "A") {
    //check ip address
    const ipformat =
      /^(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.(25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;
    if (!value.match(ipformat)) {
      valid = false;
      setting_error_msg = " a valid IP format (xxx.xxx.xxx.xxx)";
    }
  }
  return valid;
}

function process_settings_answer(response_text) {
  let result = true;
  try {
    const response = JSON.parse(response_text);
    if (typeof response.EEPROM === "undefined") {
      result = false;
      console.warn("No EEPROM");
    } else {
      //console.log("EEPROM has " + response.EEPROM.length + " entries");
      if (response.EEPROM.length > 0) {
        let vi = 0;
        for (let i = 0; i < response.EEPROM.length; i++) {
          if (!is_setting_entry(response.EEPROM[i])) {
            continue;
          }
          const sEntry = create_setting_entry(response.EEPROM[i], vi++);
          scl.push(sEntry);
        }
        if (vi > 0) {
          const common = new Common();
          if (common.setup_is_done) {
            build_HTML_setting_list(common.current_setting_filter);
          }
          update_UI_setting();
        } else {
          result = false;
        }
      } else {
        result = false;
      }
    }
  } catch (e) {
    console.error("Parsing error:", e);
    result = false;
  }
  return result;
}

const settingEntryMin = (sentry) => {
  if (typeof sentry.M !== "undefined") {
    return sentry.M;
  }
  //add limit according the type
  switch (sentry.T) {
    case "B": return -127;
    case "A": return 7;
    case "S":
    case "I": return 0;
    default: return 0;
  }
}

const settingEntryMax = (sentry) => {
  if (typeof sentry.S !== "undefined") {
    return sentry.S;
  }
  //add limit according the type
  switch (sentry.T) {
    case "B":
    case "S": return 255;
    case "A": return 15;
    case "I": return 2147483647;
    default: return 2147483647;
  }
}

/** Build list of possible options if defined */
const settingEntryOptions = (sentry) => {
  if (typeof sentry.O === "undefined") {
    return [];
  }
  const options = [];
  for (const i in sentry.O) {
    const val = sentry.O[i];
    for (const j in val) {
      options.push({ id: val[j].trim(), display: j.trim() });
    }
  }
  return options;
}

/** create entry to go into scl list */
const create_setting_entry = (sentry, vi) => {
  return {
    index: vi,
    F: sentry.F,
    id: `setting_${sentry.H.replaceAll("\\", "_").replaceAll("/", "_")}`,
    label: sentry.H,
    defaultvalue: sentry.V.trim(),
    cmd: `[ESP401]P=${sentry.P} T=${sentry.T} V=`,
    Options: settingEntryOptions(sentry),
    min_val: settingEntryMin(sentry),
    max_val: settingEntryMax(sentry),
    type: sentry.T,
    pos: sentry.P,
  };
}

/** Check it is valid setting entry */
const is_setting_entry = (sline) => typeof sline.T !== "undefined" && typeof sline.V !== "undefined" && typeof sline.P !== "undefined" && typeof sline.H !== "undefined";

const getFlag = (i, j) =>
  scl[i].type !== "F" || scl[i].Options.length <= j
    ? -1
    : Number.parseInt(scl[i].Options[j].id);

const setting = (i, j) => id(sId(scl[i], j));

const getSettingElem = (i, j, pf) => {
  const elemId = sId(scl[i], j, pf);
  return id(elemId);
}

const setElemClass = (i, j, pf, pType, className) => {
  const elem = getSettingElem(i, j, pf);
  if (elem == null) {
    console.warn(`Could not find setting ${pType} element for id '${sId(scl[i], j, pf)}'`);
    return;
  }
  elem.className = className;
}

const setBtn = (i, j, value) => setElemClass(i, j, "btn_", "button", `btn ${value}`);
const setStatus = (i, j, value) => setElemClass(i, j, "status_", "status", `form-group ${value}`);
const setIcon = (i, j, value) => setElemClass(i, j, "icon_", "icon", `form-control-feedback ${value}`);

function setIconHTML(i, j, value) {
  setHTML(sId(scl[i], j, "icon_"), value);
}

// function setting_revert_to_default(i, j = 0) {
// 	if (scl[i].type === "F") {
// 		const tst = Number.parseInt(defval(i));
// 		setting(i, j).value = tst === (tst | getFlag(i, j)) ? "1" : "0";
// 	} else {
// 		setting(i, j).value = defval(i);
// 	}
// 	setBtn(i, j, "btn-default");
// 	setStatus(i, j, "form-group has-feedback");
// 	setIconHTML(i, j, "");
// }

const applyFlag = (value, defVal, i, j = 0) => {
  const sEntry = scl[i];
  if (sEntry.type !== "F") {
    return value;
  }

  //console.log("it is flag value");
  let tmp = defVal;
  if (value === "1") {
    tmp |= getFlag(i, j);
  } else {
    tmp &= ~getFlag(i, j);
  }
  return tmp;
}

function settingsetvalue(i, j = 0) {
  //remove possible spaces
  let value = setting(i, j).value.trim();
  const defVal = defval(i);
  
  //Apply flag here
  value = applyFlag(value, defVal, i, j);
  if (value === defVal) {
    return;
  }

  //check validity of value
  const isvalid = setting_check_value(value, i);
  //if not valid show error
  if (!isvalid) {
    setsettingerror(i);
    alertdlg(trx_text_item("Out of range"), `${trx_text_item("Value must be ")}${setting_error_msg} !`);
  } else {
    //value is ok save it
    setting_lasti = i;
    setting_lastj = j;
    scl[i].defaultvalue = value;
    setBtn(i, j, "btn-success");
    setIcon(i, j, "has-success ico_feedback");
    setIconHTML(i, j, get_icon_svg("ok"));
    setStatus(i, j, "has-feedback has-success");

    const cmd = buildHttpCommandCmd(httpCmdType.plain, `${scl[i].cmd}${value}`);
    SendGetHttp(cmd, setESPsettingsSuccess, setESPsettingsfailed);
  }
}

function setting_checkchange(i, j) {
  //console.log("list value changed");
  const settingElem = setting(i, j);
  const sEntry = scl[i];
  let val = "";
  if (settingElem === null) {
    console.warn(`Could not find setting input element for id '${sId(sEntry, j)}'`);
  } else {
    val = setting(i, j).value.trim();
  }

  const defVal = sEntry.defaultvalue;
  val = applyFlag(val, defVal, i, j);

  //console.log("value: " + val);
  //console.log("default value: " + defVal);
  if (defVal === val) {
    console.log("values are identical");
    setBtn(i, j, "btn-default");
    setIcon(i, j, "");
    setIconHTML(i, j, "");
    setStatus(i, j, "has-feedback");
  } else if (setting_check_value(val, i)) {
    //console.log("Check passed");
    setsettingchanged(i, j);
  } else {
    console.log("change bad");
    setsettingerror(i, j);
  }
}

function setsettingchanged(i, j) {
  setStatus(i, j, "has-feedback has-warning");
  setBtn(i, j, "btn-warning");
  setIcon(i, j, "has-warning ico_feedback");
  setIconHTML(i, j, get_icon_svg("warning-sign"));
}

function setsettingerror(i, j) {
  setBtn(i, j, "btn-danger");
  setIcon(i, j, "has-error ico_feedback");
  setIconHTML(i, j, get_icon_svg("remove"));
  setStatus(i, j, "has-feedback has-error");
}

function setESPsettingsSuccess(response) {
  //console.log(response);
  update_UI_setting();
}

function setESPsettingsfailed(error_code, response) {
  const errMsg = stdErrMsg(error_code, response);
  alertdlg(trx_text_item("Set failed"), errMsg);
  conErr(errMsg);
  setBtn(setting_lasti, setting_lastj, "btn-danger");
  const iconName = `icon_setting_${setting_lasti}_${setting_lastj}`;
  setClassName(iconName, "form-control-feedback has-error ico_feedback");
  setHTML(iconName, get_icon_svg("remove"));
  setStatus(setting_lasti, setting_lastj, "has-feedback has-error");
}

function getESPsettingsSuccess(response) {
  displayNone("settings_loader");
  displayBlock("settings_refresh_btn");
  if (!process_settings_answer(response)) {
    getESPsettingsfailed(406, trx_text_item("Wrong data"));
    console.log(response);
    return;
  }
  displayNone("settings_status");
  displayBlock("settings_list_content");
}

function getESPsettingsfailed(error_code, response) {
  conErr(error_code, response);
  displayNone("settings_loader");
  displayBlock(["settings_status", "settings_refresh_btn"]);
  setHTML("settings_status", stdErrMsg(error_code, response, trx_text_item("Failed")));
}

const restart_esp = () => {
  confirmdlg(trx_text_item("Please Confirm"), trx_text_item("Restart FluidNC"), process_restart_esp);
};

function process_restart_esp(answer) {
  if (answer === "yes") {
    restartdlg();
  }
}

const define_esp_role = (index) => {
  const common = new Common();
  switch (Number(defval(index))) {
    case common.SETTINGS_FALLBACK_MODE:
      displayBlock(["setup_STA", "setup_AP"]);
      break;
    case common.SETTINGS_AP_MODE:
      displayNone("setup_STA");
      displayBlock("setup_AP");
      break;
    case common.SETTINGS_STA_MODE:
      displayBlock("setup_STA");
      displayNone("setup_AP");
      break;
    default:
      displayNone(["setup_STA", "setup_AP"]);
      break;
  }
};

const define_esp_role_from_pos = (pos) => define_esp_role(get_index_from_eeprom_pos(pos));

export {
  build_control_from_pos,
  build_HTML_setting_list,
  define_esp_role,
  define_esp_role_from_pos,
  defval,
  get_index_from_eeprom_pos,
  refreshSettings,
  restart_esp,
  saveMaslowYaml,
};
