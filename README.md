# Titanbay Private Markets API (Technical Test_)

A RESTful API for managing private market funds and investor commitments, built with NestJS and Prisma.

PostgreSQL is used as the database, running locally via docker-compose.

## Quick Start (Minimal Setup)

Ensure you have [Docker](https://www.docker.com/) and [Node.js](https://nodejs.org/) installed.

1.  **Install dependencies:**
    ```bash
    npm install
    ```

2.  **Start the database:**
    ```bash
    docker-compose up -d
    ```

3.  **Initialize the database & seed data:**
    ```bash
    # Sync schema
    npx prisma db push

    # Apply seed data (Funds, Investors, Investments)
    npx prisma db seed
    ```

4.  **Run the application:**
    ```bash
    npm run start:dev
    ```
    The API will be available at `http://localhost:3000`.

---

## API Documentation

The full API specification can be found [here](https://storage.googleapis.com/interview-api-doc-funds.wearebusy.engineering/index.html).

### Key Endpoints

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `POST` | `/funds` | Create a new fund |
| `GET` | `/funds` | List all funds |
| `GET` | `/funds/:id` | Get a specific fund by UUID |
| `PUT` | `/funds` | Update an existing fund (Full body required) |
| `POST` | `/investors` | Create a new investor |
| `GET` | `/investors` | List all investors |
| `POST` | `/funds/:id/investments` | Create an investment for a fund |
| `GET` | `/funds/:id/investments` | List all investments for a fund |

---

## Testing

The project includes both unit and end-to-end integration tests.

```bash
# Run unit tests
npm run test

# Run E2E integration tests
npm run test:e2e
```

---

## Usage Examples

### Funds
**List all funds:**
```bash
curl http://localhost:3000/funds
```

**Get a specific fund:**
```bash
curl http://localhost:3000/funds/{fund_id}
```

**Create a fund:**
```bash
curl -X POST http://localhost:3000/funds \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Titanbay Growth Fund II",
    "vintage_year": 2025,
    "target_size_usd": 500000000.00,
    "status": "Fundraising"
  }'
```

### Investors
**List all investors:**
```bash
curl http://localhost:3000/investors
```

### Investments
**List investments for a fund:**
```bash
curl http://localhost:3000/funds/{fund_id}/investments
```

**Create a new investment:**
```bash
curl -X POST http://localhost:3000/funds/{fund_id}/investments \
  -H "Content-Type: application/json" \
  -d '{
    "investor_id": "{investor_id}",
    "amount_usd": 75000000.00,
    "investment_date": "2024-03-15"
  }'
```

---

## Design Decisions & Assumptions

*   **Financial Precision (Strings):** `Decimal` values for `amount_usd` and `target_size_usd` are returned as **strings with exactly two decimal places** (e.g., `"100.00"`). This follows financial API best practices to prevent precision loss during JSON serialization and ensures consistent formatting for the client.
*   **Decoupled Entities:** I used specialized `Entity` classes (e.g., `Fund`, `Investment`) with `class-transformer`. This decouples the database schema (Prisma models) from the API response, allowing for granular control over serialization (like date formatting or excluding internal fields).
*   **Validation:** Robust validation is implemented using `class-validator`. I also added `ParseUUIDPipe` to all path parameters to ensure `400 Bad Request` is returned for malformed IDs instead of server-side errors.
*   **Consolidated Tests:** Integration tests are consolidated into a single `api.e2e-spec.ts` file, organized by resource, to provide a clear overview of the entire API surface area in one place.

---

## AI Collaboration

**How I used AI:**
*   **Framework choice:** Initial planning and weighing up of frameworks to use, particularly the choice of ORM
*   **Boilerplate Generation:** Rapidly created NestJS modules, services, and controllers.
*   **Schema Mapping:** Used AI to translate the API spec into a valid Prisma schema.
*   **Test-Driven Development:** Leveraged the AI to generate edge-case test scenarios (unhappy paths) and verify data transformations.
*   **Refactoring:** Used AI to perform surgical refactors, such as converting raw Prisma results into formatted entities and cleaning up unused service logic.