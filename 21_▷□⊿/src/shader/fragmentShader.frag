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

    float id = floor(mod(vIndex, 4.8));

    vec3 col1 = vec3(0.0);
    vec3 col2 = vec3(0.0);
    vec3 color = vec3(0.0);
    col1 = vec3(0.9, 0.9, 0.8);
    col2 = vec3(0.1, 0.85, 0.2);

    if (id == 0.0) {
        // Circle
        uv.x *= (vResolution.x / vResolution.y);// make horizontal value begger than 1 (this makes precise circle)
        vec2 uv1 = uv;
        uv *= rotate(45.0 * vIndex * PI / 180.0);
        uv.x += time;
        vec2 uv2 = fract(uv * 5.0);
        float l = step(0.5, length(uv2.x));
        color = mix(col1, col2, step(0.6, max(length(uv1), l)));
    } else if (id == 1.0) {
        // Stripe
        uv *= rotate(45.0 * vIndex * PI / 180.0);
        uv.y += time;
        uv = fract(uv * 5.0);
        float l = step(0.5, length(uv.y));
        color = mix(col1, col2, step(0.6, l));
    } else if (id == 2.0) {
        // zigzag
        float offset = 1.0 + mod(vIndex, 4.0);
        vec2 tile = uv;
        tile.x *= offset;
        tile.x += time;
        tile.y += 0.5;
        float x = tile.x * 2.0;
        float a = floor(1.0 + sin(x * PI));
        float b = floor(1.0 + sin((x + 1.0) * PI));
        float f = fract(x);
        float v = step(mix(a, b, f), tile.y);
        color = mix(col1, col2, v);
    } else if (id == 3.0) {
        // ripple
        uv.x *= vResolution.x / vResolution.y;
        float offset = 1.0 + mod(vIndex, 4.0);
        float f = step(0.5, fract(length(uv) * offset - time));
        color = mix(col1, col2, f);
    } else {
        //    uv *= rotate((90.0 * mod(vIndex, 2.0)) * PI / 180.0);
        uv *= rotate((90.0 * vIndex) * PI / 180.0);
        //    uv *= rotate(time*2.0);
        uv = uv * 0.5 + 0.5;
        color = mix(col1, col2, step(1.0, uv.x + uv.y));
    }

    float borderWidth = 1.0;
    float l = step(vResolution.x * vUv.x, borderWidth)
            + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
            + step(vResolution.y *vUv.y, borderWidth)
            + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}