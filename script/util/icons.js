import hearting from '/assets/icons/love/hearting.js';
import hearter from '/assets/icons/love/hearter.js';
import hearted from '/assets/icons/love/hearted.js';
import heart from '/assets/icons/love/heart.js';
import store from '/script/util/store.js';



const toggle = (el, q, v, cb, i) => {
    let e = q ? el.querySelector('.i-' + q) : el;
    if (!e) return undefined;

    const click = () => {
        let s = v && e.classList.contains(v);
        let r = cb ? cb(!s, e) : undefined;
        let c = r !== false && v;
        if (c) e.classList.toggle(v);

    }

    e.onclick = click;
    if (i) click();
    return e;
}



const unique = (love, id) => {
    love = love.replaceAll(' xlink:href="#', ` xlink:href="#${id}_`);
    love = love.replaceAll(' id="', ` id="${id}_`);
    return love;
}

const love = (el, id, e) => {
    const _heart = unique(hearter, id);
    const _hearted = unique(hearting, id);

    const _ = {};

    const set = e => {
        _.e = e;
        if (e && store.get(e)) {
            _.el.innerHTML = hearted;
            _.el.classList.add('heart');
        }
        else {
            _.el.innerHTML = heart;
            _.el.classList.remove('heart');
        }
    }

    _.el = toggle(el, '', 'heart', v => {
        let p = v ? store.put(_.e) : store.pop(_.e);
        if (p) _.el.innerHTML = v ? _hearted : _heart;
        else return false;
    })

    set(e);

    return {
        el: _.el,
        set
    }
}



export { toggle, love };
