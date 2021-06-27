//#define GLSLIFY 1

uniform vec2 resolution;
uniform float time;

varying vec2 vUv;

const float PI = 3.14159;

float rand(float t) {
    return fract(sin(t * 1234.0) * 5678.0);
}

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

void main() {
    vec2 uv = (vUv * resolution.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    uv *= 40.0;
    vec2 id = floor(uv);
    vec3 color = vec3(1.0);
    float vv = 360.0;
    float t = mod(time * 360.0, vv);

    vec3 bg = vec3(0.0, 0.1, 0.2);
    vec3 col1 = vec3(0.0, 0.5, 0.8);
    vec3 col2 = vec3(0.6, 0.0, 0.3);

    id.x -= id.y * 50.0;

    if (mod(id.x, 2.0) == 0.0) {
        id.x += id.y;

        color = mix(
            mix(col1, col2, step(1.0, mod(uv.x, 4.0))),
            bg,
            (sin(uv.y * 0.05 + rand(id.x) * 10.0 + 360.0 * t / vv * PI / 180.0))
        );
    } else {
        color = bg;
    }

    gl_FragColor = vec4(color, 1.0);
}