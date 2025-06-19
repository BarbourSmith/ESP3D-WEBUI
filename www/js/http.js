import { Common, alertdlg, httpCmd, setHTML, trx_text_item, logindlg } from "./common.js";

/** A list of various command objects that can be used as a queue */
const cmd_list = [];
let processing_cmd = false;
const max_cmd = 100;

let cmdInterval = 0;

const processNextCmd = () => {
    if (!cmd_list.length) {
        console.warn("Command list empty, no messages to process at this time");
        clearInterval(cmdInterval);
        cmdInterval = 0;
    }

    switch (process_cmd_list(cmd_list[0], "process")) {
        case 1:
            // Success, job done, move on ...
            break;
        case -3:
            // Malformed command, remove from the list without changing anything else
            cmd_list.splice(0, 1);
            break;
        case -2:
            // TODO: Too many commands in the cmd_list, this should be reprocessed later
            break;
        case -1:
            // TODO: Currently processing a command, this should be retried
            break;
        default:
            break;
    }
}

/** This comes straight out of the Mozilla website for Math.random */
const getRandomIntExclusive = (min = 0, max = 10000) => {
    const minCeiled = Math.ceil(min);
    const maxFloored = Math.floor(max);
    return Math.floor(Math.random() * (maxFloored - minCeiled) + minCeiled);
}

const zeroPrefixedString = (value, prefix = "00000") => `${prefix}${value}`.slice(-prefix.length);

/** Remove the command with the specified Id */
const removeCmd = (cmdId) => {
    const ix = cmd_list.findIndex((c) => c.id === cmdId);
    if (ix !== -1) {
        cmd_list.splice(ix, 1);
    } else {
        console.warn(`Wanted to remove the command with id:'${cmdId}', but no matching command found in the list. The command list has probably been purged.`);
    }
}

/** Validate that the processing 'state' is OK */
const validateProcessing = (cmd, step = "") => {
    if (cmd_lock) {
        // Currently doing a cmd_list process, so this should probably be retried
        return -1;
    }

    if (!["add", "process", "remove", "purge"].includes(step)) {
        // The step is invalid, so the associated command should be discarded
        return -3;
    }

    if (cmd_list.length > max_cmd) {
        http_handleError(cmd, 503, trx_text_item("Server not responding"));
        // Exceeded the cmd_list maximum size, this should probably be retried once other commands have been processed and removed
        return -2;
    }

    return 0;
}

/** Validate that the cmd object meets basic requirements */
const validateCommand = (cmd, step = "") => {
    const isCmdObject = typeof cmd === "object";
    if (!isCmdObject) {
        // The cmd is invalid, so this should be discarded
        return -3;
    }

    const cmdType = cmd?.type || "";
    if (!["GET", "POST"].includes(cmdType)) {
        // The cmd is invalid, so this should be discarded
        return -3;
    }

    // Make sure that any step (except for "add" and "purge") already has an id in the cmd
    if (!("id" in cmd) && ["process", "remove"].includes(step)) {
        // The cmd is invalid, so this should be discarded, although this does imply a programmer error
        return -3;
    }

    return 0;
}

/** A semaphore (sorta mutex) for working with the cmd_list */
let cmd_lock = false;

