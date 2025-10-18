var grbl_processfn = null;
var grbl_errorfn = null;

function noop() {}
function SendPrinterCommand(prnCmd, echo_on, processfn, errorfn, cmd_code, max_cmd_code, extra_arg) {
    if (prnCmd.trim().length === 0) {
        return;
    }

    var push_cmd = typeof echo_on !== 'undefined' ? echo_on : true;
    if (push_cmd) {
        Monitor_output_Update(`[#]${prnCmd.trim()}\n`);
    }

    //removeIf(production)
    console.log(prnCmd);
    if (typeof processfn !== 'undefined') {
        processfn("Test response");
    } else {
        SendPrinterCommandSuccess("Test response");
    }
    return;
    //endRemoveIf(production)

    // Ensure that we have valid functions defined for process and error returns
    let procFn = typeof processfn === "function" ? processfn : SendPrinterCommandSuccess;
    let errFn = typeof errorfn === "function" ? errorfn : SendPrinterCommandFailed;
    if (!prnCmd.startsWith("[ESP")) {
        grbl_processfn = procFn;
        grbl_errorfn = errFn;
        // For GRBL commands, route HTTP responses through the GRBL message processor
        procFn = function(response) {
            // Split response into lines and process each through GRBL handler
            const lines = response.split('\n');
            for (const line of lines) {
                const trimmed = line.trim();
                if (trimmed.length > 0 && typeof process_grbl_data === 'function') {
                    process_grbl_data(trimmed);
                }
            }
        };
        errFn = noop;
    }

	let cmd = buildHttpCommandCmd(httpCmdType.commandText, prnCmd);
    if (extra_arg) {
        cmd += `&${extra_arg}`;
    }

    SendGetHttp(cmd, procFn, errFn, cmd_code, max_cmd_code);
    //console.log(cmd);
}

function SendPrinterCommandSuccess(response) {
}

function SendPrinterCommandFailed(error_code, response) {
    const resp = HTMLDecode((response || "").trim());
    const errMsg = (error_code === 0)
        ? translate_text_item("Connection error")
        : stdErrMsg(error_code, resp, translate_text_item("Error"));

    Monitor_output_Update(`${errMsg}\n`);

    conErr(error_code, resp, "printer cmd Error");
}
