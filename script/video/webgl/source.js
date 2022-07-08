


const vertex = `

attribute vec2 aPos;

void main() {
    gl_Position = vec4(aPos, 0, 1);
}

`;



const fragment = `

precision highp int;
precision mediump float;

#define uLen 2
#define uPosI 0
#define uColI 0

uniform float uT[uLen];
uniform float uC[uLen];
uniform int uI[uLen];

uniform float uM;

uniform sampler2D uTex;
uniform ivec2 uTexDim;

vec4 texel(int x, int y) {
    vec2 c = vec2(x, y);
    vec2 s = vec2(uTexDim);
    vec2 v = (c + 0.5) / s;
    return texture2D(uTex, v);
}

void main() {
    vec2 c = vec2(gl_FragCoord);

    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
    float s = 0.0;

    int width = uTexDim.x;
    int height = uTexDim.y;
    for (int i = 0; i < 100; i += 2) {
        if (i >= width) break;

        vec4 aPos = texel(i, uI[uPosI]);
        vec4 bPos = texel(i, uI[uPosI] + 1);
        vec4 pos = mix(aPos, bPos, uC[uPosI]);

        vec4 aCol = texel(i + 1, uI[uColI]);
        vec4 bCol = texel(i + 1, uI[uColI] + 1);
        vec4 col = mix(aCol, bCol, uC[uColI]);

        vec2 p = vec2(pos[0], pos[1]);
        float d = distance(c, p);

        if (d < 1.0) d = 1.0;
        float m = 50.0 / d;
        m = pow(m, uM);

        if (m > 300.0) {
            r = col[0];
            g = col[1];
            b = col[2];
            s = 0.0;
            break;
        }

        r += col[0] * m;
        g += col[1] * m;
        b += col[2] * m;
        s += m;
    }

    r = r / 255.0;
    g = g / 255.0;
    b = b / 255.0;

    if (s > 0.0) {
        r = r / s;
        g = g / s;
        b = b / s;
    }

    gl_FragColor = vec4(r, g, b, 1.0);
}

`;



export default {
    vertex,
    fragment
}
