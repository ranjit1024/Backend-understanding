import net from 'node:net';

const server = net.createServer((socket) => {
  const peer = `${socket.remoteAddress}:${socket.remotePort}`;
  console.log(`client connected: ${peer}`);
  socket.setEncoding('utf8');

  socket.on('data', (data) => {
    console.log(`[${peer}] received ${JSON.stringify(data)}`);
    socket.write(`echo: ${data}`);
  });

  socket.on('end', () => {
    console.log(`client disconnected: ${peer}`);
  });

  socket.on('error', (err) => {
    console.error(`socket error: ${err.message}`);
  });
});

const port = Number(process.env.PORT ?? 4000);
server.listen(port, () => {
  console.log(`TCP echo server on localhost:${port}`);
});
