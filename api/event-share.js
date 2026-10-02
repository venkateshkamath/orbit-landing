import { fetchEventShare, renderEventShareHtml } from '../eventSharePage.js';

export default async function handler(req, res) {
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    res.statusCode = 405;
    res.setHeader('Allow', 'GET, HEAD');
    res.end('Method Not Allowed');
    return;
  }

  const eventId = String(req.query?.id || '').trim();
  if (!eventId || eventId.length > 128) {
    res.statusCode = 400;
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.end('<!doctype html><title>ORBIT</title><p>Invalid event link.</p>');
    return;
  }

  const meta = await fetchEventShare(eventId);
  const html = renderEventShareHtml({ eventId, meta });

  res.statusCode = 200;
  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.setHeader(
    'Cache-Control',
    'public, max-age=60, s-maxage=300, stale-while-revalidate=600',
  );
  res.end(html);
}
