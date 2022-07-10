import section from './section/index.js';



const track = e => {
    if (!e) return {};
    let track = {};
    track.e = e;



    track.min = 1;
    track.max = 5;
    track.pow = 3;


    track.sections = [];
    for (let i = 0; i < e?.sections?.length || 0; ++i) {
        track.sections.push(section(e.sections[i], track));
    }

    return track;
}



export default track;
