import popup from '/script/util/popup.js';
import copy from '/script/util/copy.js';
import player from '/script/player.js';
import ws from './ws.js';



const _ = {};



const id = () => _.id || '';
const search = () => location.search.slice(1);

const init = () => {
    _.bar = document.querySelector('#bar');
    _.session = _.bar.querySelector('#session');
    _.toggle = _.bar.querySelector('#content .i-session');
    _.bot = _.session.querySelector('.bot span');
    _.top = _.session.querySelector('span.top');
    _.btn = _.session.querySelector('button');

    ws.init();

    _.id = search();
    let join = !!_.id;
    if (join) _.bar.className = 'session';
    fill(false, join, false);

    _.btn.onclick = () => {
        if (ws.active()) return close();
        open(search());
    }

    ws.on('msg', e => {
        if (e.count) count(1, 0, e.count - 1);

        const update = () => {
            if (e.pause !== undefined) {
                player.pause(e.pause, true);
            }

            if (e.set !== undefined) {
                let set = e.set;
                let now = Date.now();
                let time = e.time || 0;
                if (time && time < now) {
                    set += (now - time) / 1000;
                }

                player.set(set, true);
            }
        }

        if (!e.track?.meta) update();
        else {
            if (e.end) e.track.meta.end = e.end;
            else if (_.meta) e.track.meta = _.meta;
            player.play(e.track, !e.end, update);
            delete _.meta;
        }
    })

    ws.on('open', (id, host) => {
        fill(true, false, false);
        player.play(null, null, true);
        history.replaceState(null, '', '/?' + id);
        if (!host) return popup(`You've joined the group session.`);
        _.id = id;

        let p = 'Copy session link';
        copy(window.location.href, p).then(() => {
            popup(`Session link copied to your clipboard.`);
        }, () => popup(`Copy session link from the address bar.`, 'link'));
    })

    const end = msg => {
        fill(false, false, false);
        player.play(null, null, true);
        history.replaceState(null, '', '/');
        delete _.meta;
        delete _.id;
        popup(msg);
    }

    ws.on('reject', () => end(`The group session has ended.`));
    ws.on('close', () => end(`You've left the group session.`));
}



const open = id => {
    fill(false, !!id, true);
    player.prep();
    ws.open(id);
}

const close = () => {
    ws.close();
}



const fill = (open, join, load, c) => {
    let top = 'Start a remote group session';
    if (open) top = 'Participating in a group session';
    else if (join) top = 'Join the remote group session';
    _.top.innerHTML = top;

    let btn = 'Start session';
    if (load && join) btn = 'Joining...';
    else if (load) btn = 'Starting...';
    else if (open) btn = 'Leave session';
    else if (join) btn = 'Join session';
    _.btn.innerHTML = btn;

    if (load) _.btn.setAttribute('disabled', '');
    else _.btn.removeAttribute('disabled')

    if (open) _.session.classList.add('open');
    else _.session?.classList.remove('open');

    if (open) _.toggle.classList.add('open');
    else _.toggle?.classList.remove('open');

    count(open, join, c);
}

const count = (open, join, c) => {
    if (open && c === undefined) return;
    let bot = 'Listen with friends in different places';
    if (join) bot = 'Connect with other participants';
    else if (open && !c) bot = 'No other participants';
    else if (open && c < 2) bot = 'One other participant';
    else if (open) bot = `${c} other participants`;
    _.bot.innerHTML = bot;
}



const set = t => {
    if (!ws.active()) return false;

    ws.send({
        set: t
    })

    return true;
}

const pause = p => {
    if (!ws.active()) return false;
    let loop = !p && player.ended();
    let t = loop ? 0 : player.time();

    ws.send({
        set: t,
        pause: p
    })

    return true;
}

const play = e => {
    if (!ws.active()) return false;
    let meta = e?.meta || e;
    let uri = meta?.uri;
    _.meta = meta;

    if (uri) ws.send({
        track: uri,
        set: 0
    })

    return true;
}



export default {
    init,
    id,
    set,
    pause,
    play
}
