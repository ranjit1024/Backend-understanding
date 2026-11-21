import dns from 'node:dns/promises';

const host = process.argv[2] ?? 'example.com';

const [lookup, a, aaaa, mx, txt] = await Promise.allSettled([
  dns.lookup(host),
  dns.resolve4(host),
  dns.resolve6(host),
  dns.resolveMx(host),
  dns.resolveTxt(host),
]);

console.log(`DNS results for ${host}\n`);

print('lookup (what the OS resolver returns)', lookup);
print('A', a);
print('AAAA', aaaa);
print('MX', mx);
print('TXT', txt);

function print(label, result) {
  if (result.status === 'fulfilled') {
    console.log(`${label}:`, JSON.stringify(result.value, null, 2));
  } else {
    console.log(`${label}: unavailable (${result.reason.code})`);
  }
}
