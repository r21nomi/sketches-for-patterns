//#define GLSLIFY 1
precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;
uniform float rowNum;

varying float vIndex;
varying float vIndexRatio;
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

//    uv *= rotate(mod((time * 0.1) * 360.0, 360.0) * PI / 180.0);

    vec3 color = mix(
        mix(vec3(0.2, 0.3, 0.55), vec3(1.0, 0.0, 0.0), (uv.x + uv.y) * 0.35),
        mix(vec3(0.6, 0.7, 0.9), vec3(1.0), (uv.x + uv.y)),
        (uv.x + uv.y) * 0.45
    );
    color = mix(
        mix(vec3(0.949,0.314,0.482), vec3(0.949,0.686,0.627), vIndexRatio),
        mix(vec3(0.004,0.18,0.251), vec3(0.012,0.651,0.651), vIndexRatio),
        (uv.x + uv.y) * 0.5
    );

    float borderWidth = 0.5;
    float l = step(vResolution.x * vUv.x, borderWidth)
            + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
            + step(vResolution.y *vUv.y, borderWidth)
            + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    color = mix(color, vec3(0.004,0.18,0.251), l);
    float transparency = mix(1.0, 0.2, l);

    gl_FragColor = vec4(color, transparency);
}