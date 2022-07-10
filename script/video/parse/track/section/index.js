


const section = (s, t) => {
    if (!s || !t) return {};
    let section = {};

    section.start = s.start;
    section.length = s.duration;
    section.end = section.start + section.length;



    return section;
}



export default section;
