import { trx_text_item } from "./common.js";

// For all of the following `valueDef` is the following structure 
/*
{
    "defValue" - (optional) the default value
    "valueType" - (required) the value type, one of "int", "float", "bool", "text", "enctext", "select", "panel"
    "units" - (optinal) a very short name/description of the relevant units for the value
    "label" - (required) The correct name/title/label of the value
    "inpClass" - (optional) A boostrap class for the values presentation
    "min" - (optional) A minimum (inclusive) for the value
    "max" - (optional) A maximum (inclusive) for the value
},
*/

/** Test the supplied numeric value against any defined `min` test (inclusive),
 * success is an empty string,
 * failure is an error message */
const valueMinTest = (value, valueDef) => {
  return "min" in valueDef && value < valueDef.min
    ? `'${valueDef.label}' ${trx_text_item("must be greater than or equal to")} ${valueDef.min}`
    : "";
};

/** Test the supplied numeric value against any defined `max` test (inclusive),
 * success is an empty string,
 * failure is an error message */
const valueMaxTest = (value, valueDef) => {
  return "max" in valueDef && value > valueDef.max
    ? `'${valueDef.label}' ${trx_text_item("must be less than or equal to")} ${valueDef.max}`
    : "";
};

/** Test whether a value is an integer, and optionally within a certain range,
 * success is an empty array,
 * failure is an array of one or more error messages  */
const valueIsInt = (value, valueDef) => {
  const errorList = [];
  const vInt = Number.parseInt(value);
  if (Number.isNaN(vInt)) {
    errorList.push(`'${valueDef.label}' ${trx_text_item("must be an integer")}`);
  } else {
    errorList.push(valueMinTest(vInt, valueDef));
    errorList.push(valueMaxTest(vInt, valueDef));
  }
  return errorList.filter((err) => err);
}

/** Test whether a value is an float, and optionally within a certain range,
 * success is an empty array,
 * failure is an array of one or more error messages  */
const valueIsFloat = (value, valueDef) => {
  const errorList = [];
  const vFloat = Number.parseFloat(value);
  if (Number.isNaN(vInt)) {
    errorList.push(`'${valueDef.label}' ${trx_text_item("must be an float")}`);
  } else {
    errorList.push(valueMinTest(vFloat, valueDef));
    errorList.push(valueMaxTest(vFloat, valueDef));
  }
  return errorList.filter((err) => err);
}

/** Test whether a value is a boolean, or text that says 'true' or 'false',
 * NOTE: This does NOT specifically test if a value is truthy or falsey
 * success is an empty array,
 * failure is an array of one error messages */
const valueIsBool = (value, valueDef) => {
  return (typeof value === "boolean" || (typeof value === "string" && ["true", "false"].includes(value.toLocaleLowerCase())))
    ? []
    : `'${valueDef.label}' ${trx_text_item("must be a boolean, or 'true' or 'false'")}`;
}

/** Test whether a value is text,
 * success is an empty array,
 * failure is an array of one error messages */
const valueIsText = (value, valueDef) => {
  return (typeof value === "string")
    ? []
    : `'${valueDef.label}' ${trx_text_item("must be a string")}`;
}

/** Checks a supplied value against the supplied valueDef,
 * success is an empty array,
 * failure is an array of one or more error messages  */
const checkValue = (value, valueDef, errorList = []) => {
  switch (valueDef.valueType) {
    case "int": errorList.push(valueIsInt(value, valueDef)); break;
    case "float": errorList.push(valueIsFloat(value, valueDef)); break;
    case "panel":
    case "bool":
      // These are both boolean values
      errorList.push(valueIsBool(value, valueDef));
      break;
    case "enctext":
    case "text":
      // These are both text string
      errorList.push(valueIsText(value, valueDef));
      break;
    case "select":
      // This is effectively an enum - no specific test for this yet
      break;
    default: {
      const valueDefError = `'${valueDef.label}' ${trx_text_item("is an unknown value type")} '${valueDef.valueType}'`;
      console.error(`${valueDefError}: ${JSON.stringify(value)}`);
      errorList.push(valueDefError);
      break;
    }
  }
  return errorList.filter((err) => err);
}

/** Tests if the supplied value starts with any of the supplied testText values.
 * Notes:
 * * any whitespace will not be trimmed from either the value or the testText values
 * * a falsey or non-text value will always return `false`
 * * all falsey or non-text values in the testText array will be eliminated
 * * an empty testText array will result in `true` being returned
 */
const valueStartsWith = (value, testText) => {
  if (typeof value !== "string" || !value) {
    return false;
  }
  let tests = (typeof testText === "string") ? [testText] : testText;
  if (!Array.isArray(tests)) {
    console.error(`valueStartsWith was supplied with an unusable testText value: '${testText}'`);
    return false;
  }
  tests = tests.filter((test) => {return typeof test === "string" && test});
  if (tests.length === 0) {
    return true;
  }
  return tests.some((test) => value.startsWith(test));
}

export { checkValue, valueIsFloat, valueStartsWith };
