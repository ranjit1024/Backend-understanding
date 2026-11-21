# DNS

DNS (Domain Name System) is the internet's phonebook: it maps human-friendly
names like `api.example.com` to IP addresses.

## Resolution flow

When you connect to a hostname, roughly this happens:

1. **Application/OS cache**: the OS (and sometimes the browser) checks its cache.
2. **Stub resolver**: your machine asks a configured recursive resolver
   (your router, ISP, or something like `1.1.1.1`).
3. **Recursive resolver**: if it has no cached answer, it walks the hierarchy:
   - root servers -> knows the TLD servers
   - TLD servers (`.com`) -> know the authoritative servers
   - authoritative servers -> return the actual record
4. The answer is cached according to its **TTL** and returned to you.

So your backend process does not usually talk to root servers. It talks to the
resolver configured on the machine.

## Record types

| Type | Meaning | Example |
|------|---------|---------|
| `A` | IPv4 address | `example.com -> 93.184.216.34` |
| `AAAA` | IPv6 address | `example.com -> 2606:2800:...` |
| `CNAME` | Alias to another name | `www.example.com -> example.com` |
| `MX` | Mail server for a domain | `example.com -> mail.example.com` |
| `TXT` | Arbitrary text | SPF/DKIM records, domain verification |
| `NS` | Authoritative name servers | who is allowed to answer for the zone |
| `SRV` | Service location (host + port) | service discovery |

## TTL and caching

Every record has a **TTL** (time to live) in seconds. Caches may keep the answer
until it expires. This means:

- DNS changes are not instant. Old answers can be served until the TTL runs out.
- Lower TTL = faster propagation, but more queries.
- Before migrating servers, people often lower the TTL ahead of time.

## Why a backend developer cares

- **Connection reuse beats re-resolving**: if you open a new connection per
  request, you pay DNS + TCP + TLS every time. Pools amortize this.
- **DNS-based load balancing**: one name can return multiple IPs; clients try
  them in order. It is coarse-grained and does not know about server health.
- **Service discovery**: in containers/Kubernetes, service names resolve to
  internal addresses.
- **Localhost surprises**: `localhost` may resolve to `::1` (IPv6) first. If
  your server only listens on `127.0.0.1`, a client may fail or be slow.
- **Failure modes**: DNS timeouts and stale records are real production issues.
  Caches and resolvers differ, so "it works on my machine" can be a DNS problem.

## Try it

```bash
npm run dns:lookup              # defaults to example.com
npm run dns:lookup -- github.com
```

The example compares `dns.lookup` (what the OS resolver returns, used by
`fetch`) with direct record lookups (`resolve4`, `resolve6`, `resolveMx`,
`resolveTxt`).

Also try:

```bash
node -e "require('node:dns').lookup('localhost', {all:true}, console.log)"
```

## Questions to test yourself

- Why does changing a DNS record not take effect immediately everywhere?
- What is the difference between `dns.lookup` and `dns.resolve4`?
- Why might `localhost` behave differently from `127.0.0.1`?

## Further reading

- Node.js `dns` module: https://nodejs.org/api/dns.html
- Cloudflare DNS learning center: https://www.cloudflare.com/learning/dns/what-is-dns/
