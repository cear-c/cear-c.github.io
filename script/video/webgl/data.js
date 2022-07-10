import setup from './setup.js';



const _ = {};



const texture = (gl, program, tex, dim, index) => {
    const _ = { index };
    _.texture = setup.texture(gl, index);
    _.attribute = gl.getUniformLocation(program, tex);
    _.dimension = gl.getUniformLocation(program, dim);

    _.set = () => {
        gl.activeTexture(gl.TEXTURE0 + _.index);
        gl.bindTexture(gl.TEXTURE_2D, _.texture);
        gl.uniform2i(_.dimension, _.width, _.height);
        gl.uniform1i(_.attribute, _.index);
    }

    _.put = frames => {
        let height = frames?.length;
        if (!height) return;

        let width = 0;
        for (let i = 0; i < height; ++i) {
            let size = frames[i].pos.length * 2;
            if (size > width) width = size;
        }

        let data = new Float32Array(width * height * 4);
        for (let i = 0; i < height; ++i) {
            for (let j = 0; j < width / 2; ++j) {
                let k = (i * width + j * 2) * 4;
                let f = frames[i];
                let p = f.pos[j];
                let c = f.col[j];
                let m = f.mod[j];

                data[k + 0] = p[0] || 0;
                data[k + 1] = p[1] || 0;

                data[k + 2] = 0;
                data[k + 3] = 0;

                data[k + 4] = c[0] || 0;
                data[k + 5] = c[1] || 0;
                data[k + 6] = c[2] || 0;

                data[k + 7] = m || 1;
            }
        }

        gl.activeTexture(gl.TEXTURE0 + _.index);
        gl.bindTexture(gl.TEXTURE_2D, _.texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, width, height, 0, gl.RGBA, gl.FLOAT, data);
        _.height = height;
        _.width = width;
    }

    return _;
}



const init = (gl, program) => {
    _.tex = texture(gl, program, 'uTex', 'uTexDim', 0);

    _.i = gl.getUniformLocation(program, 'uI');
    _.t = gl.getUniformLocation(program, 'uT');
    _.d = gl.getUniformLocation(program, 'uD');
}



const put = state => {
    if (!_.tex) return;
    if (!state?.frames) return;
    _.tex.put(state.frames);
}



const frame = (gl, config) => {
    if (!_.tex || !config) return;
    if (!_.tex.width || !_.tex.height) return;

    gl.uniform1i(_.i, config.i);
    gl.uniform1fv(_.t, config.t);
    gl.uniform1fv(_.d, config.d);

    _.tex?.set();
}



export default {
    init,
    put,
    frame
}
