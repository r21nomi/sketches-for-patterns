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
attribute float direction;
attribute float ratio;
attribute vec2 weight;

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
varying float vDirection;
varying float vRatio;
varying vec2 vWeight;

void main() {
    vIndex = index;
    vTotalIndex = totalIndex;
    vUv = uv;
    vColor = color;
    // Actual resolution of rect by vertex with padding.
    vResolution = vec2(size.x - padding.x, size.y - padding.y);
    vDirection = direction;
    vRatio = ratio;
    vWeight = weight;

    float t = time / duration;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    gl_Position = projectionMatrix * mvPosition;
}