export default name => {
    const events = {};

    const on = (e, cb) => {
        let exists = events.hasOwnProperty(e);
        if (!exists) events[e] = [];
        events[e].push(cb);
    }

    const emit = (e, ...a) => {
        let listeners = events[e];
        if (!listeners?.length) return;
        for (let i = 0; i < listeners.length; ++i) {
            listeners[i](...a);
        }
    }

    const info = (...a) => emit('info', name, ...a);
    const warn = (...a) => emit('warn', name, ...a);
    const error = (...a) => emit('error', name, ...a);

    return {
        error,
        warn,
        info,
        emit,
        on
    }
}
