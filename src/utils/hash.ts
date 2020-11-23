import {createHash} from 'crypto';

/**
 * Compute the git blob hash for a base64 encoded string
 * @param b64string Base64 encoded string
 */
export function computeBlobHashB64String(b64string: string): string {
  const contents = Buffer.from(b64string, 'base64');
  const buf = Buffer.concat([Buffer.from(`blob ${contents.length}\0`), contents]);
  const hasher = createHash('sha1');
  return hasher.update(buf).digest('hex');
}
