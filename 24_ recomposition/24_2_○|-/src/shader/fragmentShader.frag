precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;

varying float vIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;
varying float vDirection;

// https://coolors.co/2a2b2e-fe5d26-a4c2a8-826aed-87ff65
vec3 col1 = vec3(42.0, 43.0, 46.0) / 255.0;
vec3 col2 = vec3(254.0, 93.0, 38.0) / 255.0;
vec3 col3 = vec3(164.0, 194.0, 168.0) / 255.0;
vec3 col4 = vec3(130.0, 106.0, 237.0) / 255.0;
vec3 col5 = vec3(135.0, 255.0, 101.0) / 255.0;

mat2 rotate(float angle) {
    return mat2(
        sin(angle), -cos(angle),
        cos(angle), sin(angle)
    );
}

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

vec3 getColor(float id, float v) {
    vec3 color;
    if (id == 0.0) {
        // rect 1
        color = mix(col4, col1, v);
    } else if (id == 1.0) {
        // rect 2
        color = mix(col4, col2, v);
    } else if (id == 2.0) {
        // rect 3
        color = mix(col4, col3, v);
    } else if (id == 3.0) {
        // rect 4
        color = mix(col4, col5, v);
    } else {
        // rect 5
        color = mix(col5, col2, v);
    }
    return color;
}

// Simplex 2D noise
//
vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
}

void main() {
    vec2 uv = 2.0 * vUv - 1.0;
    uv.x *= (vResolution.x / vResolution.y);// make horizontal value begger than 1 (this makes precise circle)

    float id = floor(mod(vIndex, 4.8));

    vec3 color = vec3(0.0);

    float speed = 0.2 + id * 0.1;
    float freq = clamp(pow(id, 2.0), 1.0, 4.0);
    float m = max(uv.x, uv.y) * freq;
    float freq2 = clamp(id * 1.2, 0.5, 2.0);
    float _borderWidth = 0.3;
    float v = step(_borderWidth, mod(m, freq2));

    if (vDirection > 0.5) {
        // vertical stripe
        uv *= (id + 1.0);
        uv.x += time * (id + 3.0);
        uv.x = fract(uv.x);
        uv.x -= 0.5;
        float v = step(0.5, fract(uv.x));
        color = getColor(id, v);
    } else if (vDirection < 0.0) {
        if (mod(id, 2.0) == 0.0) {
            // Dot
            uv *= (id + 10.0);
            vec2 id2 = floor(uv);
            uv = fract(uv);
            uv -= 0.5;
            float r = 0.35 * snoise(id2) + 0.15;
            float v = step(r, fract(time * 2.0 - snoise(id2)));
            color = getColor(id, v);
        } else {
            // Ripple
            float l = 7.0;
            uv = floor(uv * l) / l;
            float v = step(0.5, fract(length(uv * 2.0) - time * id));
            color = getColor(id, v);
        }
    } else {
        // horizontal stripe
        uv *= (id + 1.0);
        uv.y += time * (id + 3.0);
        uv.y = fract(uv.y);
        uv.y -= 0.5;
        float v = step(0.5, fract(uv.y));
        color = getColor(id, v);
    }

    float borderWidth = 4.0;
    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4((color), transparency);
}