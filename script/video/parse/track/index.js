import section from './section/index.js';



const track = e => {
    if (!e) return {};
    let track = {};
    track.e = e;



    track.sections = [];
    for (let i = 0; i < e?.sections?.length || 0; ++i) {
        track.sections.push(section(e.sections[i], track));
    }
    return track;
}



export default track;
