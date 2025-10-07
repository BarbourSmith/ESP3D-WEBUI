const tablet_n_axes = 4;

const tabletClick = () => {
    if (window.navigator && window.navigator.vibrate) {
        window.navigator.vibrate(200);
    }
    beep(3, 400, 10);
}

const moveTo = (location) => {
    // Always force G90 mode because synchronization of modal reports is unreliable
    // For controllers that permit it, specifying mode and move in one block is safer
    const cmd = 'G90 G0 ' + location;
    sendCommand(cmd);
}

const MDIcmd = (value) => {
    tabletClick();
    sendCommand(value);
}

const MDI = (field) => {
    MDIcmd(id(field).value);
}

const btnMDI = (event) => {
    MDI(event.target.value)  // value refers to the adjacent text entry box
}

// Reports whether a text input box has focus - see the next comment
let isInputFocused = false;

const inputFocused = () => {
    isInputFocused = true;
}

const inputBlurred = () => {
    isInputFocused = false;
}

const setAxisByValue = (axis, coordinate) => {
    tabletClick();
    const cmd = 'G10 L20 P0 ' + axis + coordinate;
    sendCommand(cmd);
}

const zeroAxis = (axis) => {
    setAxisByValue(axis, 0);
}

const btnZeroAxis = (event) => {
    zeroAxis(event.target.value);
}

const toggleUnits = () => {
    tabletClick();
    sendCommand(modal.units == 'G21' ? 'G20' : 'G21');
    // The button label will be fixed by the response to $G
    sendCommand('$G');
}

const setDistance = (distance) => {
    tabletClick();
    id('jog-distance').value = distance;
}

const btnSetDistance = (event) => {
    setDistance(event.target.innerText);
}

const jogTo = (axisAndDistance) => {
    // Always force G90 mode because synchronization of modal reports is unreliable
    let feedrate = JogFeedrate(axisAndDistance);
    if (modal.units == "G20") {
        feedrate /= 25.4;
        feedrate = feedrate.toFixed(2);
    }

    const cmd = '$J=G91F' + feedrate + axisAndDistance + '\n';
    sendCommand(cmd);
}

const goAxisByValue = (axis, coordinate) => {
    tabletClick();
    moveTo(axis + coordinate);
}

const goto0 = (axis) => {
    goAxisByValue(axis, 0)
}

const btnOverride = (event) => { tabletClick(); sendRealtimeCmd(event.target.value); };
const btnFeedOvrCancel = (event) => { tabletClick(); sendRealtimeCmd('\x90') };
const btnSpindleOvrCancel = (event) =>  { tabletClick(); sendRealtimeCmd('\x99') };

const btnGoto0 = (event) => {
    goto0(event.target.value)
}

const setAxis = (axis, field) => {
    tabletClick();
    const coordinate = id(field).value;
    const cmd = 'G10 L20 P1 ' + axis + coordinate;
    sendCommand(cmd);
}
let timeout_id = 0;
let hold_time = 1000;

let longone = false;
const long_jog = (target) => {
    longone = true;
    let distance = 1000;
    const axisAndDirection = target.value
    let feedrate = JogFeedrate(axisAndDirection);
    if (modal.units == "G20") {
        distance /= 25.4;
        distance = distance.toFixed(3);
        feedrate /= 25.4;
        feedrate = feedrate.toFixed(2);
    }
    const cmd = '$J=G91F' + feedrate + axisAndDirection + distance + '\n';
    // tabletShowMessage("Long Jog " + cmd);
    sendCommand(cmd);
}

