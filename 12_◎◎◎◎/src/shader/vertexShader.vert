//#define GLSLIFY 1

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

varying float vIndex;
varying vec2 vUv;
varying vec3 vColor;

void main() {
    vIndex = index;
    vUv = uv;
    vColor = color;

    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
    mvPosition.xy += offset * vec2(uWidth * padding.x, uHeight * padding.y);

    gl_Position = projectionMatrix * mvPosition;
}