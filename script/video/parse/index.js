import _state from './state/index.js';
import track from './track/index.js';



const _ = {};



const play = e => {
    _.track = track(e);
    _.e = e;
}



const state = time => {
    if (!_.e) return;
    let state = {};

    let b = _.e.bars;
    let l = b?.length || 0;
    if (l < 2) return;
    let start = b[l - 1];
    let end = _.e.track?.duration || start;
    for (let i = 0; i < l; ++i) {
        if (time > b[i]) continue;
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

    let s = _.track?.sections;
    let section = s[s.length - 1];
    for (let i = 0; i < s.length || 0; ++i) {
        if (s[i].end < start) continue;
        section = s[i];
        break;
    }

    if (!section) return;
    let state_ = _state(frames, section, _.track);
    Object.assign(state, state_);
    _.state = state;
    return state;
}



const config = time => {
    if (!_.state) return;
    let config = {};

    let start = _.state.start;
    let length = _.state.length;
    let t = (time - start) / length;

    let f = _.state.frames;
    let curves = _.state.curves;
    config.t = new Float32Array(curves.length);
    config.d = new Float32Array(curves.length);
    for (let i = 0; i < curves.length; ++i) {
        let curve = curves?.[i];
        config.t[i] = curve?.(t) || t;
        for (let j = 0; j < f.length; ++j) {
            if (f[j].end < time) continue;
            let start = f[j].start;
            let length = f[j].length;
            let d = (time - start) / length;
            config.d[i] = curve?.(d) || d;
            if (!i) config.i = j;
            break;
        }
    }

    return config;
}



export default {
    play,
    state,
    config
}
