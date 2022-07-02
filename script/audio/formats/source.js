import request from '/script/util/request.js';
import events from '/script/util/events.js';
import audio from '/script/audio/index.js';
import keys from '/script/audio/keys.js';

const ev = events('MEDIA SOURCE');

keys.on('info', (...a) => ev.emit('info', ...a));
keys.on('warn', (...a) => ev.emit('warn', ...a));
keys.on('error', (...a) => ev.emit('error', ...a));



const cdn = (url, fragments) => {
    return new Promise((resolve, reject) => {
        let f = fragments || [];
        let start = f[0]?.byte[0] || 0;
        let end = f[f.length - 1]?.byte[1] || 0;
        ev.info('REQUEST', start, end);
        let headers = end && { 'Range': `bytes=${start}-${end}` };
        request('GET', url, { headers, res: 'array' }).then(res => {
            let expected = res?.byteLength === end - start + 1;
            if (!res || (end && !expected)) reject(res);
            if (f.length <= 1) return resolve([res]);
            let o = start;
            resolve(f.map(f => {
                let start = f.byte[0] - o;
                let end = f.byte[1] - o + 1;
                return res.slice(start, end);
            }))
        }, reject);
    })
}



const destroy = media => {
    _.clear = Date.now();
    if (!media) return;
    media.onsourceopen = undefined;
    media.onsourceclose = undefined;
    for (let i = 0; i < media.sourceBuffers.length; ++i) {
        let buffer = media.sourceBuffers[i];
        ev.info('DESTROY');
        try {
            media.removeSourceBuffer(buffer);
            buffer.onupdateend = undefined;
        }
        catch (err) {
            ev.warn('DESTROY', err);
        }
    }
}

const abort = (media, clear) => {
    _.clear = Date.now();
    if (media?.readyState !== 'open') return;
    for (let i = 0; i < media.sourceBuffers.length; ++i) {
        let buffer = media.sourceBuffers[i];
        ev.info('ABORT');
        try {
            buffer.abort();
            let buffered = buffer.buffered;
            let length = buffered.length;
            if (clear && length) {
                let start = buffered.start(0);
                let end = buffered.end(length - 1);
                buffer.remove(start, end);
            }
        }
        catch (err) {
            ev.warn('ABORT', err);
        }
    }
}



const updating = media => {
    if (!media) return false;
    for (let i = 0; i < media.sourceBuffers.length; ++i) {
        let updating = media.sourceBuffers[i].updating;
        if (updating) return true;
    }
    return false;
}

const open = (media, codec) => {
    try {
        ev.info('OPEN');
        let buffer = media.addSourceBuffer(codec);
        buffer.onupdateend = dequeue;
        return buffer;
    }
    catch (err) {
        ev.warn('OPEN', err);
        return undefined;
    }
}



const _ = {};



const queue = e => _.queue?.push(e);
const dequeue = delay => {
    if (delay) return Promise.resolve().then(dequeue);
    let e = _.queue?.shift();
    if (e) update(e);
}

const update = e => {
    if (!e.id) e.id = _.id;
    if (!e.time) e.time = Date.now();
    if (!_.media) return dequeue(true);
    if (e?.id !== _.id) return dequeue(true);
    if (e.time < _.clear) return dequeue(true);
    if (_.media.readyState === 'closed') {
        return queue(e);
    }

    if (e.type === 'end') {
        if (_.media.readyState === 'ended') return;
        if (updating(_.media)) return queue(e);
        _.media.endOfStream();
        ev.info('END');
        return;
    }

    if (e.type === 'append') {
        if (!_.buffer || !_.init) return queue(e);
        if (_.buffer.updating) return queue(e);

        try {
            let init = _.init.byteLength;
            let res = new Uint8Array(init + e.buffer.byteLength);
            res.set(new Uint8Array(e.buffer), init);
            res.set(new Uint8Array(_.init), 0);
            _.buffer.appendBuffer(res.buffer);
            ev.info('APPEND');
            return;
        }
        catch (err) {
            ev.warn('APPEND', err);
            if (err?.name === 'QuotaExceededError') {
                abort(_.media, true);
            }

            pop([e.fragment]);
            dequeue(true);
        }
    }
}



const pop = fragments => {
    if (!_.fragments) return;
    for (let i = 0; i < fragments.length; ++i) {
        let j = _.fragments.indexOf(fragments[i]);
        if (j >= 0) _.fragments.splice(j, 1);
    }
}

const append = (fragments, retry, end) => {
    if (!_.file || !fragments) return;
    if (!_.fragments) _.fragments = [];
    let appending = fragments.filter(f => {
        return f && !_.fragments.includes(f);
    })

    if (!appending.length) {
        if (end) update({ type: 'end' });
        return;
    }

    _.fragments.push(...appending);
    cdn(_.file.cdn, appending).then(res => {
        for (let i = 0; i < appending.length; ++i) {
            let buffer = res[i];
            let fragment = appending[i];
            if (fragment.init) _.init = buffer;
            else if (fragment && buffer) update({
                type: 'append',
                fragment,
                buffer
            })
        }
        if (end) {
            update({ type: 'end' });
        }
    }, err => {
        ev.warn('REQUEST', err);
        pop(appending);
        if (!retry) return;
        if (_.id === retry) {
            setTimeout(() => {
                append(appending, retry);
            }, 1000);
        }
    })
}



const init = () => audio.on('progress', set);

const set = (t, s) => {
    if (!_.media || !_.buffer || !_.init) return;
    if (_.media.readyState === 'closed') return;
    if (!t || t < 0) return;

    let end = false;
    let appending = [];
    let l = _.file?.fragments?.length;
    for (let i = 0; i < l; ++i) {
        let f = _.file.fragments[i];
        if (f.time[0] > t + s) continue;
        if (i < l - 1 && f.time[1] < t) continue;
        if (i === l - 1) end = true;
        appending.push(f);
    }

    append(appending, _.id, end);
}



const play = (audio, file) => {
    if (!window.MediaSource) return;
    if (!file?.cdn || !file?.fragments) return;
    return new Promise((resolve, reject) => {
        if (file === _.file) return resolve();

        _.queue = [];
        _.fragments = [];
        _.init = undefined;
        _.buffer = undefined;
        _.clear = Date.now();
        _.id = (_.id || 0) + 1;
        let decryption = keys.decrypt(audio, file);
        let media = new MediaSource();
        _.media = media;
        _.file = file;

        media.onsourceclose = () => destroy(media);
        media.onsourceopen = async () => {
            media.onsourceopen = undefined;

            let codec = file.codec;
            _.buffer = open(media, codec);
            if (!_.buffer) return reject(quit);
            dequeue();

            try { await decryption; }
            catch (err) {
                keys.error(err);
                return reject(quit);
            }

            resolve(quit);
        }

        const quit = () => {
            abort(_.media, true);
            destroy(_.media);

            for (let key in _) {
                if (key === 'id') continue;
                delete _[key];
            }

            URL.revokeObjectURL(src);
        }

        append(file.fragments.slice(0, 2), _.id);
        let src = URL.createObjectURL(media);
        audio.src = src;
    })
}



export default {
    init,
    play,
    ...ev
}
