// This Source Code Form is subject to the terms of the Mozilla Public
// License, v. 2.0. If a copy of the MPL was not distributed with this
// file, You can obtain one at http://mozilla.org/MPL/2.0/.
//
// Input:  Transformation matrix M
//         [m11 m21 m31 m41]
//         [m12 m22 m32 m42]
//         [m13 m23 m33 m43]
//         [m14 m24 m34 m44]   with m44 != 0
//
// Output: Decomposed matrix M
//         [s1u11 u21   u31   tx]
//         [XS    s2u22 u32   ty]
//         [YS    ZS    s3u33 tz]
//         [px    py    pz    C ]
//
// Modulo a non-zero scalar, M is the product of:
//
// translate3d(tx, ty, tz)
// [1 0 0 tx ]
// [0 1 0 ty ]
// [0 0 1 tz ]
// [0 0 0 1  ]
//
// rotate3d(X, Y, Z, 2 * acos(C) radian)
// [1 - 2*(YS*YS+ZS*ZS), 2*(XS*YS - ZS*C)     , 2*(XS*ZS + YS*C)     , 0]
// [2 *(XS*YS + ZS*C)  , 1 - 2*(XS*XS + ZS*ZS), 2*(YS*ZS - XS*C)     , 0]
// [2*(XS*ZS - YS*C)   , 2*(YS*ZS + XS*C)     , 1 - 2*(XS*XS + YS*YS), 0]
// [0                  , 0                    , 0                    , 1]
//
// scale3d(s1, s2, s3)
// [s1 0  0  0 ]
// [0  s2 0  0 ]     (with s_i = 1 if u_ii = 0)
// [0  0  s3 0 ]
// [0  0  0  1 ]
//
// matrix3d(u11, 0, 0, 0, u21, u22, 0, 0, u31, u32, u33, 0, 0, 0, 1)
// [u11 u21 u31 0 ]
// [0   u22 u32 0 ]  (upper triangular with u_ii = 0 or 1)
// [0   0   u33 0 ]
// [0   0   0   1 ]
//
// matrix3d(1, 0, 0, px,  0, 1, 0, py,    0, 0, 1, pz,   0, 0, 0, 1)
// [1  0  0  0  ]
// [0  1  0  0  ]
// [0  0  1  0  ]
// [px py pz 1 ]
//
function decomposeTransform(M) {
    if (!M[3][3])
        return false;

    // Normalize the matrix.
    for (var j = 0; j < 4; j++) {
        for (var i = 0; i < 4; i++)
            M[j][i] /= M[3][3];
    }

    // Translation (tx, ty, tz) and perspective (px, py, pz) are already
    // at the expected location. Nothing to do.

    //////////////////// QR Factorization ////////////////////

    function normalizeVector(v) {
        var norm = Math.hypot(v[0], v[1], v[2]);
        v[0] /= norm;
        v[1] /= norm;
        v[2] /= norm;
    }

    function applyHouseholderReflection(v, M) {
        // Left-multiply M by Qv = I - 2 v v^T using the formula
        // Qv [ col0 | col1 | col2] = [ Qv col | Qv col1 | Qv col2]
        for (var j = 0; j < 3; j++) {
            var column = M[j].slice();
            for (var i = 0; i < 3; i++) {
                M[j][i] = 0;
                for (var k = 0; k < 3; k++) {
                    var Qv_ki = ((i == k ? 1 : 0) - 2 * v[i] * v[k]);
                    M[j][i] += Qv_ki * column[k];
                }
            }
        }
    }

    function applyScale(s, M) {
        // Left-multiply M by s = diag(s0, s1, s2) using the formula
        //   [ row0 ]   [ s0 row0 ]
        // s [ row1 ] = [ s1 row1 ]
        //   [ row2 ]   [ s2 row2 ]
        for (var j = 0; j < 3; j++) {
            for (var i = 0; i < 3; i++) {
                M[j][i] *= s[i];
            }
        }
    }

    // Determine Q1, Q2, Q3 and modify M in place to get R = Q3 Q2 Q1 A.
    var detQ2Q1 = 1;

    var v1;
    if (M[0][1] || M[0][2]) {
        let alpha = Math.hypot(M[0][0], M[0][1], M[0][2]);
        if (Math.abs(-alpha - M[0][0]) > Math.abs(alpha - M[0][0]))
            alpha = -alpha;
        v1 = [M[0][0] - alpha, M[0][1], M[0][2]];
        normalizeVector(v1);
        applyHouseholderReflection(v1, M);
        detQ2Q1 = -detQ2Q1;
    }

    var v2;
    if (M[1][2]) {
        let alpha = Math.hypot(M[1][1], M[1][2]);
        if (Math.abs(-alpha - M[1][1]) > Math.abs(alpha - M[1][1]))
            alpha = -alpha;
        v2 = [0, M[1][1] - alpha, M[1][2]];
        normalizeVector(v2);
        applyHouseholderReflection(v2, M);
        detQ2Q1 = -detQ2Q1;
    }

    var epsilon3 = M[2][2] < 0 ? -1 : 1;
    var epsilon2 = M[1][1] < 0 ? -1 : 1;
    var Q3 = [detQ2Q1 * epsilon2 * epsilon3, epsilon2, epsilon3];
    applyScale(Q3, M);

    // Calculate Q = Q1 Q2 Q3
    var Q = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
    applyScale(Q3, Q);
    if (v2) applyHouseholderReflection(v2, Q);
    if (v1) applyHouseholderReflection(v1, Q);

    // Determine the quaternion representing the rotation.
    // C = cos(rotation angle/2), S = sin(rotation angle/2)
    // (X, Y, Z) = vector axis
    var C  = .5 * Math.sqrt(Math.max(1 + Q[0][0] + Q[1][1] + Q[2][2], 0));
    var XS = 0, YS = 0, ZS = 0;
    if (C < 1) {
        XS = .5 * Math.sqrt(Math.max(1 + Q[0][0] - Q[1][1] - Q[2][2], 0));
        YS = .5 * Math.sqrt(Math.max(1 - Q[0][0] + Q[1][1] - Q[2][2], 0));
        ZS = .5 * Math.sqrt(Math.max(1 - Q[0][0] - Q[1][1] + Q[2][2], 0));
        if (C > 0) {
            if (Q[1][2] - Q[2][1] < 0) XS = -XS; // q23 - q32 = 4XSC
            if (Q[2][0] - Q[0][2] < 0) YS = -YS; // q31 - q13 = 4YSC
            if (Q[0][1] - Q[1][0] < 0) ZS = -ZS; // q12 - q21 = 4ZSC
        } else {
            // q12 + q21 = 4 XS YS
            if ((Q[0][1] + Q[1][0]) * XS * YS < 0)
                YS = -YS;
            // q31 + q13 = 4 XS ZS and q23 + q32 = 4 YS ZS
            if (((Q[2][0] + Q[0][2]) * XS * ZS < 0) ||
                ((Q[2][0] + Q[0][2]) * YS * ZS < 0))
                ZS = -ZS;
        }
    }

    // Set the quaternion in the remaining space.
    // [*  *  * *]
    // [XS *  * *]
    // [YS ZS * *]
    // [*  *  * C]
    M[0][1] = XS;
    M[0][2] = YS;
    M[1][2] = ZS;
    M[3][3] = C;

    // Unscale R
    if (M[0][0]) { M[1][0] /= M[0][0]; M[2][0] /= M[0][0]; }
    if (M[1][1]) { M[2][1] /= M[1][1]; }

    return true;
}

