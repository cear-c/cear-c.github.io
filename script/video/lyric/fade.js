import bezier from '/script/util/bezier.js';



const _fade = {
    in: {
        curve: bezier(0.8, 0, 1, 1),
        offset: 0.2,
        time: 0.5
    },
    out: {
        curve: bezier(0.5, 0, 1, 1),
        offset: 0.2,
        time: 0.5
    },
    mid: {
        step: 0.05,
        max: 0.25
    }
}



const fade = (_, t, d, l) => {
    let fade = d < 0 ? _fade.in : _fade.out;
    let c = Math.max(0, fade.offset - l / 2);
    let o = Math.max(0, fade.offset - c);
    let f = Math.max(0, fade.time - c);
    t += o;

    let mid = _fade.mid;
    if (t >= f) return false;
    let p = t <= 0 ? 0 : fade.curve(t / f);
    let q = t >= 0 ? 1 : 1 - t / (o - l / 2);
    let s = (l / 2 - o) * mid.step;
    if (s > mid.max) s = mid.max;

    s *= _.h;
    q *= s * d;
    p *= (s - _.h) * d;
    let m = Math.round(p - q);
    _.ctx.translate(0, m);

    return true;
}



export default fade;
