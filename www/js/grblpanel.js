import {
	Common,
	id,
	opentab,
	SendPrinterCommand,
	grbl_reset,
	reportNone,
	tryAutoReport,
	reportPolled,
	onAutoReportIntervalChange,
	onstatusIntervalChange,
	onprobemaxtravelChange,
	onprobefeedrateChange,
	onproberetractChange,
	onprobetouchplatethicknessChange,
	SendRealtimeCmd,
	StartProbeProcess,
	setSpindleSpeed,
	trx_text_item,
	setHTML,
	get_icon_svg,
} from "./common.js";

const grblPanelClearStatus = () => SendPrinterCommand("$X", true, null, null, 114, 1);
const grblPanelPause = () => SendRealtimeCmd(0x21);
const grblPanelResume = () => SendRealtimeCmd(0x7e);

const grblPanelF10Minus = () => SendRealtimeCmd(0x92);
const grblPanelF1Minus = () => SendRealtimeCmd(0x94);
const grblPanelF0 = () => SendRealtimeCmd(0x90);
const grblPanelF1Plus = () => SendRealtimeCmd(0x93);
const grblPanelF10Plus = () => SendRealtimeCmd(0x91);

const grblPanelS10Minus = () => SendRealtimeCmd(0x9b);
const grblPanelS1Minus = () => SendRealtimeCmd(0x9d);
const grblPanelS0 = () => SendRealtimeCmd(0x99);
const grblPanelS1Plus = () => SendRealtimeCmd(0x9c);
const grblPanelS10Plus = () => SendRealtimeCmd(0x9a);

const grblPanelSpindle = () => SendRealtimeCmd(0x9e);
const grblPanelFlood = () => SendRealtimeCmd(0xa0);
const grblPanelMist = () => SendRealtimeCmd(0xa1);

const grblPanelSpindleFwd = () => {
	const common = new Common();
	SendPrinterCommand(`M3 S${common.spindleTabSpindleSpeed}`, false, null, null, 1, 1);
}
const grblPanelSpindleRew = () => {
	const common = new Common();
	SendPrinterCommand(`M4 S${common.spindleTabSpindleSpeed}`, false, null, null, 1, 1);
}
const grblPanelSpindleOff = () => SendPrinterCommand("M5 S0", false, null, null, 1, 1);
const grblPanelSpindleRpm = (event) => setSpindleSpeed(event.value);

const grblPanelControlTabLink = (event) => opentab(event, "grblcontroltab", "grbluitabscontent", "grbluitablinks");
const grblPanelSpindleTabLink = (event) => opentab(event, "grblspindletab", "grbluitabscontent", "grbluitablinks");
const grblPanelProbeTabLink = (event) => opentab(event, "grblprobetab", "grbluitabscontent", "grbluitablinks");

