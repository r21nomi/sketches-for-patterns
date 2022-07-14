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

// https://coolors.co/ff1053-6c6ea0-66c7f4-c1cad6-ffffff
vec3 col1 = vec3(255.0, 16.0, 83.0) / 255.0;
vec3 col2 = vec3(108.0, 110.0, 160.0) / 255.0;
vec3 col3 = vec3(102.0, 199.0, 244.0) / 255.0;
vec3 col4 = vec3(193.0, 202.0, 214.0) / 255.0;
vec3 col5 = vec3(255.0, 255.0, 255.0) / 255.0;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec3 getSingleColor(float id, float v) {
    vec3 color;
    float r = floor(rand(vec2(v * 360.0)) * 5.0);
    id = r;
    if (id == 0.0) {
        // rect 1
        color = col1;
    } else if (id == 1.0) {
        // rect 2
        color = col2;
    } else if (id == 2.0) {
        // rect 3
        color = col3;
    } else if (id == 3.0) {
        // rect 4
        color = col4;
    } else {
        // rect 5
        color = col5;
    }
    return color;
}

void main() {
    vec2 uv = 2.0 * vUv - 1.0;
    uv.x *= (vResolution.x / vResolution.y);// make horizontal value begger than 1 (this makes precise circle)

    float id = floor(mod(vIndex, 4.8));

    vec3 color = vec3(0.0);
    float speed = 0.2 + id * 0.1;
    vec2 dir = vec2(1.0);
    float dirXY;
    float v = 0.0;

    if (vDirection > 0.5) {
        // vertical stripe
        dir = vec2(0.0, time * speed);
        dirXY = uv.x;
    } else if (vDirection < 0.0) {
        dirXY = uv.x;
        if (mod(id, 2.0) == 0.0) {
            //
            dir = vec2(0.0, -time * speed * 0.5);
        } else {
            //
            dir = vec2(-time * speed * 0.5, 0.0);
        }
    } else {
        // horizontal stripe
        dir = vec2(time * speed, 0.0);
        dirXY = uv.y;
    }

    uv += dir;
    v = step(vRatio, fract(dirXY * vRatio * 100.0));

    color = getSingleColor(id, v * floor(vIndex * vRatio));

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