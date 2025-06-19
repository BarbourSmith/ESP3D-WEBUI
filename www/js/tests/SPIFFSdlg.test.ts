import { beforeEach, describe, expect, test } from "bun:test";
import {
	maslowMsgHandling,
	loadedValues,
	setValue,
	setHTML,
	trx_text_item,
	displayNone,
} from "../common.js";

describe("SPIFFSdlg", () => {
	beforeEach(() => {
		// Set up the DOM elements and initial values
		document.body.innerHTML = `
              <input id="gridSize" value="" />
              <input id="gridWidth" value="" />
              <input id="gridHeight" value="" />
              <input id="retractionForce" value="" />
              <input id="machineOrientation" value="" />
          `;
		global.initialGuess = {
			tr: { x: 0, y: 0, z: 0 },
			tl: { x: 0, y: 0, z: 0 },
			br: { x: 0, y: 0, z: 0 },
			bl: { x: 0, y: 0, z: 0 },
		};
		global.acceptableCalibrationThreshold = 0.5;
	});

	const testResponse = [
		'{"files":[',
		'{"name":"config.html.gz","size":"4.76 KB"},',
		'{"name":"index.html.gz","size":"21.44 KB"},',
		'{"name":"favicon.ico","size":"1.12 KB"},',
		'{"name":"config.htm","size":"19.65 KB"},',
		'{"name":"config2.htm","size":"19.98 KB"},',
		'{"name":"Testname","size":"-1"},',
		'{"name":"index2.html.gz","size":"28.89 KB"}',
		'],"path":"/","status":"Ok","total":"2.81 MB","used":"118.88 KB","occupation":"4"}',
	];

	function SPIFFSSendCommand(action, filename) {
		//removeIf(production)
		SPIFFSsuccess(testResponse.join(""));
		return;
		//endRemoveIf(production)
		// const common = new Common();
		// const url = `/files?action=${action}&filename=${encodeURI(filename)}&path=${encodeURI(common.SPIFFS_currentpath)}`;
		// id("SPIFFS_loader").style.visibility = "visible";
		// console.log(url);
		// SendGetHttp(url, SPIFFSsuccess, SPIFFSfailed);
	}

	function refreshSPIFFS() {
		setValue("SPIFFS-select", "");
		setHTML("uploadSPIFFSmsg", "");
		setHTML("SPIFFS_file_name", trx_text_item("No file chosen"));
		displayNone("SPIFFS_uploadbtn");
		displayNone("refreshSPIFFSbtn");
		displayNone("SPIFFS_select_files");
		//removeIf(production)
		SPIFFSsuccess(testResponse.join(""));
		return;
		//endRemoveIf(production)
		SPIFFSSendCommand("list", "all");
	}

	test.each(inputValidation)("Input %p results in %p", (inp, expected) => {
		const result = maslowMsgHandling(inp);
		expect(result).toBe(expected);
	});

	const stdActions = [
		["calibration_grid_size", "10", "gridSize"],
		["calibration_grid_width_mm_X", "2000", "gridWidth"],
		["calibration_grid_height_mm_Y", "1000", "gridHeight"],
		["Retract_Current_Threshold", "1500", "retractionForce"],
	];

	const noErrorResult = (key, value) => {
		const result = maslowMsgHandling(`${key}=${value}`);
		expect(result).toBe("");
	};

	test.each(stdActions)(
		"Key %p sets value %p into %p",
		(key, value, outputValueName) => {
			noErrorResult(key, value);
			expect(loadedValues(outputValueName)).toBe(value);
		},
	);

	const orientationActions = [
		["orientation", "false", "machineOrientation", "horizontal"],
		["orientation", "true", "machineOrientation", "upright"],
		["orientation", "something else", "machineOrientation", "upright"],
	];

	test.each(orientationActions)(
		"Key %p with value %p sets %p to %p",
		(key, value, outputValueName, outputValue) => {
			noErrorResult(key, value);
			expect(loadedValues(outputValueName)).toBe(outputValue);
		},
	);

	const setDim = (key, value, outDim, outValue) => {
		noErrorResult(key, value);
		if (typeof outValue === "undefined") {
			outValue = Number.parseFloat(value);
		}
		if (Array.isArray(outDim)) {
			expect(global.initialGuess[outDim[0]][outDim[1]]).toBe(outValue);
		} else {
			expect(global[outDim]).toBe(outValue);
		}
	};

	test.each(fullDimensionActions)(
		"Key %p with value %p sets %p and %p.%p as well",
		(key, value, outputValueName, outDim) => {
			setDim(key, value, outDim, undefined);
			expect(loadedValues(outputValueName)).toBe(value);
		},
	);

	const stdDimensionActions = [
		["trZ", "50", ["tr", "z"]],
		["tlX", "20", ["tl", "x"]],
		["tlY", "10", ["tl", "y"]],
		["tlZ", "40", ["tl", "z"]],
		["brX", "20", ["br", "x"]],
		["brY", "15", ["br", "y"], 0],
		["brZ", "40", ["br", "z"]],
		["blX", "16", ["bl", "x"], 0],
		["blY", "17", ["bl", "y"], 0],
		["blZ", "70", ["bl", "z"]],
		[
			"Acceptable_Calibration_Threshold",
			"1500",
			"acceptableCalibrationThreshold",
		],
	];

	test.each(stdDimensionActions)(
		"Key %p with value %p sets %p",
		(key, value, outDim, outValue = undefined) => {
			setDim(key, value, outDim, outValue);
		},
	);
});
