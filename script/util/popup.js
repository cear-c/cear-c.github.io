const _ = {};



const popup = (s, i, c) => {
    if (_.remove) _.remove();
    const bar = document.querySelector('body > #main > #bar');
    const popup = document.createElement('span');
    popup.classList = 'popup';

    if (i) {
        let icon = document.createElement('div');
        icon.className = 'icon i-' + i;
        popup.appendChild(icon);
    }

    let text = document.createElement('span');
    text.innerHTML = s || '';
    popup.appendChild(text);

    const remove = () => {
        delete _.remove;
        popup.onclick = null;
        clearTimeout(t);
        popup.remove();
    }

    popup.onclick = () => {
        remove();
        c?.();
    }
    
    _.remove = remove;
    let t = setTimeout(remove, i ? 5000 : 2500);
    bar.insertAdjacentElement('beforebegin', popup);
}



export default popup;
