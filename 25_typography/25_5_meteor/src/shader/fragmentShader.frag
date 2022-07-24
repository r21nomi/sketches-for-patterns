precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;
uniform sampler2D texture2;
uniform vec2 textureResolution;
uniform float textureBlockSize;

varying float vIndex;
varying float vTotalIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;
varying float vDirection;
varying float vRatio;
varying vec2 vWeight;

mat2 rotate(float angle) {
    return mat2(
        sin(angle), -cos(angle),
        cos(angle), sin(angle)
    );
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec2 getUVForTexture (vec2 uv, float t) {
    float count = textureBlockSize;
    vec2 pos = vec2(
        floor(fract(t) * count),
        floor(mod(t, count))
    );
    vec2 eachSize = textureResolution / count / textureResolution;
    vec2 ff = vec2(pos.x, pos.y);

    return vec2(
        uv.x * eachSize.x + eachSize.x * ff.x,
        uv.y * eachSize.y + (1.0 - eachSize.y) - eachSize.y * ff.y
    );
}

float rect(vec2 size, vec2 uv) {
    float cc = step(size.x, length(uv.x));
    return max(cc, step(size.y, length(uv.y)));
}

float x(vec2 uv, float size, float boldness) {
    float c = rect(vec2(size), vec2(uv.x, uv.y * boldness));
    return min(c, rect(vec2(size), vec2(uv.x * boldness, uv.y)));
}

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    bool isOver = abs(uv.x) > 1.0 || abs(uv.y) > 1.0;
    uv = uv * 0.5 + 0.5;

    float count = textureBlockSize;

    vec2 weight = (vWeight * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    vec2 ratio = vec2(
        max((vResolution.x / vResolution.y) / (textureResolution.x / textureResolution.y), 1.0),
        max((vResolution.y / vResolution.x) / (textureResolution.y / textureResolution.x), 1.0)
    );

    float t = 0.0;

    for (int i = 0; i < 20; i++) {
        float id = float(i);
        float speed = time * id * 0.01;
        vec2 move = vec2(fract(speed) * 2.0 - 1.0);
        float size = id / 10.0 * 0.1 + 0.05;
        vec2 offsetPos = vec2(rand(vec2(id)), rand(vec2(id, 6.0))) * 2.0 - 1.0;
        float c = 1.0 - step(size, length(weight + move + offsetPos));
        t += mix(0.0, mod(vWeight.x + vWeight.y + time * id * 0.1, count), c);
    }

    vec2 uvForTex = getUVForTexture(uv, t);

    vec3 bgColor = vec3(0.06);
    vec3 txtColor = vec3(1.0);
    vec4 tex = texture2D(texture, uvForTex);
    vec3 color = mix(bgColor, txtColor, tex.rgb);

    if (isOver) {
        color = bgColor;
    }

    gl_FragColor = vec4(color, 1.0);
}