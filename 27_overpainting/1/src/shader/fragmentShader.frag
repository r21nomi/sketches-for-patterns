precision mediump float;

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;

varying vec2 vUv;
varying vec2 vResolution;

void main() {
    vec2 v = vUv;
    float m = 85.0;
    v = floor(v * m) / m;

    vec4 color = texture2D(texture, v);
    if (color.a + color.g + color.b <= 1.1) {
//        color.rgb = vec3(1.0, 0.0, 0.0);
        discard;
    }
    if (floor(mod(time * 18.0, 10.0)) == 0.0) {
        color.rgb = color.brg;
    }
    gl_FragColor = color;
}