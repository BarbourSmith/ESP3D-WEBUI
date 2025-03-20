import {
    Common,
    elemsByClass,
    get_icon_svg,
    displayBlock,
    displayNone,
    displayUndoNone,
    id,
    setHTML,
    closeModal,
    setactiveModal,
    showModal,
    getPrefValue,
    setPrefValue,
    SavePreferences,
    build_language_list,
    trx_text_item,
    build_control_from_pos,
    build_HTML_setting_list,
    define_esp_role,
    define_esp_role_from_pos,
    translate_text,
    setClassName,
    // get_index_from_eeprom_pos,
    // defval,
} from "./common.js";

const wizardSteps = [
    { name: "startstep", icon: "alert", link: "startsteplink", wizardLine: "", contAct: () => step0ContentAndActions(), next: "step1" },
    { name: "step1", icon: "cog", link: "step1link", wizardLine: "wizard_line1", contAct: () => step1ContentAndActions(), next: "step2" },
    { name: "step2", icon: "signal", link: "step2link", wizardLine: "wizard_line2", contAct: () => step2ContentAndActions(), next: "endstep" },
    // { name: "step3", icon: "wizard-sd", link: "step3link", wizardLine: "wizard_line3", contAct: () => step3ContentAndActions(), next: "endstep" },
    { name: "endstep", icon: "ok", link: "endsteplink", wizardLine: "wizard_line4", contAct: () => step4Content(), next: "close" },
];

const setupDlgCancel = () => closeModal("cancel");
const setupDlgContinue = () => continueSetupWizard();

/** Set up the event handlers and state machine for the setup wizard */
const setupdlg = () => {
    const common = new Common();
    common.setup_is_done = false;

    // displayNone("main_ui");
    setHTML("settings_list_data", "");

    const modal = setactiveModal("setupdlg.html", setupdone);
    if (modal == null) {
        return;
    }

    id("setupDlgCancel").addEventListener("click", setupDlgCancel);

    const actions = [];
    const content = ["<div class='steplinks spacer'></div>"];
    for ( const step of wizardSteps ) {
        content.push(buildWizardLink(step));
        actions.push({ id: step.link, type: "click", method: (event) => startStep(event, step.name) });
    };
    setHTML("setupStepLinks", content.join("\n"));
    addActions(actions);

    setHTML("wizard_button", trx_text_item("Start"));
    // point the wizard button at the next step
    id("wizard_button").title = wizardSteps[0].next;
    id("wizard_button").addEventListener("click", setupDlgContinue);

    for ( const step of wizardSteps ) {
        if (step.wizard) {
            disableStepLink(step.wizard, step.link);
        }
    };

    // displayNone("step3link");

    showModal();
    wizardNotDone(wizardSteps[0].link);

    // Load up the step content and actions
    wizardSteps[0].contAct();
    id(wizardSteps[0].link).click();
};

const td = (content) => `<td>${content}</td>`;
const table = (content) => `<table><tr>${content}</tr></table>`;
const heading = (label) => `<h4>${trx_text_item(label)}</h4><hr>`;
const buildControlItem = (label, pos, actions, extra) => (trx_text_item(label) + table(build_control_from_pos(pos, actions, extra)));
const hardRule = () => "<hr>\n";
const div = (name) => `<div id='${name}'>`;
const endDiv = () => "</div>";
/** Mark the wizard step as 'not done' by removing the 'wizard_done' class */
const wizardNotDone = (element) => id(element).classList.remove("wizard_done");

const buildWizardLink = (step) => {
    const content = [];
    if (step.wizardLine) {
        content.push(`<div id="${step.wizardLine}" class="steplinks connecting-line"></div>`);
    }

    content.push(`<button id="${step.link}" class="steplinks">`);
    content.push(get_icon_svg(step.icon, {t: "translate(50,1200) scale(1,-1)"}));
    content.push("</button>");

    return content.join("\n");
}

function setupdone(response) {
    const common = new Common();
    common.setup_is_done = true;
    common.do_not_build_settings = false;
    build_HTML_setting_list(common.current_setting_filter);
    SavePreferences();
    translate_text(getPrefValue("language_list"));
    // displayUndoNone("main_ui");
    closeModal("setup done");
}

const startStep = (evt, stepName) => {
    // if (evt.currentTarget.classList.contains("wizard_done")) {
    //     return;
    // }

    for (const stepcont of elemsByClass("stepcontent")) {
        const stepId = stepcont.id;
        if (stepId !== stepName) {
            displayNone(stepId);
        }
    };

    displayBlock(stepName);
    evt.currentTarget.classList.add("active");
};

function openStepLink(wizardLine, stepLink) {
    id(wizardLine).style.background = "#337AB7";
    id(stepLink).disabled = "";
    id(stepLink).classList.remove("disabled");
}

/** Disable the wizard step and mark it as not done */
const disableStepLink = (wizardLine, stepLink) => {
    id(wizardLine).style.background = "#e0e0e0";
    id(stepLink).disabled = true;
    setClassName(stepLink, "steplinks disabled");
    wizardNotDone(stepLink);
}

const closeStepLink = (stepLink) => {
    const elem = id(stepLink);

    elem.classList.remove("active");
    if (elem.classList.contains("wizard_done")) {
        return;
    }

    elem.classList.add("wizard_done");
    elem.classList.add("no_revert_wizard");
}