const sendMove = (cmd) => {
    tabletClick();
    const jog = (params) => {
        params = params || {};
        let s = '';
        for (const key in params) {
            s += key + params[key];
        }
        jogTo(s);
    };
    const move = (params) => {
        params = params || {};
        let s = '';
        for (const key in params) {
            s += key + params[key];
        }
        moveTo(s);
    };

    const distance = Number(id('jog-distance').value) || 0;

    const fn = {
        'G28': () => {
            sendCommand('G28');
        },
        'G30': () => {
            sendCommand('G30');
        },
        'X0Y0Z0': () => {
            move({ X: 0, Y: 0, Z: 0 })
        },
        'X0': () => {
            move({ X: 0 });
        },
        'Y0': () => {
            move({ Y: 0 });
        },
        'Z0': () => {
            move({ Z: 0 });
        },
        'X-Y+': () => {
            jog({ X: -distance, Y: distance });
        },
        'X+Y+': () => {
            jog({ X: distance, Y: distance });
        },
        'X-Y-': () => {
            jog({ X: -distance, Y: -distance });
        },
        'X+Y-': () => {
            jog({ X: distance, Y: -distance });
        },
        'X-': () => {
            jog({ X: -distance });
        },
        'X+': () => {
            jog({ X: distance });
        },
        'Y-': () => {
            jog({ Y: -distance });
        },
        'Y+': () => {
            jog({ Y: distance });
        },
        'Z-': () => {
            jog({ Z: -distance });
        },
        'Z+': () => {
            jog({ Z: distance });
        }
    }[cmd];

    fn && fn();
};

const getDollarResult = (result) => {
    [name, value] = result.split('=');
    if (!value) {
        return;
    }
    switch (name) {
    case '$/axes/x/max_travel_mm':
        displayer.setXTravel(parseFloat(value));
        return;
    case '$/axes/y/max_travel_mm':
        displayer.setYTravel(parseFloat(value));
        return;
    case '$/axes/x/homing/mpos_mm':
        displayer.setXHome(parseFloat(value));
        return;
    case '$/axes/y/homing/mpos_mm':
        displayer.setYHome(parseFloat(value));
        return;
    case '$/axes/x/homing/positive_direction':
        displayer.setXDir(value);
        return;
    case '$/axes/y/homing/positive_direction':
        displayer.setYDir(value);
        return;
    }
}

const tabletScrollMessage = (msg) => {
    const messages = id('messages');
    messages.innerHTML += "<br>" + msg;
    messages.scrollTop = messages.scrollHeight;
}

const tabletShowMessage = (msg) => {
    if (msg.startsWith('ok')) {
        // success
        return;
    }
    if (msg == '' || msg.startsWith('<') || msg.startsWith('\n') || msg.startsWith('\r')) {
        return;
    }
    if (msg.startsWith('error:')) {
        msg = '<span style="color:red;">' + msg + '</span>';
    }
    tabletScrollMessage(msg);
    if (msg.startsWith('$')) {
        getDollarResult(msg);
    }
}

const tabletShowResponse = (response) => {
    const messages = id('messages');
    messages.value = response;
}

const setJogSelector = (units) => {
    let buttonDistances = [];
    let menuDistances = [];
    let selected = 0;
    if (units == 'G20') {
        // Inches
        buttonDistances = [0.001, 0.01, 0.1, 1, 0.003, 0.03, 0.3, 3, 0.005, 0.05, 0.5, 5];
        menuDistances = [0.00025, 0.0005, 0.001, 0.003, 0.005, 0.01, 0.03, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10, 30];
        selected = '1';
    } else {
        // millimeters
        buttonDistances = [0.1, 1, 10, 100, 0.3, 3, 30, 300, 0.5, 5, 50, 500];
        menuDistances = [0.005, 0.01, 0.03, 0.05, 0.1, 0.3, 0.5, 1, 3, 5, 10, 30, 50, 100, 300, 500, 1000];
        selected = '10';
    }
    const buttonNames = ['jog00', 'jog01', 'jog02', 'jog03', 'jog10', 'jog11', 'jog12', 'jog13', 'jog20', 'jog21', 'jog22', 'jog23'];
    buttonNames.forEach((n, i) => { id(n).innerHTML = buttonDistances[i]; });

    const selector = id('jog-distance');
    selector.length = 0;
    selector.innerText = null;
    menuDistances.forEach((v) => {
        const option = document.createElement("option");
        option.textContent = v;
        option.selected = (v == selected);
        selector.appendChild(option);
    });
};

const removeJogDistance = (option, oldIndex) => {
    const selector = id('jog-distance');
    selector.removeChild(option);
    selector.selectedIndex = oldIndex;
};

const addJogDistance = (distance) => {
    const selector = id('jog-distance');
    const option = document.createElement("option");
    option.textContent = distance;
    option.selected = true;
    return selector.appendChild(option);
};

