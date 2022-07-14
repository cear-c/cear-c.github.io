const rgb = (h, s, v) => {
    h = (h / 360) % 1;
    if (h < 0) h += 1;

    s = s / 100;
    if (s < 0) s = 0;
    if (s > 1) s = 1;

    v = v / 100;
    if (v < 0) v = 0;
    if (v > 1) v = 1;

    let r, g, b;
    let i = Math.floor(h * 6);
    let f = h * 6 - i;
    let p = v * (1 - s);
    let q = v * (1 - f * s);
    let t = v * (1 - (1 - f) * s);
    switch (i % 6) {
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }

    r = r * 256;
    g = g * 256;
    b = b * 256;
    return [r, g, b];
}



export default rgb;
