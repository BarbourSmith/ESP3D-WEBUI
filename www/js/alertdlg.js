import { closeModal, setactiveModal, showModal, id, setHTML, get_icon_svg } from "./common.js";

const alertDlgCancel = () => closeModal("cancel");
const alertDlgClose = () => closeModal("Ok");

/** alert dialog */
const alertdlg = (titledlg, textdlg, closefunc) => {
	const modal = setactiveModal("alertdlg.html", closefunc);
	if (modal === null) {
		return;
	}

	id("cancelAlertDlg").addEventListener("click", alertDlgCancel);
	id("closeAlertDlg").addEventListener("click", alertDlgClose);

	setHTML("alert-warning", get_icon_svg("warning-sign", {h:'24px', w:'26px', t:'translate(50,1200) scale(1, -1)', color:'red'}));

	const title = modal.element.getElementsByClassName("modal-title")[0];
	const body = modal.element.getElementsByClassName("modal-text")[0];
	title.innerHTML = titledlg;
	body.innerHTML = textdlg;

	showModal();
};

export { alertdlg };
