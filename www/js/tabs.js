import { elemsByClass, displayBlock, displayNone, id } from "./common.js";

const opentab = (evt, tabname, tabcontentid, tablinkid) => {
	const deactivateEvent = new Event("deactivate");
	const tabcontent = elemsByClass("tabcontent");
    for (const tab of tabcontent) {
        if (tab.parentNode.id === tabcontentid) {
            tab.dispatchEvent(deactivateEvent);
            displayNone(tab.id);
        }
    }

	const tablinks = elemsByClass("tablinks");
    for (const tablink of tablinks) {
        if (tablink.parentNode.id === tablinkid) {
            tablink.classList.remove("active");
        }
    }

    const activateEvent = new Event("activate");
    id(tabname).dispatchEvent(activateEvent);
    displayBlock(tabname);

    evt.currentTarget.classList.add("active");
};

export { opentab };
