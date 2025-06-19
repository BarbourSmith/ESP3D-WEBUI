import {
	trx_text_item,
	conErr,
	displayBlock,
	displayNone,
	id,
	setHTML,
	closeModal,
	setactiveModal,
	showModal,
	httpCmd,
	buildHttpLoginCmd,
	SendGetHttp,
} from "./common.js";

/** login dialog */
const logindlg = (closefunc, check_first = false) => {
	const modal = setactiveModal("logindlg.html", closefunc);
	if (modal == null) {
		return;
	}

	id("login_user_text").addEventListener("keyup", login_id_OnKeyUp);
	id("login_password_text").addEventListener("keyup", login_password_OnKeyUp);
	id("login_submit_btn").addEventListener("click", SubmitLogin);

	const iconOptions = { t: "translate(50,1200) scale(1,-1)" };
	const buildTitle = (icon, label) => `${get_icon_svg(icon, iconOptions)}<span id="login_title">${trx_text_item(label)}</span>`;
	setHTML("login_title_container", buildTitle("login", "Identification requested"));

	displayNone("login_loader");
	displayBlock("login_content");

	if (check_first) {
		SendGetHttp(httpCmd.login, checkloginsuccess);
	} else {
		showModal();
	}
};

const parseResponse = (response_text, action = "") => {
	let response = {};
	try {
		response = JSON.parse(response_text);
	} catch (error) {
		console.error(`Parsing the response from the '${action}' failed. This is probably a programmer error.`);
	}
	return response;
}

function checkloginsuccess(response_text) {
	const response = parseResponse(response_text, "check for login success");
	if ("authentication_lvl" in response && typeof response.authentication_lvl !== "undefined") {
		if (response.authentication_lvl !== "guest") {
			if (typeof response.authentication_lvl !== "undefined") {
				setHTML("current_auth_level", `(${trx_text_item(response.authentication_lvl)})`);
			}
			if (typeof response.user !== "undefined") {
				setHTML("current_ID", response.user);
			}
			closeModal("cancel");
		} else showModal();
	} else {
		showModal();
	}
}

function login_id_OnKeyUp(event) {
	//console.log(event.keyCode);
	if (event.keyCode === 13) id("login_password_text").focus();
}

function login_password_OnKeyUp(event) {
	//console.log(event.keyCode);
	if (event.keyCode === 13) id("login_submit_btn").click();
}

function loginfailed(error_code, response_text) {
	const response = parseResponse(response_text, "failed login attempt");

	setHTML("login_title", trx_text_item(response.status || "Identification invalid!"));
	conErr(error_code, response_text);
	displayBlock("login_content");
	setHTML("current_ID", trx_text_item("guest"));
	displayNone(["login_loader", "logout_menu", "logout_menu_divider", "password_menu"]);
}

function loginsuccess(response_text) {
	const response = parseResponse(response_text, "login success");
	if ("authentication_lvl" in response && typeof response.authentication_lvl !== "undefined") {
		setHTML("current_auth_level", `(${trx_text_item(response.authentication_lvl)})`);
	}
	displayNone("login_loader");
	displayBlock(["logout_menu", "logout_menu_divider", "password_menu"]);
	closeModal("Connection successful");
}

function SubmitLogin() {
	const user = getValueTrimmed("login_user_text");
	const password = getValueTrimmed("login_password_text");

	setHTML("current_ID", user);
	setHTML("current_auth_level", "");
	displayNone("login_content");
	displayBlock("login_loader");

	const cmd = buildHttpLoginCmd({ USER: user, PASSWORD: password });
	SendGetHttp(cmd, loginsuccess, loginfailed);
}

function DisconnectionSuccess(response_text) {
	setHTML("current_ID", trx_text_item("guest"));
	setHTML("current_auth_level", "");
	displayNone(["logout_menu", "logout_menu_divider", "password_menu"]);
}

function DisconnectionFailed(error_code, response) {
	setHTML("current_ID", trx_text_item("guest"));
	setHTML("current_auth_level", "");
	displayNone(["logout_menu", "logout_menu_divider", "password_menu"]);
	conErr(error_code, response);
}

function DisconnectLogin(answer) {
	if (answer === "yes") {
		const cmd = buildHttpLoginCmd({ DISCONNECT: answer });
		SendGetHttp(cmd, DisconnectionSuccess, DisconnectionFailed);
	}
}

export { DisconnectLogin, logindlg };
