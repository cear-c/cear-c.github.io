


const dim = (_, frame, section, track) => {
    let dim = {};

    let w = window.innerWidth;
    let h = window.innerHeight;
    let d = Math.sqrt(w * w + h * h);

    dim.s = 2;
    dim.r = d / 2;
    dim.x = w / 2;
    dim.y = h / 2;
    dim.w = w;
    dim.h = h;

    return dim;
}



export default dim;
