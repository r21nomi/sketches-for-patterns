//#define GLSLIFY 1
precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform float rowNum;

varying float vIndex;
varying vec2 vUv;
varying vec3 vColor;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

mat2 rotate(float angle) {
    return mat2(
        cos(angle), -sin(angle),
        sin(angle), cos(angle)
    );
}

float ease_in_out_expo(float x) {
    float t=x; float b=0.; float c=1.; float d=1.;
    if (t==0.) return b;
    if (t==d) return b+c;
    if ((t/=d/2.) < 1.) return c/2. * pow(2., 10. * (t - 1.)) + b;
    return c/2. * (-pow(2., -10. * --t) + 2.) + b;
}

float ease_in_out_cubic(float x) {
    float t=x; float b=0.; float c=1.; float d=1.;
    if ((t/=d/2.) < 1.) return c/2.*t*t*t + b;
    return c/2.*((t-=2.)*t*t + 2.) + b;
}

const float PI = 3.14159;

void main() {
    vec2 uv = 2.0 * vUv - 1.0;

    uv *= rotate(mod((time + vIndex*0.01) * 360.0, 360.0) * PI / 180.0);
//    uv *= rotate(time + vIndex);

    float speed = time * 1.0 + mod(vIndex, rowNum) * 0.1;
    float ease = ease_in_out_expo(fract(speed));
    ease = mix(ease, fract(speed), 0.15);
    uv.x += uv.x * sin(PI * ease) * 0.25;
    float ballRadius = 0.5 + sin(PI * ease) * 0.3;
    float ball = 1.0 - step(ballRadius, length(uv));
    vec3 ballColor = mix(
        mix(vec3(0.2, 0.3, 0.55), vec3(1.5), (uv.x + uv.y) * 0.35),
        mix(vec3(0.6, 0.2, 0.6), vec3(0.8), (uv.x + uv.y)),
        (uv.x + uv.y) * 0.45
    );
//    vec3 ballColor = mix(
//        mix(vec3(0.7), vec3(0.9), (uv.x + uv.y) * 0.35),
//        mix(vec3(0.3), vec3(1.0), (uv.x + uv.y)),
//        (uv.x + uv.y) * 0.45
//    );

    float ringRadius = ballRadius;
    float ring = step(ringRadius, length(uv)) * (1.0 - step(ringRadius + 0.08, length(uv)));
    float outputAlpha = ball + ring;
    vec3 ringColor = mix(
        vec3(0.6),
        vec3(0.0, 0.0, 0.3),
        uv.x + uv.y
    );
//    vec3 ringColor = mix(
//        vec3(0.7),
//        vec3(0.8),
//        uv.x + uv.y
//    );

    vec3 color = mix(ballColor, ringColor, step(ball, ring));

    gl_FragColor = vec4(color, outputAlpha);
}