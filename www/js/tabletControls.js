const get2DContext = (id) => {
	const btnElem = document.getElementById(id)
	if (!btnElem) {
		return null;
	}
	return btnElem.getContext("2d");
}

/** Draw corner arrow buttons */
const drawCornerBtn = (btnDef) => {
	const bec = get2DContext(btnDef.id);
	if (!bec) {
		return;
	}

	bec.fillStyle = btnDef.fill;
	bec.fillRect(0, 0, 500, 500);
	bec.beginPath();
	bec.moveTo(...btnDef.path[0]);
	for (let ix = 1; ix < btnDef.path.length; ix++) {
		bec.lineTo(...btnDef.path[ix]);
	}
	// bec.moveTo(...btnDef.path[btnDef.path.length - 1]);
	bec.closePath();
	bec.lineWidth = 5;
	bec.strokeStyle = "white";
	bec.fillStyle = "white";
	bec.fill();
	bec.stroke();

	return bec;
}

const drawCornerBtns = () => {
	const btnDefs = [
		{ name: "tlC", id: "tlBtn", fill: "#b69fcb", path: [[90, 40], [90, 140], [230, 40], [90, 40]] },
		{ name: "trC", id: "trBtn", fill: "#b69fcb", path: [[90, 40], [230, 140], [230, 40], [90, 40]] },
		{ name: "blC", id: "blBtn", fill: "#b69fcb", path: [[90, 40], [230, 140], [90, 140], [90, 40]] },
		{ name: "brC", id: "brBtn", fill: "#b69fcb", path: [[90, 140], [230, 140], [230, 40], [90, 140]] },
	]
	for (const btnDef of btnDefs) {
		drawCornerBtn(btnDef);
	};
}

const drawArrowBtns = () => {
	const upC = get2DContext("upBtn");
	if (upC) {
		upC.fillStyle = "#9d88c0";
		upC.fillRect(0, 0, 500, 500);
		// #rect441
		upC.beginPath();
		upC.fillStyle = "white";
		upC.lineWidth = 1;
		upC.rect(60 + 49.21384, 99.622299, 93.976021, 74.721062);
		upC.fill();

		// #path608
		upC.beginPath();
		upC.strokeStyle = "white";
		upC.lineWidth = 1;
		upC.lineCap = "butt";
		upC.lineJoin = "miter";
		upC.moveTo(60 + 5.109692, 104.66681);
		upC.lineTo(60 + 94.67922, 4.145211);
		upC.lineTo(60 + 189.30507, 103.959);
		upC.lineTo(60 + 5.109692, 104.66681);
		upC.closePath();
		upC.stroke();
		upC.fill();
	}

	const dnC = get2DContext("dnBtn");
	if (dnC) {
		dnC.fillStyle = "#9d88c0";
		dnC.fillRect(0, 0, 500, 500);
		// #rect441
		dnC.save();
		dnC.transform(1.0, 0.0, 0.0, -1.0, 0.0, 0.0);
		dnC.fillStyle = "white";
		dnC.lineWidth = 1;
		dnC.rect(60 + 49.21384, -75.901474, 93.976021, 74.721062);
		dnC.fill();
		dnC.restore();

		// #path608
		dnC.beginPath();
		dnC.strokeStyle = "white";
		dnC.fillStyle = "white";
		dnC.lineWidth = 1;
		dnC.lineCap = "butt";
		dnC.lineJoin = "miter";
		dnC.moveTo(60 + 5, 70 - 20);
		dnC.lineTo(60 + 94, 171 - 20);
		dnC.lineTo(60 + 189, 71 - 20);
		dnC.lineTo(60 + 5, 70 - 20);
		dnC.closePath();
		dnC.stroke();
		dnC.fill();
	}

	const rC = get2DContext("rBtn");
	if (rC) {
		rC.fillStyle = "#9d88c0";
		rC.fillRect(0, 0, 500, 500);
		// #g1100
		rC.save();
		rC.transform(0.0, 1.0, -1.0, 0.0, 187.481, 0.27369);
		// #rect441
		rC.fillStyle = "white";
		rC.lineWidth = 1;
		rC.rect(-20 + 49.21384, 99.622299 - 80, 93.976021, 74.721062);
		rC.fill();

		// #path608
		rC.beginPath();
		rC.strokeStyle = "white";
		rC.lineWidth = 1;
		rC.lineCap = "butt";
		rC.lineJoin = "miter";
		rC.moveTo(-20 + 5.109692, 104.66681 - 80);
		rC.lineTo(-20 + 94.67922, 4.145213 - 80);
		rC.lineTo(-20 + 189.30507, 103.959 - 80);
		rC.closePath();
		rC.stroke();
		rC.fill();
		rC.restore();
	}

	const lC = get2DContext("lBtn");
	if (lC) {
		lC.fillStyle = "#9d88c0";
		lC.fillRect(0, 0, 500, 500);
		// #g1100
		lC.save();
		lC.transform(0.0, 1.0, 1.0, 0.0, 11.9575, 0.27369);
		// #rect441
		lC.fillStyle = "white";
		lC.lineWidth = 1;
		lC.rect(-20 + 49.21384, 99.622299, 93.976021, 74.721062);
		lC.fill();

		// #path608
		lC.beginPath();
		lC.strokeStyle = "white";
		lC.lineWidth = 1;
		lC.lineCap = "butt";
		lC.lineJoin = "miter";
		lC.moveTo(-20 + 5.109692, 104.66681);
		lC.lineTo(-20 + 94.67922, 4.145213);
		lC.lineTo(-20 + 189.30507, 103.959);
		lC.closePath();
		lC.stroke();
		lC.fill();
		lC.restore();
	}
}

