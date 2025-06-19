import { id } from "./common.js";

/** A list of currently opened modals */
const listmodal = [];

const setactiveModal = (html_template_name, closefunc) => {
    const mdlTemplate = id(html_template_name);
    if (!mdlTemplate) {
        console.error(`Error: no template named '${html_template_name}'`);
        return null;
    }

    const clFn = (closefunc instanceof Function) ? closefunc : (response) => {/* Do Nothing*/};
    const modal = {
        element: mdlTemplate,
        id: listmodal.length,
        name: html_template_name,
        closefn: clFn
    }
    listmodal.push(modal);

    return listmodal[listmodal.length - 1];
}

/** The currently active modal, or `null` if there are no currently active modals */
const getactiveModal = () => (listmodal.length > 0) ? listmodal[listmodal.length - 1] : null;

/** Show the modal dialog */
const showModal = () => {
    const currentmodal = getactiveModal();
    if (!currentmodal) {
        return;
    }
    currentmodal.element.style.display = "block";
}

/** Close the modal dialog - normally triggered when the user clicks on <X> */
const closeModal = (response) => {
    const currentmodal = listmodal.pop();
    if (!currentmodal) {
        // the list of modals is empty
        return;
    }

    currentmodal.element.style.display = "none";
    currentmodal.closefn(response);
}

export { listmodal, closeModal, getactiveModal, setactiveModal, showModal };
