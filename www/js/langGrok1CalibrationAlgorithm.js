// Lang-Grok1 Calibration Algorithm
// Ported from the HTML implementation provided in the feature request

const MAX_ITER = 100;
const TOL = 0.01;
const N_PARAMS = 5;

// Gaussian elimination for 5x6 augmented matrix A x = b
function solveGauss(A, x) {
    const n = N_PARAMS;
    for (let p = 0; p < n; p++) {
        let maxr = p;
        for (let i = p + 1; i < n; i++) {
            if (Math.abs(A[i][p]) > Math.abs(A[maxr][p])) maxr = i;
        }
        [A[p], A[maxr]] = [A[maxr], A[p]];
        if (Math.abs(A[p][p]) < 1e-12) return false;
        for (let i = p + 1; i < n; i++) {
            const c = A[i][p] / A[p][p];
            for (let j = p; j <= n; j++) {
                A[i][j] -= c * A[p][j];
            }
        }
    }
    for (let i = n - 1; i >= 0; i--) {
        if (Math.abs(A[i][i]) < 1e-12) return false;
        x[i] = A[i][n];
        for (let j = i + 1; j < n; j++) {
            x[i] -= A[i][j] * x[j];
        }
        x[i] /= A[i][i];
    }
    return true;
}

// 5x5 matrix inversion via Gauss-Jordan
function invert5x5(A) {
    const n = N_PARAMS;
    const aug = A.map((row, i) => [...row, ...Array.from({length: n}, (_, j) => i === j ? 1 : 0)]);
    for (let p = 0; p < n; p++) {
        let maxr = p;
        for (let i = p + 1; i < n; i++) {
            if (Math.abs(aug[i][p]) > Math.abs(aug[maxr][p])) maxr = i;
        }
        [aug[p], aug[maxr]] = [aug[maxr], aug[p]];
        if (Math.abs(aug[p][p]) < 1e-12) return null;

        const c = 1 / aug[p][p];
        for (let j = 0; j < 2 * n; j++) aug[p][j] *= c;

        for (let i = 0; i < n; i++) {
            if (i !== p) {
                const factor = aug[i][p];
                for (let j = 0; j < 2 * n; j++) {
                    aug[i][j] -= factor * aug[p][j];
                }
            }
        }
    }
    const inv = aug.map((row) => row.slice(n, 2 * n));
    return inv;
}

// Compute residuals f (2N) and Jacobian J (2N x 5); if computeAbs, include abs_res_br/bl in return
function computeFAndJ(params, meas, n, computeAbs = false) {
    const x1 = params[0], x2 = params[1], y2 = params[2], x3 = params[3], y3 = params[4];
    const f = new Array(2 * n).fill(0);
    const J = Array.from({length: 2 * n}, () => new Array(N_PARAMS).fill(0));
    let abs_res_br = null;
    let abs_res_bl = null;
    if (computeAbs) {
        abs_res_br = new Array(n).fill(0);
        abs_res_bl = new Array(n).fill(0);
    }
    for (let i = 0; i < n; i++) {
        const tl = meas[i].tl, tr = meas[i].tr, br = meas[i].br, bl = meas[i].bl;
        const diff = tl * tl - tr * tr;
        if (Math.abs(x1) < 1e-9) {
            f[2 * i] = f[2 * i + 1] = 1e18;
            for (let k = 0; k < N_PARAMS; k++) { J[2 * i][k] = J[2 * i + 1][k] = 0; }
            if (computeAbs) { abs_res_br[i] = abs_res_bl[i] = 1e6; }
            continue;
        }
        const xd = (x1 * x1 + diff) / (2 * x1);
        const yd2 = tl * tl - xd * xd;
        if (yd2 < 0) {
            f[2 * i] = f[2 * i + 1] = 1e18;
            for (let k = 0; k < N_PARAMS; k++) { J[2 * i][k] = J[2 * i + 1][k] = 0; }
            if (computeAbs) { abs_res_br[i] = abs_res_bl[i] = 1e6; }
            continue;
        }
        const yd = Math.sqrt(yd2);

        // BR
        const dx_c = xd - x2, dy_c = yd - y2;
        const recon_br = Math.sqrt(dx_c * dx_c + dy_c * dy_c);
        f[2 * i] = dx_c * dx_c + dy_c * dy_c - br * br;
        const dxd_dx1 = 0.5 - diff / (2 * x1 * x1);
        const dyd_dx1 = -xd * dxd_dx1 / yd;
        J[2 * i][0] = 2 * dx_c * dxd_dx1 + 2 * dy_c * dyd_dx1;
        J[2 * i][1] = -2 * dx_c;
        J[2 * i][2] = -2 * dy_c;
        J[2 * i][3] = 0;
        J[2 * i][4] = 0;
        if (computeAbs) abs_res_br[i] = recon_br - br;

        // BL
        const dx_e = xd - x3, dy_e = yd - y3;
        const recon_bl = Math.sqrt(dx_e * dx_e + dy_e * dy_e);
        f[2 * i + 1] = dx_e * dx_e + dy_e * dy_e - bl * bl;
        J[2 * i + 1][0] = 2 * dx_e * dxd_dx1 + 2 * dy_e * dyd_dx1;
        J[2 * i + 1][1] = 0;
        J[2 * i + 1][2] = 0;
        J[2 * i + 1][3] = -2 * dx_e;
        J[2 * i + 1][4] = -2 * dy_e;
        if (computeAbs) abs_res_bl[i] = recon_bl - bl;
    }
    const result = {f, J};
    if (computeAbs) {
        result.abs_res_br = abs_res_br;
        result.abs_res_bl = abs_res_bl;
    }
    return result;
}

