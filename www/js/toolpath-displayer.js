// Display the XY-plane projection of a GCode toolpath on a 2D canvas

var root = window;

const canvas = document.getElementById("small-toolpath");
const scale = window.devicePixelRatio;
const width = window.innerWidth; 
canvas.width = width * scale;
canvas.height = (width / 2) * scale;
var tp = canvas.getContext("2d", { willReadFrequently: true });
var tpRect;

tp.lineWidth = 0.1;
tp.lineCap = 'round';
tp.strokeStyle = 'black';

var cameraAngle = 0;

// Default fallback values (will be replaced by actual configuration values)
var tlX = -8.339;
var tlY = 2209;
var trX = 3505; 
var trY = 2209;
var blX = 0;
var blY = 0;
var brX = 3505;
var brY = 0;

// Function to update anchor points from configuration
function updateAnchorPointsFromConfig() {
    if (globalThis.initialGuess) {
        if (globalThis.initialGuess.tl) {
            tlX = globalThis.initialGuess.tl.x || tlX;
            tlY = globalThis.initialGuess.tl.y || tlY;
        }
        if (globalThis.initialGuess.tr) {
            trX = globalThis.initialGuess.tr.x || trX;
            trY = globalThis.initialGuess.tr.y || trY;
        }
        if (globalThis.initialGuess.bl) {
            blX = globalThis.initialGuess.bl.x || blX;
            blY = globalThis.initialGuess.bl.y || blY;
        }
        if (globalThis.initialGuess.br) {
            brX = globalThis.initialGuess.br.x || brX;
            brY = globalThis.initialGuess.br.y || brY;
        }
    }
}

//Draw buttons
const tlC = document.getElementById("tlBtn").getContext("2d");
tlC.fillStyle = "#b69fcb";
tlC.fillRect(0, 0, 500, 500);
tlC.beginPath();
tlC.moveTo(90, 40);
tlC.lineTo(90, 140);
tlC.lineTo(230, 40);
tlC.lineTo(90, 40);
tlC.closePath();
tlC.lineWidth = 5;
tlC.strokeStyle = 'white';
tlC.fillStyle = 'white';
tlC.fill();
tlC.stroke();

const trC = document.getElementById("trBtn").getContext("2d");
trC.fillStyle = "#b69fcb";
trC.fillRect(0, 0, 500, 500);
trC.beginPath();
trC.moveTo(90, 40);
trC.lineTo(230, 140);
trC.lineTo(230, 40);
trC.lineTo(90, 40);
trC.closePath();
trC.lineWidth = 5;
trC.strokeStyle = 'white';
trC.fillStyle = 'white';
trC.fill();
trC.stroke();

const blC = document.getElementById("blBtn").getContext("2d");
blC.fillStyle = "#b69fcb";
blC.fillRect(0, 0, 500, 500);
blC.beginPath();
blC.moveTo(90, 40);
blC.lineTo(230, 140);
blC.lineTo(90, 140);
blC.lineTo(90, 40);
blC.closePath();
blC.lineWidth = 5;
blC.strokeStyle = 'white';
blC.fillStyle = 'white';
blC.fill();
blC.stroke();

const brC = document.getElementById("brBtn").getContext("2d");
brC.fillStyle = "#b69fcb";
brC.fillRect(0, 0, 500, 500);
brC.beginPath();
brC.moveTo(90, 140);
brC.lineTo(230, 140);
brC.lineTo(230, 40);
brC.lineTo(90, 140);
brC.closePath();
brC.lineWidth = 5;
brC.strokeStyle = 'white';
brC.fillStyle = 'white';
brC.fill();
brC.stroke();

const upC = document.getElementById("upBtn").getContext("2d");
upC.fillStyle = "#9d88c0";
upC.fillRect(0, 0, 500, 500);
// #rect441
upC.beginPath();
upC.fillStyle = 'white';
upC.lineWidth = 1;
upC.rect(60+49.213840, 99.622299, 93.976021, 74.721062);
upC.fill();
    
// #path608
upC.beginPath();
upC.strokeStyle = 'white';
upC.lineWidth = 1;
upC.lineCap = 'butt';
upC.lineJoin = 'miter';
upC.moveTo(60+5.109692, 104.666810);
upC.lineTo(60+94.679220, 4.145211);
upC.lineTo(60+189.305070, 103.959000);
upC.lineTo(60+5.109692, 104.666810);
upC.closePath();
upC.stroke();
upC.fill();



