import { id } from "./common.js";

/** Set the display style of the element (or elements) identified by name(s) to the supplied value */
const setDisplay = (name, val) => {
  if (!name) {
    return;
  }
  const names = Array.isArray(name) ? name : [name];
  const elems = names.map((name) => id(name)).filter((elem) => elem);
  for (const elem of elems) {
    elem.style.display = val;
  };
}

/** Set the display style of the element (or elements) identified by name(s) to 'none' */
const displayNone = (name) => setDisplay(name, 'none');

/** Set the display style of the element (or elements) identified by name(s) to 'block' */
const displayBlock = (name) => setDisplay(name, 'block');

const displayFlex = (name) => setDisplay(name, 'flex');
const displayTable = (name) => setDisplay(name, 'table-row');
const displayInline = (name) => setDisplay(name, 'inline');
const displayInitial = (name) => setDisplay(name, 'initial');
/** Clear the display attribute */
const displayUndoNone = (name) => setDisplay(name, '');


export { displayBlock, displayFlex, displayTable, displayInitial, displayInline, displayNone, displayUndoNone };
