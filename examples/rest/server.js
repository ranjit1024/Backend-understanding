import http from 'node:http';

let nextId = 1;
const tasks = new Map();

function send(res, status, body, headers = {}) {
  const payload = body === undefined ? '' : JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json',
    ...headers,
  });
  res.end(payload);
}

async function readJson(req) {
  let raw = '';
  for await (const chunk of req) {
    raw += chunk;
  }
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return undefined;
  }
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split('/').filter(Boolean);

  if (parts[0] !== 'tasks') {
    return send(res, 404, { error: 'not_found', message: 'route not found' });
  }

  if (parts.length === 1) {
    if (req.method === 'GET') {
      return send(res, 200, [...tasks.values()]);
    }

    if (req.method === 'POST') {
      const body = await readJson(req);
      if (!body || typeof body.title !== 'string' || body.title.trim() === '') {
        return send(res, 400, {
          error: 'validation_failed',
          message: 'title is required',
        });
      }

      const task = { id: nextId++, title: body.title, done: false };
      tasks.set(task.id, task);
      return send(res, 201, task, { Location: `/tasks/${task.id}` });
    }

    return send(
      res,
      405,
      { error: 'method_not_allowed', message: `${req.method} not allowed on /tasks` },
      { Allow: 'GET, POST' },
    );
  }

  if (parts.length === 2) {
    const id = Number(parts[1]);
    const task = tasks.get(id);

    if (!task) {
      return send(res, 404, { error: 'not_found', message: `task ${id} not found` });
    }

    if (req.method === 'GET') {
      return send(res, 200, task);
    }

    if (req.method === 'PATCH') {
      const body = await readJson(req);
      if (!body) {
        return send(res, 400, {
          error: 'validation_failed',
          message: 'body must be a JSON object',
        });
      }

      if (body.title !== undefined) {
        if (typeof body.title !== 'string' || body.title.trim() === '') {
          return send(res, 400, {
            error: 'validation_failed',
            message: 'title must be a non-empty string',
          });
        }
        task.title = body.title;
      }

      if (body.done !== undefined) {
        task.done = Boolean(body.done);
      }

      return send(res, 200, task);
    }

    if (req.method === 'DELETE') {
      tasks.delete(id);
      return send(res, 204);
    }

    return send(
      res,
      405,
      { error: 'method_not_allowed', message: `${req.method} not allowed on /tasks/:id` },
      { Allow: 'GET, PATCH, DELETE' },
    );
  }

  return send(res, 404, { error: 'not_found', message: 'route not found' });
});

const port = Number(process.env.PORT ?? 3001);
server.listen(port, () => {
  console.log(`REST server on http://localhost:${port}`);
});