const dnC = document.getElementById("dnBtn").getContext("2d");
dnC.fillStyle = "#9d88c0";
dnC.fillRect(0, 0, 500, 500);
// #rect441
dnC.save();
dnC.transform(1.000000, 0.000000, 0.000000, -1.000000, 0.000000, 0.000000);
dnC.fillStyle = 'white';
dnC.lineWidth = 1;
dnC.rect(60 + 49.213840, -75.901474, 93.976021, 74.721062);
dnC.fill();
dnC.restore();
    
// #path608
dnC.beginPath();
dnC.strokeStyle = 'white';
dnC.fillStyle = 'white';
dnC.lineWidth = 1;
dnC.lineCap = 'butt';
dnC.lineJoin = 'miter';
dnC.moveTo(60 + 5, 70 - 20);
dnC.lineTo(60 + 94, 171 - 20);
dnC.lineTo(60 + 189, 71 - 20);
dnC.lineTo(60 + 5, 70 - 20);
dnC.closePath();
dnC.stroke();
dnC.fill();

const rC = document.getElementById("rBtn").getContext("2d");
rC.fillStyle = "#9d88c0";
rC.fillRect(0, 0, 500, 500);
// #g1100
rC.save();
rC.transform(0.000000, 1.000000, -1.000000, 0.000000, 187.481000, 0.273690);
    
// #rect441
rC.fillStyle = 'white';
rC.lineWidth = 1;
rC.rect(-20 + 49.213840, 99.622299 - 80, 93.976021, 74.721062);
rC.fill();
    
// #path608
rC.beginPath();
rC.strokeStyle = 'white';
rC.lineWidth = 1;
rC.lineCap = 'butt';
rC.lineJoin = 'miter';
rC.moveTo(-20+5.109692, 104.666810 - 80);
rC.lineTo(-20+94.679220, 4.145213 - 80);
rC.lineTo(-20+189.305070, 103.959000 - 80);
rC.closePath();
rC.stroke();
rC.fill();
rC.restore();


const lC = document.getElementById("lBtn").getContext("2d");
lC.fillStyle = "#9d88c0";
lC.fillRect(0, 0, 500, 500);
// #g1100
lC.save();
lC.transform(0.000000, 1.000000, 1.000000, 0.000000, 11.957500, 0.273690);
    
// #rect441
lC.fillStyle = 'white';
lC.lineWidth = 1;
lC.rect(-20 + 49.213840, 99.622299, 93.976021, 74.721062);
lC.fill();
    
// #path608
lC.beginPath();
lC.strokeStyle = 'white';
lC.lineWidth = 1;
lC.lineCap = 'butt';
lC.lineJoin = 'miter';
lC.moveTo(-20 + 5.109692, 104.666810);
lC.lineTo(-20 + 94.679220, 4.145213);
lC.lineTo(-20 + 189.305070, 103.959000);
lC.closePath();
lC.stroke();
lC.fill();
lC.restore();

const hC = document.getElementById("hBtn").getContext("2d");

const xO = 55;
const yO = -45;

// #path5094
hC.beginPath();
hC.fillStyle = 'rgb(183, 161, 208)';
hC.strokeStyle = 'rgb(0, 0, 0)';
hC.lineWidth = 0.472615;
hC.lineCap = 'butt';
hC.lineJoin = 'miter';
hC.moveTo(xO + 55.719343, 197.549650 + yO);
hC.lineTo(xO + 152.150650, 197.549650 + yO);
hC.lineTo(xO + 152.609520, 74.078285 + yO);
hC.lineTo(xO + 132.404810, 73.680279 + yO);
hC.lineTo(xO + 131.393420, 110.310850 + yO);
hC.lineTo(xO + 103.475730, 84.035976 + yO);
hC.lineTo(xO + 54.341657, 131.433070 + yO);
hC.fill();
hC.stroke();
    
// #rect1898
hC.beginPath();
hC.fillStyle = 'rgb(218, 208, 230)';
hC.lineWidth = 0.472615;
hC.rect(xO + 74.087212, 146.169600 + yO, 29.847790, 50.981743);
hC.fill();
    
