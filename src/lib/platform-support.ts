export function isMacOsPlatform(platform: NodeJS.Platform = process.platform): boolean {
  return platform === 'darwin';
}

export function assertMacOsOnlyFeature(
  commandLabel: string,
  detail = 'Linux runtime installs are available, but the managed daemon and macOS Keychain-backed credential flow are not implemented there yet.',
  platform: NodeJS.Platform = process.platform,
): void {
  if (isMacOsPlatform(platform)) {
    return;
  }

  throw new Error(`${commandLabel} is currently supported only on macOS. ${detail}`);
}
