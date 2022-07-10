


const vertex = `

attribute vec2 aPos;

void main() {
    gl_Position = vec4(aPos, 0, 1);
}

`;



const fragment = `

precision highp int;
precision mediump float;



uniform int uI;
uniform float uT[2];
uniform float uD[2];



uniform sampler2D uTex;
uniform ivec2 uTexDim;

vec4 texel(int x, int y) {
    vec2 c = vec2(x, y);
    vec2 s = vec2(uTexDim);
    vec2 v = (c + 0.5) / s;
    return texture2D(uTex, v);
}



void main() {
    float r = 0.0;
    float g = 0.0;
    float b = 0.0;
    float s = 0.0;

    vec2 c = vec2(gl_FragCoord);
    for (int i = 0; i < 100; i += 2) {
        if (i >= uTexDim.x) break;



        vec4 aPos = texel(i, uI);
        vec4 bPos = texel(i, uI + 1);
        vec4 pos = mix(aPos, bPos, uD[0]);

        vec4 aCol = texel(i + 1, uI);
        vec4 bCol = texel(i + 1, uI + 1);
        vec4 col = mix(aCol, bCol, uD[0]);

        float aMod = aCol[3];
        float bMod = bCol[3];
        float mod = mix(aMod, bMod, uD[0]);



        vec2 p = vec2(pos[0], pos[1]);
        float d = distance(c, p);
        if (d < 1.0) d = 1.0;
        float m = 50.0 / d;
        m = pow(m, mod);

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
