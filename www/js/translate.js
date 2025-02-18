import { translate_text_item, getPrefValue, HTMLDecode } from "./common.js";

/** Call translate_text_item, already knowing what the selected language is */
const trx_text_item = (item_text, withtag = false) => {
	const selLang = getPrefValue("language_list");
	return translate_text_item(item_text, selLang, withtag);
}

/** Set up text translation to the selected language */
const translate_text = (lang = "") => {
	let translated_content = "";
	const selLang = lang ? lang : getPrefValue("language_list");

	const All = document.getElementsByTagName("*");
	for (let i = 0; i < All.length; i++) {
		if (All[i].hasAttribute("translate")) {
			let content = "";
			if (!All[i].hasAttribute("english_content")) {
				content = All[i].innerHTML;
				content.trim();
				All[i].setAttribute("english_content", content);
			}
			content = All[i].getAttribute("english_content");
			translated_content = translate_text_item(content, selLang);

			All[i].innerHTML = translated_content;
		}
		//add support for placeholder attribute
		if (All[i].hasAttribute('translateph') && All[i].hasAttribute('placeholder')) {
			let content = "";
			if (!All[i].hasAttribute("english_content")) {
				content = All[i].getAttribute("placeholder");
				content.trim();
				All[i].setAttribute("english_content", content);
			}
			content = All[i].getAttribute("english_content");

			translated_content = HTMLDecode(translate_text_item(content, selLang));
			All[i].setAttribute("placeholder", translated_content);
		}
	}
};

export { translate_text, trx_text_item };
