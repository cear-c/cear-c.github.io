const session = (keys, cert) => {
    const _ = {
        serverCertificate: cert,
        nativeMediaKeys: keys
    }

    const promise = () => {
        let r = {};
        let p = new Promise((res, rej) => {
            r.resolve = res;
            r.reject = rej;
        })
        r.promise = p;
        return r;
    }

    const r = {
        attach: () => {
            if (_.attached) return;
            let e = _.nativeKeySession;
            if (!e) return;
            e.onwebkitkeyerror = r.onKeyError;
            e.onwebkitkeyadded = r.onKeyAdded;
            e.onwebkitkeymessage = r.onKeyMessage;
            _.attached = true;
        },

        detach: () => {
            if (!_.attached) return;
            let e = _.nativeKeySession;
            if (!e) return;
            e.onwebkitkeyerror = undefined;
            e.onwebkitkeyadded = undefined;
            e.onwebkitkeymessage = undefined;
            _.attached = false;
        },

        onKeyMessage: e => {
            if (!e?.message?.buffer) return;
            r.onmessage?.({
                message: e.message.buffer,
                messageType: 'license-request'
            })

            if (!_.request) return;
            _.request.resolve(true);
            _.request = null;
        },

        onKeyAdded: () => {
            r.onkeystatuseschange?.();
            if (!_.update) return;
            _.update.resolve(true);
            _.update = null;
        },

        onKeyError: () => {
            if (_.request) {
                _.request.reject();
                _.request = null;
            }
            if (_.update) {
                _.update.reject();
                _.update = null;
            }
        },

        rebuildInitData: e => {
            let t = new Uint8Array(e);
            if (new DataView(t.buffer).getUint32(0, !0) + 4 !== t.byteLength) throw '';
            let n = function(e) {
                let t = Math.floor(e.byteLength / 2);
                let r = new DataView(e.buffer);
                let n = new Uint16Array(t);
                for (let a = 0; a < t; a++) n[a] = r.getUint16(2 * a, !0);
                return String.fromCharCode.apply(null, n);
            }(t.slice(4));
            
            let r = n.match(/^skd:\/\/([0-9a-fA-F]+)/);
            if (!r?.[1]) throw '';
            
            let o = new Uint8Array(function(e) {
                let t = new Uint8Array(2 * e.length);
                let n = new DataView(t.buffer);
                let r = e.split('');
                for (let a = 0; a < r.length; a++) {
                    let i = r[a].charCodeAt(0);
                    n.setUint16(2 * a, i, !0);
                }
                return t.buffer;
            }(r[1]));

            let i = _.serverCertificate;
            let s = new Uint8Array(t.byteLength + 4 + o.byteLength + 4 + i.byteLength);
            let c = 0;

            s.set(t, c), c += t.byteLength;
            let l = new DataView(s.buffer);
            l.setUint32(c, o.byteLength, !0);
            c += 4; s.set(o, c); c += o.byteLength;
            l.setUint32(c, i.byteLength, !0);
            c += 4; s.set(i, c);
            return s;
        },

        generateRequest: (type, init) => {
            try {
                let data = new Uint8Array(r.rebuildInitData(init));
                _.nativeKeySession = _.nativeMediaKeys.createSession('video/mp4', data, null);
                r.attach();
            } catch (err) {
                _.request = null;
                return Promise.reject(err);
            }
            _.request = promise();
            return _.request.promise;
        },

        update: res => {
            try {
                if (!_.nativeKeySession) return Promise.reject();
                _.nativeKeySession.update(new Uint8Array(res));
            } catch (err) {
                _.update = null;
                return Promise.reject(err);
            }
            _.update = promise();
            return _.update.promise;
        },

        close: () => {
            return new Promise(resolve => {
                r.detach();
                resolve(true);
                return;
            })
        }
    }

    return r;
}



const keys = system => {
    return new Promise(resolve => {
        const _ = {
            nativeMediaKeys: new WebKitMediaKeys(system),
            serverCertificate: null
        }

        return resolve({
            attach: audio => {
                if (audio.readyState >= 1) {
                    audio.webkitSetMediaKeys(_.nativeMediaKeys);
                    audio.webkitMediaKeys = _.nativeMediaKeys;
                    return Promise.resolve();
                }

                audio.onloadedmetadata = () => {
                    audio.onloadedmetadata = null;
                    audio.webkitSetMediaKeys(_.nativeMediaKeys);
                    audio.webkitMediaKeys = _.nativeMediaKeys;
                }

                audio.onwebkitneedkey = e => {
                    audio.onencrypted?.({
                        initData: e.initData,
                        initDataType: 'cenc',
                        fromPolyFill: true
                    })
                }

                return Promise.resolve();
            },

            setServerCertificate: cert => {
                _.serverCertificate = new Uint8Array(cert);
                return Promise.resolve(true);
            },

            createSession: () => {
                if (!_.serverCertificate) return null;
                return session(_.nativeMediaKeys, _.serverCertificate);
            }
        })
    })
}



const access = (system, config) => {
    return new Promise((resolve, reject) => {
        if (system !== 'com.apple.fps.1_0') return reject();
        const _ = {
            keySystem: system,
            configuration: null
        }

        for (let i = 0; i < config.length; ++i) {
            if (_.configuration) break;
            let o = config[i];
            let audio = [];
            let video = [];

            for (let j = 0; j < o?.audioCapabilities?.length || 0; ++j) {
                var type = o.audioCapabilities[j]?.contentType?.split(';')[0];
                if (type && WebKitMediaKeys.isTypeSupported(system, type)) {
                    audio.push(o.audioCapabilities[j]);
                }
            }

            for (let j = 0; j < o?.videoCapabilities?.length || 0; ++j) {
                var type = o.videoCapabilities[j]?.contentType?.split(';')[0];
                if (type && WebKitMediaKeys.isTypeSupported(system, type)) {
                    video.push(o.videoCapabilities[j]);
                }
            }

            if (audio.length || video.length) {
                _.configuration = { ...o,
                    videoCapabilities: video,
                    audioCapabilities: audio
                }
                break;
            }
        }

        if (!_.configuration) reject();

        return resolve({
            keySystem: _.keySystem,
            getConfiguration: () => _.configuration,
            createMediaKeys: () => keys(_.keySystem)
        })
    })
}



const safari = typeof WebKitMediaKeys === 'function';

const attach = (audio, keys) => {
    if (!safari) return audio.setMediaKeys(keys);
    if (keys.attach) return keys.attach(audio);
    return Promise.reject();
}

export { attach };
export default {
    access: safari ? access : (system, config) => {
        if (!navigator.requestMediaKeySystemAccess) throw null;
        return navigator.requestMediaKeySystemAccess(system, config);
    }
}
