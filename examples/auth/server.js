import http from 'node:http';
import crypto from 'node:crypto';

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  const candidate = crypto.scryptSync(password, salt, 64);
  const expected = Buffer.from(hash, 'hex');
  return candidate.length === expected.length && crypto.timingSafeEqual(candidate, expected);
}

const users = new Map([
  ['ranjit', { name: 'Ranjit', password: hashPassword('secret') }],
]);

const sessions = new Map();

function parseCookies(req) {
  const header = req.headers.cookie ?? '';
  return Object.fromEntries(
    header
      .split(';')
      .filter(Boolean)
      .map((part) => {
        const [key, ...rest] = part.trim().split('=');
        return [key, decodeURIComponent(rest.join('='))];
      }),
  );
}

function currentUser(req) {
  const sid = parseCookies(req).sid;
  return sid ? sessions.get(sid) : undefined;
}

function send(res, status, body, headers = {}) {
  res.writeHead(status, { 'Content-Type': 'text/html; charset=utf-8', ...headers });
  res.end(body);
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (req.method === 'GET' && url.pathname === '/') {
    const user = currentUser(req);
    return send(
      res,
      200,
      user
        ? `<p>Logged in as <b>${user.name}</b></p>
           <p><a href="/me">/me</a> · <a href="/logout">/logout</a></p>`
        : `<p>Not logged in</p>
           <form method="post" action="/login">
             <input name="username" placeholder="username" />
             <input name="password" type="password" placeholder="password" />
             <button>Log in</button>
           </form>
           <p>Try ranjit / secret</p>`,
    );
  }

  if (req.method === 'POST' && url.pathname === '/login') {
    let body = '';
    for await (const chunk of req) {
      body += chunk;
    }

    const form = new URLSearchParams(body);
    const username = form.get('username') ?? '';
    const password = form.get('password') ?? '';
    const user = users.get(username);

    if (!user || !verifyPassword(password, user.password)) {
      return send(res, 401, '<p>Invalid credentials. <a href="/">Back</a></p>');
    }

    const sid = crypto.randomUUID();
    sessions.set(sid, { name: user.name });

    return send(res, 303, '', {
      Location: '/',
      'Set-Cookie': `sid=${sid}; HttpOnly; Path=/; SameSite=Lax`,
    });
  }

  if (req.method === 'GET' && url.pathname === '/me') {
    const user = currentUser(req);
    if (!user) {
      return send(res, 401, '<p>Not logged in. <a href="/">Back</a></p>');
    }
    return send(res, 200, `<p>Hello ${user.name}</p><p><a href="/">Back</a></p>`);
  }

  if (req.method === 'GET' && url.pathname === '/logout') {
    const sid = parseCookies(req).sid;
    if (sid) sessions.delete(sid);

    return send(res, 303, '', {
      Location: '/',
      'Set-Cookie': 'sid=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax',
    });
  }

  return send(res, 404, '<p>Not found</p>');
});

const port = Number(process.env.PORT ?? 3002);
server.listen(port, () => {
  console.log(`Auth demo on http://localhost:${port} (login: ranjit / secret)`);
});
