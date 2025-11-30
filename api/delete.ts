import { r2Client } from '../lib/r2Client';
import { DeleteObjectCommand } from '@aws-sdk/client-s3';

export default async function handler(req: any, res: any) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req as any) chunks.push(chunk);
    const bodyStr = Buffer.concat(chunks).toString('utf8') || '{}';
    const body = JSON.parse(bodyStr);

    let key = body.key;
    if (!key && body.url) {
      const { CLOUDFLARE_PUBLIC_DOMAIN } = process.env as Record<string, string | undefined>;
      if (CLOUDFLARE_PUBLIC_DOMAIN && body.url.startsWith(CLOUDFLARE_PUBLIC_DOMAIN)) {
        key = body.url.substring(CLOUDFLARE_PUBLIC_DOMAIN.length + 1);
      } else {
        const parts = body.url.split('/');
        key = parts[parts.length - 1];
      }
    }

    if (!key) return res.status(400).json({ error: 'No key or url provided' });

    const cmd = new DeleteObjectCommand({ Bucket: process.env.CLOUDFLARE_BUCKET_NAME, Key: key });
    await r2Client.send(cmd);

    return res.status(200).json({ deleted: true });
  } catch (err) {
    console.error('api/delete error', err);
    return res.status(500).json({ error: String(err) });
  }
}
