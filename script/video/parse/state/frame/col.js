import rgb from '/script/util/rgb.js';



const col = (_, frame, section, track) => {
    let col = [];

    let color = section.col;
    let timbre = frame.timbre;
    let min = Math.min(...timbre);
    let max = Math.max(...timbre);
    let d = max - min;
    let o = -min;

    let p = (_.end - section.start) / section.length;
    p = isNaN(p) || p < 0 ? 0 : p > 1 ? 1 : p;
    let t = section.curve(p);
    let f = 1 - t;

    for (let i = 0; i < 6; ++i) {
        let x = timbre[i + 0] || 0;
        let y = timbre[i + 6] || 0;
        let a = color.a[i % color.a.length];
        let b = color.b[i % color.b.length];
        if (!a || !b) return col.push([0, 0, 0]);

        let h = (x + o) / d;
        let s = y < 0 ? 0 : y / +d;
        let v = y > 0 ? 0 : y / -d;

        col.push(rgb(
            (a.h[0] * f + b.h[0] * t) + (a.h[1] * f + b.h[1] * t) * h,
            (a.s[0] * f + b.s[0] * t) + (a.s[1] * f + b.s[1] * t) * s,
            (a.v[0] * f + b.v[0] * t) + (a.v[1] * f + b.v[1] * t) * v
        ))
    }

    return col;
}



export default col;
