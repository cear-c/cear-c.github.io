import bezier from '/script/util/bezier.js';
import frame from './frame/index.js';



const _ = {}



const state = (f, s, t) => {
    let state = {};


    state.frames = [];
    let c = _.frames || [];
    for (let i = 0; i < f.length; ++i) {
        while (c.length && c[0].start !== f[i].start) c.shift();
        if (!c.length) state.frames.push(frame(f[i], s, t));
        else state.frames.push(c.shift());
    }
    _.frames = state.frames;



    state.curves = [null];
    state.curves.push(bezier(0.5));



    return state;
}



export default state;
