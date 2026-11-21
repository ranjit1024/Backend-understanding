# Queues & Async Work

Some work is too slow, too failure-prone, or too bursty to do inside a request.
Queues move that work out of the request path.

## The problem

A request that does everything synchronously:

```
POST /orders -> validate -> charge card -> send email -> update analytics -> respond
```

Problems:

- Latency adds up.
- If the email provider is down, the order fails even though the charge worked.
- Traffic spikes hit every downstream system directly.

With a queue:

```
POST /orders -> validate -> charge card -> enqueue(job) -> 202 Accepted
                                          |
                                worker: send email, update analytics
```

## Core pieces

- **Producer**: publishes a message/job.
- **Queue / broker**: stores messages durably (RabbitMQ, Kafka, SQS, Redis
  streams, etc.).
- **Consumer / worker**: pulls messages and does the work.
- **Ack**: the consumer confirms completion so the message is not redelivered.
- **Dead-letter queue (DLQ)**: where messages go after repeated failures, so
  you can inspect them instead of losing them.

## Delivery semantics

| Guarantee | Meaning | Risk |
|-----------|---------|------|
| At-most-once | deliver once, maybe never | lost work |
| At-least-once | deliver until acked | duplicate work |
| Exactly-once | once, end to end | expensive; often "effectively once" |

Most real systems choose **at-least-once** plus **idempotent consumers**. A
consumer must tolerate seeing the same message twice.

## Retries and backoff

Failures are normal: timeouts, rate limits, downstream outages.

- Retry with **exponential backoff** and jitter.
- Limit retries, then send to the DLQ.
- Do not retry errors that will never succeed (e.g. malformed payloads).
- Make side effects idempotent: use a unique job id and store processed ids.

## Ordering and scale

- Many brokers preserve order within a partition/queue, not globally.
- Multiple consumers process in parallel, so completion order is not guaranteed.
- Scale workers independently from web servers.
- Backpressure: if producers outrun consumers, queue depth grows. Monitor it.

## When not to use a queue

- The caller needs the result immediately (a queue adds latency).
- The operation must be strongly consistent with the request (e.g. charging a
  card is often done synchronously, while the receipt email is queued).
- The system is small and the added operational complexity is not worth it.

## Try it

```bash
npm run queue:demo
```

The demo is an in-process queue: a producer enqueues jobs, a single worker drains
them one at a time. Notice:

- The producer does not wait for each job.
- Jobs run in FIFO order.
- The queue is just an array here; a real broker adds durability, acks, retries,
  and multiple workers across machines.

## Questions to test yourself

- Why does at-least-once delivery require idempotent consumers?
- What should happen to a message that fails 10 times?
- Why is a queue a bad place for a request that must return a result?
- What would change if two workers ran instead of one?

## Further reading

- AWS SQS visibility timeout and DLQs: https://docs.aws.amazon.com/AWSSimpleQueueService/latest/SQSDeveloperGuide/sqs-visibility-timeout.html
- RabbitMQ reliability guide: https://www.rabbitmq.com/reliability.html
