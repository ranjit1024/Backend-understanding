import net from 'node:net';

const port = Number(process.env.PORT ?? 4000);

const socket = net.createConnection({ host: '127.0.0.1', port }, () => {
  console.log('connected');
  socket.write('hello over tcp\n');
});

socket.setEncoding('utf8');

socket.on('data', (data) => {
  console.log(`received ${JSON.stringify(data)}`);
});

setTimeout(() => {
  socket.write('second message\n');
}, 200);

setTimeout(() => {
  socket.end('bye\n');
}, 500);

socket.on('close', () => {
  console.log('connection closed');
});

socket.on('error', (err) => {
  console.error(`connection failed: ${err.message}`);
  console.error('Start the server first: npm run tcp:server');
  process.exitCode = 1;
});
