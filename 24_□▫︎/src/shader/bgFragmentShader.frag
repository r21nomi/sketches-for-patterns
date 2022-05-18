//#define GLSLIFY 1

#define PI 3.14159265358979323846

uniform vec2 resolution;
uniform float time;

varying vec2 vUv;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

float rand(vec2 p) {
    p+=.2127+p.x*.3713*p.y;
    vec2 r=4.789*sin(489.123*(p));
    return fract(r.x*r.y);
}

void main() {
    vec2 uv = 2.0 * vUv - 1.0;

    float n = rand(floor(vec2(4.0, 2.0) * uv.xy * 60.0) + time * 0.1) * 0.08;
    vec3 color = mix(vec3(1.0), vec3(0.0), n);

    gl_FragColor = vec4(color, n);
}