// Input:  Decomposed matrix M
//         [s1u11 u21   u31   tx ]
//         [XS    s2u22 u32   ty ]
//         [YS    ZS    s3u33 tz ]
//         [px    py    pz    C  ]
//
// Output: Transformation matrix M
//         [m11 m21 m31 m41]
//         [m12 m22 m32 m42]
//         [m13 m23 m33 m43]
//         [m14 m24 m34 1]
//
function recomposeTransform(M) {
    // Translation (tx, ty, tz) and perspective (px, py, pz) are already
    // at the expected location. Nothing to do.

    // Apply the scale.
    if (M[0][0]) { M[1][0] *= M[0][0]; M[2][0] *= M[0][0]; }
    if (M[1][1]) { M[2][1] *= M[1][1]; }

    // Extract the quaternion and reset the 1 at the bottom right corner
    // as well as the 0's below the diagonal of M.
    var XS = M[0][1]; M[0][1] = 0;
    var YS = M[0][2]; M[0][2] = 0;
    var ZS = M[1][2]; M[1][2] = 0;
    var C = M[3][3]; M[3][3] = 1;

    // Apply the quaternion.
    // Left-multiply M by Q using the formula
    // Q [ col0 | col1 | col2] = [ Q col | Q col1 | Q col2]
    var Q = [
        [1 - 2*(YS*YS+ZS*ZS), 2 *(XS*YS + ZS*C),     2*(XS*ZS - YS*C)     ],
        [2*(XS*YS - ZS*C),    1 - 2*(XS*XS + ZS*ZS), 2*(YS*ZS + XS*C)     ],
        [2*(XS*ZS + YS*C),    2*(YS*ZS - XS*C),      1 - 2*(XS*XS + YS*YS)]
    ];
    for (var j = 0; j < 3; j++) {
        var column = M[j].slice();
        for (var i = 0; i < 3; i++) {
            M[j][i] = 0;
            for (var k = 0; k < 3; k++)
                M[j][i] += Q[k][i] * column[k];
        }
    }
}