const setButton = (name, isEnabled, color, text) => {
    const button = id(name);
    button.disabled = !isEnabled;
    button.style.backgroundColor = color;
    button.innerText = text;
};

let leftButtonHandler;
const setLeftButton = (isEnabled, color, text, click) => {
    setButton('btn-start', isEnabled, color, text);
    leftButtonHandler = click;
};

const doLeftButton = (event) => {
    if (leftButtonHandler) {
        leftButtonHandler();
    }
};

let rightButtonHandler;
const setRightButton = (isEnabled, color, text, click) => {
    setButton('btn-pause', isEnabled, color, text);
    rightButtonHandler = click;
};

const doRightButton = (event) => {
    if (rightButtonHandler) {
        rightButtonHandler();
    }
};

const green = '#86f686';
const red = '#f64646';
const gray = '#f6f6f6';
const yellow = '#ffffa8';

let gCodeLoaded = false;
const setRunControls = () => {
    if (gCodeLoaded) {
        // A GCode file is ready to go
        setLeftButton(true, green, 'Start', runGCode);
        setRightButton(false, gray, 'Pause', null);
    } else {
        // Can't start because no GCode to run
        setLeftButton(false, gray, 'Start', null);
        setRightButton(false, gray, 'Pause', null);
    }
};

let startTime = 0;

let spindleDirection = '';
let spindleSpeed = '';

const stopAndRecover = () => {
    stopGCode();
    // To stop GRBL you send a reset character, which causes some modes
    // be reset to their default values.  In particular, it sets G21 mode,
    // which affects the coordinate display and the jog distances.
    requestModes();
};

const unlock = () => {
    sendCommand('$X');
}

let runTime = 0;
const updateModal = () => {
    const newUnits = modal.units == 'G21' ? 'mm' : 'Inch';
    if (getText('units') != newUnits) {
        setText('units', newUnits);
        setJogSelector(modal.units);
    }
    setHTML('gcode-states', modal.modes || "GCode State");
    setText('wpos-label', modal.wcs);
    const distanceText = modal.distance == 'G90'
        ? modal.distance
        : "<div style='color:red'>" + modal.distance + "</div>";
    setHTML('distance', distanceText);

    const modeText = modal.distance + " " +
        modal.wcs + " " +
        modal.units + " " +
        "T" + modal.tool + " " +
        "F" + modal.feedrate + " " +
        "S" + modal.spindle + " ";

    setHTML('gcode-states', modal.modes || "GCode State");
}

let grblReportingUnits = 0;  // Should be set from $10
let oldCannotClick = null;
let gCodeDisplayable = false;

