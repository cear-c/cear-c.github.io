const request = (method, url, config) => {
    config.method = method;

    return new Promise((resolve, reject) => {
        fetch(url, config).then(res => {
            let status = res.status || 0;
            if (200 <= status && status <= 299) {
                let r = null;
                if (config.res === 'array') r = res.arrayBuffer();
                if (config.res === 'blob') r = res.blob();
                if (config.res === 'text') r = res.text();
                if (r === null) r = res.json();
                r.then(resolve, reject);
                return;
            }

            reject(res);
        }, reject);
    })
}

export default request;
