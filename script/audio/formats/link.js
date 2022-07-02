const init = () => {}

const play = (audio, file) => {
    return new Promise((resolve, reject) => {
        if (!file?.file_url) return reject();
        audio.src = file.file_url;
        alert('URLURLURULRURLURURLURLRULRURLURURLURL');
        resolve(() => {});
    })
}

export default {
    init,
    play
}
