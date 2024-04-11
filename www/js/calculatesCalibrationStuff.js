//This is the inital guess for how big the machine is. These numbers are wrong intensionally
const initialWidth = 3048 + 12
const initialHeight = 2200 - 14

//Establish initial guesses for the corners
var initialGuess = {
  tl: { x: 0, y: initialHeight },
  tr: { x: initialWidth, y: initialHeight },
  bl: { x: 0, y: 0 },
  br: { x: initialWidth, y: 0 },
  fitness: 100000000,
}

const centerX = initialWidth / 2
const centerY = initialHeight / 2

let result

/**------------------------------------Intro------------------------------------
 *
 *   If you are reading this code to understand it then I would recommend starting
 *  at the bottom of the page and working your way up. The code is written in a
 * functional style so the function definitions are at the top and the code that
 * actually runs is at the bottom. It was also written quickly and modified a lot
 * so it is not very clean. I apologize for that.
 *
 *------------------------------------------------------------------------------
 */


/**
 * Computes the distance between two points.
 * @param {number} a - The x-coordinate of the first point.
 * @param {number} b - The y-coordinate of the first point.
 * @param {number} c - The x-coordinate of the second point.
 * @param {number} d - The y-coordinate of the second point.
 * @returns {number} - The distance between the two points.
 */
function distanceBetweenPoints(a, b, c, d) {
  var dx = c - a
  var dy = d - b
  return Math.sqrt(dx * dx + dy * dy)
}

/**
 * Computes the end point of a line based on its starting point, angle, and length.
 * @param {number} startX - The x-coordinate of the line's starting point.
 * @param {number} startY - The y-coordinate of the line's starting point.
 * @param {number} angle - The angle of the line in radians.
 * @param {number} length - The length of the line.
 * @returns {Object} - An object containing the x and y coordinates of the line's end point.
 */
function getEndPoint(startX, startY, angle, length) {
  var endX = startX + length * Math.cos(angle)
  var endY = startY + length * Math.sin(angle)
  return { x: endX, y: endY }
}

/**
 * Computes how close all of the line end points are to each other.
 * @param {Object} line1 - The first line to compare.
 * @param {Object} line2 - The second line to compare.
 * @param {Object} line3 - The third line to compare.
 * @param {Object} line4 - The fourth line to compare.
 * @returns {number} - The fitness value, which is the average distance between all line end points.
 */
function computeEndpointFitness(line1, line2, line3, line4) {
  const a = distanceBetweenPoints(line1.xEnd, line1.yEnd, line2.xEnd, line2.yEnd)
  const b = distanceBetweenPoints(line1.xEnd, line1.yEnd, line3.xEnd, line3.yEnd)
  const c = distanceBetweenPoints(line1.xEnd, line1.yEnd, line4.xEnd, line4.yEnd)
  const d = distanceBetweenPoints(line2.xEnd, line2.yEnd, line3.xEnd, line3.yEnd)
  const e = distanceBetweenPoints(line2.xEnd, line2.yEnd, line4.xEnd, line4.yEnd)
  const f = distanceBetweenPoints(line3.xEnd, line3.yEnd, line4.xEnd, line4.yEnd)

  const fitness = (a + b + c + d + e + f) / 6

  return fitness
}

/**
 * Computes the end point of a line based on its starting point, angle, and length.
 * @param {Object} line - The line to compute the end point for.
 * @returns {Object} - The line with the end point added.
 */
function computeLineEndPoint(line) {
  const end = getEndPoint(line.xBegin, line.yBegin, line.theta, line.length)
  line.xEnd = end.x
  line.yEnd = end.y
  return line
}

/**
 * Walks the four lines in the given set, adjusting their endpoints to minimize the distance between them.
 * @param {Object} tlLine - The top-left line in the set.
 * @param {Object} trLine - The top-right line in the set.
 * @param {Object} blLine - The bottom-left line in the set.
 * @param {Object} brLine - The bottom-right line in the set.
 * @param {number} stepSize - The amount to adjust the angle of each line by on each iteration.
 * @returns {Object} - An object containing the final positions of each line.
 */
