# n-use (nuse)

[Node.js](https://nodejs.org/) version switcher / manager for **Windows**.  

It finds and downloads the latest version according to specified version.  
The last used `node` is persisted to env, so a new cmd will inherit it automatically.  
Current cmd will keep its own version (if set) or will use the version set in env.  
Different cmd instances can use different node versions.  
Unlike similar tools, this:

* allows friendly node names and matching semver (see [#use](#use) section)
* updates the matched version if a newer build is published

## Prerequisites

Windows 10 (build [17063](https://docs.microsoft.com/en-us/virtualization/community/team-blog/2017/20171219-tar-and-curl-come-to-windows)+) or Windows 11

## Install

1. `curl https://raw.githubusercontent.com/vallyian/nuse/main/nuse.bat -o nuse.bat`
2. `nuse` *wanted-version* (ie `nuse 18`)

## Use

`nuse   number | semver | friendly-name | -v | -h [debugger]`

where:

* `number`: node major version (e.g. 16)
* `semver`: node semver version (e.g. 16.9 or 16.9.1)
* `friendly-name`: node friendly-name version (e.g. gallium or hydrogen)
* `-v`: prints the current node and npm versions
* `-h`: echoes back the usage
* `debugger`: outputs debug messages if true (other values are considered false); default is false 

### Examples

* `nuse 16` => `v16.9.1`
* `nuse 16.9` => `v16.9.1`
* `nuse 16.8` => `v16.8.0`
* `nuse 16.8.0` => `v16.8.0`
* `nuse gallium` => `v16.9.1`
* `nuse 16.42.42` => `version not found`
