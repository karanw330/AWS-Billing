# AWS Billing Engine

An event-driven, multi-tenant cloud usage metering and billing project inspired by AWS-style usage processing. The goal is to build a **reliable, testable billing backend**, with correctness and recoverability taking priority over infrastructure breadth.

## Tech Stack

| Component | Technology | Status |
| --- | --- | --- |
| Billing engine | Java 25, Spring Boot, Spring Kafka, `BigDecimal` | In development |
| Event streaming | Apache Kafka / Redpanda | Implemented; reliability work ongoing |
| Synthetic event producer | Python, `confluent-kafka` | Implemented |
| Persistent billing data | MySQL | Planned next |
| Query layer and UI | REST APIs, dashboard | Planned after core engine |
| Local packaging | Docker / Docker Compose | Final phase |

**Scope:** MySQL is the planned primary database. Redis may be evaluated later only if a measured need emerges. A separate time-series database, Kubernetes, and ML anomaly detection are **not part of the current roadmap**.

## Currently Implemented

- Python generator producing AWS-style usage events for **20 simulated tenants** across enterprise, mid-size, and development tiers, covering **5 services**.
- Kafka consumer that deserializes and processes usage events in Spring Boot.
- Spring-managed service registry for routing events to the appropriate service-specific handler.
- In-memory per-tenant, per-service usage processing and aggregation.
- Exponential-backoff error handling, dead-letter routing for eligible processing failures, and handling of malformed/deserialization-failed records.
- **Provisional in-memory duplicate detection** using event IDs.

> **Important:** In-memory deduplication and aggregation are not durable. They are not yet a guarantee against double billing across process restarts or concurrent consumers. MySQL-backed transactional processing is the next major step.

## Architecture

### Current flow

```text
Python Usage Generator
         |
         v
   Kafka Usage Topic
         |
         v
  Spring Boot Consumer
         |
         v
   Deserialize / Parse
         |
         v
  Event ID Duplicate Check
     (in-memory today)
         |
         v
 Spring Service Registry
         |
         v
 Usage Processing / Aggregation
     (in-memory today)

Processing failures --> Retry policy --> Dead-Letter Topic
```

### Target flow (after MySQL integration)

```text
Python Generator --> Kafka --> Spring Boot Billing Engine
                                     |
                                     v
                            Validate usage event
                                     |
                                     v
                           MySQL transaction
                          /                 \
              Register unique event_id   Record usage / charges
                          \                 /
                           Commit transaction
                                     |
                                     v
                         Complete Kafka processing
                                     |
                                     v
                       REST API --> Dashboard
```

The database transaction will ensure that **recording a processed event and applying its billing effects succeed or fail together**. A unique constraint on `event_id` will prevent repeated billing effects when Kafka redelivers an event. Kafka offsets must only advance after successful processing or an explicitly handled recovery path.

## Development Roadmap

### Phase 1 — Finish Kafka Reliability (Current Focus)
- [x] Ingest and process usage events through Kafka.
- [x] Implement service-based event routing.
- [x] Configure retry handling and dead-letter routing.
- [ ] Validate offset-commit behavior and failure recovery end to end.
- [ ] Finalize handling for invalid, retryable, and non-retryable messages.

### Phase 2 — MySQL Persistence & Idempotency
- [ ] Design tables for processed events, tenant/service usage, and billing records.
- [ ] Persist usage and monetary charges using precise decimal types.
- [ ] Enforce `UNIQUE(event_id)` in MySQL.
- [ ] Apply event registration and billing updates within one database transaction.
- [ ] Ensure duplicate events are safely ignored, including after a consumer restart.
- [ ] Add persisted billing summaries and invoice records.

### Phase 3 — Tests, Correctness & Metrics
- [ ] Test duplicate delivery, retries, invalid events, DLT behavior, and consumer restarts.
- [ ] Verify monetary calculations and consistency between usage events and billing totals.
- [ ] Measure event throughput, processing latency, error rates, and retry/DLT counts.
- [ ] Inspect consumer lag and document benchmark conditions and bottlenecks.

### Phase 4 — REST API & Dashboard
- [ ] Expose tenant usage, charges, and invoice summaries through REST endpoints.
- [ ] Build a dashboard for billing breakdowns and relevant pipeline metrics.
- [ ] Keep the UI focused on inspecting and demonstrating the finished backend.

### Phase 5 — Docker & Final Polish
- [ ] Containerize the application and its local dependencies with Docker Compose.
- [ ] Document setup, architecture decisions, test results, and limitations.
- [ ] Provide a reproducible end-to-end demo.

## Engineering Priorities

1. **Correctness first:** no duplicate charges and precise monetary calculations.
2. **Recoverability:** predictable behavior under retries, malformed messages, and restarts.
3. **Evidence over claims:** tests and reproducible measurements before performance assertions.
4. **Controlled scope:** introduce additional infrastructure only when requirements or benchmarks justify it.

> **Status:** Active development. Current work is focused on completing Kafka reliability, followed by MySQL persistence and transactional idempotency. Testing and metrics come before the dashboard or containerization.
