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

float ease_in_out_expo(float x) {
    float t=x; float b=0.; float c=1.; float d=1.;
    if (t==0.) return b;
    if (t==d) return b+c;
    if ((t/=d/2.) < 1.) return c/2. * pow(2., 10. * (t - 1.)) + b;
    return c/2. * (-pow(2., -10. * --t) + 2.) + b;
}

float rect(vec2 size, vec2 uv, float edge) {
    vec2 d = abs(uv - vec2(0.0)) - size + edge;
    float l = length(max(d, 0.0)) + min(max(d.x, d.y), 0.0);
    return 1.0 - step(l - edge, 0.0);
}

float circle(float size, vec2 uv) {
    return step(size, length(uv));
}

float close(vec2 uv, float size, float boldness) {
//    uv *= rotate(45.0 * PI / 180.0);
//    float c = rect(vec2(size), vec2(uv.x, uv.y * boldness), 0.0);
//    return min(c, rect(vec2(size), vec2(uv.x * boldness, uv.y), 0.0));
    return 0.0;
}

float _borderRect(vec2 size, vec2 uv, float boldness, float edge) {
    float r1 = rect(size, uv, edge);
    float r2 = rect(size - boldness, uv, edge);
    float border = abs(r1 - r2);
    return border;
}

vec3 borderRect(vec3 color, vec3 borderColor, vec2 size, vec2 uv, float boldness, float edge) {
    float border = _borderRect(size, uv, boldness, edge);
    color = mix(color, borderColor, border);
    return color;
}

float maximizing(vec2 uv, vec2 size) {
//    float border = _borderRect(size, uv, 0.015, 0.0);
//    return border;
    return 0.0;
}

