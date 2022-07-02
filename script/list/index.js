import { love } from '/script/util/icons.js';
import player from '/script/player.js';
import api from '/script/util/api.js'



const _ = {
    index: 0,
    last: null,
    state: []
}



const init = () => {
    _.list = document.querySelector('#list');
    _.info = _.list.querySelector('#info');
    _.items = _.list.querySelector('#items');

    _.search = _.info.querySelector('.search');
    _.input = _.info.querySelector('input[type=text]');
    _.close = _.info.querySelector('.i-close');
    _.back = _.info.querySelector('.i-back');

    _.item = _.items.querySelector('#item');
    _.scroll = _.items.querySelector('.scroll');
    _.header = _.items.querySelector('.header');
    _.content = _.items.querySelector('.content');
    _.filters = [..._.items.querySelectorAll('.filter > input')];

    input();
    queue();
    search();

    setTimeout(() => _.input.value = '', 100);
    const restore = () => history.pushState(null, '', '/' + location.search);
    window.onpopstate = () => {
        restore();
        pop();
    }

    restore();
}



const scrolled = () => {
    let s = _.scroll;
    if (_.load || !s.clientHeight) return;
    let bot = s.scrollHeight - s.scrollTop - s.clientHeight;
    if (bot > 256 || !_.index || _.index < 0) return;
    search(_.index);
}

const input = () => {
    _.search.onclick = e => {
        if (e.target === _.back) return pop();
        if (_.info.classList.contains('hidden')) return;
        _.info.classList.add('hidden');
    }

    _.input.onfocus = () => {
        _.input.value = '';
    }

    _.input.onkeydown = e => {
        if (e.keyCode !== 13) return;
        let q = _.input.value.trim();
        _.input.blur();
        push(q);
    }

    _.close.onclick = () => {
        push('');
    }

    _.filters.forEach(filter => {
        filter.onclick = () => search();
    })

    _.scroll.onscroll = scrolled;
}



const queue = () => {
    const width = 16 * 12;
    const max = 16 * 6;
    const min = 16;

    let pos = null;
    let item = null;

    const down = e => {
        let el = e?.target;
        if (!el || !_.content.contains(el)) return;
        while (!el.classList.contains('item')) {
            if (el === _.content) return;
            el = el.parentElement;
            if (!el) return;
        }

        let type = api.type(el?.e?.uri);
        if (type !== 'track') return;
        el.ontransitionend?.();
        item = el;
        pos = e.x;
    }

    const move = e => {
        if (!item) return;
        let d = Math.min(width, e.x - pos);
        if (d < min) d = 0;

        item.style.setProperty('--pos', `${d}px`);
        if (d && !item.classList.contains('queue')) {
            item.classList.add('queue');
        }
    }

    const up = e => {
        if (!item) return;
        let d = e.x - pos;
        let el = item;
        item = null;
        pos = null;

        if (d > max) player.queue(el.e);
        el.style.setProperty('--pos', `0px`);
        el.classList.add('queued');
        el.ontransitionend = () => {
            el.ontransitionend = undefined;
            el.classList.remove('queue', 'queued');
        }
    }

    _.content.onpointerdown = down;
    document.addEventListener('pointermove', move);
    document.addEventListener('pointercancel', up);
    document.addEventListener('pointerup', up);
}



const push = q => {
    _.list.classList.remove('hidden');
    _.info.classList.add('hidden');
    if (_.load) return;
    let l = _.state.length;
    let last = _.state[l - 1];
    if (!q && !last) return;
    if (q === last) return;
    _.state.push(q);
    search();
}

const pop = () => {
    if (_.list.classList.contains('hidden')) {
        return _.list.classList.remove('hidden');
    }

    if (!_.state.length) {
        if (_.info.classList.contains('hidden')) {
            return _.info.classList.remove('hidden');
        }

        return _.list.classList.add('hidden');
    }

    if (_.load) return;
    _.state.pop();
    search();
}



const name = type => {
    let name = type;
    if (name === 'track') name = 'song';
    return name || 'item';
}

const click = (type, el, e) => {
    if (!e?.uri) return;
    if (el.classList.contains('queue')) return;
    if (type !== 'track') push(e.uri);
    else player.play(e);
}

