precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;

varying float vIndex;
varying float vTotalIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;
varying float vDirection;
varying float vRatio;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

float rand(vec2 c){
    return fract(sin(dot(c.xy ,vec2(12.9898,78.233))) * 43758.5453);
}

mat2 rotate(float angle) {
    return mat2(
        sin(angle), -cos(angle),
        cos(angle), sin(angle)
    );
}

float rect(vec2 size, vec2 uv) {
    float cc1 = step(size.x, abs(length(uv.x)));
    float cc2 = step(size.y, abs(length(uv.y)));
    return max(cc1, cc2);
}

float x(vec2 uv, float size, float boldness) {
    float c1 = rect(vec2(size), vec2(uv.x, uv.y * boldness));
    float c2 = rect(vec2(size), vec2(uv.x * boldness, uv.y));
    return min(c1, c2);
}

float _(vec2 uv, vec2 size, float boldness) {
    return rect(size, vec2(uv.x, uv.y * boldness));
}

float l(vec2 uv, vec2 size, float boldness) {
    return rect(size, vec2(uv.x * boldness, uv.y));
}

float stripe(float uv, float freq, float boldness) {
    return step(boldness, length(fract(uv * freq)));
}

float stripeBox(vec2 uv, float freq, float boldness, float _time) {
    uv = abs(uv * freq) + _time;
    float m = max(uv.x, uv.y);
    float v = step(boldness, mod(m, 1.0));
    return v;
}

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 uvAspect = vResolution / min(vResolution.x, vResolution.y);

    float id = floor(mod(vIndex, 4.0));

    float v = 0.0;
    float t = time * 0.5;

    // +++
    if (vDirection > 0.5) {
        // horizontal
        uv.x += t;
    } else {
        // vertical
        uv.y -= t;
    }
    uv *= rotate(floor(rand(vec2(vIndex)) * 2.0) * 45.0 * PI / 180.0);
    vec2 _id = uv * (1.0 + rand(vec2(vIndex)) * 10.0);
    vec2 maxUV = uvAspect * (1.0 + rand(vec2(vIndex)) * 10.0);
    uv = fract(_id);
    uv -= 0.5;
    float dir;
    if (vDirection > 0.5) {
        // horizontal
        dir = floor(_id).y;
    } else {
        // vertical
        dir = floor(_id).x;
    }
    v = x(uv, map(sin(dir - time * 3.0), -1.0, 1.0, 0.15, 0.5), 4.0);

    vec3 obj = vec3(rand(vec2(id * 1.0)) * 0.05);
    vec3 bg = vec3(1.0);

    vec3 color = mix(obj, bg, v);

    gl_FragColor = vec4(color, 1.0);
}