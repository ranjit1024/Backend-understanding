# Databases

A backend is mostly about reading and writing data safely while many clients
hit it at once. The database is where correctness is won or lost.

## Relational vs NoSQL

| | Relational (SQL) | Document / key-value (NoSQL) |
|---|------------------|------------------------------|
| Data shape | tables, rows, fixed schema | JSON documents, flexible |
| Relationships | foreign keys, joins | embedding or manual references |
| Transactions | strong, multi-row ACID | varies by product |
| Queries | expressive SQL | product-specific |
| Scaling | vertical first, then read replicas/sharding | often horizontal by design |
| Good fit | structured data, integrity, reporting | flexible documents, huge scale, caches |

"SQL vs NoSQL" is not a religion. Pick based on access patterns, consistency
needs and operational constraints. Many systems use both (Postgres + Redis).

## ACID

- **Atomicity**: all or nothing.
- **Consistency**: constraints hold before and after.
- **Isolation**: concurrent transactions do not corrupt each other.
- **Durability**: committed data survives a crash.

Isolation levels trade correctness for concurrency. Know your database's default
(Postgres defaults to read committed). Some anomalies only disappear at
serializable isolation.

## Indexes

An index is a separate data structure (usually a B-tree) that lets the database
find rows without scanning the whole table.

- Speeds up `WHERE`, `JOIN`, `ORDER BY` on indexed columns.
- Costs space and slows down writes (every insert/update maintains the index).
- Composite indexes follow the **leftmost prefix rule**: an index on
  `(user_id, created_at)` helps queries filtering by `user_id`, or by
  `user_id + created_at`, but not by `created_at` alone.
- Always check the query plan (`EXPLAIN`) instead of guessing.

## Transactions

Use a transaction when several writes must succeed or fail together:

```sql
BEGIN;
UPDATE accounts SET balance = balance - 100 WHERE id = 1;
UPDATE accounts SET balance = balance + 100 WHERE id = 2;
COMMIT;
```

Without a transaction, a crash between the two statements loses money.

## Common backend problems

- **N+1 queries**: fetch a list, then one query per item. Fix with a join or a
  batched `WHERE id IN (...)`.
- **Unbounded queries**: missing `LIMIT` and pagination.
- **Missing indexes**: fine at 100 rows, fatal at 10 million.
- **Race conditions**: read-modify-write without a transaction or atomic update
  (`UPDATE ... SET count = count + 1` instead of reading into the app).
- **Migrations**: schema changes must be versioned and reviewed like code.
- **Connection pooling**: opening a connection is expensive; pools reuse them.
  Pool exhaustion is a common outage cause.
- **SQL injection**: always use parameterized queries, never string
  concatenation.

## Try it

```bash
npm run db:demo
```

The example uses Node's built-in `node:sqlite` (experimental, no install). It:

1. Creates `users` and `posts` tables with a foreign key.
2. Inserts rows with prepared statements.
3. Joins posts with their authors.
4. Prints the query plan for an indexed lookup.
5. Runs a transaction and rolls back on error.
6. Shows a unique constraint rejecting a duplicate.

## Questions to test yourself

- Why can adding an index make writes slower?
- What is the N+1 problem and how do you detect it?
- Why is `SELECT * FROM users WHERE id = ?` with a parameter safer than
  building the SQL string?
- What does a transaction protect you from that a retry loop does not?

## Further reading

- PostgreSQL documentation: https://www.postgresql.org/docs/current/
- Use The Index, Luke (SQL indexing): https://use-the-index-luke.com/
- Node.js `node:sqlite`: https://nodejs.org/api/sqlite.html
