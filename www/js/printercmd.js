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
            console.log('Processing GRBL response for command:', prnCmd.trim(), 'response:', response);
            // Special handling for $CI command - response is plain channel names
            if (prnCmd.trim() === '$CI') {
                console.log('Special $CI handling');
                const lines = response.split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    console.log('Processing line:', trimmed);
                    // $CI returns plain channel names like "websocket", "telnet", "usbcdc", "macros"
                    if (trimmed.length > 0 && /^[a-z]+$/.test(trimmed)) {
                        console.log('Line matches channel name pattern, calling accumulateConnectionInfo');
                        if (typeof accumulateConnectionInfo === 'function') {
                            accumulateConnectionInfo(trimmed);
                        } else {
                            console.log('accumulateConnectionInfo is not a function!');
                        }
                    } else if (trimmed === 'ok' && typeof process_grbl_data === 'function') {
                        // Process the "ok" response
                        console.log('Processing ok response');
                        process_grbl_data(trimmed);
                    }
                }
            } else {
                // For other GRBL commands, process normally
                const lines = response.split('\n');
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (trimmed.length > 0 && typeof process_grbl_data === 'function') {
                        process_grbl_data(trimmed);
                    }
                }
            }
        };
        errFn = noop;
    }

	let cmd = buildHttpCommandCmd(httpCmdType.commandText, prnCmd);
    if (extra_arg) {
        cmd += `&${extra_arg}`;
    }

    console.log('SendPrinterCommand: Sending HTTP request:', cmd);
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
