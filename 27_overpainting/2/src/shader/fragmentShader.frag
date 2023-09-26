precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;

varying vec2 vUv;
varying vec2 vResolution;

void main() {
    vec2 v = vUv;
    vec4 color = texture2D(texture, v);
//    if (color.a + color.g + color.b >= 2.95) {
//        color.rgb = vec3(1.0, 0.0, 0.0);
//        discard;
//    }
    gl_FragColor = color;
}