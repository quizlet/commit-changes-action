import {createHash} from 'crypto';

/**
 * Compute the SHA1 hash for a base64 encoded string
 * @param b64string Base64 encoded string
 */
export function sha1HashB64String(b64string: string): string {
  const buf = Buffer.from(b64string, 'base64');
  const hasher = createHash('sha1');
  return hasher.update(buf).digest('hex');
}
