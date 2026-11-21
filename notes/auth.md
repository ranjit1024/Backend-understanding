# Auth & Sessions

Two different questions that are easy to mix up:

- **Authentication**: who are you?
- **Authorization**: what are you allowed to do?

A logged-in user (authenticated) can still get `403 Forbidden` because they lack
permission (authorization).

## Never store plaintext passwords

Passwords must be stored as **slow hashes with a per-user salt**:

- Use `scrypt`, `bcrypt` or `argon2`.
- Each password gets a random salt, stored next to the hash.
- Compare with a constant-time comparison to avoid timing leaks.
- Never log passwords, never email them, never store them reversibly encrypted.

Node's built-in `crypto.scryptSync` is enough for a demo (the auth example uses
it). In production, a dedicated library with tuned parameters is usually better.

## Sessions (stateful)

1. User posts credentials.
2. Server verifies the password hash.
3. Server creates a session record: `sessionId -> userId` (in memory, Redis, DB).
4. Server sets a cookie: `Set-Cookie: sid=<random>; HttpOnly; Secure; SameSite=Lax`.
5. On later requests, the browser sends the cookie; the server looks up the session.

Properties:

- Logout is easy: delete the session server-side.
- Sessions can be revoked individually.
- Requires shared storage when you run more than one server instance.
- Cookie attributes matter: `HttpOnly` blocks JavaScript access, `Secure` only
  sends over HTTPS, `SameSite` limits cross-site sending (CSRF protection).

## Tokens / JWT (stateless)

A JWT is a signed token containing claims (user id, role, expiry):

```
header.payload.signature
```

- The server verifies the signature instead of looking up a session.
- No shared session store needed, but **revocation is hard**: a valid token
  stays valid until it expires.
- Common pattern: short-lived access token + long-lived refresh token that can
  be revoked.
- The payload is readable (base64), not encrypted. Never put secrets in it.
- Store tokens carefully. `localStorage` is readable by any XSS; `HttpOnly`
  cookies avoid that but need CSRF protection.

## Sessions vs tokens

| | Sessions | JWT |
|---|----------|-----|
| State | server-side | client-side claims |
| Revoke instantly | yes | hard |
| Scaling | needs shared store | easy |
| Size per request | small (id) | larger (claims) |
| Common use | web apps | APIs, mobile, services |

## Basic auth

`Authorization: Basic base64(username:password)`.

- Simple, but sends credentials on every request.
- Only acceptable over HTTPS.
- Fine for internal tools and quick prototypes, not for user-facing login.

## Other things to know

- **CSRF**: a malicious site triggers a state-changing request with the user's
  cookies. Defend with `SameSite`, CSRF tokens, and origin checks.
- **XSS**: injected JavaScript runs with the user's session. Escape output and
  use `HttpOnly` cookies.
- **Rate limiting**: slow down password guessing and token brute force.
- **OAuth2 / OIDC**: delegated authorization/login ("Sign in with Google").
  OIDC is the identity layer built on OAuth2.
- **HTTPS everywhere**: without TLS, cookies and tokens are readable in transit.

## Try it

```bash
npm run auth:server
```

Open http://localhost:3002 and log in with `ranjit` / `secret`. Then:

```bash
curl -i -c /tmp/cookies.txt -X POST http://localhost:3002/login \
  -d 'username=ranjit&password=secret'
curl -i -b /tmp/cookies.txt http://localhost:3002/me
curl -i -b /tmp/cookies.txt http://localhost:3002/logout
curl -i -b /tmp/cookies.txt http://localhost:3002/me   # now 401
```

Look at the `Set-Cookie` headers and the `303` redirect after login/logout.

## Questions to test yourself

- Why is a plain SHA-256 hash of a password not enough?
- What can an attacker do with a stolen session cookie? What about a stolen JWT?
- Why does `HttpOnly` matter if you already sanitize HTML?

## Further reading

- OWASP password storage cheat sheet: https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html
- OWASP session management cheat sheet: https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html
- JWT introduction: https://jwt.io/introduction
