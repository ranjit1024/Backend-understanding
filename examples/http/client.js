const base = process.env.BASE_URL ?? 'http://localhost:3000';

async function main() {
  try {
    const health = await fetch(`${base}/health`);
    console.log(`GET /health -> ${health.status} ${health.statusText}`);
    console.log(await health.json());

    const echo = await fetch(`${base}/echo?from=client`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Demo': 'yes',
      },
      body: JSON.stringify({ message: 'hi' }),
    });

    console.log(`\nPOST /echo -> ${echo.status} ${echo.statusText}`);
    console.log(await echo.json());
  } catch {
    console.error(`Could not reach ${base}.`);
    console.error('Start the server first: npm run http:server');
    process.exitCode = 1;
  }
}

main();
