


const wait = (cb, n = 3) => n ? requestAnimationFrame(() => wait(cb, n - 1)) : cb();

export { wait };
