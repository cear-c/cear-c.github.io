import dim from './dim.js';
import pos from './pos.js';
import col from './col.js';
import mod from './mod.js';



const frame = (frame, section, track) => {
    let _ = {};

    _.start = frame.start;
    _.length = frame.duration;
    _.end = _.start + _.length;

    _.dim = dim(_, frame, section, track);
    _.pos = pos(_, frame, section, track);
    _.col = col(_, frame, section, track);
    _.mod = mod(_, frame, section, track);

    return _;
}



export default frame;
