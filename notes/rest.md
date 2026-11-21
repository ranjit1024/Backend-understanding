# REST APIs

REST (Representational State Transfer) is an architectural style, not a
protocol. In practice, a "REST API" means an HTTP API built around **resources**,
identified by URLs, manipulated with standard HTTP methods.

## Core ideas

- **Resources**: nouns, not verbs. `/tasks`, `/tasks/42`, `/users/7/tasks`.
- **Representations**: the same resource can be returned as JSON, HTML, etc.
  The client and server agree via `Content-Type` and `Accept`.
- **Statelessness**: each request contains all the information needed.
- **Uniform interface**: standard methods, status codes and headers.

## Method mapping

| Operation | Method | Typical success | Typical errors |
|-----------|--------|-----------------|----------------|
| List | `GET /tasks` | 200 | - |
| Read one | `GET /tasks/:id` | 200 | 404 |
| Create | `POST /tasks` | 201 + `Location` | 400, 409 |
| Replace | `PUT /tasks/:id` | 200 / 204 | 400, 404 |
| Partial update | `PATCH /tasks/:id` | 200 | 400, 404 |
| Delete | `DELETE /tasks/:id` | 204 | 404 |

## Status codes that matter

- `200 OK`: here is the representation.
- `201 Created`: created, and `Location` points at the new resource.
- `204 No Content`: success, no body to return.
- `400 Bad Request`: malformed body or invalid fields.
- `401 Unauthorized`: not authenticated.
- `403 Forbidden`: authenticated but not allowed.
- `404 Not Found`: resource does not exist.
- `405 Method Not Allowed`: URL exists, method does not; include `Allow`.
- `409 Conflict`: state conflict, e.g. duplicate unique value.
- `422 Unprocessable Entity`: syntactically valid but semantically invalid.
- `500 Internal Server Error`: unexpected server failure.

## Design habits

- Use plural nouns: `/tasks`, not `/getTasks`.
- Put filters in the query string: `/tasks?done=true&limit=20`.
- Version when breaking changes are unavoidable: `/v1/tasks`.
- Return a consistent error shape:

  ```json
  { "error": "validation_failed", "message": "title is required" }
  ```

- Paginate lists. Never return an unbounded table.
- Do not leak internal details (stack traces, SQL errors) to clients.
- Validate input at the boundary. Do not trust `Content-Type` or body shape.

## Idempotency and retries

Clients and proxies retry requests. `GET`, `PUT` and `DELETE` can be retried
safely. `POST` can create duplicates. Solutions:

- Client sends an `Idempotency-Key` header; the server stores the key and the
  result and returns the same response on retry.
- Or design the operation to be naturally idempotent (e.g. `PUT /tasks/42`).

## REST is not a law

REST works well for resource-oriented CRUD. It fits awkwardly for actions
(`POST /orders/42/cancel` is common) and for highly nested or batch operations.
Alternatives: RPC-style APIs, GraphQL, gRPC. The HTTP fundamentals still apply.

## Try it

```bash
npm run rest:server
```

```bash
curl -i http://localhost:3001/tasks
curl -i -X POST http://localhost:3001/tasks \
  -H 'Content-Type: application/json' \
  -d '{"title":"learn REST"}'
curl -i -X PATCH http://localhost:3001/tasks/1 \
  -H 'Content-Type: application/json' \
  -d '{"done":true}'
curl -i -X DELETE http://localhost:3001/tasks/1
curl -i -X PUT http://localhost:3001/tasks/1
```

Watch the status codes and the `Location` header on create.

## Questions to test yourself

- Why should `DELETE` be idempotent?
- When would you return `409` instead of `400`?
- What belongs in the URL versus the query string versus the body?

## Further reading

- MDN HTTP methods: https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods
- RFC 9110 (HTTP semantics): https://www.rfc-editor.org/rfc/rfc9110
