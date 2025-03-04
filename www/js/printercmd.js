import {
    conErr,
    HTMLDecode,
    stdErrMsg,
    Monitor_output_Update,
    httpCmdType,
	buildHttpCommandCmd,
    SendGetHttp,
    trx_text_item,
    Common,
} from "./common.js";

const cleanFunc = (fn, cleanFn) => fn instanceof Function ? fn : cleanFn;

function noop() {}
function SendPrinterCommand(prnCmd, echo_on, processfn, errorfn, cmd_code, max_cmd_code, extra_arg) {
    const pCmd = (prnCmd || "").trim();
    if (!pCmd) {
        return;
    }

    const push_cmd = typeof echo_on !== 'undefined' ? echo_on : true;
    if (push_cmd) {
        Monitor_output_Update(`[#]${pCmd}\n`);
    }

    // Ensure that we have valid functions defined for process and error returns
    let procFn = cleanFunc(processfn, SendPrinterCommandSuccess);
    let errFn = cleanFunc(errorfn, SendPrinterCommandFailed);

    if (!pCmd.startsWith("[ESP")) {
        const common = new Common();
        common.grbl_processfn = procFn;
        common.grbl_errorfn = errFn;
        procFn = noop;
        errFn = noop;
    }
	let cmd = buildHttpCommandCmd(httpCmdType.commandText, pCmd);
    if (extra_arg) {
        cmd += `&${extra_arg}`;
    }

    SendGetHttp(cmd, procFn, errFn, cmd_code, max_cmd_code);
    //console.log(cmd);
}

function SendPrinterCommandSuccess(response) { }

function SendPrinterCommandFailed(error_code, response) {
    const resp = HTMLDecode((response || "").trim());
    const errMsg = (error_code === 0)
        ? trx_text_item("Connection error")
        : stdErrMsg(error_code, resp, trx_text_item("Error"));

    Monitor_output_Update(`${errMsg}\n`);

    conErr(error_code, resp, "printer cmd Error");
}

export { SendPrinterCommand };
