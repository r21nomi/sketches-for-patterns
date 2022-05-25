precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;

varying float vIndex;
varying vec2 vUv;
varying vec3 vColor;
varying vec2 vResolution;
varying float vDirection;
varying float vRatio;

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 uvAspect = vResolution / min(vResolution.x, vResolution.y);

    float id = floor(mod(vIndex, 4.8));
    if (id == 0.0) {
        id = 1.0;
    }

    vec3 color = vec3(1.0);

    for (int i = 0; i < 10; i++) {
        float _speed = 0.2;
        float idTime = time * id + float(i) * _speed;
        float ballPosition = mod(idTime, 4.0);
        float ballSize = 0.15;
        float margin = 0.05;
        vec2 maxMove = (uvAspect - margin) - ballSize;
        vec2 move = (fract(idTime) * 2.0 - 1.0) * maxMove;
        vec2 dd = vec2(1.0);

        if (ballPosition < 1.0) {
            // left
            dd = vec2(move.x, maxMove.y);
        } else if (ballPosition < 2.0) {
            // up
            dd = vec2(maxMove.x, -move.y);
        } else if (ballPosition < 3.0) {
            // right
            dd = vec2(-move.x, -maxMove.y);
        } else {
            // down
            dd = vec2(-maxMove.x, move.y);
        }

        // Circle
        float cc = step(ballSize, length(uv + dd));

        // Rect
//        float cc = step(ballSize, length(uv.x + dd.x));
//        cc = max(cc, step(ballSize, length(uv.y + dd.y)));

        color *= vec3(cc);
    }

    float borderWidth = 2.0;
    if (vRatio < 0.01) {
        borderWidth = 0.0;
    } else {
        borderWidth = 2.0;
    }
    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}