//#define GLSLIFY 1

uniform vec2 resolution;
uniform float time;

varying vec2 vUv;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

void main() {
    vec2 uv = 2.0 * vUv - 1.0;
    uv += time * 0.001;

    vec3 color = mix(
        vec3(0.18, 0.24, 0.6),
        vec3(0.18, 0.24, 0.7),
        uv.y
    );

    float n = rand(uv) * 0.25;
    color = mix(color, vec3(1.0), n);

    gl_FragColor = vec4(color, n);
}