// Input:  Decomposed matrix M
//         [s1u11 u21   u31   tx ]
//         [XS    s2u22 u32   ty ]
//         [YS    ZS    s3u33 tz ]
//         [px    py    pz    C  ]
//
//         Optional a number formating function
//         e.g. (x) => { return Math.round(x) * 1000 / 1000 }
//
//
// Return value: A CSS transform property.
function serializeTransform(M, formatNumber) {
    var value = "", parameters;

    function f(x) { return formatNumber ? formatNumber(x) : x; };

    // Translation
    parameters = `${f(M[3][0])}px, ${f(M[3][1])}px, ${f(M[3][2])}px`;
    if (parameters != "0px, 0px, 0px")
        value += `translate3d(${parameters}) `;

    // Rotation
    var S = Math.sqrt(Math.max(1 - M[3][3] * M[3][3], 0));
    if (S > 0) {
        parameters = `${f(360 * Math.acos(M[3][3]) / Math.PI)}deg`
        if (parameters != "0")
            value += `rotate3d(${f(M[0][1] / S)}, ${f(M[0][2] / S)}, ${f(M[1][2] / S)}, ${parameters}) `;
    }

    // Scale
    parameters = `${f(M[0][0] || 1)}, ${f(M[1][1] || 1)}, ${f(M[2][2] || 1)}`;
    if (parameters != "1, 1, 1")
        value += `scale3d(${parameters}) `;

    // Upper triangular and perspective
    var px = `${f(M[0][3])}`;
    var py = `${f(M[1][3])}`;
    var pz, d;
    if (px == "0" && py == "0" && M[2][3] < 0) {
        parameters = `${f(-1/M[2][3])}`;
        if (parameters != "0")
            d = parameters;
    }
    if (!d)
        pz = `${f(M[2][3])}`;
    parameters = `${f((M[0][0] ? 1 : 0))}, 0, 0, ${px}, ${f(M[1][0])}, ${f((M[1][1] ? 1 : 0))}, 0, ${py}, ${f(M[2][0])}, ${f(M[2][1])}, ${f((M[2][2] ? 1 : 0))}, ${pz ? pz : 0}, 0, 0, 0, 1`;
    if (parameters != "1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1")
        value += `matrix3d(${parameters}) `;
    if (d)
        value += `perspective(${d})`;

    return value.length ? value.trim() : "none";
}
