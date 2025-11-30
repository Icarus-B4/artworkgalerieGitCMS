import crypto from 'crypto';
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { r2Client } from './r2Client';

const { CLOUDFLARE_BUCKET_NAME, CLOUDFLARE_PUBLIC_DOMAIN } = process.env as Record<string, string | undefined>;

if (!CLOUDFLARE_BUCKET_NAME || !CLOUDFLARE_PUBLIC_DOMAIN) {
  console.warn('Missing CLOUDFLARE_BUCKET_NAME or CLOUDFLARE_PUBLIC_DOMAIN');
}

export async function uploadToR2(file: any, filename?: string) {
  if (!CLOUDFLARE_BUCKET_NAME || !CLOUDFLARE_PUBLIC_DOMAIN) {
    throw new Error('R2 configuration missing');
  }

  const baseName = (filename || (file && file.name) || 'upload').replace(/\s+/g, '_');
  const random = crypto.randomBytes(6).toString('hex');
  const key = `${Date.now()}-${random}-${baseName}`;

  let body: any = file;
  if (file && file.buffer) {
    body = file.buffer;
  } else if (file && typeof file.arrayBuffer === 'function') {
    const ab = await file.arrayBuffer();
    body = Buffer.from(ab);
  }

  const contentType = (file && file.type) || 'application/octet-stream';

  const cmd = new PutObjectCommand({
    Bucket: CLOUDFLARE_BUCKET_NAME,
    Key: key,
    Body: body,
    ContentType: contentType,
  });

  const result = await r2Client.send(cmd);

  const url = `${CLOUDFLARE_PUBLIC_DOMAIN.replace(/\/$/, '')}/${key}`;

  console.log('uploadToR2: uploaded', url);

  return { url, key, result };
}
