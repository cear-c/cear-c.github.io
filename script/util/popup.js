const _ = {};



const popup = msg => {
    if (_.remove) _.remove();
    const bar = document.querySelector('body > #main > #bar');
    const popup = document.createElement('span');
    popup.classList = 'popup';
    popup.innerHTML = msg;

    const remove = () => {
        popup.onclick = null;
        clearTimeout(t);
        popup.remove();
    }

    _.remove = () => {
        _.remove = null;
        remove();
    }

    popup.onclick = remove;
    let t = setTimeout(remove, 2500);
    bar.insertAdjacentElement('beforebegin', popup);
}



export default popup;
