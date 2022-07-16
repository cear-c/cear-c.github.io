import bar from '/script/bar/index.js';
import text from './text.js';
import fade from './fade.js';



const _ = {}



const init = () => {
    let canvas = document.querySelector('#lyric');
    let ctx = canvas.getContext('2d');
    _.ctx = ctx;

    const resize = () => {
        _.w = canvas.clientWidth;
        _.h = canvas.clientHeight;
        canvas.height = _.h;
        canvas.width = _.w;
    }

    window.addEventListener('resize', resize);
    resize();
}



const play = e => {
    delete _.text;
    _.lyric = e?.lyrics;
    if (!_.lyric?.length) delete _.lyric;
    else for (let i = 0; i < _.lyric.length; ++i) {
        _.lyric[i].start = _.lyric[i].time / 1000;
        if (i >= _.lyric.length - 1) break;
        let next = _.lyric[i + 1].time;
        _.lyric[i].end = next / 1000;
    }
}



const frame = time => {
    _.ctx.clearRect(0, 0, _.w, _.h);
    if (!_.lyric || !bar.lyric()) return;

    let lyric = [];
    if (!_.text) _.text = [];
    for (let i = 0; i < _.lyric.length; ++i) {
        if (_.lyric[i].start > time + 2) break;
        if (_.lyric[i].start < time) continue;
        let l = _.lyric[i].words?.length || 0;
        if (l > 1) lyric.push(_.lyric[i]);
    }

    for (let i = 0; i < lyric.length; ++i) {
        let found = false;
        for (let j = 0; j < _.text.length; ++j) {
            if (_.text[j].time === lyric[i].time) {
                found = true;
                break;
            }
        }
        if (!found) {
            _.text.push({
                ...lyric[i],
                draw: text(_, lyric[i])
            })
        }
    }

    for (let i = 0; i < _.text.length; ++i) {
        let t = 0;
        let end = _.text[i].end;
        let start = _.text[i].start;
        let mid = (start + end) / 2;
        let d = time < mid ? -1 : 1;
        if (d > 0) t = time - end;
        else t = start - time;
        let l = end - start;

        if (!fade(_, t, d, l)) {
            if (d < 0) continue;
            _.text.splice(i--, 1);
            continue;
        }

        _.text[i].draw?.(_, t, d, l);
        _.ctx.setTransform(1, 0, 0, 1, 0, 0);
    }
}



export default {
    init,
    play,
    frame
}
