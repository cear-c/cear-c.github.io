import player from './player.js';

player.on('info', (...a) => console.log('INFO', ...a));
player.on('warn', (...a) => console.warn('WARN', ...a));
player.on('error', (...a) => console.error('ERROR', ...a));



window.onload = async () => {

    player.init()

}
