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

mat2 rotate(float angle) {
    return mat2(
    sin(angle), -cos(angle),
    cos(angle), sin(angle)
    );
}

float rect(vec2 size, vec2 uv) {
    float cc = step(size.x, length(uv.x));
    return max(cc, step(size.y, length(uv.y)));
}

float x(vec2 uv, float size, float boldness) {
    float c = rect(vec2(size), vec2(uv.x, uv.y * boldness));
    return min(c, rect(vec2(size), vec2(uv.x * boldness, uv.y)));
}

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 uvAspect = vResolution / min(vResolution.x, vResolution.y);

    float id = floor(mod(vIndex, 4.0));
    if (id == 0.0) {
        id = 1.0;
    }

    float initialAngle = 0.0;
    float velocity = 1.0 * vRatio;
    uv *= rotate((initialAngle + 360.0 * velocity) * PI / 180.0);

    float v = x(uv, 1.0, 5.0);

    vec3 obj = mix(vec3(0.0, 0.0, 0.98), vec3(1.0), vRatio * 5.0);
    vec3 bg = vec3(0.9);
    vec3 color = mix(obj, bg, v);

    gl_FragColor = vec4(color, 1.0);
}