const assert = require('assert');
const child_process = require('child_process');
const fs = require('fs');
const path = require('path');

const { nuseDir: cwd, nodeDistUrl, nuseDirFile, wantedVersion } = process.env;
const vfile = path.join(cwd, '.v');
const getWantedVersion = (() => {
    switch (wantedVersion) {
        case 'argon': return 4;
        case 'boron': return 6;
        case 'carbon': return 8;
        case 'dubnium': return 10;
        case 'erbium': return 12;
        case 'fermium': return 14;
        case 'gallium': return 16;
        case 'hydrogen': return 18;
        default: return wantedVersion;
    }
})();

Promise.resolve().then(exec).catch(e => {
    console.error(e.message || e);
    process.exit(1);
});

function exec() {
    if (!wantedVersion) assert.fail(`invalid version arg`);

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

    // console.info(`setting node path to ${nodePath} ...`);
    // child_process.execSync(`setx nusev ${nodePath}`, { stdio: 'ignore' });
    fs.writeFileSync(nuseDirFile, nodePath, { encoding: 'utf-8' });
};

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
        .find(x => new RegExp(`^v?${getWantedVersion}.*$`, 'i').test(x));
}