const tabletGrblState = (grbl) => {
    updateModal();
    const stateName = grbl.stateName;

    // Unit conversion factor - depends on both $13 setting and parser units
    let factor = 1.0;

    //  spindleSpeed = grbl.spindleSpeed;
    //  spindleDirection = grbl.spindle;
    //
    //  feedOverride = OVR.feed/100.0;
    //  rapidOverride = OVR.rapid/100.0;
    //  spindleOverride = OVR.spindle/100.0;

    const mmPerInch = 25.4;
    switch (modal.units) {
        case 'G20':
            factor = grblReportingUnits === 0 ? 1 / mmPerInch : 1.0;
            break;
        case 'G21':
            factor = grblReportingUnits === 0 ? 1.0 : mmPerInch;
            break;
    }

    const cannotClick = stateName == 'Run' || stateName == 'Hold';
    // Recompute the layout only when the state changes
    if (oldCannotClick != cannotClick) {
        selectDisabled('.jog-controls .form-control', cannotClick);
        selectDisabled('.jog-controls .btn', cannotClick);
        selectDisabled('.dropdown-toggle', cannotClick);
        selectDisabled('.axis-position .position', cannotClick);
        selectDisabled('.axis-position .form-control', cannotClick);
        selectDisabled('.axis-position .btn', cannotClick);
        selectDisabled('.axis-position .position', cannotClick);
        if (cannotClick) {
            expandVisualizer();
        } else {
            contractVisualizer();
        }
    }
    oldCannotClick = cannotClick;

    updateModal();

    switch (stateName) {
        case 'Sleep':
            setLeftButton(false, gray, 'Unlock', null);
            setRightButton(true, red, 'Reset', stopAndRecover);
            break;
        case 'Alarm':
            setLeftButton(true, yellow, 'Unlock', unlock);
            setRightButton(true, red, 'Reset', stopAndRecover);
            break;
        case 'Idle':
            setRunControls();
            break;
        case 'Door1':
            setLeftButton(ffalse, gray, 'Resume', resumeGCode);
            setRightButton(true, red, 'Stop', stopAndRecover);
            break;
        case 'Door0':
        case 'Hold':
            setLeftButton(true, green, 'Resume', resumeGCode);
            setRightButton(true, red, 'Stop', stopAndRecover);
            break;
        case 'Jog':
        case 'Home':
        case 'Run':
            setLeftButton(false, gray, 'Start', null);
            setRightButton(true, red, 'Pause', pauseGCode);
            break;
        case 'Check':
            setLeftButton(true, gray, 'Start', null);
            setRightButton(true, red, 'Stop', stopAndRecover);
            break;
    }

    if (grbl.spindleDirection) {
        switch (grbl.spindleDirection) {
            case 'M3': spindleDirection = 'CW'; break;
            case 'M4': spindleDirection = 'CCW'; break;
            case 'M5': spindleDirection = 'Off'; break;
        }
    }
    setText('spindle-direction', spindleDirection);

    spindleSpeed = grbl.spindleSpeed ? Number(grbl.spindleSpeed) : '';

    const now = new Date();
    setText('time-of-day', now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0'));
    if (stateName == 'Run') {
        let elapsed = now.getTime() - startTime;
        if (elapsed < 0)
            elapsed = 0;
        let seconds = Math.floor(elapsed / 1000);
        const minutes = Math.floor(seconds / 60);
        seconds = seconds % 60;
        if (seconds < 10)
            seconds = '0' + seconds;
        runTime = minutes + ':' + seconds;
    } else {
        startTime = now.getTime();
    }

    setText('runtime', runTime);

    let stateText = "";
    if (stateName == 'Run') {
        const rateNumber = modal.units == 'G21'
            ? Number(grbl.feedrate).toFixed(0)
            : Number(grbl.feedrate / 25.4).toFixed(2);

        const rateText = rateNumber +
            (modal.units == 'G21' ? ' mm/min' : ' in/min');

        setText('feed', rateNumber);
        setText('spindle-speed', spindleSpeed);
        if (OVRchanged) {
            OVRchanged = false;
            setText('feed-ovr', OVR.feed + '%');
            setText('spindle-ovr', OVR.spindle + '%');
        }

        stateText = rateText + " " + spindleSpeed + " " + spindleDirection;
    } else {
        // const stateText = errorText == 'Error' ? "Error: " + errorMessage : stateName;
        stateText = stateName;
    }
    setText('active-state', stateText);

    if (grbl.lineNumber && (stateName == 'Run' || stateName == 'Hold' || stateName == 'Stop')) {
        setText('line', grbl.lineNumber);
        if (gCodeDisplayable) {
            scrollToLine(grbl.lineNumber);
        }
    }
    if (gCodeDisplayable) {
        displayer.reDrawTool(modal, arrayToXYZ(WPOS));
    }

    const digits = modal.units == 'G20' ? 4 : 2;

    if (WPOS) {
        WPOS.forEach( (pos, index) => {
            if (index < tablet_n_axes) {
                setTextContent('wpos-' + axisNames[index], Number(pos * factor).toFixed(index > 2 ? 2 : digits));
            }
        });
    }

    MPOS.forEach( (pos, index) => {
        if (index < tablet_n_axes) {
            setTextContent('mpos-' + axisNames[index], Number(pos * factor).toFixed(index > 2 ? 2 : digits));
        }
    });
}

const addOption = (selector, name, value, isDisabled, isSelected) => {
    const opt = document.createElement('option');
    opt.appendChild(document.createTextNode(name));
    opt.disabled = isDisabled;
    opt.selected = isSelected;
    opt.value = value;
    selector.appendChild(opt);
}

const toggleVisualizer = (event) => {
    if (id('mdifiles').hidden) {
        contractVisualizer();
    } else {
        expandVisualizer();
    }
}

const contractVisualizer = () => {
    id('mdifiles').hidden = false;
    id('setAxis').hidden = false;
    id('jog-controls').hidden = false;
    id('ovr-controls').hidden = true;
    setBottomHeight();
}

const expandVisualizer = () => {
    id('mdifiles').hidden = true;
    id('setAxis').hidden = true;
    id('jog-controls').hidden = true;
    id('ovr-controls').hidden = false;
    setBottomHeight();
}

let gCodeFilename = '';

const clearTabletFileSelector = (message) => {
    const selector = id('filelist');
    selector.length = 0;
    selector.selectedIndex = 0;
    if (message) {
        addOption(selector, message, -3, true, true);
    }
}

const populateTabletFileSelector = (files, path, status) => {
    const selector = id('filelist');

    const selectedFile = gCodeFilename.split('/').slice(-1)[0];

    if (!files) {
        clearTabletFileSelector();
        addOption(selector, status, -3, true, selectedFile == '');
        return;
    }

    // Normalize path
    if(!path.startsWith('/')) {
        path = '/' + path;
    }
    if(!path.endsWith('/')) {
        path += '/';
    }

    files_currentPath = path;

    clearTabletFileSelector();

    // Filter out files that are not directories or gcode files
    files = filterFiles(files);
    files_file_list = files;

    const inRoot = path === '/';
    if (!files.length) {
        addOption(selector, "No files found in /SD" + path, -3, true, selectedFile == '');

        // Handle no valid files in folder
        if (!inRoot) {
            addOption(selector, '..', -1, false, false);
        }
        return;
    }
    
    const legend = 'Load GCode File from /SD' + path;
    addOption(selector, legend, -2, true, true);  // A different one might be selected later

    if (!inRoot) {
        addOption(selector, '..', -1, false, false);
    }
    let gCodeFileFound = false;
    files.forEach((file, index) => {
        if (file.size == -1) { // Directory
            addOption(selector, file.name + "/", index, false, false);
        } else {
            const found = file.name == selectedFile;
            if (found) {
                gCodeFileFound = true;
            }
            addOption(selector, file.name, index, false, found);
        }
    });
    if (!gCodeFileFound) {
        gCodeFilename = '';
        gCodeDisplayable = false;
        setHTML('filename', '');
        showGCode('');
    }
}

const arrayToXYZ = (a) => {
    return {
        x: a[0],
        y: a[1],
        z: a[2]
    }
}

const showGCode = (gcode) => {
    gCodeLoaded = gcode != '';
    if (!gCodeLoaded) {
        id('gcode').value = "(No GCode loaded)";
        displayer.clear();
    } else {
        id('gcode').value = gcode;
        const initialPosition = {
            x: WPOS[0],
            y: WPOS[1],
            z: WPOS[2]
        };

        if (gCodeDisplayable) {
            displayer.showToolpath(gcode, modal, arrayToXYZ(WPOS));
        }
    }

    // XXX this needs to take into account error states
    setRunControls();
}

let machineBboxAsked = false;

const askMachineBbox = () => {
    if (machineBboxAsked) {
        return;
    }
    askAxis("$/axes/x/homing/mpos_mm");
    askAxis("$/axes/x/homing/positive_direction");
    askAxis("$/axes/x/max_travel_mm");

    askAxis("$/axes/y/homing/mpos_mm");
    askAxis("$/axes/y/homing/positive_direction");
    askAxis("$/axes/y/max_travel_mm");

    machineBboxAsked = true;
}

const nthLineEnd = (str, n) => {
    if (n <= 0)
        return 0;
    const L = str.length;
    let i = -1;
    while (n-- && i++ < L) {
        i = str.indexOf("\n", i);
        if (i < 0) break;
    }
    return i;
}

const scrollToLine = (lineNumber) => {
    const gCodeLines = id('gcode');
    const lineHeight = parseFloat(getComputedStyle(gCodeLines).getPropertyValue('line-height'));
    const gCodeText = gCodeLines.value;

    gCodeLines.scrollTop = (lineNumber) * lineHeight;

    let start;
    let end;
    if (lineNumber <= 0) {
        start = 0;
        end = 1;
    } else {
        start = (lineNumber == 1) ? 0 : start = nthLineEnd(gCodeText, lineNumber) + 1;
        end = gCodeText.indexOf("\n", start);
    }

    gCodeLines.select();
    gCodeLines.setSelectionRange(start, end);
};

const runGCode = () => {
    gCodeFilename && sendCommand('$sd/run=' + gCodeFilename);
};

const tabletSelectGCodeFile = (filename) => {
    const selector = id('filelist');
    const options = Array.from(selector.options);
    const option = options.find(item => item.text == filename);
    option.selected = true;
};

const tabletLoadGCodeFile = (path, size) => {
    gCodeFilename = path;
    if ((isNaN(size) && (size.endsWith("MB") || size.endsWith("GB"))) || size > 1000000) {
        setHTML('filename', gCodeFilename + " (too large to show)");
        showGCode("GCode file too large to display (> 1MB)");
        gCodeDisplayable = false;
        displayer.clear();
    } else {
        gCodeDisplayable = true;
        setHTML('filename', gCodeFilename);
        files_downloadFile(gCodeFilename)
    }
};

const selectFile = (event) => {
    tabletClick();
    const filelist = id('filelist');
    const index = Number(filelist.options[filelist.selectedIndex].value);
    if (index === -3) {
        // No files
        return;
    }
    if (index === -2) {
        // Blank entry selected
        return;
    }
    if (index === -1) {
        // Go up
        gCodeFilename = '';
        files_go_levelup();
        return;
    }
    const file = files_file_list[index];
    const filename = file.name;
    if (file.isdir) { // Directory
        gCodeFilename = '';
        files_enter_dir(filename);
    } else {
        tabletLoadGCodeFile(files_currentPath + filename, file.size);
    }
};

const hideMenu = () => { toggleDropdown(); }
const menuReset = () => { stopAndRecover(); hideMenu(); }
const menuUnlock = () => { sendCommand('$X'); hideMenu(); }
const menuHomeAll = () => { sendCommand('$H'); hideMenu(); }
const menuHomeA = () => { sendCommand('$HA'); hideMenu(); }
const menuSpindleOff = () => { sendCommand('M5'); hideMenu(); }
const menuFullscreen = () => { toggleFullscreen(); hideMenu(); }

const requestModes = () => { sendCommand('$G'); }

const cycleDistance = (up) => {
    const sel = id('jog-distance');
    const newIndex = sel.selectedIndex + (up ? 1 : -1);
    if (newIndex >= 0 && newIndex < sel.length) {
        tabletClick();
        sel.selectedIndex = newIndex;
    }
};

const downEvent = new PointerEvent('pointerdown');
const upEvent = new PointerEvent('pointerup');
const jogClick = (name) => {
    const button = id(name);
    button.dispatchEvent(downEvent);
    button.dispatchEvent(upEvent);
}
const clickon = (name) => {
    const button = id(name);
    button.click();
}

let ctrlDown = false;
let oldIndex = null;;
let newChild = null;

const shiftUp = () => {
    if (!newChild) {
        return;
    }
    removeJogDistance(newChild, oldIndex);
    newChild = null;
}
const altUp = () => {
    if (!newChild) {
        return;
    }
    removeJogDistance(newChild, oldIndex);
    newChild = null;
}

const shiftDown = () => {
    if (newChild) {
        return;
    }
    const sel = id('jog-distance');
    const distance = sel.value;
    oldIndex = sel.selectedIndex;
    newChild = addJogDistance(distance * 10);
}
const altDown = () => {
    if (newChild) {
        return;
    }
    const sel = id('jog-distance');
    const distance = sel.value;
    oldIndex = sel.selectedIndex;
    newChild = addJogDistance(distance / 10);
}

const tabletIsActive = () => {
    return id('tablettab').style.display !== 'none';
}
const handleKeyDown = (event) => {
    // When we are in a modal input field like the MDI text boxes
    // or the numeric entry boxes, disable keyboard jogging so those
    // keys can be used for text editing.
    if (!tabletIsActive()) {
        return;
    }
    if (isInputFocused) {
        return;
    }
    switch (event.key) {
        case "ArrowRight":
            jogClick('jog-x-plus');
            event.preventDefault();
            break;
        case "ArrowLeft":
            jogClick('jog-x-minus');
            event.preventDefault();
            break;
        case "ArrowUp":
            jogClick('jog-y-plus');
            event.preventDefault();
            break;
        case "ArrowDown":
            jogClick('jog-y-minus');
            event.preventDefault();
            break;
        case "PageUp":
            jogClick('jog-z-plus');
            event.preventDefault();
            break;
        case "PageDown":
            jogClick('jog-z-minus');
            event.preventDefault();
            break;
        case "Escape":
        case "Pause":
            clickon('btn-pause');
            break;
        case "Shift":
            shiftDown();
            break;
        case "Control":
            ctrlDown = true;
            break;
        case "Alt":
            altDown();
            break;
        case "=": // = is unshifted + on US keyboards
        case "+":
            cycleDistance(true);
            event.preventDefault();
            break;
        case '-':
            cycleDistance(false);
            event.preventDefault();
            break;
        case 'keydown':
        case 'keyup':
            break;
        default:
            // console.log(event);
            break;
    }
}
const handleKeyUp = (event) => {
    if (!tabletIsActive()) {
        return;
    }
    if (isInputFocused) {
        return;
    }
    switch (event.key) {
        case "Shift":
            shiftUp();
            break;
        case "Control":
            ctrlDown = false;
            break;
        case "Alt":
            altUp();
            break;
    }
}

const mdiEnterKey = (event) => {
    if (event.key === 'Enter') {
        MDIcmd(event.target.value);
        event.target.blur();
    }
}

// setMessageHeight(), with these helper functions, adjusts the size of the message
// window to fill the height of the screen.  It would be nice if we could do that
// solely with CSS, but I did not find a way to do that.  Everything I tried either
// a) required setting a fixed message window height, or
// b) the message window would extend past the screen bottom when messages were added
const height = (element) => {
    return element.getBoundingClientRect().height;
}
const heightId = (eid) => {
    return height(id(eid));
}
const controlHeight = () => {
    return heightId('nav-panel') + heightId('axis-position') + heightId('setAxis') + heightId('control-pad') + heightId('mdifiles');
}
const setBottomHeight = () => {
    if (!tabletIsActive()) {
        return;
    }
    const residue = bodyHeight() - navbarHeight() - controlHeight();

    const tStyle = getComputedStyle(id('tablettab'))
    const tPad = parseFloat(tStyle.paddingTop) + parseFloat(tStyle.paddingBottom);
    const msgElement = id('status');
    msgElement.style.height = (residue - tPad - 10) + 'px';
}

const handleDown = (event) => {
    const target = event.target;
    if (target.classList.contains('jog')) {
        timeout_id = setTimeout(long_jog, hold_time, target);
    }
}
const handleUp = (event) => {
    clearTimeout(timeout_id);
    const target = event.target;
    if (target.classList.contains('jog')) {
        if (longone) {
            longone = false;
            sendRealtimeCmd('\x85');
        } else {
            sendMove(target.value);
        }
    }
}
const handleOut = (event) => {
    clearTimeout(timeout_id);
    const target = event.target;
    if (target.classList.contains('jog')) {
        if (longone) {
            longone = false;
            sendRealtimeCmd('\x85');
        }
    }
}

const addListeners = () => {
    addInterfaceListeners();

    // We use up/down/out events so long presses will do continuous jogging
    // Click events are unnecessary (they are equivalent to up+down with a
    // short interval) and harmful because they can cause double-triggering
    // of a jog action due to interaction with click and pointerup.
    const joggers = id('jog-controls');
    for (j of document.getElementsByClassName('jog')) {
        j.addEventListener('pointerdown', handleDown);
        j.addEventListener('pointerup', handleUp);
        j.addEventListener('pointerout', handleOut);
    }

    id('mditext0').addEventListener('keyup', mdiEnterKey);
    id('mditext1').addEventListener('keyup', mdiEnterKey);

    numpad.init();
    for (let i = 0; i < tablet_n_axes; i++) {
        const axis = axisNames[i]
        numpad.attach({target: `wpos-${axis}`, axis: axis})
    }

    // The listener could be added to the tablettab element by setting tablettabs
    // contentEditable property.  The problem is that it is too easy for tablettab
    // to lose focus, in which case it does not receive keys.  The solution is to
    // delegate the event to window and then have the handler check to see if the
    // tablet is active.

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.onresize = setBottomHeight;
};
