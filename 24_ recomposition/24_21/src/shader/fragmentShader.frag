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

float atan2(float y, float x){
    return x == 0.0 ? sign(y) * PI / 2.0 : atan(y, x);
}

/**
 * Reference
 * https://karanokan.info/2019/03/31/post-2465
 */
float polygon(vec2 p, float n, float size){
    float a = atan2(p.x, p.y) + PI;
    float r = 2.0 * PI / n;
    return cos(floor(0.5 + a / r) * r - a) * length(p) - size;
}
float star(vec2 p, float n, float t, float size){
    float a = 2.0 * PI / float(n) / 2.0;
    float c = cos(a);
    float s = sin(a);
    vec2 r = p * mat2(c, -s, s, c);
    return (polygon(p, n, size) - polygon(r, n, size) * t) / (1.0 - t);
}

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);

    vec3 color = vec3(0.0);
    // https://en.wikipedia.org/wiki/Flag_of_the_United_States#Colors
    vec3 blue = vec3(10.0, 49.0, 97.0) / 255.0;
    vec3 red = vec3(179.0, 25.0, 66.0) / 255.0;
    vec3 white = vec3(1.0, 1.0, 1.0);

    if (vWeight.x < 0.4 && vWeight.y > 0.6) {
        color = mix(vec3(1.0), blue, step(0.3, star(uv, 5.0, 0.6, 0.1)));
    } else {
        float f = fract(vWeight.y * 9.0);
        if (f < 0.5) {
            color = red;
        } else {
            color = white;
        }
    }

    gl_FragColor = vec4(color, 1.0);
}