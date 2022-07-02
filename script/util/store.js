import popup from '/script/util/popup.js';



const _items = [];



const init = () => {
    let keys = Object.keys(localStorage);
    for (let i = 0; i < keys.length; ++i) {
        try {
            let item = localStorage.getItem(keys[i]);
            if (item) _items.push(JSON.parse(item));
        } catch(err) {}
    }

    _items.sort((a, b) => {
        return (b.time || 0) - (a .time || 0);
    })
}



const put = e => {
    if (!e?.uri) return false;

    try {
        let i = {
            time: Date.now(),
            artists: e.artists,
            context: e.context,
            owner: e.owner,
            image: e.image,
            name: e.name,
            uri: e.uri
        }

        if (!i.context) delete i.context;
        if (!i.artists) delete i.artists;
        if (!i.owner) delete i.owner;
        let s = JSON.stringify(i);

        _items.unshift(i);
        localStorage.setItem(e.uri, s);
    }
    catch (err) {
        popup(`Error adding to Liked Items.`);
        return false;
    }

    popup(`Added to Liked Items.`);
    return true;
}

const pop = e => {
    if (!e?.uri) return false;

    try {
        let i = _items.findIndex(i => i.uri === e.uri);
        if (i >= 0) _items.splice(i, 1);
        localStorage.removeItem(e.uri);
    }
    catch (err) {
        popup(`Error removing from Liked Items.`);
        return false;
    }

    popup(`Removed from Liked Items.`);
    return true;
}

const get = e => {
    if (!e) return _items;
    if (!e.uri) return false;
    try { return !!localStorage.getItem(e.uri); }
    catch (err) { return false; }
}



export default {
    init,
    put,
    pop,
    get
}