function walkLines(tlLine, trLine, blLine, brLine, stepSize) {
  let changeMade = true
  let bestFitness = computeEndpointFitness(tlLine, trLine, blLine, brLine)

  while (changeMade) {
    changeMade = false

    const lines = [tlLine, trLine, blLine, brLine]

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i]

      for (let direction of [-1, 1]) {
        const newLine = computeLineEndPoint({
          xBegin: line.xBegin,
          yBegin: line.yBegin,
          theta: line.theta + direction * stepSize,
          length: line.length,
        })

        const newFitness = computeEndpointFitness(
          i === 0 ? newLine : tlLine,
          i === 1 ? newLine : trLine,
          i === 2 ? newLine : blLine,
          i === 3 ? newLine : brLine
        )

        if (newFitness < bestFitness) {
          lines[i] = newLine
          bestFitness = newFitness
          changeMade = true
        }
      }
    }

    tlLine = lines[0]
    trLine = lines[1]
    blLine = lines[2]
    brLine = lines[3]
  }

  return { tlLine, trLine, blLine, brLine }
}

/**
 * Computes the fitness of a set of lines based on how close their endpoints are to each other.
 * @param {Object} measurement - An object containing the initial theta values and lengths for each line.
 * @param {Object} individual - An object containing the x and y coordinates for each line's starting point.
 * @returns {Object} - An object containing the fitness value and the final positions of each line.
 */
function magneticallyAttractedLinesFitness(measurement, individual) {
  //These set the inital conditions for theta. They don't really mater, they just have to kinda point to the middle of the frame.
  if (measurement.tlTheta == undefined) {
    measurement.tlTheta = -0.3
  }
  if (measurement.trTheta == undefined) {
    measurement.trTheta = 3.5
  }
  if (measurement.blTheta == undefined) {
    measurement.blTheta = 0.5
  }
  if (measurement.brTheta == undefined) {
    measurement.brTheta = 2.6
  }

  //Define the four lines with starting points and lengths
  var tlLine = computeLineEndPoint({
    xBegin: individual.tl.x,
    yBegin: individual.tl.y,
    theta: measurement.tlTheta,
    length: measurement.tl,
  })
  var trLine = computeLineEndPoint({
    xBegin: individual.tr.x,
    yBegin: individual.tr.y,
    theta: measurement.trTheta,
    length: measurement.tr,
  })
  var blLine = computeLineEndPoint({
    xBegin: individual.bl.x,
    yBegin: individual.bl.y,
    theta: measurement.blTheta,
    length: measurement.bl,
  })
  var brLine = computeLineEndPoint({
    xBegin: individual.br.x,
    yBegin: individual.br.y,
    theta: measurement.brTheta,
    length: measurement.br,
  })

  var { tlLine, trLine, blLine, brLine } = walkLines(tlLine, trLine, blLine, brLine, 0.1)
  var { tlLine, trLine, blLine, brLine } = walkLines(tlLine, trLine, blLine, brLine, 0.01)
  var { tlLine, trLine, blLine, brLine } = walkLines(tlLine, trLine, blLine, brLine, 0.001)
  var { tlLine, trLine, blLine, brLine } = walkLines(tlLine, trLine, blLine, brLine, 0.0001)
  var { tlLine, trLine, blLine, brLine } = walkLines(tlLine, trLine, blLine, brLine, 0.00001)
  var { tlLine, trLine, blLine, brLine } = walkLines(tlLine, trLine, blLine, brLine, 0.000001)
  var { tlLine, trLine, blLine, brLine } = walkLines(tlLine, trLine, blLine, brLine, 0.0000001)
  var { tlLine, trLine, blLine, brLine } = walkLines(tlLine, trLine, blLine, brLine, 0.00000001)

  measurement.tlTheta = tlLine.theta
  measurement.trTheta = trLine.theta
  measurement.blTheta = blLine.theta
  measurement.brTheta = brLine.theta

  //Compute the final fitness
  const finalFitness = computeEndpointFitness(tlLine, trLine, blLine, brLine)

  //Compute the tension in the two upper belts
  const { TL, TR } = calculateTensions(tlLine.xEnd, tlLine.yEnd, individual)
  measurement.TLtension = TL
  measurement.TRtension = TR

  drawLines(tlLine, trLine, blLine, brLine, individual);

  return { fitness: finalFitness, lines: { tlLine: tlLine, trLine: trLine, blLine: blLine, brLine: brLine } }
}

