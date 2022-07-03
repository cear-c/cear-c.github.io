import player from '/script/player.js';



const init = () => {
    if (!navigator.mediaSession) return;

    navigator.mediaSession.setActionHandler('previoustrack', () => {
        player.prev();
    })

    navigator.mediaSession.setActionHandler('nexttrack', () => {
        player.next();
    })

    navigator.mediaSession.setActionHandler('play', () => {
        player.pause(false);
    })

    navigator.mediaSession.setActionHandler('pause', () => {
        player.pause(true);
    })

    navigator.mediaSession.setActionHandler('seekto', e => {
        if (e?.seekTime) player.set(e.seekTime);
    })
}

const play = e => {
    if (!e?.meta) return;
    if (!navigator.mediaSession) return;
    navigator.mediaSession.metadata = new MediaMetadata({
        artwork: e.meta.image && [{ src: e.meta.image }],
        artist: e.meta.artists,
        title: e.meta.name
    })
}



export default {
    init,
    play
}
