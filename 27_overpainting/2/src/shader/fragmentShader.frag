precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;
uniform sampler2D texture2;
uniform vec2 texture2Resolution;

varying vec2 vUv;
varying vec2 vResolution;

void main() {
    vec2 v = vUv;
    vec4 colorVideo = texture2D(texture, v);
    vec4 colorComputer = texture2D(texture2, v);
    vec4 color = colorComputer;
    if (color.a == 0.0) {
        color = colorVideo;
        if (v.y > 0.9) {
            color.a = 0.0;
        }
    }
//    if (color.a + color.g + color.b >= 2.95) {
//        color.rgb = vec3(1.0, 0.0, 0.0);
//        discard;
//    }
    gl_FragColor = color;
}