function computeThreshold(allAbsRes) {
    const sorted = [...allAbsRes].sort((a, b) => a - b);
    const total = sorted.length;
    const q1Idx = Math.floor(total / 4);
    const q3Idx = Math.floor(3 * total / 4);
    const q1 = sorted[q1Idx];
    const q3 = sorted[q3Idx];
    return q3 + 1.5 * (q3 - q1);
}

// Main solver function (returns {params, stds, residual} or null if fail)
function runSolver(initialParams, meas, nn) {
    let params = [...initialParams];
    let JTJ = Array.from({length: N_PARAMS}, () => new Array(N_PARAMS).fill(0));
    let JTf = new Array(N_PARAMS).fill(0);
    let delta = new Array(N_PARAMS).fill(0);
    let aug = Array.from({length: N_PARAMS}, () => new Array(N_PARAMS + 1).fill(0));

    let converged = false;
    for (let iter = 0; iter < MAX_ITER; iter++) {
        const {f, J} = computeFAndJ(params, meas, nn);

        // Compute J^T J and J^T f
        for (let j = 0; j < N_PARAMS; j++) {
            JTf[j] = 0;
            for (let k = 0; k < N_PARAMS; k++) JTJ[j][k] = 0;
        }
        for (let i = 0; i < 2 * nn; i++) {
            for (let j = 0; j < N_PARAMS; j++) {
                JTf[j] += J[i][j] * f[i];
                for (let k = 0; k < N_PARAMS; k++) {
                    JTJ[j][k] += J[i][j] * J[i][k];
                }
            }
        }

        // Augment
        for (let j = 0; j < N_PARAMS; j++) {
            for (let k = 0; k < N_PARAMS; k++) aug[j][k] = JTJ[j][k];
            aug[j][N_PARAMS] = -JTf[j];
        }

        if (!solveGauss(aug, delta)) {
            return null;
        }

        // Update
        let norm_delta = 0;
        for (let j = 0; j < N_PARAMS; j++) {
            params[j] += delta[j];
            norm_delta += delta[j] * delta[j];
        }
        norm_delta = Math.sqrt(norm_delta);
        if (norm_delta < TOL) {
            converged = true;
            break;
        }
    }

    if (!converged) return null;

    const {f: final_f, J: final_J} = computeFAndJ(params, meas, nn);
    let residual = 0;
    let sum_sq = 0;
    for (let i = 0; i < 2 * nn; i++) {
        residual += Math.abs(final_f[i]);
        sum_sq += final_f[i] * final_f[i];
    }

    // Covariance
    const dof = 2 * nn - N_PARAMS;
    const sigma2 = (dof > 0) ? sum_sq / dof : 0;

    // Recompute JTJ
    const JTJ_final = Array.from({length: N_PARAMS}, () => new Array(N_PARAMS).fill(0));
    for (let i = 0; i < 2 * nn; i++) {
        for (let j = 0; j < N_PARAMS; j++) {
            for (let k = 0; k < N_PARAMS; k++) {
                JTJ_final[j][k] += final_J[i][j] * final_J[i][k];
            }
        }
    }

    const inv_JTJ = invert5x5(JTJ_final);
    if (inv_JTJ === null) return null;

    const stds = new Array(N_PARAMS).fill(0);
    for (let j = 0; j < N_PARAMS; j++) {
        const var_j = inv_JTJ[j][j] * sigma2;
        stds[j] = (var_j > 0) ? Math.sqrt(var_j) : 0;
    }

    return {params, stds, residual};
}

