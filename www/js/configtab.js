import { Apply_config_override, Delete_config_override, refreshconfig, id, setHTML, get_icon_svg } from "./common.js";

/** Set up the event handlers for the config tab */
const configtab = () => {
	id("config_refresh_btn").addEventListener("click", refreshconfig);
	id("config_apply_override").addEventListener("click", Apply_config_override);
	id("config_delete_override").addEventListener("click", Delete_config_override);

	const iconOptions = { t: "translate(50,1200) scale(1,-1)" };
	setHTML("config_refresh_btn", get_icon_svg("refresh", iconOptions));
	setHTML("config_apply_override", get_icon_svg("save", iconOptions));
	setHTML("config_delete_override", `<span>${get_icon_svg("trash", iconOptions)}</span>`);
};

export { configtab };
