precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;

varying float vIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;
varying float vDirection;

// https://coolors.co/add7f6-a9fdac-3f8efc-2667ff-3b28cc
vec3 col1 = vec3(173.0, 215.0, 246.0) / 255.0;
vec3 col2 = vec3(169.0, 253.0, 172.0) / 255.0;
vec3 col3 = vec3(63.0, 142.0, 252.0) / 255.0;
vec3 col4 = vec3(38.0, 103.0, 255.0) / 255.0;
vec3 col5 = vec3(59.0, 40.0, 204.0) / 255.0;

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
        color = mix(col2, col1, v);
    } else if (id == 1.0) {
        // rect 2
        color = mix(col3, col2, v);
    } else if (id == 2.0) {
        // rect 3
        color = mix(col4, col5, v);
    } else if (id == 3.0) {
        // rect 4
        color = mix(col3, col1, v);
    } else {
        // rect 5
        color = mix(col4, col2, v);
    }
    return color;
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
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
    vec2 dir = vec2(1.0);

    if (vDirection > 0.5) {
        // vertical stripe
        dir = vec2(0.0, time * speed);
    } else if (vDirection < 0.0) {
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
    }

    uv += dir;

    float f1 = 5.0 * id;
    vec2 uv1 = floor(uv * f1) / f1;
    uv1 += rand(uv + time);

    float f2 = 5.0 * id;
    vec2 uv2 = floor(uv * f2) / f2;
    uv2 += rand(uv + time);

    float n1 = snoise(vec2(uv1.y, uv1.y * 0.1) + dir);
    float n2 = snoise(vec2(uv2.x * 0.1, uv2.x) + dir);
    float v = max(step(rand(uv1), n1), step(rand(uv2), n2));
    if (v == 0.0) {
//        v = step(0.5, rand(uv)) * 0.9;
    }
    color = getColor(id, v);

    float borderWidth = 2.0;
    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}