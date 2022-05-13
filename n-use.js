const assert = require('assert');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

const { nuseInitRegistry, nodeDistUrl, nuseDirFile, wantedNodeVersion } = process.env;
const cwd = __dirname;
const vfile = path.join(cwd, 'v.html');
const getWantedNodeVersion = (() => {
    switch (wantedNodeVersion) {
        case 'argon': return 4;
        case 'boron': return 6;
        case 'carbon': return 8;
        case 'dubnium': return 10;
        case 'erbium': return 12;
        case 'fermium': return 14;
        case 'gallium': return 16;
        case 'hydrogen': return 18;
        default: return wantedNodeVersion;
    }
})();

Promise.resolve().then(exec).catch(e => {
    console.error(e.message || e);
    process.exit(1);
});

async function exec() {
    if (nuseInitRegistry) await initRegistry();

    if (!wantedNodeVersion) assert.fail(`USAGE: nuse version`);

    const matchedVersion = await getMatchedVersion();
    const versionArch = `node-${matchedVersion}-win-x64`;
    const nodePath = path.join(cwd, versionArch);

    if (!fs.existsSync(nodePath)) {
        if (!fs.existsSync(`${nodePath}.zip`)) {
            console.info(`downloading ${nodeDistUrl}/${matchedVersion}/${versionArch}.zip ...`);
            await download(`${nodeDistUrl}/${matchedVersion}/${versionArch}.zip`, `${versionArch}.zip`);
        }

        console.info(`unpacking ${versionArch}.zip ...`);
        await execCmd('tar', '-xf', `${versionArch}.zip`);
        fs.rmSync(`${nodePath}.zip`, { force: true });
    }

    fs.writeFileSync(nuseDirFile, nodePath, { encoding: 'utf-8' });
};

function execCmd(cmd, ...args) {
    return new Promise((ok, rej) => child_process.execFile(
        cmd,
        args,
        { shell: false },
        (err, out) => err ? rej(err) : ok(out)
    ));
}

async function initRegistry() {
    const userPath = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'Path').then(x => x.trim().split(/    /g)[3]);
    let addReg = '';
    if (!(/%nuseDir%;/i.test(userPath))) addReg += '%nuseDir%;';
    if (!(/%nodeDir%;/i.test(userPath))) addReg += '%nodeDir%;';
    if (addReg) await execCmd('reg', 'add', 'HKCU\\Environment', '/t', 'REG_EXPAND_SZ', '/f', '/v', 'Path', '/d', `${userPath}${addReg}`);
}

async function getMatchedVersion() {
    let recent;
    if (!fs.existsSync(vfile)) {
        await getVfile();
        recent = true;
    }

    let ret = findMatchedVersion();
    if (!ret && !recent) {
        await getVfile();
        ret = findMatchedVersion();
    }

    return ret ?? assert.fail('version not found');
}

async function getVfile() {
    console.info(`querying node versions from ${nodeDistUrl}/ ...`);
    const html = await fetch(nodeDistUrl).then(x => x.text());
    fs.writeFileSync(vfile, html, { encoding: 'utf-8' });

}

function findMatchedVersion() {
    const links = getHtmlLinks(fs.readFileSync(vfile, { encoding: 'utf-8' }))
        .filter(x => new RegExp(getWantedNodeVersion, 'i').test(x))
        .sort((a, b) => b.localeCompare(a));
    const exact = links.find(x => new RegExp(`^${getWantedNodeVersion}$`, 'i').test(x));
    const aprox = links.find(x => new RegExp(`^v?${getWantedNodeVersion}.*$`, 'i').test(x));
    return exact || aprox;
}

function getHtmlLinks(html) {
    return html
        .split(/(\r|\n)/g)
        .reduce((p, t) => {
            t = ((t
                .split(/<a href=\".+\">/i)[1] || '')
                .split(/\/?<\/a>/i)[0] || '')
                .trim();
            t && p.push(t);
            return p;
        }, []);
}

async function download(url, file) {
    const arrayBuffer = await fetch(url).then(r => r.arrayBuffer());
    fs.writeFileSync(file, Buffer.from(arrayBuffer));
}
