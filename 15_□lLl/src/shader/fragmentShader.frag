//#define GLSLIFY 1

uniform vec2 resolution;
uniform float time;

varying vec2 vUv;

vec3 permute(vec3 x) {
    return mod(((x*34.0)+1.0)*x, 289.0);
}

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

void main() {
    vec2 uv = (vUv * resolution.xy * 2.0 - resolution.xy) / min(resolution.x, resolution.y);

    float f = 30.0;
    uv = floor(uv * f) / f;
    float edge = smoothstep(1.0, 0.0, abs(length(uv.x))) * smoothstep(2.0, 0.0, abs(length(uv.y)));
    edge = 1.0;

    float _t = 0.08;
    vec2 t = vec2(cos(time * _t) * edge, sin(time * _t) * edge);

    uv.y += snoise(uv + t);
    uv.x += snoise(uv);
    float noise = snoise(vec2(uv * 2.0 + t));

    vec3 c0 = vec3(4, 191, 173);  // main
    vec3 c1 = vec3(27, 100, 242);  // point1
    vec3 c2 = vec3(4, 247, 198);  // point2
    vec3 c3 = vec3(32, 45, 115);  // point3
    vec3 c4 = vec3(204, 217, 207);  // background

    vec4 color = vec4(c0, 255.0);

    if (noise > -0.2) {
        color.rgb = c1;
    }
    if (noise > -0.1) {
        color.rgb = c2;
    }
    if (noise > -0.05) {
        color.rgb = c3;
    }
    if (noise > 0.0) {
        color.rgb = c4;
    }
    color = color / 255.0;

    gl_FragColor = vec4(color.rgb, 1.0);
}