


const wrap = (_, w, lyric) => {

    let h = 0;
    let s = 1;
    let less = 0;
    let line = '';
    let lines = [];
    let words = lyric.words.split(/\s+/);
    for (let i = 0; i < words.length; ++i) {
        let add = line && line + ' ';
        if (!words[i]) continue;
        else add += words[i];

        let size = measure(_, add).width * s;
        let last = i >= words.length -1;
        if (size < w && !last) {
            less = size / w;
            line = add;
            continue;
        }

        if (size < w) line = add;
        else if (!line) line = add;
        else {
            let more = w / (size / s);
            if (less > more) --i;
            else line = add;
        }

        let m = measure(_, line);
        s = Math.min(s, w / m.width);
        let height = m.height * s * 1.1;
        let width = m.width * s;
        w = width;

        lines.push({
            words: line,
            x: w,
            y: h,
            w: s,
            h: s
        })

        line = '';
        h += height;
    }

    let x = lines[0]?.x;
    let y = (_.h - h) / 2;
    for (let i = 0; i < lines.length; ++i) {
        let w = x - lines[i].x;
        lines[i].x = (_.w - x) / 2 + w;
        lines[i].y += y;
    }

    return lines;
}



const measure = (_, s) => {
    let m = _.ctx.measureText(s);
    let descent = m.fontBoundingBoxDescent;
    let ascent = m.fontBoundingBoxAscent;
    let right = m.actualBoundingBoxRight;
    let left = m.actualBoundingBoxLeft;
    let height = ascent + descent;
    let width = left + right;
    return {
        height,
        width
    }
}



const text = (_, lyric) => {
    let m = Math.min(_.w, _.h);

    let font = 12 + Math.floor(m / 24);
    font = Math.max(16, Math.min(64, font));
    _.ctx.font = `bold ${font}px circular`;

    let w = Math.floor(m * 0.8);
    w = Math.max(250, Math.min(1000, w));

    let lines = wrap(_, w, lyric);
    if (!lines?.length) return;

    return (_, t, d, l) => {
        _.ctx.textBaseline = 'top';
        _.ctx.font = `bold ${font}px circular`;

        for (let i = 0; i < lines.length; ++i) {
            let line = lines[i];
            let w = line.w || 1;
            let h = line.h || 1;
            let words = line.words;
            let matrix = _.ctx.getTransform();
            if (w !== 1 || h !== 1) _.ctx.scale(w, h);
            let x = Math.round(line.x / w);
            let y = Math.round(line.y / h);
            _.ctx.fillText(words, x, y);
            _.ctx.setTransform(matrix);
        }
    }
}



export default text;
