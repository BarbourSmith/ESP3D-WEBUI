import { elemsByClass } from "./common.js";

const clear_drop_menu = (event) => {
	const item = get_parent_by_class(event.target, "dropdownselect");
	const ignore_id = item?.id || "-1";
	for (const item of elemsByClass("dropmenu-content")) {
		const item2 = get_parent_by_class(item, "dropdownselect");
		if (item2?.id !== ignore_id) {
			item.classList.remove("show");
		}
	};
}

/** Traverse back through the current item's parent until you get to the item with the desired classname */
function get_parent_by_class(item, classname) {
	if (!item) {
		return null;
	}
	if (item.classList.contains(classname)) {
		return item;
	}
	return get_parent_by_class(item.parentElement, classname);
}

export { clear_drop_menu };
