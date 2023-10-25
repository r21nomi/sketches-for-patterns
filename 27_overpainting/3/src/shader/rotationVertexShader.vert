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
attribute float rotationX;
attribute float rotationY;

uniform mat4 modelViewMatrix;
uniform mat4 projectionMatrix;
uniform mat4 lookAtMatrix;
uniform float time;
uniform float uWidth;
uniform float uHeight;
uniform float duration;

varying float vIndex;
varying float vTotalIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;

mat2 rotate(float radian) {
    return mat2(
        sin(radian), cos(radian),
        -cos(radian), sin(radian)
    );
}

mat3 rotation3d(vec3 axis, float radian) {
    axis = normalize(axis);
    float s = sin(radian);
    float c = cos(radian);
    float oc = 1.0 - c;

    return mat3(
        oc * axis.x * axis.x + c,           oc * axis.x * axis.y - axis.z * s,  oc * axis.z * axis.x + axis.y * s,
        oc * axis.x * axis.y + axis.z * s,  oc * axis.y * axis.y + c,           oc * axis.y * axis.z - axis.x * s,
        oc * axis.z * axis.x - axis.y * s,  oc * axis.y * axis.z + axis.x * s,  oc * axis.z * axis.z + c
    );
}

vec3 rotateByAngles(vec3 pos) {
    // X軸周りの回転
    mat3 rotationXMat = mat3(
        1.0, 0.0, 0.0,
        0.0, cos(rotationX), -sin(rotationX),
        0.0, sin(rotationX), cos(rotationX)
    );

    pos = rotationXMat * pos;

    // Y軸周りの回転
    mat3 rotationYMat = mat3(
        cos(rotationY), 0.0, sin(rotationY),
        0.0, 1.0, 0.0,
        -sin(rotationY), 0.0, cos(rotationY)
    );

    pos = rotationYMat * pos;

    return pos;
}

void main() {
    vIndex = index;
    vTotalIndex = totalIndex;
    vUv = uv;
    vColor = color;
    // Actual resolution of rect by vertex with padding.
    vResolution = vec2(size.x - padding.x, size.y - padding.y);

    // rotation
    //    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
//    mvPosition.xyz -= centerPosition.xyz;
//    mvPosition.xy *= rotate(rotationX);
//    mvPosition.xyz *= rotation3d(vec3(1.0, 1.0, 1.0), 20.0 * PI / 180.0);
//    mvPosition.xyz += centerPosition.xyz;

    vec3 rotatedPos = rotateByAngles(position);
//    rotatedPos = position;
    vec4 mvPosition = modelViewMatrix * vec4(rotatedPos, 1.0);

    gl_Position = projectionMatrix * mvPosition;
}