// #path13430
hC.beginPath();
hC.fillStyle = 'rgb(151, 132, 181)';
hC.strokeStyle = 'rgb(0, 0, 0)';
hC.lineWidth = 0.472615;
hC.lineCap = 'butt';
hC.lineJoin = 'miter';
hC.moveTo(xO + 103.475730, 84.035976 + yO);
hC.lineTo(xO + 167.304170, 144.974770 + yO);
hC.lineTo(xO + 181.080090, 132.229340 + yO);
hC.lineTo(xO + 103.016580, 56.951581 + yO);
hC.lineTo(xO + 24.953156, 131.432760 + yO);
hC.lineTo(xO + 40.565818, 144.974770 + yO);
hC.fill();
hC.stroke();

//---------------------------

const playC = document.getElementById("playBtn").getContext("2d");
playC.fillStyle = "#4aa85c";
playC.fillRect(0, 0, 500, 500);

playC.beginPath();
playC.strokeStyle = 'white';
playC.fillStyle = 'white';
playC.lineWidth = 1;
playC.lineCap = 'butt';
playC.lineJoin = 'miter';
playC.moveTo(60 + 44.053484, 147.608260 - 35);
playC.lineTo(60 + 44.053484, 68.502834 - 35);
playC.lineTo(60 + 112.311470, 106.828610 - 35);
playC.closePath();
playC.fill();
playC.stroke();


const stopC = document.getElementById("stopBtn").getContext("2d");
stopC.fillStyle = "#cd654c";
stopC.fillRect(0, 0, 500, 500);

stopC.strokeStyle = 'white';
stopC.fillStyle = 'white';
stopC.beginPath();
stopC.fillStyle = 'white';
stopC.lineWidth = 1;
stopC.rect(60 + 44, 65 - 35, 100, 80);
stopC.fill();
stopC.stroke();

var tpUnits = 'G21';

var tpBbox = {
    min: {
        x: Infinity,
        y: Infinity
    },
    max: {
        x: -Infinity,
        y: -Infinity
    }
};
var bboxIsSet = false;

var resetBbox = function() {
    tpBbox.min.x = Infinity;
    tpBbox.min.y = Infinity;
    tpBbox.max.x = -Infinity;
    tpBbox.max.y = -Infinity;
    bboxIsSet = false;
}

// Project the 3D toolpath onto the 2D Canvas
// The coefficients determine the type of projection
// Matrix multiplication written out
var xx = 0.707;
var xy = 0.707;
var xz = 0.0;
var yx = -0.707/2;
var yy = 0.707/2;
var yz = 1.0;
var isoView = function() {
    xx = 0.707;
    xy = 0.707;
    xz = 0.0;
    yx = -0.707;
    yy = 0.707;
    yz = 1.0;
}
var obliqueView = function() {
    xx = 0.707;
    xy = 0.707;
    xz = 0.0;
    yx = -0.707/2;
    yy = 0.707/2;
    yz = 1.0;
}
var topView = function() {
    xx = 1.0;
    xy = 0.0;
    xz = 0.0;
    yx = 0.0;
    yy = 1.0;
    yz = 0.0;
}
const projection = (wpos) => ({ x: wpos.x * xx + wpos.y * xy + wpos.z * xz, y: wpos.x * yx + wpos.y * yy + wpos.z * yz });

var formatLimit = function(mm) {
    return (tpUnits == 'G20') ? (mm/25.4).toFixed(3)+'"' : mm.toFixed(2)+'mm';
}

var toolX = null;
var toolY = null;
var toolSave = null;
var toolRadius = 6;
var toolRectWH = toolRadius*2 + 4;  // Slop to encompass the entire image area

var drawTool = function(dpos) {
    pp = projection(dpos)
    toolX = xToPixel(pp.x)-toolRadius-2;
    toolY = yToPixel(pp.y)-toolRadius-2;
    
    // Validate coordinates before calling getImageData to prevent canvas errors
    if (!isFinite(toolX) || !isFinite(toolY)) {
        return; // Skip drawing if coordinates are invalid
    }
    
    toolSave = tp.getImageData(toolX, toolY, toolRectWH, toolRectWH);

    tp.beginPath();
    tp.strokeStyle = 'magenta';
    tp.fillStyle = 'magenta';
    tp.arc(pp.x, pp.y, toolRadius/scaler, 0, Math.PI*2, true);
    tp.fill();
    tp.stroke();
}

var drawOrigin = function(radius) {
    po = projection({x: 0.0, y:0.0, z:0.0})
    tp.beginPath();
    tp.strokeStyle = 'red';
    tp.arc(po.x, po.y, radius, 0, Math.PI*2, false);
    tp.moveTo(-radius*1.5, 0);
    tp.lineTo(radius*1.5, 0);
    tp.moveTo(0,-radius*1.5);
    tp.lineTo(0, radius*1.5);
    tp.stroke();
}

