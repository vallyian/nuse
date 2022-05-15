const assert = require('assert');
const child_process = require('child_process');
const [nodev, npmv] = process.argv.splice(2);

describe('nuse', () => {
    let nuseDir = '';
    let nodeDir = '';

    it('args', () => !nodev && !npmv && assert.fail(`invalid test run args`));

    it('user env Path is updated', async () => {
        const userPath = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'Path')
            .then(x => (x.trim().split(/\s{4}/g)[3] || '').split(";"));
        assert.equal(userPath.includes('%nuseDir%'), true, `user env Path does not include %nuseDir%`);
        assert.equal(userPath.includes('%nodeDir%'), true, `user env Path does not include %nodeDir%`);
    });

    it('user env nuseDir is set', async () => {
        nuseDir = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'nuseDir')
            .then(x => (x.trim().split(/\s{4}/g)[3] || ''));
        assert.notEqual(nuseDir, '');
    });

    it('user env nodeDir is set', async () => {
        nodeDir = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'nodeDir')
            .then(x => (x.trim().split(/\s{4}/g)[3] || ''));
        assert.notEqual(nodeDir, '');
    });

    it('node and npm verions', async () => {
        const out = await execCmd('nuse.bat', '-v');
        if (nodev) assert.equal(out.includes(`node: v${nodev}`), true, `expected node version: '${nodev}'; out: '${out}'`);
        if (npmv) assert.equal(out.includes(`npm: v${npmv}`), true, `expected npm version: '${npmv}'; out: '${out}'`);
    });
});

function execCmd(cmd, ...args) {
    return new Promise((ok, rej) => child_process.execFile(
        cmd,
        args,
        { shell: false },
        (err, out) => err ? rej(err) : ok(String(out).trim())
    ));
}

async function describe(name, cb) {
    if (!global.tests) global.tests = [];
    await Promise.resolve().then(cb);
    console.log(`\x1b[36m${name}\x1b[0m`);
    for (let test of global.tests)
        console.log(`\x1b[34m    ${test.name}\x1b[0m ... ${await Promise.resolve().then(test.cb).then(() => '\x1b[32mpass\x1b[0m').catch(() => '\x1b[31mfail\x1b[0m')}`);
}

function it(name, cb) { global.tests.push({ name, cb }); }
