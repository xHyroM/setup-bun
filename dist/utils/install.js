import { cacheDir, downloadTool, extractZip, find } from '@actions/tool-cache';
import { restoreCache, saveCache } from '@actions/cache';
import { addPath, info } from '@actions/core';
import getAsset from './getAsset.js';
import { join } from 'path';
import { homedir } from 'os';
export default async (release) => {
    const asset = getAsset(release.assets);
    const path = join(homedir(), '.bun', 'bin', asset.name);
    const cache = find('bun', release.version) || await restoreCache([path], `bun-${process.platform}-${asset.name}-${release.version}`);
    if (cache) {
        info(`Using cached Bun installation from ${cache}.`);
        addPath(path);
        return;
    }
    info(`Downloading Bun from ${asset.asset.browser_download_url}.`);
    const zipPath = await downloadTool(asset.asset.browser_download_url);
    const extracted = await extractZip(zipPath, join(homedir(), '.bun', 'bin'));
    const newCache = await cacheDir(extracted, 'bun', release.version);
    await saveCache([
        join(extracted, asset.name)
    ], `bun-${process.platform}-${asset.name}-${release.version}`);
    info(`Cached Bun to ${newCache}.`);
    addPath(newCache);
    const bunPath = join(homedir(), '.bun', 'bin', asset.name);
    addPath(bunPath);
};
