import source from './source.js';
import setup from './setup.js';
import data from './data.js';



const _ = {};



const init = () => {
    let canvas = document.querySelector('canvas');
    let gl = setup.gl(canvas);
    if (!gl) return;

    let program = setup.program(gl, source);
    if (!program) return;

    _.gl = gl;
    _.canvas = canvas;
    _.program = program;
    data.init(gl, program);

    setup.buffer(gl, program, 'aPos', 2, new Float32Array([
        -1, -1,
        -1, +1,
        +1, -1,
        +1, +1
    ]))
}



const put = state => {
    if (!_.gl) return;
    data.put(state);
}



const frame = config => {
    if (!_.gl) return;

    _.gl.clear(_.gl.COLOR_BUFFER_BIT);
    _.gl.useProgram(_.program);
    data.frame(_.gl, config);

    _.gl.drawArrays(_.gl.TRIANGLE_STRIP, 0, 4);
}



export default {
    init,
    put,
    frame
}