/**
 * Computes the distance of one line's end point from the center of mass of the other three lines.
 * @param {Object} lineToCompare - The line to compute the distance for.
 * @param {Object} line2 - The second line to use in computing the center of mass.
 * @param {Object} line3 - The third line to use in computing the center of mass.
 * @param {Object} line4 - The fourth line to use in computing the center of mass.
 * @returns {Object} - An object containing the x and y distances from the center of mass.
 */
function computeDistanceFromCenterOfMass(lineToCompare, line2, line3, line4) {
  //Compute the center of mass
  const x = (line2.xEnd + line3.xEnd + line4.xEnd) / 3
  const y = (line2.yEnd + line3.yEnd + line4.yEnd) / 3

  return { x: lineToCompare.xEnd - x, y: lineToCompare.yEnd - y }
}

/**
 * Computes the distances from the center of mass for four lines and converts them into the relevant variables that we can tweak.
 * @param {Object} lines - An object containing four lines to compute the distances from the center of mass for.
 * @returns {Object} - An object containing the distances from the center of mass for tlX, tlY, trX, trY, and brX.
 */
function generateTweaks(lines) {
  //We care about the distances for tlX, tlY, trX, trY, brX

  const tlX = computeDistanceFromCenterOfMass(lines.tlLine, lines.trLine, lines.blLine, lines.brLine).x
  const tlY = computeDistanceFromCenterOfMass(lines.tlLine, lines.trLine, lines.blLine, lines.brLine).y
  const trX = computeDistanceFromCenterOfMass(lines.trLine, lines.tlLine, lines.blLine, lines.brLine).x
  const trY = computeDistanceFromCenterOfMass(lines.trLine, lines.tlLine, lines.blLine, lines.brLine).y
  const brX = computeDistanceFromCenterOfMass(lines.brLine, lines.tlLine, lines.trLine, lines.blLine).x

  return { tlX: tlX, tly: tlY, trX: trX, trY: trY, brX: brX }
}

/**
 * Computes all of the tweaks and summarizes them to move the guess furthest from the center of mass of the lines.
 * @param {Array} lines - An array of lines to compute the tweaks for.
 * @param {Object} lastGuess - The last guess made by the algorithm.
 * @returns {Object} - The updated guess with the furthest tweaks applied.
 */
function computeFurthestFromCenterOfMass(lines, lastGuess) {
  var tlX = 0
  var tlY = 0
  var trX = 0
  var trY = 0
  var brX = 0

  lines.forEach((line) => {
    const tweaks = generateTweaks(line)

    tlX = tlX + tweaks.tlX
    tlY = tlY + tweaks.tly
    trX = trX + tweaks.trX
    trY = trY + tweaks.trY
    brX = brX + tweaks.brX
  })

  tlX = tlX / lines.length
  tlY = tlY / lines.length
  trX = trX / lines.length
  trY = trY / lines.length
  brX = brX / lines.length

  const maxError = Math.max(Math.abs(tlX), Math.abs(tlY), Math.abs(trX), Math.abs(trY), Math.abs(brX))

  var divisor = -10
  if (maxError == Math.abs(tlX)) {
    //console.log("Move tlY by: " + tlY/divisor);
    lastGuess.tl.x = lastGuess.tl.x + tlX / divisor
  }
  if (maxError == Math.abs(tlY)) {
    //console.log("Move tlY by: " + tlY/divisor);
    lastGuess.tl.y = lastGuess.tl.y + tlY / divisor
  } else if (maxError == Math.abs(trX)) {
    //console.log("Move trX by: " + trX/divisor);
    lastGuess.tr.x = lastGuess.tr.x + trX / divisor
  } else if (maxError == Math.abs(trY)) {
    //console.log("Move trY by: " + trY/divisor);
    lastGuess.tr.y = lastGuess.tr.y + trY / divisor
  } else if (maxError == Math.abs(brX)) {
    //console.log("Move brX by: " + brX/divisor);
    lastGuess.br.x = lastGuess.br.x + brX / divisor
  }

  return lastGuess
}