var drawMachineBounds = function() {
    
    //Work codinates offset the maxTravel part centers it in the view so 0,0 is the middle of the sheet
    var woodWidth = 2438;
    var woodHeight = 2438/2;

    //Project onto the camera view
    const p0 = projection({x: -woodWidth/2, y: -woodHeight/2, z: 0});
    const p1 = projection({x: woodWidth/2, y: -woodHeight/2, z: 0});
    const p2 = projection({x: woodWidth/2, y: woodHeight/2, z: 0});
    const p3 = projection({x: -woodWidth/2, y: woodHeight/2, z: 0});

    //This is used to fit everything in the camera view later
    tpBbox.min.x = Math.min(tpBbox.min.x, p0.x);
    tpBbox.min.y = Math.min(tpBbox.min.y, p0.y);
    tpBbox.max.x = Math.max(tpBbox.max.x, p2.x);
    tpBbox.max.y = Math.max(tpBbox.max.y, p2.y);
    bboxIsSet = true;

    //Draw to the actual display
    tp.beginPath();
    tp.moveTo(p0.x, p0.y);
    tp.lineTo(p0.x, p0.y);
    tp.lineTo(p1.x, p1.y);
    tp.lineTo(p2.x, p2.y);
    tp.lineTo(p3.x, p3.y);
    tp.lineTo(p0.x, p0.y);
    tp.strokeStyle = "green";
    tp.stroke();

}

var drawMachineBelts = function() {
    console.log("Draw belts");

    // Update anchor points from current configuration
    updateAnchorPointsFromConfig();

    const tl = projection({x: tlX - trX/2, y: tlY/2, z: 0});
    const tr = projection({x: trX/2, y: trY/2, z: 0});
    const bl = projection({x: blX - brX/2, y: blY - tlY/2, z: 0});
    const br = projection({x: brX/2, y: brY - trY/2, z: 0});

    tpBbox.min.x = Math.min(tpBbox.min.x, bl.x);
    tpBbox.min.y = Math.min(tpBbox.min.y, bl.y);
    tpBbox.max.x = Math.max(tpBbox.max.x, tr.x);
    tpBbox.max.y = Math.max(tpBbox.max.y, tr.y);

    tp.beginPath();
    tp.strokeStyle = "grey";
    tp.moveTo(0, 0);
    tp.lineTo(tl.x, tl.y);
    tp.moveTo(0, 0);
    tp.lineTo(tr.x, tr.y);
    tp.moveTo(0, 0);
    tp.lineTo(bl.x, bl.y);
    tp.moveTo(0, 0);
    tp.lineTo(br.x, br.y);
    tp.stroke();

    tp.fillStyle = "black";
    tp.beginPath();
    tp.arc(tl.x, tl.y, 10, 0, 2 * Math.PI);
    tp.closePath();
    tp.fill();
    tp.beginPath();
    tp.arc(tr.x, tr.y, 10, 0, 2 * Math.PI);
    tp.closePath();
    tp.fill();
    tp.beginPath();
    tp.arc(br.x, br.y, 10, 0, 2 * Math.PI);
    tp.closePath();
    tp.fill();
    tp.beginPath();
    tp.arc(bl.x, bl.y, 10, 0, 2 * Math.PI);
    tp.closePath();
    tp.fill();
    

    const squareSize = projection({x: 50, y: 0, z: 0});


    var i = bl.x;
    var j = bl.y;
    while(i < tr.x){
        while(j < tr.y){
            drawARect(i,j,squareSize.x, computPositonGradient(i, j, tl, tr, bl, br));
            j = j + squareSize.x;
        }
        j = bl.y;
        i = i + squareSize.x;
    }
}

var checkMinBeltLength = function(x1, y1, x2, y2){
    const dist = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2));
    if(dist < 1200){
        return 1 - dist/1200;
    }
    else{
        return 0;
    }
}

var computPositonGradient = function(x,y, tl, tr, bl, br){
    var opacity = 0;
    
    //Check distance from the mounting points
    opacity = opacity + checkMinBeltLength(x,y,tl.x, tl.y);
    opacity = opacity + checkMinBeltLength(x,y,tr.x, tr.y);
    opacity = opacity + checkMinBeltLength(x,y,bl.x, bl.y);
    opacity = opacity + checkMinBeltLength(x,y,br.x, br.y);

    opacity = Math.max(opacity, computeTension(x,y, tl, tr, bl, br));

    return opacity;
}

