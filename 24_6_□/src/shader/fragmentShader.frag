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

float rect(vec2 size, vec2 uv) {
    float cc = step(size.x, length(uv.x));
    return max(cc, step(size.y, length(uv.y)));
}

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 uvAspect = vResolution / min(vResolution.x, vResolution.y);

    float id = floor(mod(vIndex, 4.0));
    if (id == 0.0) {
        id = 1.0;
    }

    vec3 color = vec3(1.0);
    vec2 dir = vec2(0.0);

    if (vDirection > 0.5) {
        // vertical
        dir = vec2(1.0, 0.0);
    } else {
        // horizontal
        dir = vec2(0.0, 1.0);
    }

    vec3 color1 = vec3(43.0, 45.0, 66.0) / 255.0;
    vec3 color2 = vec3(141.0, 153.0, 174.0) / 255.0;
    vec3 color3 = vec3(248.0, 243.0, 43.0) / 255.0;
    vec3 color4 = vec3(255.0, 255.0, 255.0) / 255.0;
    vec3 bgColor = vec3(1.0);
    vec3 objColor = vec3(1.0);

    for (int i = 0; i < 1; i++) {
        float _speed = 1.0;
        float t = (time + vIndex) * 0.6;
        float easing = ease_in_out_expo(fract(t));
        float easedTime = floor(t) + easing;
        float idTime = easedTime + float(i) * _speed * id;
        float ballPosition = mod(idTime, 4.0);
        vec2 ballSize = vec2(0.0);
        float margin = 0.0;
        vec2 maxMove = (uvAspect - margin) - ballSize;
        vec2 move = (fract(idTime) * 2.0 - 1.0) * maxMove;
        vec2 dd = vec2(1.0);
        bool isVertical = false;

        if (ballPosition < 1.0) {
            // left
            isVertical = true;
            ballSize.x += easing * maxMove.x;
            dd = vec2(move.x - ballSize.x, 0.0);
            ballSize.y = maxMove.y;

            bgColor = color2;
            objColor = color3;
        } else if (ballPosition < 2.0) {
            // up
            ballSize.y += easing * maxMove.y;
            dd = vec2(0.0, -move.y + ballSize.y);
            ballSize.x = maxMove.x;

            bgColor = color3;
            objColor = color4;
        } else if (ballPosition < 3.0) {
            // right
            isVertical = true;
            ballSize.x += easing * maxMove.x;
            dd = vec2(-move.x + ballSize.x, 0.0);
            ballSize.y = maxMove.y;

            bgColor = color4;
            objColor = color1;
        } else {
            // down
            ballSize.y += easing * maxMove.y;
            dd = vec2(0.0, move.y - ballSize.y);
            ballSize.x = maxMove.x;

            bgColor = color1;
            objColor = color2;
        }

        // Rect
        float cc = rect(ballSize, uv + dd);

        color *= vec3(cc);
    }

    color = mix(objColor, bgColor, color);

    float borderWidth = 1.0;

    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}