/**
 * Computes the fitness of a guess for a set of measurements by comparing the guess to magnetically attracted lines.
 * @param {Array} measurements - An array of measurements to compare the guess to.
 * @param {Object} lastGuess - The last guess made by the algorithm.
 * @returns {Object} - An object containing the fitness of the guess and the lines used to calculate the fitness.
 */
function computeLinesFitness(measurements, lastGuess) {
  var fitnesses = []
  var allLines = []

  //Check each of the measurements against the guess
  measurements.forEach((measurement) => {
    const { fitness, lines } = magneticallyAttractedLinesFitness(measurement, lastGuess)
    fitnesses.push(fitness)
    allLines.push(lines)
  })

  //Computes the average fitness of all of the measurements
  const fitness = calculateAverage(fitnesses)

  // console.log(fitnesses)

  //Here is where we need to do the calculation of which corner is the worst and which direction to move it
  lastGuess = computeFurthestFromCenterOfMass(allLines, lastGuess)
  lastGuess.fitness = fitness

  return lastGuess
}

function calculateTensions(x, y, guess) {
  let Xtl = guess.tl.x
  let Ytl = guess.tl.y
  let Xtr = guess.tr.x
  let Ytr = guess.tr.y
  let Xbl = guess.bl.x
  let Ybl = guess.bl.y
  let Xbr = guess.br.x
  let Ybr = guess.br.y

  let mass = 5.0
  const G_CONSTANT = 9.80665
  let alpha = 0.26
  let TL, TR

  let A, C, sinD, cosD, sinE, cosE
  let Fx, Fy

  A = (Xtl - x) / (Ytl - y)
  C = (Xtr - x) / (Ytr - y)
  A = Math.abs(A)
  C = Math.abs(C)
  sinD = x / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  cosD = y / Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2))
  sinE = Math.abs(Xbr - x) / Math.sqrt(Math.pow(Xbr - x, 2) + Math.pow(y, 2))
  cosE = y / Math.sqrt(Math.pow(Xbr - x, 2) + Math.pow(y, 2))

  Fx = Ybr * sinE - Ybl * sinD
  Fy = Ybr * cosE + Ybl * cosD + mass * G_CONSTANT * Math.cos(alpha)
  // console.log(`Fx = ${Fx.toFixed(1)}, Fy = ${Fy.toFixed(1)}`);

  let TLy = (Fx + C * Fy) / (A + C)
  let TRy = Fy - TLy
  let TRx = C * (Fy - TLy)
  let TLx = A * TLy

  // console.log(`TLy = ${TLy.toFixed(1)}, TRy = ${TRy.toFixed(1)}, TRx = ${TRx.toFixed(1)}, TLx = ${TLx.toFixed(1)}`);

  TL = Math.sqrt(Math.pow(TLx, 2) + Math.pow(TLy, 2))
  TR = Math.sqrt(Math.pow(TRx, 2) + Math.pow(TRy, 2))

  return { TL, TR }
}

/**
 * Calculates the average of an array of numbers.
 * @param {number[]} array - The array of numbers to calculate the average of.
 * @returns {number} - The average of the array.
 */
function calculateAverage(array) {
  var total = 0
  var count = 0

  array.forEach(function (item, index) {
    total += Math.abs(item)
    count++
  })

  return total / count
}



/**
 * Projects the measurements to the plane of the machine. This is needed
 * because the belts are not parallel to the surface of the machine.
 * @param {Object} measurement - An object containing the measurements
 * @returns {Object} - An object containing the projected measurements
 */
