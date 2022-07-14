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

    float d = 2.0;
    float c = fract(length(weight * d) - time);
    float v = step(0.5, c);

    vec3 color = mix(mix(vec3(1.0, 1.0, 0.0), vec3(0.0, 0.0, 1.0), c), vec3(1.0), v);

    gl_FragColor = vec4(color, 1.0);
}