async function runLangGrok1Calibration(measurements) {
    const messagesBox = document.getElementById('messages');
    
    const N = measurements.length;
    if (N < 3) {
        messagesBox.textContent += '\nError: Need at least 3 measurements.\n';
        return null;
    }

    // Adaptive initial guess from first measurement
    let initialParams = [400.0, 800.0, 400.0, 100.0, 800.0];  // Fallback
    const meas0 = measurements[0];
    const tl0 = meas0.tl, tr0 = meas0.tr, br0 = meas0.br, bl0 = meas0.bl;
    const scale_x = (tl0 + tr0) / 2.0;
    const scale_y = (br0 + bl0) / 2.0;
    initialParams = [
        scale_x,
        scale_x + (br0 - bl0)/2.0 + scale_x / 2.0,
        scale_y,
        scale_x / 2.0,
        scale_y
    ];

    messagesBox.textContent += '\n\nLang-Grok1 Calibration Algorithm\n';
    messagesBox.textContent += '================================\n';
    messagesBox.textContent += `Adaptive Init:\n`;
    messagesBox.textContent += `  x1: ${initialParams[0].toFixed(1)} mm\n`;
    messagesBox.textContent += `  x2: ${initialParams[1].toFixed(1)} mm\n`;
    messagesBox.textContent += `  y2: ${initialParams[2].toFixed(1)} mm\n`;
    messagesBox.textContent += `  x3: ${initialParams[3].toFixed(1)} mm\n`;
    messagesBox.textContent += `  y3: ${initialParams[4].toFixed(1)} mm\n`;
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Full fit
    const fullResult = runSolver(initialParams, measurements, N);
    if (fullResult === null) {
        messagesBox.textContent += '\nError: Solver failed for full data.\n';
        return null;
    }

    // Detect outliers
    const outlierResult = computeFAndJ(fullResult.params, measurements, N, true);
    const abs_res_br = outlierResult.abs_res_br;
    const abs_res_bl = outlierResult.abs_res_bl;
    const allAbsRes = [];
    for (let i = 0; i < N; i++) {
        allAbsRes.push(Math.abs(abs_res_br[i]), Math.abs(abs_res_bl[i]));
    }
    const threshold = computeThreshold(allAbsRes);

    const outlierIndices = [];
    for (let i = 0; i < N; i++) {
        if (Math.abs(abs_res_br[i]) > threshold || Math.abs(abs_res_bl[i]) > threshold) {
            outlierIndices.push(i);
        }
    }

    messagesBox.textContent += `\nOutlier Detection:\n`;
    messagesBox.textContent += `  Threshold: ${threshold.toFixed(3)} mm\n`;
    messagesBox.textContent += `  Outliers at indices: [${outlierIndices.join(', ')}]\n`;
    
    if (outlierIndices.length > 0) {
        messagesBox.textContent += '\nDismissed Outlier Points:\n';
        outlierIndices.forEach(idx => {
            const point = measurements[idx];
            messagesBox.textContent += `  Index ${idx}: {bl: ${point.bl.toFixed(2)}, br: ${point.br.toFixed(2)}, tr: ${point.tr.toFixed(2)}, tl: ${point.tl.toFixed(2)}} (BR error: ${Math.abs(abs_res_br[idx]).toFixed(2)} mm, BL error: ${Math.abs(abs_res_bl[idx]).toFixed(2)} mm)\n`;
        });
    } else {
        messagesBox.textContent += '  No outliers detected.\n';
    }

    messagesBox.textContent += `\nFull Fit (with outliers):\n`;
    messagesBox.textContent += `  x1 (B): ${fullResult.params[0].toFixed(1)} ± ${fullResult.stds[0].toFixed(1)} mm\n`;
    messagesBox.textContent += `  x2 (C): ${fullResult.params[1].toFixed(1)} ± ${fullResult.stds[1].toFixed(1)} mm, y2 (C): ${fullResult.params[2].toFixed(1)} ± ${fullResult.stds[2].toFixed(1)} mm\n`;
    messagesBox.textContent += `  x3 (E): ${fullResult.params[3].toFixed(1)} ± ${fullResult.stds[3].toFixed(1)} mm, y3 (E): ${fullResult.params[4].toFixed(1)} ± ${fullResult.stds[4].toFixed(1)} mm\n`;
    messagesBox.textContent += `  Residual sum: ${fullResult.residual.toFixed(3)} mm²\n`;
    messagesBox.scrollTop = messagesBox.scrollHeight;

    let cleanResult = fullResult;
    
    if (outlierIndices.length > 0) {
        // Filter good measurements
        const goodMeasurements = measurements.filter((_, i) => !outlierIndices.includes(i));
        cleanResult = runSolver(fullResult.params, goodMeasurements, goodMeasurements.length);
        if (cleanResult !== null) {
            messagesBox.textContent += `\nCleaned Fit (no outliers):\n`;
            messagesBox.textContent += `  x1 (B): ${cleanResult.params[0].toFixed(1)} ± ${cleanResult.stds[0].toFixed(1)} mm\n`;
            messagesBox.textContent += `  x2 (C): ${cleanResult.params[1].toFixed(1)} ± ${cleanResult.stds[1].toFixed(1)} mm, y2 (C): ${cleanResult.params[2].toFixed(1)} ± ${cleanResult.stds[2].toFixed(1)} mm\n`;
            messagesBox.textContent += `  x3 (E): ${cleanResult.params[3].toFixed(1)} ± ${cleanResult.stds[3].toFixed(1)} mm, y3 (E): ${cleanResult.params[4].toFixed(1)} ± ${cleanResult.stds[4].toFixed(1)} mm\n`;
            messagesBox.textContent += `  Residual sum: ${cleanResult.residual.toFixed(3)} mm²\n`;
        } else {
            messagesBox.textContent += '\nError: Solver failed for cleaned data.\n';
            cleanResult = fullResult; // Fall back to full result
        }
    }
    messagesBox.scrollTop = messagesBox.scrollHeight;

    // Convert to Maslow format and send commands
    // Based on the issue requirements:
    // $/Maslow_brX=x1, $/Maslow_tlX=x3, $/Maslow_tlY=y3, $/Maslow_trX=x2, $/Maslow_brY=y2
    const x1 = cleanResult.params[0];
    const x2 = cleanResult.params[1];
    const y2 = cleanResult.params[2];
    const x3 = cleanResult.params[3];
    const y3 = cleanResult.params[4];

    messagesBox.textContent += '\n\nSending calibration values to firmware:\n';
    messagesBox.textContent += `  $/Maslow_brX=${x1.toFixed(1)}\n`;
    messagesBox.textContent += `  $/Maslow_tlX=${x3.toFixed(1)}\n`;
    messagesBox.textContent += `  $/Maslow_tlY=${y3.toFixed(1)}\n`;
    messagesBox.textContent += `  $/Maslow_trX=${x2.toFixed(1)}\n`;
    messagesBox.textContent += `  $/Maslow_brY=${y2.toFixed(1)}\n`;
    messagesBox.scrollTop = messagesBox.scrollHeight;

    sendCommand(`$/Maslow_brX=${x1.toFixed(1)}`);
    sendCommand(`$/Maslow_tlX=${x3.toFixed(1)}`);
    sendCommand(`$/Maslow_tlY=${y3.toFixed(1)}`);
    sendCommand(`$/Maslow_trX=${x2.toFixed(1)}`);
    sendCommand(`$/Maslow_brY=${y2.toFixed(1)}`);

    // Refresh settings and save to maslow.yaml
    refreshSettings(current_setting_filter);
    saveMaslowYaml();

    messagesBox.textContent += '\nCalibration complete! Settings saved to maslow.yaml.\n';
    messagesBox.scrollTop = messagesBox.scrollHeight;

    return cleanResult;
}
