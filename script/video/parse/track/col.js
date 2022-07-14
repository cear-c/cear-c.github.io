


const col = (_, track) => {
    let col = {};

    let ms = _.e.duration_ms || 0;
    let val = _.e.valence || 0.5;
    let dir = _.e.mode ? 1 : -1;

    val = val < 0 ? 0 : val > 1 ? 1 : val;
    let light = val < 0.5 ? 0 : val - 0.5;
    let dark = val > 0.5 ? 0 : 0.5 - val;

    let m = dir * 5;
    let h = dir * (ms % 360);
    let s = 100 - 20 * light;
    let v = 100 - 60 * dark;

    col.h = [h, 360 * m];
    col.s = [s, -120];
    col.v = [v, -120];

    return col;
}



export default col;
