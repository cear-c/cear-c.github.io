


const frame = (f, s, t) => {
    let frame = {};

    frame.start = f.start;
    frame.length = f.duration;
    frame.end = frame.start + frame.length;



    frame.pos = pos(f, s, t);
    frame.col = col(frame.pos, f, s, t);

    return frame;
}



const pos = (f, s, t) => {
    let pos = [];
    let w = window.innerWidth;
    let h = window.innerHeight;
    for (let i = 0; i < 6; ++i) {
        pos.push([
            f.pitches[i * 2 + 0] * w,
            f.pitches[i * 2 + 1] * h
        ])
    }
    return pos;
}



const col = (p, f, s, t) => {
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



export default frame;
