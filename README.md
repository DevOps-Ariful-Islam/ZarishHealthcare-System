# ZarishHealthcare System - Comprehensive Healthcare Information Platform

![ZarishHealthcare Logo](docs/assets/zarish-logo.png)

## Overview

ZarishHealthcare is a comprehensive, microservices-based healthcare information system designed specifically for humanitarian contexts and complex healthcare operations. Built with offline-first capabilities, multi-tenant architecture, and robust security frameworks.

## System Architecture

### Core Components

- **ZarishCare** - Electronic Health Records & Clinical Management
- **ZarishLabs** - Laboratory Information Management System  
- **ZarishOps** - Operations & Resource Management
- **ZarishAnalytix** - Analytics & Reporting Platform
- **ZarishAccess** - Identity & Access Management
- **ZarishSync** - Data Synchronization & Offline Support
- **ZarishMobile** - Mobile Applications for Field Operations
- **ZarishPortal** - Web-based Administrative Interface

### Technology Stack

- **Backend**: Go (Gin), Node.js (NestJS)
- **Frontend**: React/Next.js, React Native
- **Databases**: PostgreSQL, CouchDB, Redis
- **Infrastructure**: Docker, Kubernetes, Kong Gateway
- **Security**: Keycloak-based Authentication
- **Monitoring**: Prometheus, Grafana, ELK Stack

## Quick Start

```bash
# Clone the repository
git clone https://github.com/DevOps-Ariful-Islam/ZarishHealthCare-System
cd zarishhealthcare-system

# Start development environment
./scripts/dev-setup.sh

# Run all services
docker-compose up -d

# Access the system
# Web Portal: http://localhost:3000
# API Gateway: http://localhost:8080
# Analytics: http://localhost:8088
```

## Project Structure

```
ZarishHealthcare-System/
├── apps/                    # Frontend Applications
│   ├── zarish-portal/      # Web Admin Interface
│   ├── zarish-mobile/      # Mobile Field App
│   └── zarish-desktop/     # Desktop Client
├── services/               # Backend Microservices
│   ├── zarish-care/       # Clinical Management
│   ├── zarish-labs/       # Laboratory Management
│   ├── zarish-ops/        # Operations Management
│   ├── zarish-analytix/   # Analytics Engine
│   ├── zarish-access/     # Identity Management
│   └── zarish-sync/       # Data Synchronization
├── packages/              # Shared Libraries
├── infrastructure/        # DevOps & Deployment
├── docs/                 # Documentation
└── scripts/              # Automation Scripts
```

## Features

### Clinical Management
- ✅ Patient Registration & Demographics
- ✅ Electronic Health Records
- ✅ NCD Program Management
- ✅ Mental Health & Psychosocial Support
- ✅ Maternal & Child Health
- ✅ Emergency Case Management

### Laboratory Management
- ✅ Digital Lab Requests & Results
- ✅ Rapid Diagnostic Tests (RDT) Support
- ✅ Quality Control & Validation
- ✅ Equipment Integration

### Operations & Analytics
- ✅ Multi-Partner Coordination
- ✅ 4W Reporting Automation
- ✅ DHIS-2 Integration
- ✅ EWARS Surveillance System
- ✅ Real-time Dashboards

### Humanitarian-Specific Features
- ✅ Offline-First Architecture
- ✅ Multi-Camp Operations
- ✅ Refugee Population Management
- ✅ Multi-Language Support (Bangla, Rohingya, English)
- ✅ Low-Bandwidth Optimization

## Development

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- Go 1.21+
- PostgreSQL 15+

### Environment Setup
```bash
# Development environment
cp .env.example .env.development
./scripts/setup-dev.sh

# Production environment
./scripts/setup-prod.sh
```

### Testing
```bash
# Run all tests
./scripts/test-all.sh

# Run specific service tests
./scripts/test-service.sh zarish-care
```

## Deployment

### Development
```bash
docker-compose -f docker-compose.dev.yml up -d
```

### Production
```bash
# Kubernetes deployment
kubectl apply -f infrastructure/kubernetes/
```

### Hybrid Cloud
```bash
# Deploy across cloud and on-premise
./scripts/deploy-hybrid.sh
```

## Documentation

- [Architecture Guide](docs/architecture/README.md)
- [API Reference](docs/api/README.md)
- [User Manual](docs/user-guide/README.md)
- [Deployment Guide](docs/deployment/README.md)
- [Security Guide](docs/security/README.md)

## License

Copyright © 2025 ZarishSphere. All rights reserved.

## Support

- Documentation: https://docs.zarishhealthcare.org
- Community: https://community.zarishhealthcare.org
- Issues: https://github.com/DevOps-Ariful-Islam/ZarisHhealthcare-System/issues
# ZarishHealthcare-System
