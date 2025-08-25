# ZarishHealthcare System

## Project Overview

ZarishHealthcare System is a comprehensive, microservices-based healthcare information platform designed for humanitarian operations. It supports offline-first workflows, multi-organization coordination, and regulatory compliance (HIPAA, GDPR). The system is built with a modern technology stack, including Node.js, TypeScript, React, PostgreSQL, Redis, and CouchDB. It is designed to be deployed using Docker and Kubernetes.

## Building and Running

### Prerequisites

*   Node.js >= 18.x
*   Yarn >= 4.x
*   Docker & Docker Compose
*   Kubernetes (optional, for production)

### Setup

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/DevOps-Ariful-Islam/ZarishHealthcare-System.git
    cd ZarishHealthcare-System
    ```
2.  **Install dependencies:**
    ```bash
    yarn install
    ```
3.  **Copy and edit the `.env` file as needed:**
    ```bash
    cp .env.example .env
    # Edit .env with your secrets and config
    ```
4.  **Start services (development):**
    ```bash
    yarn dev
    ```
5.  **Build and run containers:**
    ```bash
    yarn docker:build
    yarn docker:up
    ```

### Key Commands

*   `yarn dev`: Start all services for development.
*   `yarn build`: Build all services and applications.
*   `yarn test`: Run all tests.
*   `yarn lint`: Run linter.
*   `yarn format`: Format code.
*   `yarn docker:build`: Build Docker images.
*   `yarn docker:up`: Start Docker containers.
*   `yarn docker:down`: Stop Docker containers.

## Development Conventions

*   **Monorepo:** The project uses a monorepo structure with Yarn workspaces.
*   **Microservices:** The backend is composed of several microservices, each in its own package.
*   **TypeScript:** The entire codebase is written in TypeScript.
*   **Testing:** The project uses Jest for unit and integration testing, and Cypress for end-to-end testing.
*   **CI/CD:** GitHub Actions are used for continuous integration and deployment.
*   **Infrastructure as Code:** Terraform and Helm are used for managing infrastructure.
*   **API:** The project uses a combination of RESTful APIs and GraphQL.
