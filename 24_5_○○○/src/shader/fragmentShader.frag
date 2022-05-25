precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;

varying float vIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;
varying float vDirection;
varying float vRatio;

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);

    float id = floor(mod(vIndex, 4.8));
    if (id == 0.0) {
        id = 1.0;
    }

    vec3 color = vec3(0.0);
    float idTime = time * id;
    float ff = mod(idTime, 4.0);
    float ccSize = 0.5;
    float fffMax = 1.0 - ccSize;
    float fff = (fract(idTime) * 2.0 - 1.0) * fffMax;
    vec2 dd = vec2(1.0);

//    vec2 ooo = vResolution.xy / min(vResolution.x, vResolution.y);
//    vec2 ooo2 = vec2(0.0);
//    if (ooo.x > ooo.y) {
//        ooo *= vec2(2.0, 1.0);
//        ooo2 = vec2(ccSize / 1.0, 0.0);
//    } else {
//        ooo *= vec2(1.0, 2.0);
//        ooo2 = vec2(0.0, ccSize / 1.0);
//    }

    if (ff < 1.0) {
        // left
        dd = vec2(fff, fffMax);
//        ooo2 *= -1.0;
    } else if (ff < 2.0) {
        // up
        dd = vec2(fffMax, -fff);
//        ooo2 *= -1.0;
    } else if (ff < 3.0) {
        // right
        dd = vec2(-fff, -fffMax);
    } else {
        // down
        dd = vec2(-fffMax, fff);
    }

//    float cc = step(ccSize, length(uv + dd * ooo + ooo2));
    float cc = step(ccSize, length(uv + dd));
    color = vec3(cc);

    float borderWidth = 2.0;
    if (vRatio < 0.01) {
        borderWidth = 0.0;
    } else {
        borderWidth = 2.0;
    }
    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}