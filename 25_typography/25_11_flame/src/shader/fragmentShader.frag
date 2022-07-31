precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;
uniform sampler2D texture2;
uniform vec2 textureResolution;
uniform float textureBlockSize;
uniform vec3 bgColor;

varying float vIndex;
varying float vTotalIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;
varying float vDirection;
varying float vRatio;
varying vec2 vWeight;

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

float getTypePos(float index) {
    return index / textureBlockSize;
}

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    bool isOver = abs(uv.x) > 1.0 || abs(uv.y) > 1.0;
    uv = uv * 0.5 + 0.5;

    float count = textureBlockSize;
    float totalCount = count * count;

    vec2 weight = (vWeight * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    vec2 ratio = vec2(
        max((vResolution.x / vResolution.y) / (textureResolution.x / textureResolution.y), 1.0),
        max((vResolution.y / vResolution.x) / (textureResolution.y / textureResolution.x), 1.0)
    );

    vec3 color = bgColor;

    float t = 0.0;

    weight *= 14.0;
    vec2 id = floor(weight);

    if (mod(id.x, 2.0) == 0.0) {
        float speed = 6.0;
        float y = weight.y + rand(vec2(id.x)) * 100.0 + time * rand(vec2(id.x)) * speed;
        float l = max(mod(-y, 20.0), 0.0) / 3.0;
        t = mod(l, totalCount);
    } else {
        t = 0.0;
    }

    vec2 uvForTex = getUVForTexture(uv, t);

    vec3 txtColor = vec3(1.0);
    vec4 tex = texture2D(texture, uvForTex);
    color = tex.rgb;

    if (isOver) {
        color = bgColor;
    }

    gl_FragColor = vec4(color, 1.0);
}