float minimizing(vec2 uv, vec2 size) {
//    float border = rect(vec2(size.x, size.y * 0.2), uv, 0.0);
//    return border;
    return 0.0;
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

    vec3 color1 = vec3(235.0, 235.0, 235.0) / 255.0;
    vec3 color2 = vec3(250.0, 250.0, 250.0) / 255.0;
    vec3 color3 = vec3(245.0, 245.0, 245.0) / 255.0;
    vec3 color4 = vec3(240.0, 240.0, 240.0) / 255.0;
    vec3 bgColor = vec3(1.0);
    vec3 objColor = vec3(1.0);
    vec3 edgeColor = vec3(0.95);
    vec3 windowBorderColor = vec3(0.8);
    vec3 buttonBorderColor = vec3(1.0);
    vec3 lastEdgeColor = edgeColor;
    vec3 closeButtonBGColor = vec3(1.0, 0.4, 0.5);
    vec3 miximizingButtonBGColor = vec3(0.0, 0.8, 0.3);
    vec3 minimizingButtonBGColor = vec3(1.0, 0.75, 0.0);
    vec3 closeButtonColor = vec3(0.25);
    vec2 closeButton = vec2(0.0);
    vec2 lastCloseButton = vec2(0.0);
    vec2 maximizingButton = vec2(0.0);
    vec2 lastMaximizingButton = vec2(0.0);
    vec2 minimizingButton = vec2(0.0);
    vec2 lastMinimizingButton = vec2(0.0);
    float edgeSize = 0.2;
    float t = (time + vIndex) * 0.6;
    float easing = ease_in_out_expo(fract(t));
    float easedTime = floor(t) + easing;
    float _speed = 1.0;
    float idTime = easedTime + 1.0 * _speed * id;
    float ballPosition = mod(idTime, 4.0);
    vec2 ballSize = vec2(0.0);
    float margin = 0.0;
    vec2 maxMove = (uvAspect - margin) - ballSize;
    vec2 move = (fract(idTime) * 2.0 - 1.0) * maxMove;
    vec2 dd = vec2(1.0);
    bool isVertical = false;
    float edge = 0.0;
    float lastEdge = 0.0;
    vec2 lastBallSize = maxMove;
    float windowBorderBoldness = 0.01;
    float buttonBorderBoldness = 0.01;
    float windowRadius = 0.06;
    float buttonRadius = 0.015;

    if (ballPosition < 1.0) {
        // left
        isVertical = true;
        ballSize.x += easing * maxMove.x;
        dd = vec2(move.x - ballSize.x, 0.0);
        ballSize.y = maxMove.y;
        edge = 1.0 - step(-edgeSize, uv.y - maxMove.y);
        lastEdge = edge;
        closeButton = vec2(uv.x + move.x, uv.y - maxMove.y);
        lastCloseButton = vec2(uv.x + uvAspect.x * 1.0, uv.y - maxMove.y);
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
        closeButton = vec2(uv.x + uvAspect.x * 1.0, uv.y - move.y);
        lastCloseButton = vec2(uv.x + uvAspect.x * 1.0, uv.y - maxMove.y);
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
        closeButton = vec2(uv.x - move.x + uvAspect.x * 2.0, uv.y - maxMove.y);
        lastCloseButton = vec2(uv.x + uvAspect.x, uv.y - maxMove.y);
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
        lastEdge = step(edgeSize, length(uv.y + maxMove.y - uvAspect.y * 2.0));
        closeButton = vec2(uv.x + uvAspect.x * 1.0, uv.y + move.y - uvAspect.y * 2.0);
        lastCloseButton = vec2(uv.x + uvAspect.x * 1.0, uv.y - maxMove.y);
        maximizingButton = closeButton;
        lastMaximizingButton = lastCloseButton;
        minimizingButton = closeButton;
        lastMinimizingButton = lastCloseButton;

        bgColor = color1;
        objColor = color2;
    }

    // last window
    bgColor = mix(lastEdgeColor, bgColor, lastEdge);
    color = mix(bgColor, color, rect(lastBallSize, uv, windowRadius));
    color = borderRect(color, windowBorderColor, uvAspect, uv, windowBorderBoldness, windowRadius);

    vec2 closeButtonProp = vec2(0.06, 7.0);  // size, boldness

    vec2 btnSize = vec2(edgeSize * 0.2);
    float btnXOssset = 0.01;
    float btnYOssset = 0.0;

    // last close button
    vec2 lastColseBtnPos = lastCloseButton + vec2(-edgeSize * 0.5 - btnXOssset, edgeSize * 0.5 + btnYOssset);
    color = mix(closeButtonBGColor, color, circle(btnSize.x, lastColseBtnPos));
    color = mix(color, closeButtonColor, close(lastColseBtnPos, closeButtonProp.x, closeButtonProp.y));

    float offf = -0.2;
    vec2 _minimizingPos = vec2(-edgeSize * (1.3 + offf) - btnXOssset, edgeSize * 0.5 + btnYOssset);
    vec2 _maximizingPos = vec2(-edgeSize * (2.1 + offf * 2.0) - btnXOssset, edgeSize * 0.5 + btnYOssset);

    // last maximizing button
    vec2 lastMaximizingBtnPos = lastMaximizingButton + _maximizingPos;
    color = mix(miximizingButtonBGColor, color, circle(btnSize.x, lastMaximizingBtnPos));
    color = mix(color, closeButtonColor, maximizing(lastMaximizingBtnPos, vec2(0.05, 0.05)));

    // last minimizing button
    vec2 lastMinimizingBtnPos = lastMinimizingButton + _minimizingPos;
    color = mix(minimizingButtonBGColor, color, circle(btnSize.x, lastMinimizingBtnPos));
    color = mix(color, closeButtonColor, minimizing(lastMinimizingBtnPos, vec2(0.05, 0.05)));

    // new window
    objColor = mix(edgeColor, objColor, edge);
    float cc = rect(ballSize, uv + dd, windowRadius);
    color = mix(objColor, color, cc);
    color = borderRect(color, windowBorderColor, ballSize, uv + dd, windowBorderBoldness, windowRadius);

    // new colose button
    vec2 colseBtnPos = closeButton + vec2(-edgeSize * 0.5 - btnXOssset, edgeSize * 0.5 + btnYOssset);
    color = mix(closeButtonBGColor, color, circle(btnSize.x, colseBtnPos));
    color = mix(color, closeButtonColor, close(colseBtnPos, closeButtonProp.x, closeButtonProp.y));

    // maximizing button
    vec2 maximizingBtnPos = maximizingButton + _maximizingPos;
    color = mix(miximizingButtonBGColor, color, circle(btnSize.x, maximizingBtnPos));
    color = mix(color, closeButtonColor, maximizing(maximizingBtnPos, vec2(0.05, 0.05)));

    // minimizing button
    vec2 minimizingBtnPos = minimizingButton + _minimizingPos;
    color = mix(minimizingButtonBGColor, color, circle(btnSize.x, minimizingBtnPos));
    color = mix(color, closeButtonColor, minimizing(minimizingBtnPos, vec2(0.05, 0.05)));

    float borderWidth = 0.0;

    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}