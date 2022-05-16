//#define GLSLIFY 1
precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;

varying float vIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;

vec3 col1 = vec3(176.0, 46.0, 12.0) / 255.0;
vec3 col2 = vec3(235.0, 69.0, 17.0) / 255.0;
vec3 col3 = vec3(242.0, 244.0, 243.0) / 255.0;
vec3 col4 = vec3(48.0, 52.0, 63.0) / 255.0;
vec3 col5 = vec3(27.0, 32.0, 33.0) / 255.0;

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

    vec3 color = vec3(0.0);

    float speed = 0.2 + id * 0.1;
    uv = abs(uv) - time * speed;
    float freq = 5.0 + id;
    float m = max(uv.x, uv.y) * freq;
    float freq2 = clamp(id * 1.2, 0.5, 2.0);
    float _borderWidth = 0.3;
    float border = step(_borderWidth, mod(m, freq2));

    if (id == 0.0) {
        // rect 1
        color = mix(col1, col2, border);
    } else if (id == 1.0) {
        // rect 2
        color = mix(col3, col4, border);
    } else if (id == 2.0) {
        // rect 3
        color = mix(col2, col5, border);
    } else if (id == 3.0) {
        // rect 4
        color = mix(col3, col1, border);
    } else {
        // rect 5
        color = mix(col5, col2, border);
    }

    gl_FragColor = vec4((color), 1.0);
}