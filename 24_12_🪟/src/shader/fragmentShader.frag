precision mediump float;

const float PI = 3.1415926535897932384626433832795;

uniform vec2 resolution;
uniform float time;
uniform sampler2D texture;

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

vec3 edgeStripe(vec3 edgeColor, vec2 uv) {
    return mix(edgeColor * 0.98, edgeColor, step(0.5, fract(uv.y * 30.0)));
}

float circle(float size, vec2 uv) {
    return step(size, length(uv));
}

float borderCircle(float size, vec2 uv, float boldness) {
    float c1 = circle(size, uv);
    float c2 = circle(size - boldness, uv);
    return abs(c1 - c2);
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

vec3 borderBtn(vec2 uv, vec3 color, vec3 bgColor, float size, float boldness) {
    float b = borderCircle(size, uv, boldness);
    float f = step(length(uv), size) * (1.0 - smoothstep(size, 0.0, length(uv)));
    color = mix(color, bgColor * 0.6, f);
    return color;
}

vec3 btn(vec2 uv, vec3 color, vec3 bgColor, float size) {
    color = mix(color, bgColor * 0.0, smoothstep(size * 1.3, size * 0.4, length(vec2(uv.x, uv.y + 0.005))));
    bgColor = mix(bgColor * 1.2, bgColor, smoothstep(0.0, 1.0, (uv.y + 0.45)));
    bgColor = mix(vec3(1.9), bgColor, smoothstep(0.0, 0.06, length(vec2(uv.x, uv.y * 1.0 + 0.05))));
    bgColor = mix(vec3(1.9), bgColor, smoothstep(0.0, 0.03, length(vec2(uv.x * 0.8, uv.y * 1.4 - 0.045))));
    color = mix(bgColor, color, circle(size, uv));
    return color;
}

void main() {
    vec2 uv = (vUv.xy * vResolution * 2.0 - vResolution.xy) / min(vResolution.x, vResolution.y);
    vec2 uvAspect = vResolution / min(vResolution.x, vResolution.y);

    vec2 channelSize0 = vec2(1310.0, 1114.0);
    vec2 ratio = vec2(
        max((vResolution.x / vResolution.y) / (channelSize0.x / channelSize0.y), 1.0),
        max((vResolution.y / vResolution.x) / (channelSize0.y / channelSize0.x), 1.0)
    );
    vec2 uvForTex = vec2(
        vUv.x * ratio.x + (1.0 - ratio.x) * 0.5,
        vUv.y * ratio.y + (1.0 - ratio.y) * 0.5
    );

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

    vec3 color1 = vec3(251.0, 251.0, 251.0) / 255.0;
    vec3 color2 = vec3(251.0, 251.0, 251.0) / 255.0;
    vec3 color3 = vec3(251.0, 251.0, 251.0) / 255.0;
    vec3 color4 = vec3(251.0, 251.0, 251.0) / 255.0;
    vec3 bgColor = vec3(1.0);
    vec3 objColor = vec3(1.0);
    vec3 edgeTopColor = vec3(0.95);
    vec3 edgeBottomColor = vec3(0.89);
    vec3 edgeColor = mix(edgeTopColor, edgeBottomColor, (length(vUv.x * 2.0 - 1.0)));
    vec3 windowBorderColor = edgeColor;
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
    float buttonBorderBoldness = 0.003;
    float buttonSize = 0.04;
    float windowRadius = 0.03;
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
        edgeColor = mix(edgeTopColor, edgeBottomColor, smoothstep(0.0, edgeSize, length(uv.y - maxMove.y)));
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
        edgeColor = mix(edgeTopColor, edgeBottomColor, smoothstep(0.0, edgeSize, length(uv.y - move.y)));
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
        edgeColor = mix(edgeTopColor, edgeBottomColor, smoothstep(0.0, edgeSize, length(uv.y - maxMove.y)));
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
        edgeColor = mix(edgeTopColor, edgeBottomColor, smoothstep(0.0, edgeSize, length(uv.y + move.y - uvAspect.y * 2.0)));
    }
    lastEdgeColor = mix(edgeTopColor, edgeBottomColor, smoothstep(0.0, edgeSize, length(uv.y + maxMove.y - uvAspect.y * 2.0)));

    vec4 lastTex = texture2D(texture, uvForTex);
    bgColor = lastTex.rgb;

    // last window
    lastEdgeColor = edgeStripe(lastEdgeColor, uv);
    bgColor = mix(lastEdgeColor, bgColor, lastEdge);
    color = mix(bgColor, color, rect(lastBallSize, uv, windowRadius));
    color = borderRect(color, windowBorderColor, uvAspect, uv, windowBorderBoldness, windowRadius);

    vec2 closeButtonProp = vec2(0.05, 7.0);  // size, boldness

    vec2 btnSize = vec2(edgeSize * 0.2);
    float btnXOssset = 0.01;
    float btnYOssset = 0.0;

    // last close button
    vec2 lastColseBtnPos = lastCloseButton + vec2(-edgeSize * 0.5 - btnXOssset, edgeSize * 0.5 + btnYOssset);
    color = btn(lastColseBtnPos, color, closeButtonBGColor, btnSize.x);
    color = borderBtn(lastColseBtnPos, color, closeButtonBGColor, buttonSize, buttonBorderBoldness);

    float offf = -0.2;
    vec2 _minimizingPos = vec2(-edgeSize * (1.3 + offf) - btnXOssset, edgeSize * 0.5 + btnYOssset);
    vec2 _maximizingPos = vec2(-edgeSize * (2.1 + offf * 2.0) - btnXOssset, edgeSize * 0.5 + btnYOssset);

    // last maximizing button
    vec2 lastMaximizingBtnPos = lastMaximizingButton + _maximizingPos;
    color = btn(lastMaximizingBtnPos, color, miximizingButtonBGColor, btnSize.x);
    color = borderBtn(lastMaximizingBtnPos, color, miximizingButtonBGColor, buttonSize, buttonBorderBoldness);

    // last minimizing button
    vec2 lastMinimizingBtnPos = lastMinimizingButton + _minimizingPos;
    color = btn(lastMinimizingBtnPos, color, minimizingButtonBGColor, btnSize.x);
    color = borderBtn(lastMinimizingBtnPos, color, minimizingButtonBGColor, buttonSize, buttonBorderBoldness);

    vec4 newTex = texture2D(texture, uvForTex + dd);
    objColor = newTex.rgb;

    // new window
    edgeColor = edgeStripe(edgeColor, uv);
    objColor = mix(edgeColor, objColor, edge);
    float cc = rect(ballSize, uv + dd, windowRadius);
    color = mix(objColor, color, cc);
    color = borderRect(color, windowBorderColor, ballSize, uv + dd, windowBorderBoldness, windowRadius);

    // new colose button
    vec2 colseBtnPos = closeButton + vec2(-edgeSize * 0.5 - btnXOssset, edgeSize * 0.5 + btnYOssset);
    color = btn(colseBtnPos, color, closeButtonBGColor, btnSize.x);
    color = borderBtn(colseBtnPos, color, closeButtonBGColor, buttonSize, buttonBorderBoldness);

    // maximizing button
    vec2 maximizingBtnPos = maximizingButton + _maximizingPos;
    color = btn(maximizingBtnPos, color, miximizingButtonBGColor, btnSize.x);
    color = borderBtn(maximizingBtnPos, color, miximizingButtonBGColor, buttonSize, buttonBorderBoldness);

    // minimizing button
    vec2 minimizingBtnPos = minimizingButton + _minimizingPos;
    color = btn(minimizingBtnPos, color, minimizingButtonBGColor, btnSize.x);
    color = borderBtn(minimizingBtnPos, color, minimizingButtonBGColor, buttonSize, buttonBorderBoldness);

    float borderWidth = 0.0;

    float l = step(vResolution.x * vUv.x, borderWidth)
        + step(vResolution.x - borderWidth, vResolution.x * vUv.x)
        + step(vResolution.y *vUv.y, borderWidth)
        + step(vResolution.y - borderWidth, vResolution.y * vUv.y);

    float transparency = mix(1.0, 0.0, l);

    gl_FragColor = vec4(color, transparency);
}