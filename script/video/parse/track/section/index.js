


const section = (s, t) => {
    if (!s || !t) return {};
    let section = {};
    let start = s.start;
    let length = s.duration;
    let end = start + length;
    section.length = length;
    section.start = start;
    section.end = end;



    return section;
}



export default section;
