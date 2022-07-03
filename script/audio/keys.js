import request from '/script/util/request.js';
import system, { attach } from './system.js';
import api from '/script/util/api.js';



const configs = [
    {
        label: 'video-sw-decode',
        initDataTypes: ['cenc'],
        audioCapabilities: [
            { contentType: 'audio/webm; codecs="opus"', robustness: 'SW_SECURE_CRYPTO' },
            { contentType: 'audio/mp4; codecs="flac"', robustness: 'SW_SECURE_CRYPTO' },
            { contentType: 'audio/mp4; codecs="mp4a.40.2"', robustness: 'SW_SECURE_CRYPTO' }
        ],
        videoCapabilities: [
            { contentType: 'video/webm; codecs="vp9"', robustness: 'SW_SECURE_DECODE' },
            { contentType: 'video/webm; codecs="vp8"', robustness: 'SW_SECURE_DECODE' },
            { contentType: 'video/mp4; codecs="avc1.4d401f"', robustness: 'SW_SECURE_DECODE' },
            { contentType: 'video/mp2t; codecs="avc1.4d401f"', robustness: 'SW_SECURE_DECODE' }
        ],
        distinctiveIdentifier: 'optional',
        persistentState: 'optional',
        sessionTypes: ['temporary']
    },
    {
        label: 'video-sw-crypto',
        initDataTypes: ['cenc'],
        audioCapabilities: [
            { contentType: 'audio/webm; codecs="opus"', robustness: 'SW_SECURE_CRYPTO' },
            { contentType: 'audio/mp4; codecs="flac"', robustness: 'SW_SECURE_CRYPTO' },
            { contentType: 'audio/mp4; codecs="mp4a.40.2"', robustness: 'SW_SECURE_CRYPTO' }
        ],
        videoCapabilities: [
            { contentType: 'video/webm; codecs="vp9"', robustness: 'SW_SECURE_CRYPTO' },
            { contentType: 'video/webm; codecs="vp8"', robustness: 'SW_SECURE_CRYPTO' },
            { contentType: 'video/mp4; codecs="avc1.4d401f"', robustness: 'SW_SECURE_CRYPTO' },
            { contentType: 'video/mp2t; codecs="avc1.4d401f"', robustness: 'SW_SECURE_CRYPTO' }
        ],
        distinctiveIdentifier: 'optional',
        persistentState: 'optional',
        sessionTypes: ['temporary']
    },
    {
        label: 'audio-flac-sw-crypto',
        initDataTypes: ['cenc'],
        audioCapabilities: [
            { contentType: 'audio/mp4; codecs="flac"', robustness: 'SW_SECURE_CRYPTO' },
            { contentType: 'audio/mp4; codecs="mp4a.40.2"', robustness: 'SW_SECURE_CRYPTO' }
        ],
        videoCapabilities: [],
        distinctiveIdentifier: 'optional',
        persistentState: 'optional',
        sessionTypes: ['temporary']
    },
    {
        label: 'audio-sw-crypto',
        initDataTypes: ['cenc'],
        audioCapabilities: [
            { contentType: 'audio/mp4; codecs="mp4a.40.2"', robustness: 'SW_SECURE_CRYPTO' }
        ],
        videoCapabilities: [],
        distinctiveIdentifier: 'optional',
        persistentState: 'optional',
        sessionTypes: ['temporary']
    }
]

const codecs = {
    '3': 'audio/mp3',
    '4': 'audio/mp3',
    '5': 'audio/mp3',
    '6': 'audio/mp3',
    '10': 'audio/mp4; codecs="mp4a.40.2"',
    '11': 'audio/mp4; codecs="mp4a.40.2"',
    '12': 'audio/mp4; codecs="mp4a.40.2"',
    '13': 'audio/mp4; codecs="mp4a.40.2"',
    '14': 'audio/mp4; codecs="mp4a.40.2"',
    '15': 'audio/mp4; codecs="mp4a.40.2"',
    '17': 'audio/mp4; codecs="flac"'
}

const systems = {
    'com.widevine.alpha': {
        pssh: 'pssh_widevine',
        cert: 'widevine-license',
        name: 'widevine'
    },
    'com.apple.fps.1_0': {
        pssh: 'pssh_fairplay',
        cert: 'fairplay-license',
        name: 'fairplay'
    }
}



const certificate = type => {
    let url = `https://spclient.wg.spotify.com/${type}/v1/application-certificate`;
    return request('GET', url, { res: 'array' });
}

const license = (type, msg) => {
    let body = btoa(String.fromCharCode.apply(null, new Uint8Array(msg)));
    return api.get('license', type, body, { res: 'array', forget: true });
}



const _ = {};



const access = async () => {
    if (_.system) return _.system;
    let keys = Object.keys(systems);
    for (let i = 0; i < keys.length; ++i) {
        try {
            let access = await system.access(keys[i], configs);
            if (!access) continue;
            _.system = access;
            return access;
        } catch (err) {}
    }

    throw null;
}



const unlock = async system => {
    if (_.keys) return _.keys;
    let key = system.keySystem;
    let type = systems[key].cert;
    let keys = await system.createMediaKeys();
    let cert = await certificate(type);
    let c = await keys.setServerCertificate(cert);
    if (!c) throw c;
    _.keys = keys;
    return keys;
}



const buffer = s => {
    s = atob(s);
    let b = new Uint8Array(s.length);
    for (let i = 0; i < s.length; ++i) {
        b[i] = s.charCodeAt(i);
    }
    return b;
}

const encrypted = (audio, system, file) => {
    return new Promise((resolve, reject) => {
        let t = setTimeout(() => {
            audio.onencrypted = undefined;
            reject();
        }, 3000);

        audio.onencrypted = e => {
            audio.onencrypted = undefined;
            clearTimeout(t);

            let config = system.getConfiguration();
            let type = config.initDataTypes[0];
            let key = system.keySystem;

            let init;
            if (e?.fromPolyFill) {
                init = e.initData;
            }

            if (!init) {
                let ids = file.seek;
                let id = ids[systems[key].pssh];
                if (!id) id = ids.pssh || '';
                init = buffer(id);
            }

            resolve({ init, type });
        }
    })
}



const update = (system, keys, { type, init }) => {
    return new Promise((resolve, reject) => {
        try { _.session?.close(); }
        catch (err) {}

        let config = system.getConfiguration();
        let session = keys.createSession(config.sessionTypes[0]);
        if (_.expire) clearTimeout(_.expire);
        _.session = session;
        delete _.expire;

        if (!session) return reject();
        session.onkeystatuseschange = () => {
            if (!_.expire && _.session === session) {
                resolve();
            }

            if (!session.expiration) return;
            if (_.expire) clearTimeout(_.expire);
            let expire = session.expiration - Date.now();
            let slack = 1000 * 60 * 5;

            _.expire = setTimeout(() => {
                update(system, keys, { init, type });
            }, expire - slack);
        }

        const message = async msg => {
            session.onmessage = undefined;
            let res = await license(system.keySystem, msg.message);
            await session.update(res);
        }

        session.onmessage = msg => message(msg).catch(reject);
        session.generateRequest(type, init).catch(reject);
    })
}



const decrypt = async (audio, file) => {
    let set = !audio.mediaKeys && !audio.webkitMediaKeys;
    file.codec = codecs[file.format] || codecs['10'];

    let system = await access();
    let encrypt = encrypted(audio, system, file);

    let keys = await unlock(system);
    if (set) await attach(audio, keys);

    let data = await encrypt;
    await update(system, keys, data);
}



export default {
    systems,
    access,
    decrypt
}
