import { S3Client } from '@aws-sdk/client-s3';

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_ACCESS_KEY_ID,
  CLOUDFLARE_SECRET_ACCESS_KEY,
  CLOUDFLARE_REGION,
} = process.env as Record<string, string | undefined>;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_ACCESS_KEY_ID || !CLOUDFLARE_SECRET_ACCESS_KEY) {
  console.warn('Missing Cloudflare R2 env vars (CLOUDFLARE_*)');
}

const endpoint = CLOUDFLARE_ACCOUNT_ID
  ? `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`
  : undefined;

export const r2Client = new S3Client({
  region: CLOUDFLARE_REGION || 'auto',
  endpoint,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY_ID || '',
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false,
});
