const assert = require('assert');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const { nuseInitRegistry, nodeDistUrl, nuseDirFile, wantedNodeVersion } = process.env;
const cwd = __dirname;
const vfile = path.join(cwd, '.v');
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

function exec() {
    if (nuseInitRegistry) initRegistry();

    if (!wantedNodeVersion) assert.fail(`USAGE: nuse version`);

    const matchedVersion = getMatchedVersion();
    const versionArch = `node-${matchedVersion}-win-x64`;
    const nodePath = path.join(cwd, versionArch);

    if (!fs.existsSync(nodePath)) {
        if (!fs.existsSync(`${nodePath}.zip`)) {
            console.info(`downloading ${nodeDistUrl}/${matchedVersion}/${versionArch}.zip ...`);
            child_process.execSync(`curl ${nodeDistUrl}/${matchedVersion}/${versionArch}.zip -o ${versionArch}.zip`, { cwd, stdio: 'ignore' });
        }

        console.info(`unpacking ${versionArch}.zip ...`);
        child_process.execSync(`tar -xf ${versionArch}.zip`, { cwd, stdio: 'ignore' });
        fs.rmSync(`${nodePath}.zip`, { force: true });
    }

    fs.writeFileSync(nuseDirFile, nodePath, { encoding: 'utf-8' });
};

function initRegistry() {
    const userPath = child_process.execSync(`reg query HKCU\\Environment /v Path`).toString().trim().split(/    /g)[3];
    let addReg = '';
    if (!(/\%nuseDir\%\;/i.test(userPath))) addReg += '^%nuseDir^%;';
    if (!(/\%nodeDir\%\;/i.test(userPath))) addReg += '^%nodeDir^%;';
    if (addReg) child_process.execSync(`reg add HKCU\\Environment /t REG_EXPAND_SZ /f /v Path /d "${userPath}"${addReg}`, { stdio: 'ignore' });
}

function getMatchedVersion() {
    let recent;
    if (!fs.existsSync(vfile)) {
        getVfile();
        recent = true;
    }

    let ret = findMatchedVersion();
    if (!ret && !recent) {
        getVfile();
        ret = findMatchedVersion();
    }

    return ret ?? assert.fail('version not found');
}

function getVfile() {
    console.info(`querying node versions from ${nodeDistUrl}/ ...`);
    child_process.execSync(`curl ${nodeDistUrl}/ > ${vfile}`, { cwd, stdio: 'ignore' });
}

function findMatchedVersion() {
    return fs.readFileSync(vfile, { encoding: 'utf-8' })
        .split(/(\r|\n)/g)
        .reduce((p, t) => {
            t = ((t
                .split(/<a href=\".+\">/i)[1] || '')
                .split(/\/?<\/a>/i)[0] || '')
                .trim();
            t && t != '..' && p.push(t);
            return p;
        }, [])
        .sort((a, b) => b.localeCompare(a))
        .find(x => new RegExp(`^v?${getWantedNodeVersion}.*$`, 'i').test(x));
}