var computeTension = function(x,y, tl, tr, bl, br){
    const A = Math.atan((y-tl.y)/(tr.x - x));
    const B = Math.atan((y-tl.y)/(x-tl.x));

    const T1 = 1 / (Math.cos(A) * Math.sin(B) / Math.cos(B) + Math.sin(A));
    const T2 = 1 / (Math.cos(B) * Math.sin(A) / Math.cos(A) + Math.sin(B));

    const T1Scaled = T1/-3;
    const T2Scaled = T2/-3; //This is some arbitrary scaling to make it look right in terms of color

    const max = Math.max(T1Scaled, T2Scaled);

    if(max > .15){
        return max;
    }
    else{
        return 0;
    }
}

// License: MIT - https://opensource.org/licenses/MIT
// Author: Michele Locati <michele@locati.it>
// Source: https://gist.github.com/mlocati/7210513
function perc2color(perc) {
    console.log(perc);
    var r, g, b = 0;
    if(perc < 50) {
        r = 255;
        g = Math.round(5.1 * perc);
    }
    else {
        g = 255;
        r = Math.round(510 - 5.10 * perc);
    }
    var h = r * 0x10000 + g * 0x100 + b * 0x1;

    console.log(r + " " + g + " " + b)
    return "rgba("+r+", "+g+", "+b+", .3)";//'#' + ('000000' + h.toString(16)).slice(-6);
}

var drawARect = function(x,y,size, opacity){

    const posP = projection({x: x - size/2, y: y - size/2, z: 0});
    tp.beginPath();
    tp.fillStyle = perc2color(100 - 100*opacity);//"rgba(255, 0, 0, " + opacity + ")";
    tp.rect(posP.x, posP.y, size, size);
    tp.fill();
}

var xOffset = 0;
var yOffset = 0;
var scaler = 1;
var xToPixel = function(x) { return scaler * x + xOffset; }
var yToPixel = function(y) { return -scaler * y + yOffset; }

var clearCanvas = function() {
    // Reset the transform and clear the canvas
    tp.setTransform(1,0,0,1,0,0);

//    if (tpRect == undefined) {
        var tpRect = canvas.parentNode.getBoundingClientRect();
        // canvas.width = tpRect.width ? tpRect.width : 400;
        // canvas.height = tpRect.height ? tpRect.height : 400;
//    }

    tp.fillStyle = "white";
    tp.fillRect(0, 0, canvas.width, canvas.height);
}

var transformCanvas = function() {
    toolSave = null;

    clearCanvas();

    var imageWidth;
    var imageHeight;
    var inset;
    if (!bboxIsSet) {
        // imageWidth = canvas.width;
        // imageHeight = canvas.height;
        inset = 0;
        scaler = 1;
        xOffset = 0;
        yOffset = 0;
        return;
    }

    var imageWidth = tpBbox.max.x - tpBbox.min.x;
    var imageHeight = tpBbox.max.y - tpBbox.min.y;
    if (imageWidth == 0) {
        imageWidth = 1;
    }
    if (imageHeight == 0) {
        imageHeight = 1;
    }
    var shrink = 0.90;
    inset = 5;
    var scaleX = (canvas.width - inset*2) / imageWidth;
    var scaleY = (canvas.height - inset*2) / imageHeight;
    var minScale = Math.min(scaleX, scaleY);

    scaler = minScale * shrink;
    if (scaler < 0) {
        scaler = -scaler;
    }
    xOffset = inset - tpBbox.min.x * scaler;
    yOffset = (canvas.height-inset) - tpBbox.min.y * (-scaler);

    // Canvas coordinates of image bounding box top and right
    var imageTop = scaler * imageHeight;
    var imageRight = scaler * imageWidth;

    // Show the X and Y limit coordinates of the GCode program.
    // We do this before scaling because after we invert the Y coordinate,
    // text would be displayed upside-down.
    // tp.fillStyle = "black";
    // tp.font = "14px Ariel";
    // tp.textAlign = "center";
    // tp.textBaseline = "bottom";
    // tp.fillText(formatLimit(tpBbox.min.y), imageRight/2, canvas.height-inset);
    // tp.textBaseline = "top";
    // tp.fillText(formatLimit(tpBbox.max.y), imageRight/2, canvas.height-inset - imageTop);
    // tp.textAlign = "left";
    // tp.textBaseline = "center";
    // tp.fillText(formatLimit(tpBbox.min.x), inset, canvas.height-inset - imageTop/2);
    // tp.textAlign = "right";
    // tp.textBaseline = "center";
    // tp.fillText(formatLimit(tpBbox.max.x), inset+imageRight, canvas.height-inset - imageTop/2);
    // Transform the path coordinate system so the image fills the canvas
    // with a small inset, and +Y goes upward.
    // The net transform from image space (x,y) to pixel space (x',y') is:
    //   x' =  scaler*x + xOffset
    //   y' = -scaler*y + yOffset
    // We use setTransform() instead of a sequence of scale() and translate() calls
    // because we need to perform the transform manually for getImageData(), which
    // uses pixel coordinates, and there is no standard way to read back the current
    // transform matrix.

    tp.setTransform(scaler, 0, 0, -scaler, xOffset, yOffset);

    tp.lineWidth = 0.5 / scaler;

    drawOrigin(imageWidth * 0.04);
}
var wrappedDegrees = function(radians) {
    var degrees = radians * 180 / Math.PI;
    return degrees >= 0 ? degrees : degrees + 360;
}