function projectMeasurement(measurement) {
  const tlZ = 116
  const trZ = 69
  const blZ = 47
  const brZ = 89

  const tl = Math.sqrt(Math.pow(measurement.tl, 2) - Math.pow(tlZ, 2))
  const tr = Math.sqrt(Math.pow(measurement.tr, 2) - Math.pow(trZ, 2))
  const bl = Math.sqrt(Math.pow(measurement.bl, 2) - Math.pow(blZ, 2))
  const br = Math.sqrt(Math.pow(measurement.br, 2) - Math.pow(brZ, 2))

  return { tl: tl, tr: tr, bl: bl, br: br }
}

/**
 * Projects an array of measurements to the plane of the machine to account for the fact that the start and end point are not in the same plane.
 * @param {Object[]} measurements - An array of objects containing the measurements of the top left, top right, bottom left, and bottom right corners of a rectangle.
 * @returns {Object[]} - An array of objects containing the projected measurements of the top left, top right, bottom left, and bottom right corners of a rectangle.
 */
function projectMeasurements(measurements) {
  var projectedMeasurements = []

  measurements.forEach((measurement) => {
    projectedMeasurements.push(projectMeasurement(measurement))
  })

  return projectedMeasurements
}

/**
 * Adds a constant to each measurement in an array of measurements.
 * @param {Object[]} measurements - An array of objects containing the measurements of the top left, top right, bottom left, and bottom right corners of a rectangle.
 * @param {number} offset - The constant to add to each measurement.
 * @returns {Object[]} - An array of objects containing the updated measurements of the top left, top right, bottom left, and bottom right corners of a rectangle.
 */
function offsetMeasurements(measurements, offset) {
  const newMeasurements = measurements.map((measurement) => {
    return {
      tl: measurement.tl + offset,
      tr: measurement.tr + offset,
      bl: measurement.bl + offset,
      br: measurement.br + offset,
    }
  })

  return newMeasurements
}

/**
 * Scales each measurement in an array of measurements by a constant.
 * @param {Object[]} measurements - An array of objects containing the measurements of the top left, top right, bottom left, and bottom right corners of a rectangle.
 * @param {number} scale - The constant to multiply each measurement by.
 * @returns {Object[]} - An array of objects containing the updated measurements of the top left, top right, bottom left, and bottom right corners of a rectangle.
 */
function scaleMeasurements(measurements, scale) {
  const newMeasurements = measurements.map((measurement) => {
    return {
      tl: measurement.tl * scale,
      tr: measurement.tr * scale,
      bl: measurement.bl, // * scale,
      br: measurement.br, // * scale
    }
  })

  return newMeasurements
}

function scaleMeasurementsBasedOnTension(measurements, guess) {
  const maxScale = 0.995
  const minScale = 0.994
  const maxTension = 60
  const minTension = 20

  const scaleRange = maxScale - minScale
  const tensionRange = maxTension - minTension

  const newMeasurements = measurements.map((measurement) => {
    const tensionAdjustedTLScale = (1 - (measurement.TLtension - minTension) / tensionRange) * scaleRange + minScale
    const tensionAdjustedTRScale = (1 - (measurement.TRtension - minTension) / tensionRange) * scaleRange + minScale

    return {
      tl: measurement.tl * tensionAdjustedTLScale,
      tr: measurement.tr * tensionAdjustedTRScale,
      bl: measurement.bl, // * scale,
      br: measurement.br, // * scale
    }
  })

  return newMeasurements
}