const drawHomeBtn = () => {
	const hC = get2DContext("hBtn");
	if (hC) {
		const xO = 55;
		const yO = -45;

		// #path5094
		hC.beginPath();
		hC.fillStyle = "rgb(183, 161, 208)";
		hC.strokeStyle = "rgb(0, 0, 0)";
		hC.lineWidth = 0.472615;
		hC.lineCap = "butt";
		hC.lineJoin = "miter";
		hC.moveTo(xO + 55.719343, 197.54965 + yO);
		hC.lineTo(xO + 152.15065, 197.54965 + yO);
		hC.lineTo(xO + 152.60952, 74.078285 + yO);
		hC.lineTo(xO + 132.40481, 73.680279 + yO);
		hC.lineTo(xO + 131.39342, 110.31085 + yO);
		hC.lineTo(xO + 103.47573, 84.035976 + yO);
		hC.lineTo(xO + 54.341657, 131.43307 + yO);
		hC.fill();
		hC.stroke();

		// #rect1898
		hC.beginPath();
		hC.fillStyle = "rgb(218, 208, 230)";
		hC.lineWidth = 0.472615;
		hC.rect(xO + 74.087212, 146.1696 + yO, 29.84779, 50.981743);
		hC.fill();

		// #path13430
		hC.beginPath();
		hC.fillStyle = "rgb(151, 132, 181)";
		hC.strokeStyle = "rgb(0, 0, 0)";
		hC.lineWidth = 0.472615;
		hC.lineCap = "butt";
		hC.lineJoin = "miter";
		hC.moveTo(xO + 103.47573, 84.035976 + yO);
		hC.lineTo(xO + 167.30417, 144.97477 + yO);
		hC.lineTo(xO + 181.08009, 132.22934 + yO);
		hC.lineTo(xO + 103.01658, 56.951581 + yO);
		hC.lineTo(xO + 24.953156, 131.43276 + yO);
		hC.lineTo(xO + 40.565818, 144.97477 + yO);
		hC.fill();
		hC.stroke();
	}
}

//---------------------------

const drawPlaybackControlBtns = () => {
	const playC = get2DContext("playBtn");
	if (playC) {
		playC.fillStyle = "#4aa85c";
		playC.fillRect(0, 0, 500, 500);
		playC.beginPath();
		playC.strokeStyle = "white";
		playC.fillStyle = "white";
		playC.lineWidth = 1;
		playC.lineCap = "butt";
		playC.lineJoin = "miter";
		playC.moveTo(60 + 44.053484, 147.60826 - 35);
		playC.lineTo(60 + 44.053484, 68.502834 - 35);
		playC.lineTo(60 + 112.31147, 106.82861 - 35);
		playC.closePath;
		playC.fill();
		playC.stroke();
	}

	const pauseC = get2DContext("pauseBtn");
	if (pauseC) {
		pauseC.fillStyle = "#efbb33";
		pauseC.fillRect(0, 0, 500, 500);
		// #rect1967
		pauseC.beginPath();
		pauseC.fillStyle = "white";
		pauseC.lineWidth = 1;
		pauseC.rect(75 + 44, 66 - 35, 20, 81);
		pauseC.fill();
		// #rect1967-4
		pauseC.beginPath();
		pauseC.fillStyle = "white";
		pauseC.lineWidth = 1;
		pauseC.rect(75 + 75, 66 - 35, 20, 81);
		pauseC.fill();
	}

	const stopC = get2DContext("stopBtn");
	if (stopC) {
		stopC.fillStyle = "#cd654c";
		stopC.fillRect(0, 0, 500, 500);
		stopC.strokeStyle = "white";
		stopC.fillStyle = "white";
		stopC.beginPath();
		stopC.fillStyle = "white";
		stopC.lineWidth = 1;
		stopC.rect(60 + 44, 65 - 35, 100, 80);
		stopC.fill();
		stopC.stroke();
	}
}

const drawTPBtns = () => {
	drawCornerBtns();
	drawArrowBtns();
	drawHomeBtn();
	drawPlaybackControlBtns();
}

export { drawTPBtns };
