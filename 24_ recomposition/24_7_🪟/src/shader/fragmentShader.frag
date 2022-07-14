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

mat2 rotate(float angle) {
    return mat2(
        sin(angle), -cos(angle),
        cos(angle), sin(angle)
    );
}

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

float close(vec2 uv, float size, float boldness) {
    uv *= rotate(45.0 * PI / 180.0);
    float c = rect(vec2(size), vec2(uv.x, uv.y * boldness));
    return min(c, rect(vec2(size), vec2(uv.x * boldness, uv.y)));
}

float borderRect(vec2 size, vec2 uv, float boldness) {
    float r1 = rect(size, uv);
    float r2 = rect(size - boldness, uv);
    float border = abs(r1 - r2);
    return border;
}

vec3 borderRect(vec3 color, vec2 size, vec2 uv, vec2 uvAspect) {
    float border = borderRect(size, uv, 0.015);

    float d = step(0.0, dot(uv * rotate(0.0 * PI / 180.0), uvAspect));
    vec3 borderColor = mix(vec3(1.0), vec3(0.0), d);
    color = mix(color, borderColor, border);

    return color;
}

float maximizing(vec2 uv, vec2 size) {
    float border = borderRect(size, uv, 0.015);
    return border;
}

float minimizing(vec2 uv, vec2 size) {
    uv.y += 0.035;
    float border = rect(vec2(size.x, size.y * 0.2), uv);
    return border;
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
    vec3 g = mix(vec3(0.0, 0.0, 0.8), vec3(0.0, 0.5, 0.8), uv.x / uvAspect.x);
    vec3 edgeColor = g;
    vec3 lastEdgeColor = g;
    vec3 closeButtonBGColor = vec3(0.7);
    vec3 closeButtonColor = vec3(0.2);
    vec2 closeButton = vec2(0.0);
    vec2 lastCloseButton = vec2(0.0);
    vec2 maximizingButton = vec2(0.0);
    vec2 lastMaximizingButton = vec2(0.0);
    vec2 minimizingButton = vec2(0.0);
    vec2 lastMinimizingButton = vec2(0.0);
    float edgeSize = 0.2;
    float t = (time + vIndex) * 0.7;
    float easing = ease_out_bounce(fract(t));
    float easedTime = floor(t) + easing;

    for (int i = 0; i < 1; i++) {
        float _speed = 1.0;
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
            maximizingButton = closeButton;
            lastMaximizingButton = lastCloseButton;
            minimizingButton = closeButton;
            lastMinimizingButton = lastCloseButton;

            bgColor = color2;
            objColor = color3;
        } else if (ballPosition < 2.0) {
            // up
            ballSize.y += easing * maxMove.y;
            dd = vec2(0.0, -move.y + ballSize.y);
            ballSize.x = maxMove.x;
            edge = 1.0 - step(-edgeSize, uv.y - move.y);
            lastEdge = 1.0 - step(-edgeSize, uv.y - maxMove.y);
            closeButton = vec2(uv.x - uvAspect.x, uv.y - move.y);
            lastCloseButton = vec2(uv.x - uvAspect.x, uv.y - maxMove.y);
            maximizingButton = closeButton;
            lastMaximizingButton = lastCloseButton;
            minimizingButton = closeButton;
            lastMinimizingButton = lastCloseButton;

            bgColor = color3;
            objColor = color4;
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
            maximizingButton = closeButton;
            lastMaximizingButton = lastCloseButton;
            minimizingButton = closeButton;
            lastMinimizingButton = lastCloseButton;

            bgColor = color4;
            objColor = color1;
        } else {
            // down
            ballSize.y += easing * maxMove.y;
            dd = vec2(0.0, move.y - ballSize.y);
            ballSize.x = maxMove.x;
            edge = step(edgeSize, length(uv.y + move.y - uvAspect.y * 2.0));
            lastEdge = edge;
            closeButton = vec2(uv.x - uvAspect.x, uv.y + move.y - uvAspect.y * 2.0);
            lastCloseButton = vec2(uv.x - uvAspect.x, uv.y - maxMove.y);
            maximizingButton = closeButton;
            lastMaximizingButton = lastCloseButton;
            minimizingButton = closeButton;
            lastMinimizingButton = lastCloseButton;

            bgColor = color1;
            objColor = color2;
        }

        // rect for window
        float cc = rect(ballSize, uv + dd);

        // last window
        bgColor = mix(lastEdgeColor, bgColor, lastEdge);
        color = mix(color, bgColor, cc);
        color = borderRect(color, uvAspect, uv, uvAspect);

        vec2 closeButtonProp = vec2(0.06, 7.0);  // size, boldness

        vec2 btnSize = vec2(edgeSize * 0.4);
        float btnYOssset = 0.01;

        // last close button
        vec2 lastColseBtnPos = lastCloseButton + vec2(edgeSize * 0.5, edgeSize * 0.5 + btnYOssset);
        color = mix(closeButtonBGColor, color, rect(btnSize, lastColseBtnPos));
        color = mix(closeButtonColor, color, close(lastColseBtnPos, closeButtonProp.x, closeButtonProp.y));
        color = borderRect(color, btnSize, lastColseBtnPos, vec2(1.0));

        vec2 _maximizingPos = vec2(edgeSize * 1.4, edgeSize * 0.5 + btnYOssset);
        vec2 _minimizingPos = vec2(edgeSize * 2.2, edgeSize * 0.5 + btnYOssset);

        // last maximizing button
        vec2 lastMaximizingBtnPos = lastMaximizingButton + _maximizingPos;
        color = mix(closeButtonBGColor, color, rect(btnSize, lastMaximizingBtnPos));
        color = mix(color, closeButtonColor, maximizing(lastMaximizingBtnPos, vec2(0.05, 0.05)));
        color = borderRect(color, btnSize, lastMaximizingBtnPos, vec2(1.0));

        // last minimizing button
        vec2 lastMinimizingBtnPos = lastMinimizingButton + _minimizingPos;
        color = mix(closeButtonBGColor, color, rect(btnSize, lastMinimizingBtnPos));
        color = mix(closeButtonColor, color, minimizing(lastMinimizingBtnPos, vec2(0.05, 0.05)));
        color = borderRect(color, btnSize, lastMinimizingBtnPos, vec2(1.0));

        // new window
        objColor = mix(edgeColor, objColor, edge);
        color = mix(objColor, color, cc);
        color = borderRect(color, ballSize, uv + dd, ballSize);

        // new colose button
        vec2 colseBtnPos = closeButton + vec2(edgeSize * 0.5, edgeSize * 0.5 + btnYOssset);
        color = mix(closeButtonBGColor, color, rect(btnSize, colseBtnPos));
        color = mix(closeButtonColor, color, close(colseBtnPos, closeButtonProp.x, closeButtonProp.y));
        color = borderRect(color, btnSize, colseBtnPos, vec2(1.0));

        // maximizing button
        vec2 maximizingBtnPos = maximizingButton + _maximizingPos;
        color = mix(closeButtonBGColor, color, rect(btnSize, maximizingBtnPos));
        color = mix(color, closeButtonColor, maximizing(maximizingBtnPos, vec2(0.05, 0.05)));
        color = borderRect(color, btnSize, maximizingBtnPos, vec2(1.0));

        // minimizing button
        vec2 minimizingBtnPos = minimizingButton + _minimizingPos;
        color = mix(closeButtonBGColor, color, rect(btnSize, minimizingBtnPos));
        color = mix(closeButtonColor, color, minimizing(minimizingBtnPos, vec2(0.05, 0.05)));
        color = borderRect(color, btnSize, minimizingBtnPos, vec2(1.0));
    }

    float borderWidth = 1.0;

    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}