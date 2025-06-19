import {
	Common,
	conErr,
	displayBlock,
	displayInline,
	displayNone,
	id,
	initUI,
	closeModal,
	setactiveModal,
	showModal,
	httpCmdType,
	buildHttpCommandCmd,
	SendGetHttp,
	logindlg,
	EventListenerSetup,
	startSocket,
} from "./common.js";

/** Connect Dialog */
const connectdlg = (getFw = false) => {
	const modal = setactiveModal("connectdlg.html");
	if (modal == null) {
		return;
	}

	showModal();

	if (getFw) {
		retryconnect();
	}
};

/** Process the framework version data */
const getFWdata = (response) => {
	const tlist = response.split("#")
		.map((item) => item.toLowerCase().trim())
		.filter((item) => item)
		.map((item) => {
			const sublist = item.split(":").map((item) => item.trim());
			if (sublist.length === 1) {
				return {"name": sublist[0]};
			}
			const fwValue = {"name": sublist[0], "value": sublist[1]};
			if (sublist.length > 2) {
				fwValue.other = sublist.slice(2);
			}
			return fwValue;
		})
	const common = new Common();

	for (const item of tlist) {
		switch(item.name) {
			case "fw version": common.fwData.fw_version = item.value; break;
			case "fw target": common.fwData.target_firmware = item.value; break;
			case "fw hw": common.fwData.direct_sd = item.value === "direct sd"; break;
			case "primary sd": common.fwData.primary_sd = item.value === "none" ? "" : item.value; break;
			case "secondary sd": common.fwData.secondary_sd = item.value === "none" ? "" : item.value; break;
			case "authentication": common.fwData.ESP3D_authentication = item.value === "yes"; break;
			case "webcommunication": 
				common.fwData.async_webcommunication = item.value !== "async";
				common.fwData.websocket_port = item.other[0];
				if (item.other.length > 1) {
					common.fwData.websocket_ip = item.other[1];
				} else {
					console.warn("No IP for websocket, using default");
					common.fwData.websocket_ip = document.location.hostname;
				}
				break;
			case "hostname": common.fwData.esp_hostname = item.value; break;
			case "axis": common.fwData.grblaxis = Number.parseInt(item.value); break;
		}
	};

	//FW version:0.9.200 # FW target:smoothieware # FW HW:Direct SD # primary sd:/ext/ # secondary sd:/sd/ # authentication: yes
	common.fwData.result = "fw_version" in common.fwData && "target_firmware" in common.fwData && "direct_sd" in common.fwData;

	return common.fwData;
};

const connectfailed = (error_code, response) => {
	displayNone("connecting_msg");
	displayBlock(["connectbtn", "failed_connect_msg"]);

	id("connectbtn").addEventListener("click", retryconnect);

	conErr(error_code, response, "FW identification error");
};

const connectsuccess = (response) => {
	const fwData = getFWdata(response);
	console.log("FW identification:");
	console.log(fwData);
	if (fwData.success) {
		EventListenerSetup();
		startSocket();

		if (fwData.ESP3D_authentication) {
			closeModal("Connection successful");
			displayInline("menu_authentication");
			logindlg(initUI, true);
		} else {
			displayNone("menu_authentication");
			initUI();
		}
	} else {
		connectfailed(406, "Wrong data");
	}
};

const retryconnect = () => {
	displayNone(["connectbtn", "failed_connect_msg"]);
	displayBlock("connecting_msg");

	id("connectbtn").removeEventListener("click", retryconnect);

	const cmd = buildHttpCommandCmd(httpCmdType.plain, "[ESP800]");
	SendGetHttp(cmd, connectsuccess, connectfailed);
};

export { connectdlg };
