import keys from '/script/audio/keys.js';

const init = () => {}



const hls = file => {
    let url = file.cdn;
    let id = file.file_id;
    let init = file.fragments[0];
    let fragments = file.fragments.slice(1);

    let map = url ? `#EXT-X-MAP:URI="${url}"` : '';
    if (init?.byte?.[1] && init.byte[0] !== undefined) {
        map += `,BYTERANGE="${init.byte[1] + 1}@${init.byte[0]}"`;
    }

    let key = !id ? '' : [
        `#EXT-X-KEY:METHOD=SAMPLE-AES`,
        `URI="skd://${id}"`,
        `KEYFORMATVERSIONS="1"`,
        `KEYFORMAT="com.apple.streamingkeydelivery"`
    ].join(',');

    let segments = fragments.map(f => {
        let end = f.byte[1] || 0;
        let start = f.byte[0] || 0;
        let size = end ? (end - start + 1) : 0;
        let duration = (f.time[1] || 0) - (f.time[0] || 0);
        let range = size ? `\n#EXT-X-BYTERANGE:${size}@${start}` : ''
        return `#EXTINF:${duration},${range}\n${url}`;
    }).join('\n');

    return [
        `#EXTM3U`,
        `#EXT-X-VERSION:6`,
        `#EXT-X-TARGETDURATION:10`,
        `#EXT-X-MEDIA-SEQUENCE:0`,
        `#EXT-X-PLAYLIST-TYPE:VOD`,
        ...[key, map, segments].filter(s => s),
        '#EXT-X-ENDLIST'
    ].join('\n');
}

const data = src => {
    return 'data:application/vnd.apple.mpegurl;base64,'.concat(btoa(src));
}



const play = (audio, file) => {
    if (!file?.cdn || !file?.fragments) return;
    return new Promise((resolve, reject) => {
        let decrypt = keys.decrypt(audio, file);

        let src = hls(file);
        audio.src = data(src);

        decrypt.then(() => {
            resolve(() => {});
        }, reject);
    })
}



export default {
    init,
    play
}