var bboxHandlers = {
    addLine: function(modal, start, end) {
	// Update tpUnits in case it changed in a previous line
        tpUnits = modal.units;

        ps = projection(start);
        pe = projection(end);

        tpBbox.min.x = Math.min(tpBbox.min.x, ps.x, pe.x);
        tpBbox.min.y = Math.min(tpBbox.min.y, ps.y, pe.y);
        tpBbox.max.x = Math.max(tpBbox.max.x, ps.x, pe.x);
        tpBbox.max.y = Math.max(tpBbox.max.y, ps.y, pe.y);
        bboxIsSet = true;
    },
    addArcCurve: function(modal, start, end, center, extraRotations) {
        // To determine the precise bounding box of a circular arc we
	// must account for the possibility that the arc crosses one or
	// more axes.  If so, the bounding box includes the "bulges" of
	// the arc across those axes.

	// Update units in case it changed in a previous line
        tpUnits = modal.units;

        if (modal.motion == 'G2') {  // clockwise
            var tmp = start;
            start = end;
            end = tmp;
        }

        ps = projection(start);
        pc = projection(center);
        pe = projection(end);

	// Coordinates relative to the center of the arc
	var sx = ps.x - pc.x;
	var sy = ps.y - pc.y;
	var ex = pe.x - pc.x;
	var ey = pe.y - pc.y;

        var radius = Math.hypot(sx, sy);

	// Axis crossings - plus and minus x and y
	var px = false;
	var py = false;
	var mx = false;
	var my = false;

	// There are ways to express this decision tree in fewer lines
	// of code by converting to alternate representations like angles,
	// but this way is probably the most computationally efficient.
	// It avoids any use of transcendental functions.  Every path
	// through this decision tree is either 4 or 5 simple comparisons.
	if (ey >= 0) {              // End in upper half plane
	    if (ex > 0) {             // End in quadrant 0 - X+ Y+
		if (sy >= 0) {          // Start in upper half plane
		    if (sx > 0) {         // Start in quadrant 0 - X+ Y+
			if (sx <= ex) {     // wraparound
			    px = py = mx = my = true;
			}
		    } else {              // Start in quadrant 1 - X- Y+
			mx = my = px = true;
		    }
		} else {                // Start in lower half plane
		    if (sx > 0) {         // Start in quadrant 3 - X+ Y-
			px = true;
		    } else {              // Start in quadrant 2 - X- Y-
			my = px = true;
		    }
		}
	    } else {                  // End in quadrant 1 - X- Y+
		if (sy >= 0) {          // Start in upper half plane
		    if (sx > 0) {         // Start in quadrant 0 - X+ Y+
			py = true;
		    } else {              // Start in quadrant 1 - X- Y+
			if (sx <= ex) {     // wraparound
			    px = py = mx = my = true;
			}
		    }
		} else {                // Start in lower half plane
		    if (sx > 0) {         // Start in quadrant 3 - X+ Y-
			px = py = true;
		    } else {              // Start in quadrant 2 - X- Y-
			my = px = py = true;
		    }
		}
	    }
	} else {                    // ey < 0 - end in lower half plane
	    if (ex > 0) {             // End in quadrant 3 - X+ Y+
		if (sy >= 0) {          // Start in upper half plane
		    if (sx > 0) {         // Start in quadrant 0 - X+ Y+
			py = mx = my = true;
		    } else {              // Start in quadrant 1 - X- Y+
			mx = my = true;
		    }
		} else {                // Start in lower half plane
		    if (sx > 0) {         // Start in quadrant 3 - X+ Y-
			if (sx >= ex) {      // wraparound
			    px = py = mx = my = true;
			}
		    } else {              // Start in quadrant 2 - X- Y-
			my = true;
		    }
		}
	    } else {                  // End in quadrant 2 - X- Y+
		if (sy >= 0) {          // Start in upper half plane
		    if (sx > 0) {         // Start in quadrant 0 - X+ Y+
			py = mx = true;
		    } else {              // Start in quadrant 1 - X- Y+
			mx = true;
		    }
		} else {                // Start in lower half plane
		    if (sx > 0) {         // Start in quadrant 3 - X+ Y-
			px = py = mx = true;
		    } else {              // Start in quadrant 2 - X- Y-
			if (sx >= ex) {      // wraparound
			    px = py = mx = my = true;
			}
		    }
		}
	    }
	}
	var maxX = px ? pc.x + radius : Math.max(ps.x, pe.x);
	var maxY = py ? pc.y + radius : Math.max(ps.y, pe.y);
	var minX = mx ? pc.x - radius : Math.min(ps.x, pe.x);
	var minY = my ? pc.y - radius : Math.min(ps.y, pe.y);

	var minZ = Math.min(start.z, end.z);
	var maxZ = Math.max(start.z, end.z);

        const p0 = projection({x: minX, y: minY, z: minZ});
        const p1 = projection({x: minX, y: maxY, z: minZ});
        const p2 = projection({x: maxX, y: maxY, z: minZ});
        const p3 = projection({x: maxX, y: minY, z: minZ});
        const p4 = projection({x: minX, y: minY, z: maxZ});
        const p5 = projection({x: minX, y: maxY, z: maxZ});
        const p6 = projection({x: maxX, y: maxY, z: maxZ});
        const p7 = projection({x: maxX, y: minY, z: maxZ});

	tpBbox.min.x = Math.min(tpBbox.min.x, p0.x, p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x);
	tpBbox.min.y = Math.min(tpBbox.min.y, p0.y, p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y);
	tpBbox.max.x = Math.max(tpBbox.max.x, p0.x, p1.x, p2.x, p3.x, p4.x, p5.x, p6.x, p7.x);
	tpBbox.max.y = Math.max(tpBbox.max.y, p0.y, p1.y, p2.y, p3.y, p4.y, p5.y, p6.y, p7.y);
        bboxIsSet = true;
    }
};
var initialMoves = true;
var displayHandlers = {
    addLine: function(modal, start, end) {
        var motion = modal.motion;
        if (motion == 'G0') {
            tp.strokeStyle = initialMoves ? 'red' : 'green';
        } else {
            tp.strokeStyle = 'black';
            // Don't cancel initialMoves on no-motion G1 (e.g. G1 F30)
            // or on Z-only moves
            if (start.x != end.x || start.y != end.y) {
                initialMoves = false;
            }
        }

        ps = projection(start);
        pe = projection(end);
        tp.beginPath();
        // tp.moveTo(start.x, start.y);
        // tp.lineTo(end.x, end.y);
        tp.moveTo(ps.x, ps.y);
        tp.lineTo(pe.x, pe.y);
        tp.stroke();
    },
    addArcCurve: function(modal, start, end, center, extraRotations) {
        var motion = modal.motion;

        var deltaX1 = start.x - center.x;
        var deltaY1 = start.y - center.y;
        var radius = Math.hypot(deltaX1, deltaY1);
        var deltaX2 = end.x - center.x;
        var deltaY2 = end.y - center.y;
        var theta1 = Math.atan2(deltaY1, deltaX1);
        var theta2 = Math.atan2(deltaY2, deltaX2);
        var cw = modal.motion == "G2";
        if (!cw && theta2 < theta1) {
            theta2 += Math.PI * 2;
        } else if (cw && theta2 > theta1) {
            theta2 -= Math.PI * 2;
        }
	if (theta1 == theta2) {
	    theta2 += Math.PI * ((cw) ? -2 : 2);
	}
        if (extraRotations > 1) {
            theta2 += (extraRotations-1) * Math.PI * ((cw) ? -2 : 2);;
        }

        initialMoves = false;

        tp.beginPath();
        tp.strokeStyle = 'black';
        deltaTheta = theta2 - theta1;
        n = 10 * Math.ceil(Math.abs(deltaTheta) / Math.PI);
        dt = (deltaTheta) / n;
        dz = (end.z - start.z) / n;
        ps = projection(start);
        tp.moveTo(ps.x, ps.y);
        next = {};
        theta = theta1;
        next.z = start.z;
        for (i = 0; i < n; i++) {
            theta += dt;
            next.x = center.x + radius * Math.cos(theta);
            next.y = center.y + radius * Math.sin(theta);
            next.z += dz;
            pe = projection(next)
            tp.lineTo(pe.x, pe.y);
        }
        tp.stroke();
    },
};

