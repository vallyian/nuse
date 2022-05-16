const assert = require('assert');
const child_process = require('child_process');
const [nodev, npmv] = process.argv.splice(2);

describe('nuse', () => {
    let nuseDir = '';
    let nodeDir = '';

    if (!nodev && !npmv)
        assert.fail(`invalid test run args`);

    it('user env nuseDir is set', async () => {
        nuseDir = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'nuseDir')
            .then(x => (x.trim().split(/\s{4}/g)[3] || ''));
        expect(nuseDir).not.toEqual('');
    });

    it('user env nodeDir is set', async () => {
        nodeDir = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'nodeDir')
            .then(x => (x.trim().split(/\s{4}/g)[3] || ''));
        expect(nodeDir).not.toEqual('');
    });

    it('user env Path includes %nuseDir%', async () => {
        const userPath = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'Path')
            .then(x => (x.trim().split(/\s{4}/g)[3] || '').split(";"));
        expect(userPath).toInclude('%nuseDir%');
    });

    it('user env Path includes %nodeDir%', async () => {
        const userPath = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'Path')
            .then(x => (x.trim().split(/\s{4}/g)[3] || '').split(";"));
        expect(userPath).toInclude('%nodeDir%');
    });

    it('node verion', async () => {
        if (!nodev) return 'skip';
        expect(await execCmd(`${nodeDir}\\node.exe`, '-v')).toMatch(`^v${nodev}`);
    });

    it('npm verion', async () => {
        if (!npmv) return 'skip';
        expect(await execCmd(`${nodeDir}\\npm.cmd`, '-v')).toMatch(`^${npmv}`);
    });
});

// helpers

function execCmd(cmd, ...args) {
    return new Promise((ok, rej) => child_process.execFile(
        cmd,
        args,
        { shell: false },
        (err, out) => err ? rej(err) : ok(String(out).trim())
    ));
}

// test fw

async function describe(name, cb) {
    if (!global.tests) global.tests = [];
    console.log(`\n\x1b[36m${name}\x1b[0m`);
    await Promise.resolve().then(cb);
    for (let test of global.tests) {
        process.stdout.write(`    \x1b[34m${test.name}\x1b[0m ... `);
        process.stdout.write(await Promise.resolve().then(test.cb)
            .then(r => r === 'skip' ? 'skipped\n' : '\x1b[32mpass\x1b[0m\n')
            .catch(err => `\x1b[31mfail\n        ${err.message || err}\x1b[0m\n`));
    }
    process.stdout.write('\n');
}

function it(name, cb) { global.tests.push({ name, cb }); }

function expect(actual) {
    let notFlag = false;
    const run = (matcher, expected, func) => {
        const ret = func(expected);
        if ((ret === true && notFlag === true) ||
            (ret === false && notFlag === false))
            assert.fail(`expect: '${actual}' ${matcher}: '${expected}'`);
    }
    const matchers = {
        toInclude: expected => run('toInclude', expected, expected => actual.includes(expected)),
        toEqual: expected => run('toEqual', expected, expected => actual === expected),
        toMatch: expected => run('toMatch', expected, expected => actual.match(expected instanceof RegExp ? expected : new RegExp(expected)) !== null),
    };
    return Object.freeze({
        ...matchers,
        get not() {
            notFlag = true;
            return matchers;
        }
    });
}
