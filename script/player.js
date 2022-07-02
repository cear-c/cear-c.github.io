import session from './session/index.js';
import audio from './audio/index.js';
import video from './video/index.js';
import list from './list/index.js';
import bar from './bar/index.js';

import events from '/script/util/events.js';
import popup from '/script/util/popup.js';
import store from '/script/util/store.js';
import api from '/script/util/api.js';

const ev = events('PLAYER');

session.on('info', (...a) => ev.emit('info', ...a));
session.on('warn', (...a) => ev.emit('warn', ...a));
session.on('error', (...a) => ev.emit('error', ...a));

audio.on('info', (...a) => ev.emit('info', ...a));
audio.on('warn', (...a) => ev.emit('warn', ...a));
audio.on('error', (...a) => ev.emit('error', ...a));

video.on('info', (...a) => ev.emit('info', ...a));
video.on('warn', (...a) => ev.emit('warn', ...a));
video.on('error', (...a) => ev.emit('error', ...a));



const _ = {
    q: { i: [] }
}



const init = () => {
    const event = (f, a) => {
        video[f](a);
        list[f](a);
        bar[f](a);
    }

    audio.on('end', () => end());
    audio.on('set', t => event('set', t));
    audio.on('play', e => event('play', e));
    audio.on('pause', p => event('pause', p));

    session.on('pause', p => audio.pause(p));
    session.on('play', e => audio.play(e));
    session.on('set', t => audio.set(t));

    store.init();
    list.init();
    bar.init();

    video.init();
    audio.init();
    session.init();
}



const set = (t, s) => {
    if (!s && session.set(t)) return;
    audio.set(t);
}

const pause = (p, s) => {
    if (!s && session.pause(p)) return;
    audio.pause(p);
}



const error = err => {
    _.e = null;
    bar.play(null);
    list.play(null);
    video.play(null);
    popup(`Can't play this right now.`);
    ev.error(err);
    load();
}

const load = () => {
    _.loading = false;
    if (!_.load) return;
    let { e, q, s } = _.load;
    delete _.load;
    play(e, q, s);
}

const play = (e, q, s) => {
    let meta = e?.meta || e || null; // TODO TEST
    let query = typeof q === 'object';
    if (query && !_.q.e) _.q.e = q;
    else if (!q) delete _.q.e;
    _.e = meta;

    bar.play(meta);
    list.play(meta);
    video.play(null);

    if (_.loading) return _.load = { e, q, s };
    if (!s && session.play(e)) return;
    let fade = audio.fade(); // TODO TEST
    _.loading = true;

    let track;
    if (!e) return fade.then(load);
    if (e.meta) track = Promise.resolve(e);
    else if (e.uri) track = api.track(e.uri);
    if (!track) return error();

    track.then(res => {
        fade.then(() => {
            bar.update(res);
            video.play(res);
            audio.play(res).then(() => {
                if (typeof s === 'function') s();
                load();
            }, error);
        })
    }, error);
}



const end = force => {
    if (_.e?.end) return;
    if (_.forced) return delete _.forced;
    if (!force && bar.repeat()) prev(false);
    else if (!last()) next();
    else if (!ended()) {
        _.forced = true;
        set(duration());
    }
}

const queue = e => {
    if (!e) return;
    _.q.i.push(e);
    popup(`Added to queue.`);
}

const first = () => {
    if (!_.e) return true;
    if (_.e.prev) return false;
    return true;
}

const last = () => {
    if (!_.e) return true;
    if (_.e.next) return false;
    if (_.q.i.length) return false;
    if (_.q.e) return false;
    return true;
}

const prev = force => {
    if (!_.e) return;
    let loop = force === false;
    let start = !force && audio.time() > 3;
    let prev = _.q.e || _.e.prev;
    if (!prev) start = true;
    if (loop) pause(false);
    else if (start) set(0);
    else play(prev);
}

const next = () => {
    if (!_.e) return;
    let q = _.q.i.shift();
    if (q) return play(q, _.e);
    else if (_.q.e) {
        let next = _.q.e.next;
        if (!next) next = _.q.e;
        return play(next);
    }

    if (!_.e) return;
    if (_.e.next) play(_.e.next);
    else if (!audio.ended()) end(true);
}



const ended = () => audio.ended();
const paused = () => audio.paused();
const duration = () => audio.duration();
const time = () => audio.time();



export default {
    init,
    set,
    pause,
    play,
    queue,
    first,
    last,
    prev,
    next,
    ended,
    paused,
    duration,
    time,
    ...ev
}
