# TCP & UDP

Most backend work happens above TCP, but TCP explains a lot of behavior you
will see: connection timeouts, connection pools, head-of-line blocking, and why
a "message" can arrive split in half.

## Sockets

A socket is one endpoint of a connection, identified by an IP address and a
port: `127.0.0.1:4000`.

- The **server** binds to a port and listens.
- The **client** opens a connection to the server's address.
- After the connection is established, both sides read and write bytes.

A server handles many clients by accepting many sockets, one per connection
(or multiplexing them, as in HTTP/2).

## TCP

TCP is a **reliable, ordered byte stream**.

- It performs a three-way handshake: `SYN` -> `SYN-ACK` -> `ACK`.
- Lost packets are retransmitted.
- Bytes arrive in the order they were sent.
- It has no concept of messages. If you send `"hello"` then `"world"`, the
  receiver may get `"helloworld"` in one chunk, or `"hel"` then `"loworld"`.
  **Message boundaries are your job** (length prefixes, delimiters, or a
  protocol like HTTP that defines them).

Closing a connection uses `FIN`/`ACK` (and `RST` for aborts). A connection is
identified by the 4-tuple: source IP, source port, destination IP, destination
port.

## UDP

UDP is a **connectionless datagram** protocol.

- No handshake, no retransmission, no ordering guarantees.
- Each send is one datagram (with a size limit).
- Lower overhead, lower latency.

Used for DNS queries, video/audio streaming, games, and QUIC (which builds
reliability on top of UDP).

## TCP vs UDP

| | TCP | UDP |
|---|-----|-----|
| Connection | handshake required | none |
| Reliability | retransmits lost data | best effort |
| Ordering | guaranteed | not guaranteed |
| Message boundaries | none (byte stream) | preserved per datagram |
| Typical use | HTTP/1.1, HTTP/2, databases, SSH | DNS, QUIC/HTTP/3, streaming, games |

## Why a backend developer cares

- **Timeouts**: a TCP connect can hang. Always set connect and read timeouts.
- **Connection reuse**: opening a TCP connection costs a handshake and TLS
  negotiation. HTTP keep-alive and database connection pools exist because of
  this.
- **Backpressure**: writing faster than the peer reads fills buffers. Node
  streams expose this via `write()` returning `false` and the `drain` event.
- **Head-of-line blocking**: one slow packet blocks everything behind it on the
  same TCP connection. HTTP/2 multiplexing helps at the HTTP layer; HTTP/3
  avoids it at the transport layer.
- **Ports**: only one process can listen on a given `IP:port` combination.

## Try it

Terminal 1:

```bash
npm run tcp:server
```

Terminal 2:

```bash
npm run tcp:client
```

Watch the server logs. Notice that the client sends two writes and the server
may receive them as separate chunks or combined. The echo server simply echoes
bytes back; it does not understand "messages".

Try with netcat too:

```bash
nc localhost 4000
```

## Questions to test yourself

- Why can't the receiver assume one `write()` equals one `read()`?
- What happens if the server is not running when the client connects?
- Why is HTTP/3 built on UDP if UDP is unreliable?

## Further reading

- Node.js `net` module: https://nodejs.org/api/net.html
- RFC 9293 (TCP): https://www.rfc-editor.org/rfc/rfc9293
