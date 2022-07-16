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

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 weight = (vWeight * resolution * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    vec2 ratio = vec2(
        max((vResolution.x / vResolution.y) / (textureResolution.x / textureResolution.y), 1.0),
        max((vResolution.y / vResolution.x) / (textureResolution.y / textureResolution.x), 1.0)
    );

    float t = time * 1.1 + vIndex;
    vec2 p = vec2(
        floor(fract(t) * 5.0),
        floor(mod(t, 5.0))
    );
    vec2 eachSize = textureResolution / 5.0 / textureResolution;
    vec2 ff = vec2(p.x, p.y);
    vec2 uvForTex = vec2(vUv.x * eachSize.x + eachSize.x * ff.x, vUv.y * eachSize.y + (1.0 - eachSize.y) - eachSize.y * ff.y + 0.015);

    vec4 tex = texture2D(texture, uvForTex);
    vec3 color = tex.rgb;

    gl_FragColor = vec4(color, 1.0);
}