function findMaxFitness(measurements) {
  // reject if already running
  if (window.computing) {
    console.log('Computation in progress, ignoring request');
    return;
  }
  // turn off compute button
  window.computing = true;
  document.querySelector('button#compute-sim-button').disabled = true;

  let currentGuess = JSON.parse(JSON.stringify(initialGuess));
  let stagnantCounter = 0;
  let totalCounter = 0;
  var bestGuess = JSON.parse(JSON.stringify(initialGuess));

  var messagesBox = document.querySelector('#messages');
  const fitnessMessage = document.getElementById('fitnessMessage');

  function loop() {
    clearCalCanvas();
    currentGuess = computeLinesFitness(measurements, currentGuess);

    if (1/currentGuess.fitness > 1/bestGuess.fitness) {
        bestGuess = JSON.parse(JSON.stringify(currentGuess));
        stagnantCounter = 0;
    } else {
        stagnantCounter++;
    }
    totalCounter++;

    if(totalCounter % 100 == 0) {
      const fitnessStatus = `Fitness: ${1 / bestGuess.fitness.toFixed(7)} in ${totalCounter}`;
      fitnessMessage.innerText = fitnessStatus;
      messagesBox.value += '\n' + fitnessStatus;
      messagesBox.scrollTop;
      messagesBox.scrollTop = messagesBox.scrollHeight;
    }

    if (stagnantCounter < 100 && totalCounter < 200000) {
      requestAnimationFrame(loop);
    } else {

      if(1/bestGuess.fitness < 0.5){
        messagesBox.value += '\nWARNING FITNESS TOO LOW. DO NOT USE THESE CALIBRATION VALUES!';
      }

      messagesBox.value += '\nCalibration complete \nCalibration values:';
      messagesBox.value += '\nFitness: ' + 1/bestGuess.fitness.toFixed(7);
      messagesBox.value += '\nMaslow_tlX: ' + bestGuess.tl.x.toFixed(1);
      messagesBox.value += '\nMaslow_tlY: ' + bestGuess.tl.y.toFixed(1);
      messagesBox.value += '\nMaslow_trX: ' + bestGuess.tr.x.toFixed(1);
      messagesBox.value += '\nMaslow_trY: ' + bestGuess.tr.y.toFixed(1);
      messagesBox.value += '\nMaslow_blX: ' + bestGuess.bl.x.toFixed(1);
      messagesBox.value += '\nMaslow_blY: ' + bestGuess.bl.y.toFixed(1);
      messagesBox.value += '\nMaslow_brX: ' + bestGuess.br.x.toFixed(1);
      messagesBox.value += '\nMaslow_brY: ' + bestGuess.br.y.toFixed(1);
      messagesBox.scrollTop
      messagesBox.scrollTop = messagesBox.scrollHeight;

      if(1/bestGuess.fitness > 0.5){
        sendCommand('$/Maslow_tlX=' + bestGuess.tl.x.toFixed(1));
        sendCommand('$/Maslow_tlY=' + bestGuess.tl.y.toFixed(1));
        sendCommand('$/Maslow_trX=' + bestGuess.tr.x.toFixed(1));
        sendCommand('$/Maslow_trY=' + bestGuess.tr.y.toFixed(1));
        sendCommand('$/Maslow_blX=' + bestGuess.bl.x.toFixed(1));
        sendCommand('$/Maslow_blY=' + bestGuess.bl.y.toFixed(1));
        sendCommand('$/Maslow_brX=' + bestGuess.br.x.toFixed(1));
        sendCommand('$/Maslow_brY=' + bestGuess.br.y.toFixed(1));
        refreshSettings(current_setting_filter);
        saveMaslowYaml();

        messagesBox.value += '\nThese values have been automatically saved for you.';
        messagesBox.value += "\nYou MUST restart your machine for them to take effect...I know that is annoying, it's getting fixed ASAP. ";
        messagesBox.scrollTop
        messagesBox.scrollTop = messagesBox.scrollHeight;

        //This restarts the esp32 to prevent you from trying to move the machine after calibration
        setTimeout(function() {
          sendCommand('$System/Control=RESTART');
        }, 2000);
      }

      // allow compute button to be pressed again
      window.computing = false;
      document.querySelector('button#compute-sim-button').disabled = false;
    }
  }

  loop();
  return bestGuess;
}



//This is where the program really begins. The above is all function definitions
//The way that the progam works is that we basically guess where the four corners are and then
//check to see how good that guess was. To see how good a guess was we "draw" circles from the four corner points
//with radiuses of the measured distances. If the guess was good then all four circles will intersect at a single point.
//The closer the circles are to intersecting at a single point the better the guess is.

//Once we've figured out how good our guess was we try a different guess. We keep the good guesses and throw away the bad guesses
//using a genetic algorithm



