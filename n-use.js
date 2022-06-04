const assert = require('assert');
const child_process = require('child_process');
const fs = require('fs');
const https = require('https');
const os = require('os');
const path = require('path');

const { nuseInitRegistry, nodeDistUrl, nuseDirFile } = process.env;
const [versionArg] = process.argv.splice(2);
const cwd = __dirname;
const vfile = path.join(cwd, 'v.html');
const friendlyNames = {
    argon: 4,
    boron: 6,
    carbon: 8,
    dubnium: 10,
    erbium: 12,
    fermium: 14,
    gallium: 16,
    hydrogen: 18
};

Promise.resolve().then(exec).catch(e => {
    console.error(`\x1b[31m${e.message || e}\x1b[0m`);
    process.exit(1);
});

async function exec() {
    if (!(/win/i.test(os.platform())))
        assert.fail(`for non Windows platforms use nvm instead`);
    if (nuseInitRegistry)
        await initRegistry();
    if (!versionArg || versionArg === '-h')
        assert.fail(`\x1b[31mUSAGE:     nuse   number | semver | friendly-name | -v | -h\x1b[0m`);

    let nodePath = '';
    if (versionArg === '-v') {
        nodePath = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'nodeDir')
            .then(x => x.trim().split(/\s{4}/g)[3]);
    } else {
        const matchedVersion = await getMatchedVersion();
        const versionArch = `node-${matchedVersion}-win-x64`;
        nodePath = path.join(cwd, versionArch);

        if (!fs.existsSync(nodePath)) {
            if (!fs.existsSync(`${nodePath}.zip`)) {
                console.info(`downloading ${nodeDistUrl}/${matchedVersion}/${versionArch}.zip ...`);
                await downloadBinary(`${nodeDistUrl}/${matchedVersion}/${versionArch}.zip`, `${nodePath}.zip`);
            }
            console.info(`unpacking ${versionArch}.zip ...`);
            await execCmd('tar', '-xf', `${nodePath}.zip`, '-C', cwd);
            fs.rmSync(`${nodePath}.zip`, { force: true });
        }
    };

    fs.writeFileSync(nuseDirFile, nodePath, { encoding: 'utf-8' });
};

/**
 * Exec cmd in current dir
 * @param {string} cmd 
 * @param  {...string} args 
 * @returns {Promise<string>} Promise<string> stdOut
 */
function execCmd(cmd, ...args) {
    return new Promise((ok, rej) => child_process.execFile(
        cmd,
        args,
        { shell: false },
        (err, out) => err ? rej(err) : ok(String(out).trim())
    ));
}

/**
 * Add nuse and node binary path placeholders to user evn
 * @returns {Promise<void>} Promise<void>
 */
async function initRegistry() {
    const userPath = await execCmd('reg', 'query', 'HKCU\\Environment', '/v', 'Path')
        .then(x => x.trim().split(/\s{4}/g)[3]);
    let addReg = '';
    if (!(/%nuseDir%;/i.test(userPath)))
        addReg += '%nuseDir%;';
    if (!(/%nodeDir%;/i.test(userPath)))
        addReg += '%nodeDir%;';
    if (addReg)
        await execCmd('reg', 'add', 'HKCU\\Environment', '/t', 'REG_EXPAND_SZ', '/f', '/v', 'Path', '/d', `${userPath}${addReg}`);
}

/**
 * Get exact or highest aproximate version
 * @returns {string} stirng
 */
async function getMatchedVersion() {
    if (!fs.existsSync(vfile))
        await getVfile();
    let ret = findMatchedVersion();
    if (!ret) {
        const recent = new Date();
        recent.setHours(recent.getHours() - 8);
        if (fs.statSync(vfile).mtime < recent)
            await getVfile();
        ret = findMatchedVersion();
    }
    return ret ?? assert.fail('version not found');
}

/**
 * Save Node.js downloads page to disk
 * @returns {Promise<void>} Promise<void>
 */
async function getVfile() {
    console.info(`querying node versions from ${nodeDistUrl}/ ...`);
    const html = await downloadText(`${nodeDistUrl}/`);
    fs.writeFileSync(vfile, html, { encoding: 'utf-8' });
}

/**
 * Find exact or highest aproximate version
 * @returns {string | undefined} string | undefined
 */
function findMatchedVersion() {
    const friendlyName = friendlyNames[versionArg] || versionArg;
    const versions = getHtmlLinks(fs.readFileSync(vfile, { encoding: 'utf-8' }))
        .filter(x => /^v\d+\.\d+\.\d+\/$/.test(x))
        .map(x => x.replace(/\/$/, ''))
        .sort((a, b) => { 
            a = a.replace(/^v/g, '').split('.').map(n => +n);
            b = b.replace(/^v/g, '').split('.').map(n => +n);
            return (
                a[0] > b[0] ? -1 :
                a[0] - b[0] ? 1 :
                    a[1] > b[1] ? -1 :
                    a[1] - b[1] ? 1 :
                        a[2] > b[2] ? -1 :
                        a[2] - b[2] ? 1 :
            0);
        });

    const exact = versions.find(x => new RegExp(`^v${friendlyName}$`, 'i').test(x));
    if (exact) return exact;

    const aprox = versions.find(x => new RegExp(`^v${friendlyName}`, 'i').test(x));
    return aprox;
}

/**
 * Get list of HTML anchor text
 * @param {string} html 
 * @returns {string[]} string[]
 */
function getHtmlLinks(html) {
    return html
        .split(/(\r|\n)/g)
        .reduce((p, t) => {
            t = ((t
                .split(/<a href=\".+\">/i)[1] || '')
                .split(/<\/a>/i)[0] || '')
                .trim();
            if (t) p.push(t);
            return p;
        }, []);
}

/**
 * Download binary and write to file
 * @param {string | URL} url 
 * @param {string | fs.PathLike} file 
 * @returns {Promise<void>} Promise<void>
 */
function downloadBinary(url, file) {
    return new Promise((ok, rej) => https.get(url, res => {
        const sw = fs.createWriteStream(file);
        res.pipe(sw);
        sw.on('error', err => rej(err));
        sw.on('finish', () => sw.close(err => err ? rej(err) : ok()));
    }));
}

/**
 * Download data as text
 * @param {string | URL} url 
 * @returns {Promise<string>} Promise<string>
 */
function downloadText(url) {
    return new Promise((ok, rej) => {
        const req = https.get(url, res => {
            let data = '';
            res.on('data', chunk => data += String(chunk));
            res.on('close', () => ok(data));
        });
        req.on('error', err => rej(err));
        req.end();
    });
}
