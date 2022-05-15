//#define GLSLIFY 1
precision mediump float;

const float PI = 3.1415926535897932384626433832795;

attribute float index;
attribute vec3 position;
attribute vec2 uv;
attribute vec2 size;
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
    vResolution = vec2(size.x * padding.x, size.y * padding.y);

    float t = time / duration;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    mvPosition.xy += offset * vResolution;

    gl_Position = projectionMatrix * mvPosition;
}