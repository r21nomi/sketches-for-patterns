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

float map(float value, float beforeMin, float beforeMax, float afterMin, float afterMax) {
    return afterMin + (afterMax - afterMin) * ((value - beforeMin) / (beforeMax - beforeMin));
}

float rand(vec2 n) {
    return fract(sin(dot(n, vec2(12.9898, 4.1414))) * 43758.5453);
}

vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }

float snoise(vec2 v){
    const vec4 C = vec4(0.211324865405187, 0.366025403784439,
    -0.577350269189626, 0.024390243902439);
    vec2 i  = floor(v + dot(v, C.yy) );
    vec2 x0 = v -   i + dot(i, C.xx);
    vec2 i1;
    i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
    vec4 x12 = x0.xyxy + C.xxzz;
    x12.xy -= i1;
    i = mod(i, 289.0);
    vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 ))
    + i.x + vec3(0.0, i1.x, 1.0 ));
    vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy),
    dot(x12.zw,x12.zw)), 0.0);
    m = m*m ;
    m = m*m ;
    vec3 x = 2.0 * fract(p * C.www) - 1.0;
    vec3 h = abs(x) - 0.5;
    vec3 ox = floor(x + 0.5);
    vec3 a0 = x - ox;
    m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
    vec3 g;
    g.x  = a0.x  * x0.x  + h.x  * x0.y;
    g.yz = a0.yz * x12.xz + h.yz * x12.yw;
    return 130.0 * dot(m, g);
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
    vec2 uv2 = uv;
    uv = uv * 0.5 + 0.5;

    float count = textureBlockSize;
    float totalCount = count * count;

    vec2 weight = (vWeight * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    vec2 ratio = vec2(
        max((vResolution.x / vResolution.y) / (textureResolution.x / textureResolution.y), 1.0),
        max((vResolution.y / vResolution.x) / (textureResolution.y / textureResolution.x), 1.0)
    );

    vec3 color = bgColor;

    vec2 scaledUV = weight * 3.6;

    vec2 i_uv = floor(scaledUV);
    vec2 f_uv = fract(scaledUV);

    float dist = 1.0;

    for (int  i = -1; i <= 1; i++) {
        for (int k = -1; k <= 1; k++) {
            vec2 neighbor = vec2(float(i), float(k));
            float o = rand(i_uv + neighbor);
            vec2 offset = vec2(
                map(cos(time * o * 5.0 + snoise(weight) * 2.0), -1.0, 1.0, 0.5, 1.0),
                map(sin(time * o * 5.0 + snoise(weight) * 3.0), -1.0, 1.0, 0.5, 1.0)
            );
            vec2 pos = neighbor + offset - f_uv;

            float d = length(pos);

            dist = min(dist, dist * d);
        }
    }

    float cell = 1.0 - step(0.2, dist);
    cell = mix(0.0, floor(mod(vIndex + vIndex * time * 0.003, 7.0) + 1.0), cell);

    float t = getTypePos(cell);
    vec2 uvForTex = getUVForTexture(uv, t);
    vec4 tex = texture2D(texture, uvForTex);
    color = tex.rgb;

    if (isOver) {
        color = bgColor;
    }

    gl_FragColor = vec4(color, 1.0);
}