/** Process the supplied cmd through the various stages in its life cycle */
const process_cmd_list = (cmd, step = "") => {
    let validationState = validateProcessing(cmd, step);
    if (validationState < 0) {
        return validationState;
    }

    validationState = validateCommand(cmd, step);
    if (validationState < 0) {
        return validationState;
    }

    cmd_lock = true;

    if (!("id" in cmd) && step === "add") {
        // Ensure there's always an id when adding a command. Hopefully unique
        cmd.id = `T${Date.now()}R${zeroPrefixedString(getRandomIntExclusive())}`;
    }

    let doNext = false;

    switch (step) {
        case "add":
            // Add a new cmd to the list
            cmd_list.push(cmd);
            doNext = true;
            break;
        case "process":
            // Pass the supplied cmd from the list off for processing
            process_cmd(cmd);
            // Nothing more to do because the XHR callbacks take over from here
            doNext = false;
            break;
        case "remove":
            // Clean up after processing the cmd
            removeCmd(cmd.id);

            if (cmd_list.length) {
                doNext = true;
            } else {
                clearInterval(cmdInterval);
                cmdInterval = 0;
            }

            processing_cmd = false;
            break;
        case "purge":
            // Wipe the command list 
            cmd_list.length = 0;
            clearInterval(cmdInterval);
            cmdInterval = 0;
            doNext = false;
            processing_cmd = false;
            break;
    }
    cmd_lock = false;

    if (doNext) {
        // setInterval is used here to ensure that this call goes onto the event loop
        // i.e. so that it is effectively treated asynchronously
        const throttleInterval = 10;
        if (!cmdInterval) {
            cmdInterval = setInterval(() => processNextCmd(), throttleInterval);
        }
    }

    // Success
    return 1;
}

/** Wipe the command list - Nuclear option */
const clear_cmd_list = () => {
    process_cmd_list({ "id": "0" }, "purge");
}

const cleanFunc = (cmd, funcName, defFn) => {
    const hasCmd = typeof cmd === "object";
    const hasFuncName = typeof funcName === "string" && funcName;
    const hasCmdFunc = hasCmd && hasFuncName && funcName in cmd && typeof cmd[funcName] === "function";

    if (hasCmdFunc) {
        return cmd[funcName];
    }

    // Safety checks for stuff that should never happen - tell the programmer how they messed up
    if (!hasCmd) {
        console.warn("cleanFunc was called without being supplied a cmd object. This is a programmer error");
    }
    if (!hasCmdFunc) {
        console.warn(`cleanFunc was called with a cmd object that did not have a function called '${funcName}'. This is a programmer error`);
    }

    const hasDefFn = typeof defFn === "function";
    if (!hasDefFn) {
        const errMsg = `cleanFunc was called without being supplied a cmd.${funcName} function or a default function. This is a programmer error`;
        console.error(errMsg);
        throw new Error(errMsg);
    }

    return defFn;
}

/** A default function for a successful result */
function http_resultfn(response_text) {
    console.info(`Success: ${response_text}`);
}

const http_handleSuccess = (cmd, response_text) => {
    const resultfn = cleanFunc(cmd, "resultfn", http_resultfn);
    resultfn(response_text);
    process_cmd_list(cmd, "remove");
}

const authErrorFound = (error_code, response_text) => {
    if (error_code === 401) {
        logindlg();
        console.warn(`Authentication issue, please login. ${response_text}`);
        return true;
    }
    return false;
}

/** A default function for an error result */
function http_errorfn(error_code, response_text) {
    console.error(`${error_code}:${response_text}`);
}

const http_handleError = (cmd, error_code, response_text) => {
    if (authErrorFound(error_code, response_text)) {
        // For now with an auth_error, we continue with regular error handling
    } else {
        const errorfn = cleanFunc(cmd, "errorfn", http_errorfn);
        errorfn(error_code, response_text);
    }
    process_cmd_list(cmd, "remove");
}

const process_cmd = (cmd) => {
    if (processing_cmd) {
        return;
    }

    const cmdType = cmd.type;
    processing_cmd = true;

    switch (cmdType) {
        case "GET":
            ProcessHttpCommand(cmd);
            break;
        case "POST":
            // POST is only ever used for file uploading
            //console.log("Uploading");
            ProcessHttpCommand(cmd);
            break;
        default:
            // Unknown command type
            // This should never be true, but just in case we will handle it
            http_handleError(cmd, 400, trx_text_item(`Unknown command type '${cmdType}'`));
            break;
    }
}

const setCmdFn = (defFn, fn) => (typeof fn === "function") ? fn : defFn;

