


const mod = (_, frame, section, track) => {
    let loudness = frame.loudness[1] || 0;
    loudness = (loudness + 60) / 60;
    if (loudness < 0) loudness = 0;
    let { min, max, pow } = track.mod;
    loudness = Math.pow(loudness, pow);
    loudness = min + loudness * (max - min);

    let mod = [];
    for (let i = 0; i < 6; ++i) {
        mod.push(loudness);
    }
    return mod;
}



export default mod;
