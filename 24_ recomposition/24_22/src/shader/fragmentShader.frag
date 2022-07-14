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

    // https://www.flagcolorcodes.com/united-kingdom
    vec3 blue = vec3(1.0, 33.0, 105.0) / 255.0;
    vec3 red = vec3(200.0, 16.0, 46.0) / 255.0;
    vec3 white = vec3(255.0, 255.0, 255.0) / 255.0;

    vec3 color = vec3(0.0);

    float boldnessBackward = 0.1;
    float boldnessForward = 0.04;

    float cross1 = min(step(boldnessBackward, length(vWeight.x)), step(boldnessBackward, length(vWeight.y)));
    color = mix(white, blue, cross1);
    float cross2 = min(step(boldnessForward, length(vWeight.x)), step(boldnessForward, length(vWeight.y)));
    color = mix(red, color, cross2);

    float slashLtoR1 = step(boldnessBackward, length(vWeight.x + vWeight.y));
    color = mix(white, color, slashLtoR1);
    float slashLtoR2 = step(boldnessForward, length(vWeight.x + vWeight.y));
    color = mix(red, color, slashLtoR2);

    float slashRtoL1 = step(boldnessBackward, length(vWeight.x - vWeight.y));
    color = mix(white, color, slashRtoL1);
    float slashRtoL2 = step(boldnessForward, length(vWeight.x - vWeight.y));
    color = mix(red, color, slashRtoL2);

    gl_FragColor = vec4(color, 1.0);
}