const item = (context, e) => {
    let el = _.item.content.firstElementChild.cloneNode(true);
    const q = q => el.querySelector(q);
    let type = api.type(e?.uri);

    let title = q('.title');
    let artists = q('.artists');
    title.innerHTML = e?.name || 'null';
    if (e?.artists) artists.innerHTML = e.artists;
    else artists.remove();

    let index = q('.index');
    if (!['album', 'playlist', 'artist'].includes(context)) index.remove();
    else if (context === 'artist' && type !== 'track') index.remove();
    else index.innerHTML = `${_.content.childElementCount + 1}`;

    let img = q('img');
    if (context === 'album') img.remove();
    else img.src = e.image || `/assets/defaults/${type || 'track'}.svg`;
    let avatar = type === 'artist' || type === 'user';
    if (avatar) img.classList.add('round');

    let icon = q('.icon.type');
    if (type) icon.classList.add('i-' + type);
    else icon.remove();

    if (context !== 'head') {
        if (e?.uri) el.onclick = () => click(type, el, e);
        else el.classList.add('disabled');
    }
    else {
        let heart = document.createElement('button');
        heart.className = 'love i-love';
        if (e) love(heart, 'head', e);
        icon.insertAdjacentElement('beforebegin', heart);

        let owning = '';
        if (!e?.owner) owning = '';
        else if (type === 'album') owning = 'artist';
        else if (type === 'track') owning = 'artist';
        else if (type === 'playlist') owning = 'user';
        if (owning) {
            let owner = document.createElement('button');
            owner.className = 'icon owner i-' + owning;
            icon.insertAdjacentElement('beforebegin', owner);
            owner.onclick = () => push(e.owner);
        }
    }

    el.e = e;
    if (e === _.e) {
        playing(el);
        pausing(_.p, el);
        _.el = el;
    }

    return el;
}

const fill = (type, head, items, clear, filter) => {
    if (clear) _.content.innerHTML = '';

    let child = name(filter) + 's';
    if (!items) items = 'Something went wrong';
    else if (!items.length) {
        if (type === 'liked') {
            if (!filter) items = 'Directly link or search for any song, artist, album, playlist or user';
            else items = `Like ${child} for them to show up here`;
        }
        else if (clear) items = `No ${child} found`;
        else `No more ${child} found`;
    }

    if (clear) {
        _.scroll.scrollTop = 0;
        if (!head) _.header.classList.add('hidden');
        else _.header.classList.remove('hidden');
        let header = item('head', head || {});
        _.header.innerHTML = '';
        _.header.appendChild(header);
    }

    if (typeof items === 'string') {
        let span = document.createElement('span');
        span.innerHTML = items;
        _.content.appendChild(span);
        _.last = null;
        _.index = -1;
    }
    else {
        let seperate = type === 'artist';
        for (let i = 0; i < items?.length; ++i) {
            let el = item(type, items[i]);
            _.content.appendChild(el);
            if (!seperate) continue;
            let uri = items[i]?.uri || '';
            if (api.type(uri) !== 'album') continue;
            if (i) el.classList.add('seperate');
            seperate = false;
        }
    }

    requestAnimationFrame(scrolled);
    _.list.classList.remove('load');
    _.load = false;
}



const search = i => {
    if (_.load) return;
    if (!i) _.last = null;
    _.load = true;

    let l = _.state?.length;
    let q = l ? _.state[l - 1] : '';

    let t = q && api.type(q);
    if (!t) _.input.value = q;
    else {
        let i = name(t);
        let s = i[0].toUpperCase();
        let type = s + i.slice(1);
        _.input.value = type;
    }

    if (!i) _.list.classList.add('load');
    let f = _.filters.find(i => i.checked).value;
    api.search(i || 0, [f || ''], q, _.last).then(res => {
        if (res?.meta) {
            player.play(res);
            let i = _.state.indexOf(q);
            if (i >= 0) _.state.splice(i, 1);
            _.list.classList.remove('load');
            _.load = false;
            return;
        }

        _.index = res?.next || -1;
        let l = res?.items?.length;
        _.last = res?.items?.[l - 1];
        fill(res.type, res.head, res.items, !i, f);
    }, () => fill('', null, null, !i));
}



const set = t => {}

const playing = el => {
    const q = q => el.querySelector(q);
    q('.title').classList.add('playing');
    q('.type').classList.add('i-playing');
}

const pausing  = (p, el) => {
    const q = q => el.querySelector(q);
    if (p) q('.type').classList.add('paused');
    else q('.type').classList.remove('paused');
}

const stopping = el => {
    const q = q => el.querySelector(q);
    q('.title').classList.remove('playing');
    q('.type').classList.remove('i-playing', 'paused');
}

const pause = p => {
    if (_.el) pausing(p, _.el);
    _.p = p;
}

const play = e => {
    if (_.el) stopping(_.el);
    delete _.el;
    _.e = e;

    if (!e) return;
    let items = _.content.children;
    for (let i = 0; i < items.length; ++i) {
        if (items[i].e === e) {
            _.el = items[i];
            playing(_.el);
            pause(true);
            return;
        }
    }
}



export default {
    init,
    push,
    set,
    pause,
    play
}
