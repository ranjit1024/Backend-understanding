# Backend Understanding

Notes and small runnable examples for the backend concepts I want to actually
understand, not just recognize.

Every example uses only the Node.js standard library, so there is nothing to
install. State is kept in memory and resets when a process restarts.

## Requirements

- Node.js 22.5+ (for the built-in `node:sqlite` used in the databases example)

## Layout

```
notes/          Concept notes, one file per topic
examples/       Runnable demos, one folder per topic
README.md       Topic index and roadmap
```

## Quick start

List the available scripts:

```bash
npm run
```

Run the HTTP demo in two terminals:

```bash
npm run http:server
npm run http:client
```

Most servers accept a `PORT` environment variable, for example:

```bash
PORT=8080 npm run rest:server
```

## Topics

| # | Topic | Notes | Example | Run |
|---|-------|-------|---------|-----|
| 1 | HTTP | [notes/http.md](notes/http.md) | [examples/http](examples/http) | `npm run http:server` + `npm run http:client` |
| 2 | TCP & UDP | [notes/tcp-udp.md](notes/tcp-udp.md) | [examples/tcp](examples/tcp) | `npm run tcp:server` + `npm run tcp:client` |
| 3 | DNS | [notes/dns.md](notes/dns.md) | [examples/dns](examples/dns) | `npm run dns:lookup` |
| 4 | REST APIs | [notes/rest.md](notes/rest.md) | [examples/rest](examples/rest) | `npm run rest:server` |
| 5 | Auth & sessions | [notes/auth.md](notes/auth.md) | [examples/auth](examples/auth) | `npm run auth:server` |
| 6 | Databases | [notes/databases.md](notes/databases.md) | [examples/databases](examples/databases) | `npm run db:demo` |
| 7 | Caching | [notes/caching.md](notes/caching.md) | [examples/caching](examples/caching) | `npm run cache:server` |
| 8 | Queues & async work | [notes/queues.md](notes/queues.md) | [examples/queues](examples/queues) | `npm run queue:demo` |

## How to study a topic

1. Read the note and write down what you expect the example to do.
2. Run the example.
3. Break it on purpose: send a bad body, use the wrong method, stop the server,
   send two requests at once.
4. Write down what actually happened and why.

## Roadmap

Covered:

- [x] HTTP request/response model
- [x] TCP vs UDP and sockets
- [x] DNS resolution
- [x] REST resources and status codes
- [x] Sessions, cookies and password hashing
- [x] Relational data, indexes and transactions
- [x] HTTP caching and ETags
- [x] Producer/consumer queues and retries

Next:

- [ ] TLS and HTTPS in depth
- [ ] WebSockets and real-time transports
- [ ] Reverse proxies, load balancing and rate limiting
- [ ] Observability: logs, metrics, traces
- [ ] SQL joins, normalization and query planning
- [ ] Docker, deployment and environment configuration
- [ ] GraphQL and gRPC
