import {closeModal, setactiveModal, showModal, id, setHTML, get_icon_svg} from "./common.js";

const confirmDlgCancel = () => closeModal("cancel");
const confirmDlgYes = () => closeModal("yes");
const confirmDlgNo = () => closeModal("no");

/** confirm dialog */
const confirmdlg = (titledlg, textdlg, closefunc) => {
	const modal = setactiveModal("confirmdlg.html", closefunc);
	if (!modal) {
		return;
	}

	id("ConfirmDialogClose").addEventListener("click", confirmDlgCancel);
	id("ConfirmDialogYes").addEventListener("click", confirmDlgYes);
	id("ConfirmDialogNo").addEventListener("click", confirmDlgNo);

	// Note that this has the span with the modal-text class
	setHTML("confirmQuestion", `${get_icon_svg("question-sign", {h:'24px', w:'26px', t:'translate(50,1200) scale(1, -1)', color:'#337ab7'})}&nbsp;&nbsp;<span class="modal-text"></span>`);

	const title = modal.element.getElementsByClassName("modal-title")[0];
	const body = modal.element.getElementsByClassName("modal-text")[0];
	title.innerHTML = titledlg;
	body.innerHTML = textdlg;

	showModal();
};

export { confirmdlg };