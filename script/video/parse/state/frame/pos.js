


const pos = (_, frame, section, track) => {
    let pos = [];

    let r = _.dim.r;
    let o = Math.sqrt(r * r / 2);
    let sx = _.dim.x - o;
    let sy = _.dim.y - o;
    let s = _.dim.s;

    let pi = Math.PI;
    for (let i = 0; i < 6; ++i) {
        let x = frame.pitches[i * 2 + 0] || 0;
        let y = frame.pitches[i * 2 + 1] || 0;
        let a = pi / 4 * 3 + pi / 3 * i;
        let cos = Math.cos(a);
        let sin = Math.sin(a);

        let rx = s + cos * (x - s) + sin * (y - s);
        let ry = s + cos * (y - s) - sin * (x - s);

        pos.push([
            sx + rx / s * o,
            sy + ry / s * o
        ])
    }

    return pos;
}



export default pos;
