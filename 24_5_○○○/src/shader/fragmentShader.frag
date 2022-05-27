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

float ease_in_out_expo(float x) {
    float t=x; float b=0.; float c=1.; float d=1.;
    if (t==0.) return b;
    if (t==d) return b+c;
    if ((t/=d/2.) < 1.) return c/2. * pow(2., 10. * (t - 1.)) + b;
    return c/2. * (-pow(2., -10. * --t) + 2.) + b;
}

float getE(float e) {
    float _e;
    if (e < 0.5) {
        _e = e;
    } else {
        _e = 1.0 - e;
    }
    return _e * 1.2;
}

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 uvAspect = vResolution / min(vResolution.x, vResolution.y);

    float id = floor(mod(vIndex, 4.0));
    if (id == 0.0) {
        id = 1.0;
    }

    vec3 color = vec3(1.0);

    for (int i = 0; i < 4; i++) {
        float _speed = 1.0;
        float t = time * id * 0.6;
        float easing = ease_in_out_expo(fract(t));
        float easedTime = floor(t) + easing;
        float idTime = easedTime + float(i) * _speed * id;
        float ballPosition = mod(idTime, 4.0);
        vec2 ballSize = vec2(0.2);
        float margin = 0.1;
        vec2 maxMove = (uvAspect - margin) - ballSize;
        vec2 move = (fract(idTime) * 2.0 - 1.0) * maxMove;
        vec2 dd = vec2(1.0);

        if (ballPosition < 1.0) {
            // left
            dd = vec2(move.x, maxMove.y);
            ballSize.x += getE(easing);
        } else if (ballPosition < 2.0) {
            // up
            dd = vec2(maxMove.x, -move.y);
            ballSize.y += getE(easing);
        } else if (ballPosition < 3.0) {
            // right
            dd = vec2(-move.x, -maxMove.y);
            ballSize.x += getE(easing);
        } else {
            // down
            dd = vec2(-maxMove.x, move.y);
            ballSize.y += getE(easing);
        }

        // Circle
//        float cc = step(ballSize, length(uv + dd));

        // Rect
        float cc = step(ballSize.x, length(uv.x + dd.x));
        cc = max(cc, step(ballSize.y, length(uv.y + dd.y)));

        color *= vec3(cc);
    }

    if (vRatio > 0.01) {
        color = mix(vec3(0.2, 0.0, 0.95), vec3(1.0), color);
        color = mix(color, vec3(0.99, 0.0, 0.1), vRatio);
    }

    float borderWidth = 1.0;
    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}