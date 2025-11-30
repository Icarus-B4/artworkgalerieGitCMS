import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const app = express();
// allow passing port as CLI arg (npm script: "node ./dev-server.js 8082")
// fallback to env PORT or 8080
const PORT = process.argv[2] || process.env.PORT || 8080;

app.use(cors());
// raw body parser for uploads
app.use('/api/upload', express.raw({ type: '*/*', limit: '250mb' }));
app.use(express.json({ limit: '1mb' }));

const {
  CLOUDFLARE_ACCOUNT_ID,
  CLOUDFLARE_ACCESS_KEY_ID,
  CLOUDFLARE_SECRET_ACCESS_KEY,
  CLOUDFLARE_BUCKET_NAME,
  CLOUDFLARE_REGION,
  CLOUDFLARE_PUBLIC_DOMAIN,
} = process.env;

if (!CLOUDFLARE_ACCOUNT_ID || !CLOUDFLARE_ACCESS_KEY_ID || !CLOUDFLARE_SECRET_ACCESS_KEY || !CLOUDFLARE_BUCKET_NAME || !CLOUDFLARE_PUBLIC_DOMAIN) {
  console.warn('Warning: Some Cloudflare R2 env vars are missing. Uploads will fail until you set them.');
}

const endpoint = CLOUDFLARE_ACCOUNT_ID ? `https://${CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com` : undefined;

const s3 = new S3Client({
  region: CLOUDFLARE_REGION || 'auto',
  endpoint,
  credentials: {
    accessKeyId: CLOUDFLARE_ACCESS_KEY_ID || '',
    secretAccessKey: CLOUDFLARE_SECRET_ACCESS_KEY || '',
  },
  forcePathStyle: false,
});

app.get('/health', (req, res) => res.json({ ok: true }));

app.post('/api/upload', async (req, res) => {
  try {
    const filename = req.headers['x-filename'] || `upload-${Date.now()}`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';
    const buffer = req.body;

    if (!buffer || !(buffer instanceof Buffer)) {
      return res.status(400).json({ error: 'No file body received' });
    }

    const baseName = String(filename).replace(/\s+/g, '_');
    const random = crypto.randomBytes(6).toString('hex');
    const key = `${Date.now()}-${random}-${baseName}`;

    const cmd = new PutObjectCommand({
      Bucket: CLOUDFLARE_BUCKET_NAME,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await s3.send(cmd);

    const url = `${CLOUDFLARE_PUBLIC_DOMAIN.replace(/\/$/, '')}/${key}`;
    console.log('dev-server: uploaded', url);

    return res.json({ url, key });
  } catch (err) {
    console.error('dev-server upload error', err);
    return res.status(500).json({ error: String(err) });
  }
});

app.post('/api/delete', async (req, res) => {
  try {
    const body = req.body || {};
    let key = body.key;
    if (!key && body.url) {
      if (CLOUDFLARE_PUBLIC_DOMAIN && body.url.startsWith(CLOUDFLARE_PUBLIC_DOMAIN)) {
        key = body.url.substring(CLOUDFLARE_PUBLIC_DOMAIN.length + 1);
      } else {
        const parts = String(body.url).split('/');
        key = parts[parts.length - 1];
      }
    }

    if (!key) return res.status(400).json({ error: 'No key or url provided' });

    const cmd = new DeleteObjectCommand({ Bucket: CLOUDFLARE_BUCKET_NAME, Key: key });
    await s3.send(cmd);

    return res.json({ deleted: true });
  } catch (err) {
    console.error('dev-server delete error', err);
    return res.status(500).json({ error: String(err) });
  }
});

app.listen(PORT, () => {
  console.log(`dev-server running on http://localhost:${PORT}`);
});
