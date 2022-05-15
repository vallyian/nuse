const assert = require('assert');
const child_process = require('child_process');
const [nodev, npmv] = process.argv.splice(2);

if (!nodev && !npmv)
    assert.fail(`invalid test run args`);

new Promise((ok, rej) => child_process.execFile(
    'nuse.bat',
    ['-v'],
    { shell: false },
    (err, out) => err ? rej(err) : ok(String(out).trim())
)).then(out => {
    if (nodev) assert.equal(out.includes(`node: v${nodev}`), true, `expected node version: '${nodev}'; out: '${out}'`);
    if (npmv) assert.equal(out.includes(`npm: v${npmv}`), true, `expected npm version: '${npmv}'; out: '${out}'`);
});
