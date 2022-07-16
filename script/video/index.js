import player from '/script/player.js';
import parse from './parse/index.js';
import webgl from './webgl/index.js';
import lyric from './lyric/index.js';



const _ = {};



const now = () => performance.now() / 1000;



const init = () => {
    webgl.init();
    lyric.init();

    _.paused = true;

    const list = document.querySelector('#list');

    const change = () => {
        if (list.clientWidth < window.innerWidth) _.hidden = false;
        else _.hidden = !list.classList.contains('hidden');
        run();
    }

    new ResizeObserver(change).observe(list);
    new MutationObserver(change).observe(list, {
        attributeFilter: ['class'],
        characterData: false,
        childList: false,
        attributes: true
    })
}



const put = t => {
    let s = parse.state(t);
    _.len = s?.length;
    _.min = s?.start;
    _.max = s?.end;
    webgl.put(s);
}



const run = () => {
    if (_.hidden) return;
    if (_.paused) return;
    if (_.running) return;
    else _.running = true;
    requestAnimationFrame(() => {
        _.running = false;
        if (_.hidden) return;
        if (_.paused) return;
        let diff = _.t && now() - _.t;
        let time = _.time + diff || 0;
        let min = time >= (_.min || 0);
        let max = time < (_.max || 0);
        if (!min || !max) put(time);
        let c = parse.config(time);
        lyric.frame(time);
        webgl.frame(c);
        run();
    })
}



const set = t => {
    _.time = t;
    _.t = now();
    run();
}



const pause = p => {
    _.time = player.time();
    _.paused = p;
    _.t = now();
}



const play = e => {
    if (e) console.log(e);
    for (let key in _) {
        if (key === 'hidden') continue;
        delete _[key];
    }

    _.paused = true;
    parse.play(e);
    lyric.play(e);
}



export default {
    init,
    set,
    pause,
    play
}
