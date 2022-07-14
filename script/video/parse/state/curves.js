import bezier from '/script/util/bezier.js';



const curves = (_, state, section, track) => {
    let curves = [];

    curves.push(undefined);
    curves.push(curve(_, state, section, track));

    return curves;
}



const curve = (_, state, section, track) => {
    return bezier(0.5);
}



export default curves;
