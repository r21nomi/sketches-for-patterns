precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;
uniform vec2 texture2Resolution;

varying vec2 vUv;
varying vec2 vResolution;

void main() {
    vec2 v = vUv;
    vec4 color = texture2D(texture, v);
    gl_FragColor = color;
}