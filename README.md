
# AWS Billing Engine

An event-driven, multi-tenant cloud usage metering and billing system built with **Java, Spring Boot, Kafka, and Python**, inspired by AWS billing architecture.

## Tech Stack
- **Backend:** Java 25, Spring Boot
- **Messaging:** Apache Kafka / Redpanda
- **Event Producer:** Python, confluent-kafka
- **Processing:** Jackson, Spring Kafka, BigDecimal

## Features
- Synthetic AWS-style usage generation across 20 tenants and 5 services.
- Real-time event ingestion and processing through Kafka.
- Dynamic service routing using a Spring-managed registry.
- Per-tenant, per-service usage aggregation.
- Exponential backoff retries and dead-letter topic handling.
- In-memory duplicate detection (under development).

## Architecture

```text
Python Producer → Kafka → Spring Boot Consumer
                                  |
                            Event Processing
                                  |
                            Service Registry
                                  |
                         Usage Aggregation
```

## Roadmap
- [ ] Redis-based idempotency
- [ ] Database persistence and invoice generation
- [ ] REST APIs and analytics dashboard
- [ ] Reconciliation and integration testing
- [ ] ML-based anomaly detection

> **Status:** Under active development. Currently focused on the event ingestion and processing pipeline.
