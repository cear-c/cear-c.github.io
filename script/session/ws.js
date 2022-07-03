import { _api as api } from '/script/util/api.js';
import events from '/script/util/events.js';

const ev = events('SOCKET');

const _api = api.replace('http', 'ws');

const _beat = 1000 * 25;



const _ = {};



const init = () => {

}



const open = id => {
    if (_.ws) return;

    try {
        let url = `${_api}/${id || ''}`;
        _.ws = new WebSocket(url);
    }
    catch (err) {
        delete _.ws;
        ev.emit('reject');
        return;
    }

    _.ws.onmessage = e => {
        if (!_.ws) return;
        let data = e.data.toString();
        try { data = JSON.parse(data); }
        catch (err) { return; }

        if (!_.i && data.id) {
            if (!data.time) {
                data.time = Date.now();
            }

            _.i = setInterval(() => {
                send('ping');
            }, _beat);

            ev.emit('open', data.id, !id);
        }

        if (data.time) {
            _.time = data.time;
        }

        ev.emit('msg', data);
    }


    _.ws.onerror = close;
    _.ws.onclose = close;
}



const send = data => {
    if (!_.ws || !_.i) return;
    if (typeof data === 'object') data.time = _.time;
    if (typeof data !== 'string') data = JSON.stringify(data)
    try { _.ws.send(data); }
    catch (err) {}
}



const close = () => {
    let reject = !_.i;
    if (_.i) clearInterval(_.i);
    delete _.i;

    if (!_.ws) return;
    _.ws.onopen = undefined;
    _.ws.onmessage = undefined;
    _.ws.onerror = undefined;
    _.ws.onclose = undefined;
    _.ws.close();
    delete _.ws;

    if (reject) ev.emit('reject');
    else ev.emit('close');
}



const active = () => !!_.ws;



export default {
    init,
    open,
    send,
    close,
    active,
    ...ev
}
