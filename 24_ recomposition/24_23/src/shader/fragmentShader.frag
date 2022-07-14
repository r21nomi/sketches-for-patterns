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
varying vec2 vWeight;

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 weight = (vWeight * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    // https://www.flagcolorcodes.com/switzerland
    vec3 red = vec3(218.0, 41.0, 28.0) / 255.0;
    vec3 white = vec3(255.0, 255.0, 255.0) / 255.0;

    float boldness = 0.25;
    float fx = step(boldness, abs(weight.x));
    float fy = step(boldness, abs(weight.y));

    float _length = 0.9;
    float v = min(fx, fy);
    v = max(step(_length, abs(weight.x)), v);
    v = max(step(_length, abs(weight.y)), v);

    vec3 color = mix(white, red, v);

    gl_FragColor = vec4(color, 1.0);
}