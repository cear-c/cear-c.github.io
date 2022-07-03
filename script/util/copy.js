import popup from '/script/util/popup.js';



const fallback = (s, resolve, reject) => {
    let text = document.createElement('textarea');
    text.value = s;
    text.style.top = '0';
    text.style.left = '0';
    text.style.position = 'fixed';
    document.body.appendChild(text);

    text.focus();
    text.select();
    let copied = false;
    try { copied = document.execCommand('copy'); }
    catch (err) { copied = false; }
    text.remove();

    if (copied) resolve();
    else reject();
}

const copy = (s, p) => {
    return new Promise((resolve, reject) => {
        if (!navigator.clipboard) return fallback(s, resolve, reject);
        navigator.clipboard.writeText(s).then(resolve, () => {
            fallback(s, resolve, !p ? reject : () => {
                popup(p, 'link', () => copy(s).then(resolve, reject));
            })
        })
    })
}



export default copy;
