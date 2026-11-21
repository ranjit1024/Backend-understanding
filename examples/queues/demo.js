const queue = [];
const processed = [];
let running = false;

function enqueue(job) {
  queue.push(job);
  console.log(`produced job ${job.id} (queue length: ${queue.length})`);
  drain();
}

async function drain() {
  if (running) return;
  running = true;

  while (queue.length > 0) {
    const job = queue.shift();
    console.log(`worker picked up job ${job.id}`);

    await new Promise((resolve) => setTimeout(resolve, job.takesMs));

    processed.push(job.id);
    console.log(`worker finished job ${job.id}`);
  }

  running = false;
}

for (let id = 1; id <= 5; id += 1) {
  enqueue({ id, takesMs: 100 * (6 - id) });
}

setTimeout(() => {
  console.log('\nprocessed order:', processed.join(' -> '));
  console.log('the producer never waited for a job to finish');
}, 1700);