/** Set up the event handlers for the grblpanel */
const grblpanel = () => {
	const common = new Common();

    // GRBL reporting
    id("report_none").addEventListener("change", onReportType);
    id("report_auto").addEventListener("change", onReportType);
    id("grblpanel_autoreport_interval").addEventListener("change", onAutoReportIntervalChange);
    id("report_poll").addEventListener("change", onReportType);
    id("grblpanel_interval_status").addEventListener("change", onstatusIntervalChange);

    id("clear_status_btn").addEventListener("click", grblPanelClearStatus);
    id("sd_pause_btn").addEventListener("click", grblPanelPause);
    id("sd_resume_btn").addEventListener("click", grblPanelResume);
    id("sd_reset_btn").addEventListener("click", grbl_reset);

    id("grblpanel_F10_minus").addEventListener("click", grblPanelF10Minus);
    id("grblpanel_F1_minus").addEventListener("click", grblPanelF1Minus);
    id("grblpanel_F0").addEventListener("click", grblPanelF0);
    id("grblpanel_F1_plus").addEventListener("click", grblPanelF1Plus);
    id("grblpanel_F10_plus").addEventListener("click", grblPanelF10Plus);

    id("grblpanel_S10_minus").addEventListener("click", grblPanelS10Minus);
    id("grblpanel_S1_minus").addEventListener("click", grblPanelS1Minus);
    id("grblpanel_S0").addEventListener("click", grblPanelS0);
    id("grblpanel_S1_plus").addEventListener("click", grblPanelS1Plus);
    id("grblpanel_S10_plus").addEventListener("click", grblPanelS10Plus);

    id("grblpanel_spindle").addEventListener("click", grblPanelSpindle);
    id("grblpanel_flood").addEventListener("click", grblPanelFlood);
    id("grblpanel_mist").addEventListener("click", grblPanelMist);

    id("grblspindle_fwd").addEventListener("click", grblPanelSpindleFwd);
    id("grblspindle_rew").addEventListener("click", grblPanelSpindleRew);
    id("grblspindle_off").addEventListener("click", grblPanelSpindleOff);
    id("grblspindle_rpm").addEventListener("change", grblPanelSpindleRpm);
    id("grblspindle_rpm").addEventListener("keyup", grblPanelSpindleRpm);

    id("grblpanel_probemaxtravel").addEventListener("change", onprobemaxtravelChange);
    id("grblpanel_probefeedrate").addEventListener("change", onprobefeedrateChange);
    id("grblpanel_proberetract").addEventListener("change", onproberetractChange);
    id("grblpanel_probetouchplatethickness").addEventListener("change", onprobetouchplatethicknessChange);

    id("probingbtn").addEventListener("click", StartProbeProcess);

    id("grblcontroltablink").addEventListener("click", grblPanelControlTabLink);
    id("grblspindletablink").addEventListener("click", grblPanelSpindleTabLink);
    id("grblprobetablink").addEventListener("click", grblPanelProbeTabLink);

	id("global_reset_btn").addEventListener("click", grbl_reset);

	const clearAlarmTitle = `<span class="tooltip-text">${trx_text_item("Clear Alarm")}</span>`
	const bellIcon = get_icon_svg("bell", {h: "1.8em", w: "2em", t: "translate(50,1200) scale(1,-1)", v:"-200 -200 1700 1600", color: "black"});
	const alarmIcon = bellIcon.replace("</path>", '</path><circle cx="600" cy="600" r="700" stroke="red" stroke-width="100" fill="none"></circle><line x1="106" y1="106" x2="1094" y2="1094" stroke="red" stroke-width="100"></line>');
	setHTML("clear_status_btn", `${clearAlarmTitle}${alarmIcon}`);

	setHTML("sd_pause_btn", get_icon_svg("pause", {h: "1.4em", w: "2em", t: "translate(50,1200) scale(1,-1)", color: "blue"}));
	setHTML("sd_resume_btn", get_icon_svg("play", {h: "1.4em", w: "2em", t: "translate(50,1200) scale(1,-1)", color: "green"}));

	setHTML("grblspindle_rew", `On Rew${get_icon_svg("triangle-left")}`);
	setHTML("grblspindle_fwd", `On Fwd${get_icon_svg("triangle-right")}`);
	setHTML("grblspindle_off", `Off${get_icon_svg("stop")}`);

	const iconPlayOptions = {h: "1.4em", w: "1.3em", t: "translate(50,1200) scale(1,-1)", color: "black"};
	setHTML("FFastBack", get_icon_svg("fast-backward", iconPlayOptions));
	setHTML("FBack", get_icon_svg("step-backward", iconPlayOptions));
	setHTML("grblpanel_F0", get_icon_svg("play", iconPlayOptions));
	setHTML("FFwd", get_icon_svg("step-forward", iconPlayOptions));
	setHTML("FFastFwd", get_icon_svg("fast-forward", iconPlayOptions));

	setHTML("SFastBack", get_icon_svg("fast-backward", iconPlayOptions));
	setHTML("SBack", get_icon_svg("step-backward", iconPlayOptions));
	setHTML("grblpanel_S0", get_icon_svg("play", iconPlayOptions));
	setHTML("SFwd", get_icon_svg("step-forward", iconPlayOptions));
	setHTML("SFastFwd", get_icon_svg("fast-forward", iconPlayOptions));

	setHTML("grblSpindle", get_icon_svg("record", iconPlayOptions));
	setHTML("grblFlood", get_icon_svg("tint", iconPlayOptions));
	setHTML("grblMist", get_icon_svg("cloud-download", iconPlayOptions).replace("</path>", '</path><circle cx="600" cy="450" r="300" stroke="black" fill="black"></circle>'));

	const iconResetOptions = {h: "1.4em", w: "2em", t: "translate(1200,1200) scale(-1, -1)", v: "0 0 1200 1200", color: "white"};
	setHTML("sd_reset_btn", get_icon_svg("play", iconResetOptions));
	setHTML("global_reset_btn", get_icon_svg("play", iconResetOptions));

};

const onReportType = (e) => {
    switch (e.value) {
        case "none": reportNone(); break;
        case "auto": tryAutoReport(); break;
        case "poll": reportPolled(); break;
    }
};

export { grblpanel };
