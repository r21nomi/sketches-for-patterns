precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;
uniform vec2 textureResolution;

varying float vIndex;
varying float vTotalIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;
varying float vDirection;
varying float vRatio;
varying vec2 vWeight;

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec2 detailedUV(vec2 uv, float pixelated) {
    if (pixelated > 0.0) {
        uv = floor(uv * pixelated) / pixelated;
    }

    return vec2(
        map(uv.x, 0.0, 1.0, vWeight.x, vWeight.x + vResolution.x / resolution.x),
        map(uv.y, 0.0, 1.0, vWeight.y, vWeight.y + vResolution.y / resolution.y)
    );
}

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 uv2 = vUv;
    uv2.y -= 1.6;
    vec2 weight = (vWeight * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    vec2 weightUVAspect = resolution / min(resolution.x, resolution.y);

    vec2 ratio = vec2(
        max((resolution.x / resolution.y) / (textureResolution.x / textureResolution.y), 1.0),
        max((resolution.y / resolution.x) / (textureResolution.y / textureResolution.x), 1.0)
    );

    float scene = mod(time, 6.0);

    float n = rand(vec2(vIndex, time * 0.0001)) * 10.0 + 1.0;
    vec2 _detailedUV = detailedUV(uv2, n);
    vec2 uvForTex = vec2(
        _detailedUV.x * ratio.x + (1.0 - ratio.x) * 0.5,
        _detailedUV.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

    vec2 uvForTexOver = (uvForTex * 2.0 - 1.0) / min(ratio.x, ratio.y);
    bool isOver = abs(uvForTexOver.x) > 1.0 || abs(uvForTexOver.y) > 1.0;

    vec4 tex = texture2D(texture, uvForTex);
    if (isOver) {
//        tex.rgba = vec4(0.0, 0.0, 0.0, 1.0);
    }

    float g = 0.0;
    if (vDirection > 0.5) {
        g = vUv.x;
    } else {
        g = vUv.y;
    }

    vec4 color = tex.rgba;
    color.rgb = mix(color.rgb * 0.8, color.rgb * 1.2, g);

    gl_FragColor = color;
}