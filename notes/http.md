# HTTP

HTTP (HyperText Transfer Protocol) is one of the basic protocols used for
browser-to-server communication. It is a text-based request/response protocol:
the client sends one request, the server sends one response.

HTTP is **stateless**. Each request must carry everything the server needs to
handle it (URL, headers, cookies, auth). Servers do not remember previous
requests unless we build state on top (sessions, databases, caches).

## Anatomy of a request

```http
POST /users?role=admin HTTP/1.1
Host: example.com
Content-Type: application/json
Cookie: sid=abc123

{"name": "Ranjit"}
```

- **Request line**: method, path + query string, protocol version
- **Headers**: metadata about the request
- **Body**: optional payload (JSON, form data, file...)

## Anatomy of a response

```http
HTTP/1.1 201 Created
Content-Type: application/json
Location: /users/42

{"id": 42, "name": "Ranjit"}
```

- **Status line**: version, status code, reason phrase
- **Headers**: metadata about the response
- **Body**: optional payload

## Methods

| Method | Purpose | Safe | Idempotent |
|--------|---------|------|------------|
| GET | Read a resource | yes | yes |
| HEAD | Read headers only | yes | yes |
| POST | Create a resource / trigger an action | no | no |
| PUT | Replace a resource | no | yes |
| PATCH | Partially update a resource | no | not guaranteed |
| DELETE | Remove a resource | no | yes |

- **Safe**: does not change server state.
- **Idempotent**: repeating the same request has the same effect as sending it
  once. This matters for retries.

## Status codes

| Class | Meaning | Examples |
|-------|---------|----------|
| 1xx | Informational | 101 Switching Protocols |
| 2xx | Success | 200 OK, 201 Created, 204 No Content |
| 3xx | Redirection | 301 Moved Permanently, 304 Not Modified |
| 4xx | Client error | 400 Bad Request, 401 Unauthorized, 403 Forbidden, 404 Not Found, 405 Method Not Allowed, 429 Too Many Requests |
| 5xx | Server error | 500 Internal Server Error, 502 Bad Gateway, 503 Service Unavailable |

Common beginner mistakes:

- Returning `200` with `{"error": ...}` instead of a real 4xx/5xx code.
- Using `401` when the user is authenticated but not allowed (`403`).
- Using `400` for validation errors on a missing resource (`404`).

## Headers worth knowing

| Header | Direction | Meaning |
|--------|-----------|---------|
| `Host` | request | Which host the client wants (virtual hosting) |
| `Content-Type` | both | Body format, e.g. `application/json` |
| `Content-Length` | both | Body size in bytes |
| `Accept` | request | Response formats the client accepts |
| `Authorization` | request | Credentials (e.g. `Bearer <token>`) |
| `Cookie` / `Set-Cookie` | request / response | Client state (sessions) |
| `Cache-Control` | both | Caching rules |
| `ETag` / `If-None-Match` | response / request | Cache validation |
| `Location` | response | Redirect target or URL of a created resource |
| `User-Agent` | request | Client software identification |

## Connections and versions

- **HTTP/1.1**: persistent connections (keep-alive), one request at a time per
  connection. Pipelining exists but is rarely used.
- **HTTP/2**: multiplexes many requests over one TCP connection, binary framing,
  header compression.
- **HTTP/3**: runs over QUIC (UDP) instead of TCP, reduces head-of-line blocking.

The application-level model (methods, headers, status codes) stays the same
across versions. What changes is how bytes move over the network.

## HTTPS

HTTPS is HTTP sent inside a TLS connection. TLS provides:

- **Encryption**: nobody in the middle can read the traffic.
- **Integrity**: tampering is detected.
- **Authentication**: the certificate proves you are talking to the right server.

## Try it

Start the raw server (no framework) and hit it with curl:

```bash
npm run http:server

curl -i http://localhost:3000/health
curl -i -X POST http://localhost:3000/echo \
  -H 'Content-Type: application/json' \
  -d '{"message":"hi"}'
curl -i http://localhost:3000/nope
```

Or use the Node client in another terminal:

```bash
npm run http:client
```

## Questions to test yourself

- Why is HTTP called stateless, and how do login sessions still work?
- What is the difference between `401` and `403`?
- Why does `POST` need extra care when retrying but `PUT` usually does not?
- What does `Content-Type` change about how the server reads the body?

## Further reading

- MDN HTTP overview: https://developer.mozilla.org/en-US/docs/Web/HTTP
- RFC 9110 (HTTP semantics): https://www.rfc-editor.org/rfc/rfc9110
