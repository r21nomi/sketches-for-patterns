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

    // https://www.flagcolorcodes.com/sweden
    vec3 blue = vec3(0.0, 106.0, 167.0) / 255.0;
    vec3 yellow = vec3(254.0, 204.0, 2.0) / 255.0;

    float boldness = 0.23;
    float fx = step(boldness, abs(weight.x + 0.4));
    float fy = step(boldness, abs(weight.y));
    float v = min(fx, fy);

    vec3 color = mix(yellow, blue, v);

    gl_FragColor = vec4(color, 1.0);
}