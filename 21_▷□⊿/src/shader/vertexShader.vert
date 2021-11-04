//#define GLSLIFY 1
precision mediump float;

const float PI = 3.1415926535897932384626433832795;

attribute float index;
attribute vec3 position;
attribute vec2 uv;
attribute vec2 offset;
attribute vec2 padding;
attribute vec3 color;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float uWidth;
uniform float uHeight;
uniform float rowNum;
uniform float duration;

varying float vIndex;
varying float vIndexRatio;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;

mat2 rotate(float radien) {
    return mat2(
        sin(radien), -cos(radien),
        cos(radien), sin(radien)
    );
}

//vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
//
//float snoise(vec2 v){
//    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
//    -0.577350269189626, 0.024390243902439);
//    vec2 i  = floor(v + dot(v, C.yy) );
//    vec2 x0 = v -   i + dot(i, C.xx);
//    vec2 i1;
//    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
//    vec4 x12 = x0.xyxy + C.xxzz;
//    x12.xy -= i1;
//    i = mod(i, 289.0);
//    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
//    + i.x + vec3(0.0, i1.x, 1.0 ));
//    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
//    dot(x12.zw,x12.zw)), 0.0);
//    m = m*m ;
//    m = m*m ;
//    vec3 x = 2.0 * fract(p * C.www) - 1.0;
//    vec3 h = abs(x) - 0.5;
//    vec3 ox = floor(x + 0.5);
//    vec3 a0 = x - ox;
//    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
//    vec3 g;
//    g.x  = a0.x  * x0.x  + h.x  * x0.y;
//    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
//    return 130.0 * dot(m, g);
//}

float y(float x) {
    float contrast = 16.0; //4.0,8.0,16.0
    return 1.0 / (1.0 + exp(-contrast * (x - 0.5)));
}

void main() {
    float ratio = (index + 1.0) / rowNum;

    vIndex = index;
    vIndexRatio = ratio;
    vUv = uv;
    vColor = color;
    // Actual resolution of rect by vertex with padding.
    vResolution = vec2(uWidth * padding.x, uHeight * padding.y);

    float t = time / duration;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

//    float radius = 0.0;
//    float n = 0.3 * snoise(vec2(index, index)) * (1.0 - vIndexRatio);
//    mvPosition.x += cos(t + n) * radius * 0.5 * vIndexRatio;
//    mvPosition.y += sin(t + n) * radius * vIndexRatio;

    mvPosition.xy += offset * vResolution;

//    mvPosition.xy *= rotate(cos(t + vIndexRatio) * 180.0 * vIndexRatio * PI / 180.0);
//    mvPosition.xy *= rotate(mod(y(fract(t + vIndexRatio * 0.19)) * 360.0, 360.0) * PI / 180.0);
//    mvPosition.xy *= rotate(0.0 * PI / 180.0);
//    mvPosition.xy *= rotate(90.0 * PI / 180.0);

//    mvPosition.xy += sin(time)*50.0;

    gl_Position = projectionMatrix * mvPosition;
}