import type { IncomingMessage } from 'http';
import { uploadToR2 } from '../lib/uploadToR2';

export default async function handler(req: IncomingMessage & { method?: string; headers: any }, res: any) {
  // Allow CORS for testing - restrict in production
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-filename');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const chunks: Buffer[] = [];
    for await (const chunk of req as any) chunks.push(chunk);
    const buffer = Buffer.concat(chunks);

    const filename = req.headers['x-filename'] || `upload-${Date.now()}`;
    const contentType = req.headers['content-type'] || 'application/octet-stream';

    const file = { buffer, name: filename, type: contentType };

    const { url, key } = await uploadToR2(file, filename as string);

    return res.status(200).json({ url, key });
  } catch (err) {
    console.error('api/upload error', err);
    return res.status(500).json({ error: String(err) });
  }
}
