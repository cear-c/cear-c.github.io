import frame from './frame/index.js';
import curves from './curves.js';
import dim from './frame/dim.js'



const _state = {
    frames: [],
    uri: ''
}



const state = (state, section, track) => {
    let _ = {};

    _.dim = dim(_, state, section, track);

    if (track.e.uri !== _state.uri) {
        _state.uri = track.e.uri;
        _state.frames = [];
    }

    _.frames = [];
    let c = _state.frames;
    _state.frames = _.frames;
    for (let i = 0; i < state.length; ++i) {
        while (c.length && c[0].start !== state[i].start) c.shift();
        if (!c.length) _.frames.push(frame(state[i], section, track));
        else _.frames.push(c.shift());
    }

    _.curves = curves(_, state, section, track);

    return _;
}



export default state;
