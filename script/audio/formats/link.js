const init = () => {}



const play = (audio, file) => {
    return new Promise((resolve, reject) => {
        if (!file?.file_url) return reject();
        audio.src = file.file_url;
        resolve(() => {});
    })
}



export default {
    init,
    play
}