const buildBasicCmd = (cmd, cmd_type, result_fn, error_fn, isupload = false) => {
    return {
        cmd: cmd,
        url: new URL(`${document.location.origin}${cmd}`),
        type: cmd_type,
        isupload: isupload,
        resultfn: setCmdFn(http_resultfn, result_fn),
        errorfn: setCmdFn(http_errorfn, error_fn),
    };
}

const buildGetCmd = (cmd, cmd_code, result_fn, error_fn) => {
    const fullCmd = buildBasicCmd(cmd, "GET", result_fn, error_fn, false);

    fullCmd.cmd_code = typeof cmd_code !== "undefined" ? cmd_code : 0;

    return fullCmd;
}

const SendGetHttp = (cmd, result_fn, error_fn, cmd_code, max_cmd_code) => {
    const fullCmd = buildGetCmd(cmd, cmd_code, result_fn, error_fn)

    if (typeof cmd_code === "undefined") {
        process_cmd_list(fullCmd, "add");
        return;
    }

    /** The maximum number of times that this cmd_code can be added to the list */
    const max_of_cmd_code = (typeof max_cmd_code !== "number") ? max_cmd_code : 1;
    const count_cmd_code = cmd_list.filter((c) => c.cmd_code === cmd_code).length;

    // Some commands have a limit to how many times they are allowed in the queue
    if (count_cmd_code > max_of_cmd_code) {
        console.warn(`Limit reached for command with code:${cmd_code}`);
        return;
    }

    process_cmd_list(fullCmd, "add");
};

const buildPostFileCmd = (cmd, postdata, result_fn, error_fn) => {
    const fullCmd = buildBasicCmd(cmd, "POST", result_fn, error_fn, true);

    fullCmd.data = postdata;

    return fullCmd;
}

/** POST the file FormData */
const SendFileHttp = (cmd, postdata, result_fn, error_fn) => {
    process_cmd_list(buildPostFileCmd(cmd, postdata, result_fn, error_fn), "add");
}

/** This expects the logindlg to be visible */
const GetIdentificationStatusSuccess = (response_text) => {
    if (!response_text) {
        // treat as guest
        setHTML("current_ID", trx_text_item("guest"));
        setHTML("current_auth_level", "");
        return;
    }
    const response = JSON.parse(response_text);
    if (typeof response.authentication_lvl !== "undefined") {
        if (response.authentication_lvl === "guest") {
            setHTML("current_ID", trx_text_item("guest"));
            setHTML("current_auth_level", "");
        }
    }
}

const GetIdentificationStatus = () => {
    const cmd = httpCmd.login;
    SendGetHttp(cmd, GetIdentificationStatusSuccess);
}

const ProcessHttpCommand = (cmd) => {
    const common = new Common();
    if (common.http_communication_locked) {
        http_errorfn(503, trx_text_item("Communication locked!"));
        console.warn("locked");
        return;
    }

    const req = { method: cmd.type };
    if (req.method === "POST") {
        // Note: Only used for uploading files
        req.body = cmd.data;
    }

    common.http_communication_locked = true;
    fetch(cmd.url, req)
        .then(response => {
            common.http_communication_locked = false;
            if (response.status === 200) {
                return response.text();
            }
            if (response.status === 401) {
                GetIdentificationStatus();
            }
            throw new Error(response.status);
        })
        .then(responseText => http_handleSuccess(cmd, responseText))
        .catch(error => http_handleError(cmd, error.message, String(error)))
        .finally(() => { common.http_communication_locked = false; });
}

const CheckForHttpCommLock = () => {
    const common = new Common();
    if (common.http_communication_locked) {
        alertdlg(trx_text_item("Busy..."), trx_text_item("Communications are currently locked, please wait and retry."));
        console.warn("communication locked");
    }
    return common.http_communication_locked;
}

export { clear_cmd_list, SendFileHttp, SendGetHttp, CheckForHttpCommLock };
