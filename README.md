# n-use (nuse)

[Node.js](https://nodejs.org/) version switcher / manager for **Windows**.  

It finds and downloads the latest version according to specified version.  
The last used `node` is persisted to env, so a new cmd will inherit it automatically.  
Current cmd will keep its own version (if set) or will use the version set in env.  
Different cmd instances can use different node versions.  
Unlike similar tools, this:

* allows node code-names and matching semver (see [#use](#use) section)
* updates the matched version if a newer build is published

## Prerequisites

Windows 10 x64 (build [17063](https://docs.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows)+) or Windows 11 x64

## Install

1. download main script
   * latest version (main): `curl https://raw.githubusercontent.com/vallyian/nuse/main/nuse.bat -o nuse.bat`
   * specific version (tag): `curl https://raw.githubusercontent.com/vallyian/nuse/1.3.0/nuse.bat -o nuse.bat`
   * specific SHA: `curl https://raw.githubusercontent.com/vallyian/nuse/be91101c99fe11bfa1c156e5f2a89fad3093529f/nuse.bat -o nuse.bat` (immutable commit, if security is very important to you)
2. (recommended) inspect the downloaded script before executing first time
3. `nuse` *wanted-version* (ie `nuse 18`)

## Use

`nuse   number | semver | code-name | -v | -h [debugger]`

where:

* `number`: node major version (e.g. 16)
* `semver`: node semver (e.g. 16.9 or 16.9.1)
* `code-name`: node code-name (e.g. gallium or hydrogen)
* `-v`: prints the current node and npm versions
* `-h`: echoes back the usage
* `debugger`: outputs debug messages if value is "true" (defaults to false)

### Examples

* `nuse 16` => `v16.9.1`
* `nuse 16.9` => `v16.9.1`
* `nuse 16.8` => `v16.8.0`
* `nuse 16.8.0` => `v16.8.0`
* `nuse gallium` => `v16.9.1`
* `nuse 16.42.42` => `version not found`
