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
attribute vec3 centerPosition;
attribute vec2 rotations;

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

vec3 rotateByAngles(vec3 pos) {
    // X axis rotation
    mat3 rotationXMat = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(rotations.x), -sin(rotations.x),
        0.0, sin(rotations.x), cos(rotations.x)
    );

    // transport before rotation to make the position same as original one
    pos.xyz -= centerPosition.xyz;
    pos = rotationXMat * pos;

    // Y axis rotation
    mat3 rotationYMat = mat3(
        cos(rotations.y), 0.0, -sin(rotations.y),
        0.0, 1.0, 0.0,
        sin(rotations.y), 0.0, cos(rotations.y)
    );

    pos = rotationYMat * pos;
    // revert transportation
    pos.xyz += centerPosition.xyz;

    return pos;
}

void main() {
    vIndex = index;
    vTotalIndex = totalIndex;
    vUv = uv;
    vColor = color;
    // Actual resolution of rect by vertex with padding.
    vResolution = vec2(size.x - padding.x, size.y - padding.y);

    vec3 rotatedPos = rotateByAngles(position);
    vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);

    gl_Position = projectionMatrix * mvPosition;
}