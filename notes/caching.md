# Caching

Caching means storing a copy of something expensive so the next request is
cheaper. Every backend already has caches; the question is whether you control
them or they surprise you.

## Where caching happens

| Layer | Example | Controlled by |
|-------|---------|---------------|
| Browser | images, JS, API responses | response headers |
| CDN / edge | static assets, cached pages | `Cache-Control`, CDN rules |
| Reverse proxy | nginx cache, Varnish | proxy configuration |
| Application | in-process map, LRU | your code |
| Distributed | Redis / Memcached | your code + TTLs |
| Database | query cache, buffer pool | the database |

## HTTP caching

The server tells clients what they may cache with headers:

| Header | Meaning |
|--------|---------|
| `Cache-Control: max-age=60` | Fresh for 60 seconds |
| `Cache-Control: no-store` | Do not store at all (secrets, personal data) |
| `Cache-Control: no-cache` | Store, but revalidate before every use |
| `Cache-Control: private` | Only the browser may cache (not shared CDNs) |
| `Cache-Control: public` | Shared caches may store it |
| `ETag` | Fingerprint of the current representation |
| `Last-Modified` | When the representation last changed |
| `If-None-Match` | Client sends the ETag it has |
| `If-Modified-Since` | Client sends the date it has |

**Conditional requests** save bandwidth:

1. First response: `200` with `ETag: "abc"`.
2. Next request: `If-None-Match: "abc"`.
3. Unchanged: `304 Not Modified` with no body.
4. Changed: `200` with a new body and new `ETag`.

## Application caching patterns

- **Cache-aside**: read cache, on miss read database, then write cache.
  Most common. Watch for stale data after writes.
- **Write-through**: write cache and database together.
- **Write-behind**: write cache, flush to database later (risk of data loss).

## The hard part: invalidation

A cache is a copy, and copies go stale. Options:

- **TTL**: accept staleness up to N seconds. Simple, often correct.
- **Explicit invalidation**: delete/update the key after a write.
- **Versioned keys**: include a version in the key, change the version to bust.
- **Cache stampede**: when a popular key expires, many requests hit the database
  at once. Mitigate with a lock, request coalescing, or jittered TTLs.

## What not to cache

- Per-user private data in a shared cache (use `private` or separate keys).
- Anything that must be strongly consistent (balances, inventory counts) unless
  you understand the staleness window.
- Secrets in logs, error messages, or cache keys.

## Try it

```bash
npm run cache:server
```

```bash
# First request: 200 + ETag
curl -i http://localhost:3003/profile

# Reuse the ETag: expect 304 and no body
curl -i http://localhost:3003/profile -H 'If-None-Match: "<etag-from-above>"'

# no-store means every request is fresh
curl -i http://localhost:3003/time
curl -i http://localhost:3003/time
```

## Questions to test yourself

- What is the difference between `no-store` and `no-cache`?
- Why does a `304` response have no body?
- What happens when a cached response is stale but the origin is down?
- Why is cache invalidation famously hard?

## Further reading

- MDN HTTP caching: https://developer.mozilla.org/en-US/docs/Web/HTTP/Caching
- RFC 9111 (HTTP caching): https://www.rfc-editor.org/rfc/rfc9111
