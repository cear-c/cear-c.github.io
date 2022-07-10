import player from '/script/player.js';
import parse from './parse/index.js';
import webgl from './webgl/index.js';



const _ = {};



const now = () => performance.now() / 1000;



const init = () => {
    webgl.init();
}



const put = t => {
    let s = parse.state(t);
    _.len = s?.length;
    _.min = s?.start;
    _.max = s?.end;
    webgl.put(s);
}



const run = () => {
    requestAnimationFrame(() => {
        if (_.paused) return;
        let diff = _.t && now() - _.t;
        let time = _.time + diff || 0;
        let min = time >= (_.min || 0);
        let max = time < (_.max || 0);
        if (!min || !max) put(time);
        let c = parse.config(time);
        webgl.frame(c);
        run();
    })
}



const set = t => {
    _.time = t;
    _.t = now();
}



const pause = p => {
    _.time = player.time();
    _.paused = p;
    _.t = now();
    if (!p) run();
}



const play = e => {
    console.log(e);
    _.paused = true;
    parse.play(e);
}



export default {
    init,
    set,
    pause,
    play
}
