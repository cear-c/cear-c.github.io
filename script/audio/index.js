import events from '/script/util/events.js';
import source from './formats/source.js';
import link from './formats/link.js';
import hls from './formats/hls.js';
import media from './media.js';
import keys from './keys.js';

const ev = events('AUDIO');



const fragments = file => {
    let seek = file?.seek;
    if (file.fragments) return file.fragments;
    let a = seek?.segments || seek?.references;
    if (!a?.length) return undefined;

    let scale = seek.timescale || 1;
    let byte = seek.offset || 0;
    let time = 0;

    let fragments = [{
        byte: [0, byte - 1],
        time: [0, 0],
        init: true
    }];

    for (let i = 0; i < a?.length || 0; ++i) {
        let t = a[i]?.[1] || a[i]?.duration || 0;
        let b = a[i]?.[0] || a[i]?.size || 0;
        fragments.push({
            byte: [byte, (byte += b) - 1],
            time: [time, time += (t / scale)]
        })
    }

    file.fragments = fragments;
    return fragments;
}



const _ = {
    audio: new Audio()
}

_.audio.autoplay = true;



const _slack = 5;

const update = () => {
    let t = _.audio.currentTime;
    if (t === _.time) return;

    let rate = _slack / 2;
    if (!_.progress || _.progress > t || t > _.progress + rate) {
        _.progress = t;
        ev.emit('progress', t, _slack);
    }

    _.time = t;
    ev.emit('set', t);
}



const init = () => {
    _.audio.onplay = update;
    _.audio.onseeked = update;
    _.audio.onwaiting = update;
    _.audio.ontimeupdate = update;

    _.audio.onended = () => ev.emit('end');
    _.audio.onpause = () => ev.emit('pause', true);
    _.audio.onplaying = () => ev.emit('pause', false);

    source.init();
    link.init();
    hls.init();

    media.init();
}

const prep = () => {
    if (_.prepared) return;
    if (_.audio.src) return;
    _.prepared = true;

    _.audio.play().catch(() => {});
}



const set = t => {
    _.audio.currentTime = t;
    update();
}

const pause = p => {
    if (!_.audio?.src) return;
    if (p) _.audio.pause();
    else {
        if (!_.audio.paused) return;
        _.audio.play().catch(() => {});
    }
}

const play = e => {
    return new Promise((resolve, reject) => {
        const error = err => {
            _.audio.removeAttribute('src');
            return reject(err);
        }

        if (_.quit) _.quit();
        delete _.quit;

        keys.access().then(access => {

            let start;
            fragments(e?.mp34);
            fragments(e?.cbcs);
            let type = access.keySystem;
            let system = keys.systems[type];
            let fairplay = system?.name === 'fairplay';
            if (fairplay) start = hls.play(_.audio, e?.cbcs);
            else start = source.play(_.audio, e?.mp34);

            if (!start) {
                let url = e?.mp34?.file_url || e?.cbcs?.file_url;
                if (url) start = link.play(_.audio, file);
            }

            if (!start) return error();

            _.audio.volume = 1;
            start.then(quit => {
                if (!quit) set(0);
                else _.quit = quit;
                if (e) media.play(e);
                resolve();
            }, quit => {
                quit?.();
                error();
            })

        }, error);

    })
}



const ended = () => _.audio.ended;
const paused = () => _.audio.paused;
const duration = () => _.audio.duration;
const time = () => _.audio.currentTime;

const playing = () => {
    return !!_.audio?.src
        && !_.audio.paused
        && !_.audio.ended;
}

const fade = () => {
    if (_.fade) return _.fade;
    _.fade = new Promise(resolve => {
        if (!playing()) return resolve();
        let i = Math.floor(_.audio.volume * 10);
        let f = setInterval(() => {
            i = Math.max(0, i - 1);
            _.audio.volume = i / 10;
            if (i > 0) return;
            clearInterval(f);
            pause(true);
            setTimeout(resolve, 100);
        }, 10);
    })

    let fade = _.fade;
    fade.finally(() => delete _.fade);
    return fade;
}



export default {
    init,
    prep,
    set,
    pause,
    play,
    ended,
    paused,
    duration,
    time,
    fade,
    ...ev
}
