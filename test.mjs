import test from 'node:test';
import child_process from 'child_process';

test('nuse', async t => {
    const [nodev, npmv] = process.argv.splice(2);
    let [nuseDir, nodeDir] = ['', ''];

    await t.test('user env includes', async t => {
        await t.test('nuseDir', async () => {
             nuseDir = process.env.NUSE_GHA_RUNNER === 'true'
                 ? process.env.nuseDir
                 : await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'nuseDir').then(x => x.trim().split(/\s{4}/g)[3] || '');

            expect(nuseDir).not.toEqual('');
        });

        await t.test('nodeDir', async () => {
             nodeDir = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'nodeDir').then(x => x.trim().split(/\s{4}/g)[3] || '');

             expect(nodeDir).not.toEqual('');
        });
    });

    await t.test('user env Path includes', async t => {
        const userPath = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'Path')
            .then(x => (x.trim().split(/\s{4}/g)[3] || '').split(';'));

        await t.test('%nuseDir%', () => expect(userPath).toInclude('%nuseDir%'));
        await t.test('%nodeDir%', () => expect(userPath).toInclude('%nodeDir%'));
    });

    await t.test('versions', t => Promise.all([
        t.test('node', { skip: !nodev }, async () => expect(await execCmd(`${nodeDir}\\node.exe`, '-v')).toMatch(`^v${nodev}`)),
        t.test('npm', { skip: !npmv }, async () => expect(await execCmd(`${nodeDir}\\npm.cmd`, '-v')).toMatch(`^${npmv}`))
    ]));
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

function expect(actual) {
    let isNegated = false;
    const matchers = {
        toInclude: expected => run('toInclude', expected, expected => actual.includes(expected)),
        toEqual: expected => run('toEqual', expected, expected => actual === expected),
        toMatch: expected => run('toMatch', expected, expected => actual.match(expected instanceof RegExp ? expected : new RegExp(expected)) !== null),
    };
    function run(matcher, expected, expectationFn) {
        const asExpected = expectationFn(expected);
        if ((asExpected && isNegated) || (!asExpected && !isNegated))
            throw Error(`expect: '${actual}' ${matcher}: '${expected}'`);
    }
    return Object.freeze({
        ...matchers,
        get not() {
            isNegated = true;
            return matchers;
        }
    });
}
