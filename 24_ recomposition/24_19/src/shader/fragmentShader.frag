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
varying float vWeight;

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);

    vec3 color = vec3(0.0);

    if (vWeight < 0.35) {
        color = vec3(1.0, 0.0, 0.0);
    } else {
        color = vec3(1.0, 1.0, 1.0);
    }

    gl_FragColor = vec4(color, 1.0);
}