var ToolpathDisplayer = function() {
};

// var offset;

ToolpathDisplayer.prototype.clear = function() {
    clearCanvas();
}

ToolpathDisplayer.prototype.showToolpath = function(gcode, modal, initialPosition) {
    // Update anchor points from current configuration before displaying
    updateAnchorPointsFromConfig();
    
    cameraAngle = cameraAngle;

    var drawBounds = false;
    var drawBelts  = false;

    switch (cameraAngle) {
      case 0:
        obliqueView();
        break;
      case 1:
        obliqueView();
        drawBounds = true;
        break;
      case 2:
        topView();
        break;
      case 3:
        topView();
        drawBounds = true;
        break;
      case 4:
        topView();
        drawBounds = true;
        drawBelts  = true;
        break;
      default:
        obliqueView();
    }

    resetBbox();
    bboxHandlers.position = initialPosition;
    bboxHandlers.modal = modal;

    if(drawBounds){
        drawMachineBounds(); //Adds the machine bounds to the bounding box...this does not draw
    }
    if(drawBelts){
        drawMachineBelts(); //Adds the belts to the bounding box...does not draw yet
    }

    var gcodeLines = gcode.split('\n');
    new Toolpath(bboxHandlers).loadFromLinesSync(gcodeLines);
    transformCanvas();
    if (!bboxIsSet) {
        return;
    }
    initialMoves = true;
    displayHandlers.position = initialPosition;
    displayHandlers.modal = modal;
    new Toolpath(displayHandlers).loadFromLinesSync(gcodeLines);

    drawTool(initialPosition);

    if(drawBounds){
        drawMachineBounds(); //Actually draws the bounding box
    }
    if(drawBelts){
        drawMachineBelts(); //Actually draws the belts
    }
};