const continueSetupWizard = () => {
    const nextStepName = id("wizard_button").title;
    if (nextStepName === "close") {
        // This also calls `setupdone` above
        closeModal("ok");
        return;
    }

    const currentStep = wizardSteps.find((step) => step.next === nextStepName);
    const nextStep = wizardSteps.find((step) => step.name === nextStepName);
    console.info(`From step: '${currentStep.name}' -> To step: '${nextStepName}'`);

    // Point the wizard button at the next step
    id("wizard_button").title = nextStep?.next || "close";

    // Close the current step link and open the new step link
    closeStepLink(currentStep.link);
    openStepLink(nextStep.wizardLine, nextStep.link);

    // Load of the step content and actions
    nextStep.contAct();
    id(nextStep.link).click();

    // Any actions after exiting the step
    switch (nextStepName) {
        case "step1":
            setPrefValue("language", getPrefValue("language_list"));
            break;
        case "step2":
        case "step3":
        case "endstep":
            break;
        default:
            console.error(`wizard page ${nextStepName} is not defined`);
            break;
    }
}

const addActions = (actions) => {
    for (const action of actions) {
        const elem = id(action.id);
        if (elem) {
            elem.addEventListener(action.type, action.method);
        }
    };
};

const step0ContentAndActions = (stepName = "startstep") => {
    const ls = "language_selection";
    const sll = "setup_language_list";
    let content = "";
    content += heading("Setup Wizard");
    content += `${trx_text_item("This wizard will help you to configure the basic settings.")}<br/>`;
    content += `${div(sll) + endDiv()}<br/>`;
    content += `<span>${trx_text_item("Press start to proceed.")}</span>`;

    setHTML(stepName, content);

    id(sll).classList.add("center");
    const selLang = getPrefValue("language_list");
    const langList = table(td(`${get_icon_svg("flag")}&nbsp;`) + td(build_language_list(ls, selLang)));
    setHTML(sll, langList);

    const actions = [{ id: ls, type: "change", method: (event) => translate_text(selLang) }];
    addActions(actions);
}

const step1ContentAndActions = (stepName = "step1") => {
    const actions = [];
    const EP_HOSTNAME = "Hostname";

    const content = heading("FluidNC Settings") + buildControlItem("Define ESP name:", EP_HOSTNAME, actions);

    setHTML(stepName, content);
    addActions(actions);
    setHTML("wizard_button", trx_text_item("Continue"));
}

const step2ContentAndActions = (stepName = "step2") => {
    const common = new Common();
    const actions = [];

    let content = "";
    content += heading("WiFi Configuration");

    content += buildControlItem("Define ESP role:", common.EP_WIFI_MODE, actions, define_esp_role);
    content += `${trx_text_item("AP define access point / STA allows to join existing network")}<br/>`;

    content += hardRule();

    content += div("setup_STA");
    content += buildControlItem("What access point ESP need to be connected to:", common.EP_STA_SSID, actions);
    content += `${trx_text_item("You can use scan button, to list available access points.")}<br/>`;
    content += hardRule();
    content += buildControlItem("Password to join access point:", common.EP_STA_PASSWORD, actions);
    content += endDiv();

    content += div("setup_AP");
    content += buildControlItem("What is ESP access point SSID:", common.EP_AP_SSID, actions);
    content += hardRule();
    content += buildControlItem("Password for access point:", common.EP_AP_PASSWORD, actions);
    content += endDiv();

    setHTML(stepName, content);
    addActions(actions);
    define_esp_role_from_pos(common.EP_WIFI_MODE);
}

// const define_sd_role = (index) => {
//     if (defval(index) === 1) {
//         displayBlock("setup_SD");
//         displayNone("setup_primary_SD");
//     } else {
//         displayNone(["setup_SD", "setup_primary_SD"]);
//     }
// };

// const step3ContentAndActions = (stepName = "step3") => {
//     const common = new Common();
//     const actions = [];

//     let content = "";
//     content += heading("SD Card Configuration");
//     content += buildControlItem("Is ESP connected to SD card:", common.EP_IS_DIRECT_SD, actions, define_sd_role);
//     content += hardRule();

//     content += div("setup_SD");
//     content += buildControlItem("Check update using direct SD access:", common.EP_DIRECT_SD_CHECK, actions);
//     content += hardRule();

//     content += div("setup_primary_SD");
//     content += buildControlItem("SD card connected to ESP", common.EP_PRIMARY_SD, actions);
//     content += hardRule();
//     content += buildControlItem("SD card connected to printer", common.EP_SECONDARY_SD, actions);
//     content += hardRule();
//     content += endDiv();

//     content += endDiv();

//     setHTML(stepName, content);
//     addActions(actions);
//     define_sd_role(get_index_from_eeprom_pos(common.EP_IS_DIRECT_SD));
// }

const step4Content = (stepName = "endstep") => {
    let content = "";
    content += heading("Setup Wizard Completed");
    content += `<span>${trx_text_item("Setup is finished.")}</span><br/>`;
    content += `<span>${trx_text_item("After closing, you will still be able to change or to fine tune your settings in the main interface anytime.")}</span><br/>`;
    content += `<span>${trx_text_item("You may need to restart the board to apply the new settings and connect again")}</span>`;

    setHTML(stepName, content);
    setHTML("wizard_button", trx_text_item("Close"));
}

export { setupdlg };
