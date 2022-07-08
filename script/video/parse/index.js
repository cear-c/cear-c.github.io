import _state from './state/index.js';
import track from './track/index.js';



const _ = {};



const play = e => {
    _.track = track(e);
    _.e = e;
}



const state = t => {
    if (!_.e) return;
    let state = {};

    let b = _.e.bars;
    let l = b?.length || 0;
    if (l < 2) return;
    let end = b[l - 1];
    let start = b[l - 2];
    for (let i = 0; i < l; ++i) {
        if (t > b[i]) continue;
        start = b[i - 1] || 0;
        end = b[i];
        break;
    }

    let frames = [];
    let f = _.e.segments || [];
    for (let i = 0; i < f.length; ++i) {
        let done = f[i].start + f[i].duration;
        if (done < start) continue;
        let l = f[i].start > end;
        frames.push(f[i]);
        if (l) break;
    }

    if (!frames.length) return;
    let length = end - start;
    state.length = length;
    state.start = start;
    state.end = end;

    let section = null;
    let s = _.track?.sections || [];
    for (let i = 0; i < s?.length; ++i) {
        let done = s[i].start + s[i].duration;
        if (done < start) continue;
        section = s[i];
        break;
    }

    if (!section) return;
    let state_ = _state(frames, section, _.track);
    Object.assign(state, state_);
    _.state = state;
    return state;
}



const config = t => {
    if (!_.state) return;
    let config = {};

    let start = _.state.start;
    let length = _.state.length;
    t = (t - start) / length;
    if (isNaN(t)) t = 0;
    if (t < 0) t = 0;
    if (t > 1) t = 1;

    let curves = _.state.curves;
    config.t = new Float32Array(curves.length);
    for (let i = 0; i < curves.length; ++i) {
        config.t[i] = curves?.[i]?.(t) || t;
    }

    let f = _.state.frames;
    config.i = new Int32Array(config.t.length);
    config.c = new Float32Array(config.t.length);
    for (let i = 0; i < config.t.length; ++i) {
        let t = start + config.t[i] * length;
        for (let j = 0; j < f.length; ++j) {
            if (f[j].end < t) continue;
            let start = f[j].start;
            let length = f[j].length;
            config.c[i] = (t - start) / length;
            config.i[i] = j;
            break;
        }
    }



    config.m = 3;



    return config;
}



export default {
    play,
    state,
    config
}
