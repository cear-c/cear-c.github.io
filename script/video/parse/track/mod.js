


const mod = (_, track) => {
    let mod = {};

    let e = _.e.energy;

    mod.min = 1;
    mod.max = 2 + 2 * e;
    mod.pow = 1 + 4 * e;

    return mod;
}



export default mod;
