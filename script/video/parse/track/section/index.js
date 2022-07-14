import curve from './curve.js';
import col from './col.js';



const section = (section, track) => {
    let _ = {};

    _.start = section.start;
    _.length = section.duration;
    _.end = _.start + _.length;

    _.col = col(_, section, track);
    _.curve = curve(_, section, track);

    return _;
}



export default section;
