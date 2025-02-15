import crypto from 'crypto';
import ConfigurableError from '../errors/ConfigurableError.js';

export default function verifyWebhookSignature(req) {
  const signature = req.headers['x-signature'];
  const payload = JSON.stringify(req.body);
  const secret = 'd1a371530664e83a10dc93db581ab149eade18a69a66d80b389464c1d132c25f';

  const hash = crypto.createHmac('sha256', secret).update(payload).digest('hex');
  if (hash !== signature) throw new ConfigurableError('Invalid signature', 400);
}
