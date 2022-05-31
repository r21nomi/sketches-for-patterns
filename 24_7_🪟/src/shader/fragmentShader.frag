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

float ease_out_bounce(float x, float t, float b, float c, float d) {
    if ((t/=d) < (1./2.75)) {
        return c*(7.5625*t*t) + b;
    } else if (t < (2./2.75)) {
        return c*(7.5625*(t-=(1.5/2.75))*t + .75) + b;
    } else if (t < (2.5/2.75)) {
        return c*(7.5625*(t-=(2.25/2.75))*t + .9375) + b;
    } else {
        return c*(7.5625*(t-=(2.625/2.75))*t + .984375) + b;
    }
}

float ease_out_bounce(float x){
    return ease_out_bounce(x, x, 0.0, 1.0, 1.0);
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

    vec3 color1 = vec3(230.0, 230.0, 230.0) / 255.0;
    vec3 color2 = vec3(210.0, 210.0, 210.0) / 255.0;
    vec3 color3 = vec3(220.0, 220.0, 220.0) / 255.0;
    vec3 color4 = vec3(200.0, 200.0, 200.0) / 255.0;
    vec3 bgColor = vec3(1.0);
    vec3 objColor = vec3(1.0);
    vec3 edgeColor = vec3(0.8);
    vec3 lastEdgeColor = vec3(0.8);
    vec3 closeButtonColor = vec3(0.7);
    vec2 closeButton = vec2(0.0);
    vec2 lastCloseButton = vec2(0.0);
    float edgeSize = 0.2;

    for (int i = 0; i < 1; i++) {
        float _speed = 1.0;
        float t = (time + vIndex) * 0.7;
        float easing = ease_out_bounce(fract(t));
        float easedTime = floor(t) + easing;
        float idTime = easedTime + float(i) * _speed * id;
        float ballPosition = mod(idTime, 4.0);
        vec2 ballSize = vec2(0.0);
        float margin = 0.0;
        vec2 maxMove = (uvAspect - margin) - ballSize;
        vec2 move = (fract(idTime) * 2.0 - 1.0) * maxMove;
        vec2 dd = vec2(1.0);
        bool isVertical = false;
        float edge = 0.0;
        float lastEdge = 0.0;

        if (ballPosition < 1.0) {
            // left
            isVertical = true;
            ballSize.x += easing * maxMove.x;
            dd = vec2(move.x - ballSize.x, 0.0);
            ballSize.y = maxMove.y;
            edge = 1.0 - step(-edgeSize, uv.y - maxMove.y);
            lastEdge = edge;
            closeButton = vec2(uv.x + move.x - uvAspect.x * 2.0, uv.y - maxMove.y);
            lastCloseButton = vec2(uv.x - uvAspect.x, uv.y - maxMove.y);

            bgColor = color2;
            objColor = color3;
            edgeColor = color4;
            lastEdgeColor = color3;
        } else if (ballPosition < 2.0) {
            // up
            ballSize.y += easing * maxMove.y;
            dd = vec2(0.0, -move.y + ballSize.y);
            ballSize.x = maxMove.x;
            edge = 1.0 - step(-edgeSize, uv.y - move.y);
            lastEdge = 1.0 - step(-edgeSize, uv.y - maxMove.y);
            closeButton = vec2(uv.x - uvAspect.x, uv.y - move.y);
            lastCloseButton = vec2(uv.x - uvAspect.x, uv.y - maxMove.y);

            bgColor = color3;
            objColor = color4;
            edgeColor = color1;
            lastEdgeColor = color4;
        } else if (ballPosition < 3.0) {
            // right
            isVertical = true;
            ballSize.x += easing * maxMove.x;
            dd = vec2(-move.x + ballSize.x, 0.0);
            ballSize.y = maxMove.y;
            edge = 1.0 - step(-edgeSize, uv.y - maxMove.y);
            lastEdge = edge;
            closeButton = vec2(uv.x - move.x, uv.y - maxMove.y);
            lastCloseButton = vec2(uv.x - uvAspect.x, uv.y - maxMove.y);

            bgColor = color4;
            objColor = color1;
            edgeColor = color2;
            lastEdgeColor = color1;
        } else {
            // down
            ballSize.y += easing * maxMove.y;
            dd = vec2(0.0, move.y - ballSize.y);
            ballSize.x = maxMove.x;
            edge = step(edgeSize, length(uv.y + move.y - uvAspect.y * 2.0));
            lastEdge = edge;
            closeButton = vec2(uv.x - uvAspect.x, uv.y - maxMove.y);
            lastCloseButton = vec2(uv.x - uvAspect.x, uv.y - maxMove.y);

            bgColor = color1;
            objColor = color2;
            edgeColor = color3;
            lastEdgeColor = color2;
        }

        // Rect
        float cc = rect(ballSize, uv + dd);
        objColor = mix(edgeColor, objColor, edge);
        bgColor = mix(lastEdgeColor, bgColor, lastEdge);

        color *= vec3(cc);
    }

    color = mix(objColor, bgColor, color);

    // close button
    color = mix(closeButtonColor, color, rect(vec2(edgeSize * 0.5), closeButton + edgeSize * 0.5));
    color = mix(closeButtonColor, color, rect(vec2(edgeSize * 0.5), lastCloseButton + edgeSize * 0.5));

    float borderWidth = 1.0;

    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}