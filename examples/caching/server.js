import http from 'node:http';
import crypto from 'node:crypto';

const profile = JSON.stringify({ name: 'Ranjit', role: 'backend learner' });
const profileEtag = `"${crypto.createHash('sha1').update(profile).digest('hex')}"`;

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/profile') {
    if (req.headers['if-none-match'] === profileEtag) {
      res.writeHead(304, {
        ETag: profileEtag,
        'Cache-Control': 'max-age=60',
      });
      res.end();
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'max-age=60, public',
      ETag: profileEtag,
    });
    res.end(profile);
    return;
  }

  if (url.pathname === '/time') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
    });
    res.end(JSON.stringify({ now: new Date().toISOString() }));
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found\n');
});

const port = Number(process.env.PORT ?? 3003);
server.listen(port, () => {
  console.log(`Caching demo on http://localhost:${port}`);
});
