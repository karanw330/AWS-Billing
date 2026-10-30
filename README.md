# AWS Billing Engine

An event-driven, multi-tenant cloud usage metering and billing system built with **Java, Spring Boot, Kafka, and Python**, inspired by AWS billing architecture.

## Tech Stack
- **Backend:** Java 25, Spring Boot
- **Messaging:** Apache Kafka / Redpanda
- **Event Producer:** Python, confluent-kafka
- **Processing:** Jackson, Spring Kafka, BigDecimal
- **Planned Infrastructure:** Redis for idempotency; a time-series database for historical usage and billing analytics

## Features
- Synthetic AWS-style usage generation across 20 tenants and 5 services.
- Real-time event ingestion and processing through Kafka.
- Dynamic service routing using a Spring-managed registry.
- Per-tenant, per-service usage aggregation.
- Exponential backoff retries and dead-letter topic handling.
- In-memory duplicate detection (under development).

## Architecture

The current processing pipeline is shown below. Dashed or explicitly labeled *planned* components represent future work, not implemented functionality.

```text
Python Usage Generator
         |
         v
   Kafka Usage Topic
         |
         v
 Spring Boot Consumer ----------------------+
         |                                 |
         v                                 | Processing failures
  Parse & Validate                         v
         |                         Retry / Dead-Letter Topic
         v
 Duplicate Detection
 (in-memory; Redis planned)
         |
         v
 Spring Service Registry
         |
         v
 Tenant/Service Aggregation
         |
         +----> [Planned] Time-Series Database
         |                  |
         |                  v
         |          [Planned] Billing / Invoice Storage
         |                  |
         |                  v
         +----------> [Planned] REST APIs
                            |
                            v
                     [Planned] Dashboard
```

## Planned components for implementation 

### Core infrastructure
- [ ] Redis-based idempotency with duplicate checks and recording only after successful processing
- [ ] Time-series database persistence for historical usage and billing analytics
- [ ] Database-backed invoice generation
- [ ] REST APIs and analytics dashboard

### Reliability and scalability goals
- [ ] Reconciliation between ingested usage, aggregates, and invoices
- [ ] Integration and failure-recovery testing, including retries and dead-letter replay scenarios
- [ ] Observability: processing latency, throughput, consumer lag, error rates, and retry/DLT metrics
- [ ] Partition-aware Kafka consumer concurrency and safe aggregation under parallel processing
- [ ] Throughput and load benchmarking, with documented bottlenecks and performance improvements

> **Status:** Under active development. Currently focused on the event ingestion and processing pipeline.
