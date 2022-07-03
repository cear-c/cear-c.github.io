import request from '/script/util/request.js';
import store from '/script/util/store.js';

export const _api = 'https://192.168.50.235:443';

const _types = ['album', 'artist', 'playlist', 'user', 'track'];
const _url = 'https://open.spotify.com/';
const _uri = 'spotify:';
const _c = /[\:\/\?]/;

const _cache = [];
const _size = 100;



const type = q => {
    let type = '';
    if (q?.startsWith(_url)) type = q.slice(_url.length).split('/')[0];
    if (q?.startsWith(_uri)) type = q.slice(_uri.length).split(':')[0];
    if (!type || !_types.includes(type)) return '';
    return type;
}

const uri = url => {
    if (!url?.startsWith(_url)) {
        return url || '';
    }

    let t = type(url);
    if (!t) return url;
    let l = _url.length + t.length;
    let i = url.slice(l + 1);
    let j = i.search(_c);

    if (j >= 0) i = i.slice(0, j);
    return i ? _uri + `${t}:${i}` : url;
}



const cached = (url, body, config) => {
    if (config.forget) return null;
    body = uri(body);

    for (let i = 0; i < _cache.length; ++i) {
        if (_cache[i].url !== url) continue;
        if (_cache[i].body !== body) continue;
        if (i) _cache.unshift(..._cache.splice(i, 1));
        return _cache[0].res;
    }
    return null;
}

const cache = (url, body, res) => {
    while (_cache.length >= _size) _cache.pop();
    _cache.unshift({ url, body: uri(body), res });
}



const get = (api, query, body, config) => {
    let url = `/${api}/${query}`;
    if (!config) config = {};
    config.body = body;

    return new Promise((resolve, reject) => {
        let res = cached(url, body, config);
        if (res) return resolve(res);
        request('POST', _api + url, config).then(res => {
            if (!config.forget) cache(url, body, res);
            resolve(res);
        }, reject);
    })
}



const track = uri => {
    return get('search', '', uri)
}


const search = (index, filter, body, prev) => {
    let query = [index, ...filter].join('/');
    let res = body ? get('search', query, body) : likes(index, filter);

    return new Promise((resolve, reject) => {
        res.then(res => {
            let items = res?.items || [];
            if (type(prev?.uri) !== 'track') prev = null;
            for (let i = 0; i < items.length; ++i) {
                if (type(items[i]?.uri) !== 'track') continue;
                delete items[i].prev;
                delete items[i].next;
                if (prev) {
                    prev.next = items[i];
                    items[i].prev = prev;
                }
                prev = items[i];
            }
            resolve(res);
        }, reject);
    })
}

const likes = (index, filter) => {
    return new Promise(resolve => {
        let res = [];
        let total = 0;
        let next = index + 20;
        let items = store.get();
        let types = filter.filter(f => {
            return _types.includes(f);
        })

        if (!types.length) types = _types;
        for (let i = 0; i < items.length; ++i) {
            if (!types.includes(type(items[i]?.uri))) continue;
            if (index <= i && i < next) res.push(items[i]);
            ++total;
        }

        if (total <= next) {
            next = undefined;
        }

        resolve({
            type: 'liked',
            items: res,
            total,
            next
        })
    })
}



export default {
    type,
    get,
    track,
    search
}