ToolpathDisplayer.prototype.reDrawTool = function(modal, dpos) {
    if (toolSave != null) {
        tp.putImageData(toolSave, toolX, toolY);
        drawTool(dpos);
    }
}

ToolpathDisplayer.prototype.cycleCameraAngle = function(gcode, modal, position) {
    cameraAngle = cameraAngle + 1;
    if(cameraAngle > 4){
        cameraAngle = 0;
    }

    tpDisplayer().showToolpath(gcode, modal, position);
}

let displayer = new ToolpathDisplayer();

const tpDisplayer = () => {
	if (!displayer) {
		displayer = new ToolpathDisplayer();
	}
	return displayer;
}

/** Expects a simple array with 3 elements, and converts it to an xyz object */
const arrayToXYZ = (arr) => {
	// Provide safe defaults if array is invalid or contains non-finite values
	const safeArr = arr && Array.isArray(arr) ? arr : [0, 0, 0];
	return { 
		x: isFinite(safeArr[0]) ? safeArr[0] : 0, 
		y: isFinite(safeArr[1]) ? safeArr[1] : 0, 
		z: isFinite(safeArr[2]) ? safeArr[2] : 0 
	};
};

const updateGcodeViewerAngle = () => {
	const gcode = getValue("tablettab_gcode");
	tpDisplayer().cycleCameraAngle(gcode, gCodeModal, arrayToXYZ(WPOS));
};

canvas.addEventListener("mouseup", updateGcodeViewerAngle); 
var refreshGcode = function() {
    const gcode = getValue("tablettab_gcode");
    tpDisplayer().showToolpath(gcode, gCodeModal, arrayToXYZ(WPOS));
}

// document.getElementById("small-toolpath").addEventListener("mouseup", updateGcodeViewerAngle); 
