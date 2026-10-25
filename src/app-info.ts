import { readFileSync } from 'node:fs';
import { join } from 'node:path';

export interface AppInfo {
  readonly name: string;
  readonly version: string;
  readonly startedAt: Date;
}

export const APP_INFO = 'APP_INFO';

export function appInfoFactory(): AppInfo {
  const raw = readFileSync(join(process.cwd(), 'package.json'), 'utf-8');
  const pkg: unknown = JSON.parse(raw);
  const name =
    typeof pkg === 'object' &&
    pkg !== null &&
    'name' in pkg &&
    typeof pkg.name === 'string'
      ? pkg.name
      : 'helpdesk-api';
  const version =
    typeof pkg === 'object' &&
    pkg !== null &&
    'version' in pkg &&
    typeof pkg.version === 'string'
      ? pkg.version
      : '0.0.0';

  return {
    name,
    version,
    startedAt: new Date(),
  };
}
