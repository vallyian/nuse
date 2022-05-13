# n-use (nuse)

Node version switcher for Windows

## Prerequisites

Windows 10 +

## Install

1. `curl https://raw.githubusercontent.com/vallyian/nuse/main/nuse.bat -o nuse.bat`
2. `nuse 18`

## Use

It finds and downloads the latest version according to specified version.  
The latest `nuse` is persisted to env, so a new cmd will inherit it automatically.  
Current cmd will keep its own version (if set) or will use the version set in env.  
Different cmd instances can use different node versions.  

* `nuse gallium` => `v16.9.1`
* `nuse 16` => `v16.9.1`
* `nuse 16.9` => `v16.9.1`
* `nuse 16.8` => `v16.8.0`
* `nuse 16.8.0` => `v16.8.0`
* `nuse 16.42.42` => `version not found`
