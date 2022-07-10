


const frame = (f, s, t) => {
    let frame = {};

    frame.start = f.start;
    frame.length = f.duration;
    frame.end = frame.start + frame.length;

    frame.pos = pos(f, s, t);
    frame.col = col(f, s, t);
    frame.mod = mod(f, s, t);

    return frame;
}



const pos = (f, s, t) => {
    let pos = [];

    let pi = Math.PI;
    let w = window.innerWidth;
    let h = window.innerHeight;

    let r = Math.sqrt(2);
    let d = Math.sqrt(w * w + h * h) / 2;
    let o = Math.sqrt(d * d / 2);
    let sx = w / 2 - o;
    let sy = h / 2 - o;

    for (let i = 0; i < 6; ++i) {
        let a = pi / 4 * 3 + pi / 3 * i;
        let x = f.pitches[i * 2 + 0];
        let y = f.pitches[i * 2 + 1];
        let cos = Math.cos(a);
        let sin = Math.sin(a);

        let rx = r + cos * (x - r) + sin * (y - r);
        let ry = r + cos * (y - r) - sin * (x - r);

        pos.push([
            sx + rx / r * o,
            sy + ry / r * o
        ])
    }

    return pos;
}



const col = (f, s, t) => {
    let col = [];

    let min = Math.min(...f.timbre);
    let max = Math.max(...f.timbre);
    let d = 256 / (max - min);
    let o = -min;

    for (let i = 0; i < 6; ++i) {
        let j = Math.floor(i * 1.8);
        col.push([
            (f.timbre[j + 0] + o) * d,
            (f.timbre[j + 1] + o) * d,
            (f.timbre[j + 2] + o) * d
        ])
    }

    return col;
}



const mod = (f, s, t) => {
    let loudness = f.loudness?.[1] || 0;
    loudness = (loudness + 60) / 60;
    if (loudness < 0) loudness = 0;
    loudness = Math.pow(loudness, t.pow);
    loudness = t.min + loudness * (t.max - t.min);

    let mod = [];

    for (let i = 0; i < 6; ++i) {
        mod.push(loudness);
    }

    return mod;
}



export default frame;
