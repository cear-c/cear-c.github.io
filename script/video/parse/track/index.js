import section from './section/index.js';
import col from './col.js';
import mod from './mod.js';



const track = track => {
    if (!track?.track) return {};
    let _ = {};

    _.e = track.track;
    _.length = _.e.duration;

    _.col = col(_, track);
    _.mod = mod(_, track);

    _.sections = [];
    for (let i = 0; i < track.sections?.length || 0; ++i) {
        _.sections.push(section(track.sections[i], _));
    }

    return _;
}



export default track;
