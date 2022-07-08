import { toggle, love } from '/script/util/icons.js';
import { wait } from '/script/util/index.js';
import list from '/script/list/index.js';
import player from '/script/player.js';



const _ = {};



const init = () => {
    _.bar = document.querySelector('#bar');
    _.content = _.bar.querySelector('#content');
    _.controls = _.bar.querySelector('#controls');

    _.list = document.querySelector('#list');
    _.icons = _.content.querySelector('.icons');
    _.slider = _.controls.querySelector('.slider');

    _.progress = _.bar.querySelector('.progress > div');
    _.input = _.controls.querySelector('.input > div');
    _.min = _.controls.querySelector('.slider .min');
    _.max = _.controls.querySelector('.slider .max');

    _.img = _.content.querySelector('img');
    _.name = _.content.querySelector('.name');
    _.curr = _.name.querySelector('.curr');

    icons();
    items();
    input();

    play(null);
}



const icons = () => {
    toggle(_.icons, 'session', '', () => {
        let open = !_.bar.classList.contains('session');
        _.bar.className = open ? 'session' : '';
    })

    toggle(_.icons, 'queue', '', () => {
        _.list.classList.toggle('hidden');
    })

    _.bar.onclick = e => {
        let hidden = _.bar.classList.contains('hidden');
        if (hidden) _.bar.classList.remove('hidden');
        if (hidden || _.moved >= 5) return;
        if (_.icons.contains(e.target)) return;
        if (!_.content.contains(e.target)) return;
        let open = !_.bar.classList.contains('controls');
        _.bar.className = open ? 'controls' : '';
    }



    let heart = _.icons.querySelector('.i-love');
    _.love = love(heart, 'bar');

    _.pause = toggle(_.icons, 'play', 'pause', v => {
        player.pause(!v);
        return false;
    })



    _.mute = toggle(_.controls, 'text', 'mute', v => {
        // TOOO
    })

    toggle(_.controls, 'loop', 'repeat', v => {
        _.repeat = v;
    }, true);



    _.prev = toggle(_.controls, 'prev', '', () => {
        player.prev();
    })
    
    _.next = toggle(_.controls, 'next', '', () => {
        player.next();
    })



    _.name.ondblclick = e => {
        if (e?.target.className !== 'artists') return;
        if (_.e?.owner) list.push(_.e.owner);
    }

    _.img.ondblclick = () => {
        _.list.classList.add('hidden');
        _.bar.className = 'hidden';
    }
}



const items = () => {
    let time = 0;
    let pos = null;
    _.moved = 0;

    const down = e => {
        _.curr.classList.add('held');
        _.moved = 0;
        pos = e.x;
    }

    const move = e => {
        if (pos === null) return;

        let d = pos - e.x;
        _.curr.style.setProperty('--pos', `${-d}px`);
        _.moved = Math.max(_.moved, Math.abs(d));
    }

    const up = e => {
        if (pos === null) return;
        if (time) clearTimeout(time);
        time = 0;

        let d = pos - e.x;
        pos = null;

        let m = 40;
        let next = !player.last() && d > m;
        let prev = !player.first() && d < -m;
        if (prev) _.curr.style.setProperty('--pos', `-100%`);
        if (next) _.curr.style.setProperty('--pos', `100%`);
        if (prev) player.prev(true);
        if (next) player.next();

        wait(() => {
            _.curr.classList.remove('held');
            _.curr.style.setProperty('--pos', '0px');
            _.moved = 0;
        })
    }

    _.curr.onpointerdown = down;
    document.addEventListener('pointermove', move);
    document.addEventListener('pointercancel', up);
    document.addEventListener('pointerup', up);
}



const input = () => {
    _.seeking = false;
    let rect = null;
    let time = null;

    const down = e => {
        rect = _.slider.getBoundingClientRect();
        _.input.classList.add('drag');
        _.seeking = true;
        move(e);
    }

    const move = e => {
        if (!_.seeking || !rect) return;
        if (Math.abs(e.y - rect.bottom) > 200) {
            return up();
        }

        let x = e.x - rect.left;
        let p = Math.max(0, Math.min(1, x / rect.width));
        let t = p * _.duration || 0;
        seek(t, pos(t));
        time = t;
    }

    const up = e => {
        if (!_.seeking || !rect) return;
        _.seeking = false;
        let t = time;
        rect = null;
        time = null;

        _.input.classList.remove('drag');
        if (e && t !== null) player.set(t);
        else set(player.time());
    }

    _.slider.onpointerdown = down;
    document.addEventListener('pointermove', move);
    document.addEventListener('pointercancel', up);
    document.addEventListener('pointerup', up);
}



const time = t => {
    if (!t) t = 0;
    let s = Math.floor(t % 60);
    let m = Math.floor(t / 60);
    if (s < 10) s = `0${s}`;
    return `${m}:${s}`;
}

const pos = t => {
    let d = _.duration ? t / _.duration : 0;
    let v = Math.max(0, Math.min(1, d));
    let p = Math.round(1000 * (1 - v));
    let pos = `${-p / 10}%`;
    return pos;
}

const seek = (t, p) => {
    _.input.style.setProperty('--pos', p);

    let cur = time(t);
    let min = _.min.innerHTML;
    if (min === cur) return;
    _.min.innerHTML = cur;
}



const set = t => {
    let p = pos(t);
    _.progress.style.setProperty('--pos', p);
    if (!_.seeking) seek(t, p);
}

const pause = p => {
    if (!p) _.pause.classList.add('pause');
    else _.pause.classList.remove('pause');
}

const update = e => {
    let color = e?.track?.color;
    _.duration = e?.track?.duration;
    _.max.innerHTML = time(_.duration);
    if (color) _.bar.style.setProperty('--background', color);
    if (e?.lyrics?.length) _.mute.removeAttribute('disabled');
    else _.mute.setAttribute('disabled', '');
}



const play = e => {
    const enable = (b, e) => {
        if (!e) b?.setAttribute('disabled', '');
        else b?.removeAttribute('disabled');
    }

    _.e = e;
    enable(_.love.el, e);
    enable(_.pause, e);
    enable(_.prev, e);
    enable(_.next, e);
    _.love.set(e);

    if (!e) _.slider.classList.add('disabled');
    else _.slider.classList.remove('disabled');
    if (_.curr) _.curr.firstElementChild.innerHTML = e?.name || '';
    if (_.curr) _.curr.lastElementChild.innerHTML = e?.artists || '';
    _.img.src = e?.image || '/assets/defaults/track.svg';
}



const repeat = () => _.repeat;



export default {
    init,
    set,
    pause,
    update,
    play,
    repeat
}
