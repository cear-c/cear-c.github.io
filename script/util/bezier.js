const subdivide = (x, a, b, ax, bx) => {
    let cx, ct;
    let i = 0;
    do {
        ct = a + (b - a) / 2;
        cx = calc(ct, ax, bx) - x;
        if (cx > 0) b = ct;
        else a = ct;
    } while (Math.abs(cx) > 0.0000001 && ++i < 10);
    return ct;
}

const iterate = (x, g, ax, bx) => {
    for (let i = 0; i < 4; ++i) {
        let cs = slope(g, ax, bx);
        if (!cs) return g;
        let cx = calc(g, ax, bx) - x;
        g -= cx / cs;
    }
    return g;
}

const slope = (t, a, b) => 3 * A(a, b) * t * t + 2 * B(a, b) * t + C(a);
const calc = (t, a, b) => ((A(a, b) * t + B(a, b)) * t + C(a)) * t;
const A = (a, b) => 1 - 3 * b + 3 * a;
const B = (a, b) => 3 * b - 6 * a;
const C = (a) => 3 * a;

const bezier = (ax, ay, bx, by) => {
    if (ax === ay && bx === by) return x => x;
    let sample = new Array(11);
    let l = sample.length - 1;
    let s = 1 / (l - 1);
    for (let i = 0; i <= l; ++i) {
        sample[i] = calc(i * s, ax, bx);
    }

    const t = x => {
        let i = 0;
        let p = 0;
        for (; i < l - 1 && sample[i + 1] <= x; ++i) p += s;
        let d = (x - sample[i]) / (sample[i + 1] - sample[i]);
        let g = p + d * s;
        let initial = slope(g, ax, bx);
        if (initial >= 0.001) return iterate(x, g, ax, bx);
        else if (initial) return subdivide(x, p, p + s, ax, bx);
        else return g;
    }

    return x => {
        if (x === 0 || x === 1) return x;
        return calc(t(x), ay, by);
    }
}

export default c => {
    let a = c < 0 ? 0 : c < 1 ? c : 1;
    let b = c < 0 ? c : c < 1 ? 0 : c - 1;
    return bezier(a, -b, 1 - a, 1 + b);
}
