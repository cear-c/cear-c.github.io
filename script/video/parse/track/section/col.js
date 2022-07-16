


const col = (_, section, track) => {
    let col = {};

    let end = _.end / track.length;
    let start = _.start / track.length;
    col.a = range(_, section, track, start);
    col.b = range(_, section, track, end);

    return col;
}



const range = (_, section, track, t) => {
    let col = [];

    t = isNaN(t) || t < 0 ? 0 : t > 1 ? 1 : t;
    let h = track.col.h[0] + track.col.h[1] * t;
    let s = track.col.s;
    let v = track.col.v;

    let ener = track.e.energy;
    let loud = section.loudness;
    let dir = track.e.mode ? 1 : -1;
    loud = Math.max(loud, -30);
    if (loud > 0) loud = 0;

    let d = 45 + 1 * loud;
    let l = 15 + 30 * ener;

    for (let i = 0; i < 6; ++i) {
        col.push({
            h: [h + d * dir * i, l * dir],
            s: [s[0], s[1] * ener],
            v: [v[0], v[1] * ener]
        })
    }

    return col;
}



export default col;
