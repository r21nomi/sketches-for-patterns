//#define GLSLIFY 1
precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;

varying float vIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;

mat2 rotate(float angle) {
    return mat2(
        sin(angle), -cos(angle),
        cos(angle), sin(angle)
    );
}

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

void main() {
    vec2 uv = 2.0 * vUv - 1.0;
//    uv.x *= (vResolution.x / vResolution.y);// make horizontal value begger than 1 (this makes precise circle)

    float id = floor(mod(vIndex, 4.8));

    vec3 col1 = vec3(0.0);
    vec3 col2 = vec3(0.0);
    vec3 color = vec3(0.0);
    col1 = vec3(0.9, 0.9, 0.8);
    col2 = vec3(0.1, 0.85, 0.2);

    if (id == 0.0) {
        // rect 1
        uv = abs(uv);
        float freq = 5.0;
        float m = max(uv.x, uv.y) * freq;
        float borderWidth = 0.3;
        float border = step(borderWidth, mod(m, 1.0));
        color = mix(col1, col2, border);
    } else if (id == 1.0) {
        // rect 1
        uv = abs(uv);
        float freq = 5.0;
        float m = max(uv.x, uv.y) * freq;
        float borderWidth = 0.3;
        float border = step(borderWidth, mod(m, 1.0));
        color = mix(col1, col2, border);
    } else if (id == 2.0) {
        // rect 1
        uv = abs(uv);
        float freq = 5.0;
        float m = max(uv.x, uv.y) * freq;
        float borderWidth = 0.3;
        float border = step(borderWidth, mod(m, 1.0));
        color = mix(col1, col2, border);
    } else if (id == 3.0) {
        // rect 1
        uv = abs(uv);
        float freq = 5.0;
        float m = max(uv.x, uv.y) * freq;
        float borderWidth = 0.3;
        float border = step(borderWidth, mod(m, 1.0));
        color = mix(col1, col2, border);
    } else {
        // rect 1
        uv = abs(uv);
        float freq = 5.0;
        float m = max(uv.x, uv.y) * freq;
        float borderWidth = 0.3;
        float border = step(borderWidth, mod(m, 1.0));
        color = mix(col1, col2, border);
    }

    float borderWidth = 0.0;
    float l = step(vResolution.x * vUv.x, borderWidth)
            + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
            + step(vResolution.y *vUv.y, borderWidth)
            + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}