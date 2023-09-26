precision mediump float;

const float PI = 3.1415926535897932384626433832795;

attribute float index;
attribute float totalIndex;
attribute vec3 position;
attribute vec3 translate;
attribute vec2 uv;
attribute vec2 size;
attribute vec2 padding;
attribute vec3 color;
attribute vec2 centerPosition;
attribute float rotation;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform float time;
uniform float uWidth;
uniform float uHeight;
uniform float duration;

varying float vIndex;
varying float vTotalIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;

mat2 rotate(float radien) {
    return mat2(
        sin(radien), cos(radien),
        -cos(radien), sin(radien)
    );
}

void main() {
    vIndex = index;
    vTotalIndex = totalIndex;
    vUv = uv;
    vColor = color;
    // Actual resolution of rect by vertex with padding.
    vResolution = vec2(size.x - padding.x, size.y - padding.y);

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);

    // rotation
    mvPosition.xy -= centerPosition.xy;
    mvPosition.xy *= rotate(rotation);
    mvPosition.xy += centerPosition.xy;

    gl_Position = projectionMatrix * mvPosition;
}