// import closeModal, setactiveModal, showModal, id

/** confirm dialog */
const confirmdlg = (titledlg, textdlg, closefunc) => {
	const modal = setactiveModal("confirmdlg.html", closefunc);
	if (!modal) {
		return;
	}

	id("ConfirmDialogClose").addEventListener("click", (event) =>
		closeModal("cancel"),
	);
	id("ConfirmDialogYes").addEventListener("click", (event) =>
		closeModal("yes"),
	);
	id("ConfirmDialogNo").addEventListener("click", (event) => closeModal("no"));

	const title = modal.element.getElementsByClassName("modal-title")[0];
	const body = modal.element.getElementsByClassName("modal-text")[0];
	title.innerHTML = titledlg;
	body.innerHTML = textdlg;
	showModal();
};
