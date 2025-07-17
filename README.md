# Ecommerce AI Agent

A modern online grocery store with AI-powered features, built with React (frontend) and Node.js/Express (backend).

## Structure

- `frontend/` – React + TypeScript app
- `backend/` – Node.js/Express API (serves API and static frontend)


## Local Development

- Use Docker Compose to run frontend, backend, and database locally.

### Run All Services and Automated Tests

To build all images and run the full stack with automated backend tests:

```sh
docker compose exec backend npm run test
```

- If any test fails, all services will stop and the command will exit with an error code and test output.
- If all tests pass, all services will stop and the command will exit successfully.

## Deployment

- Deploy only the `backend` folder to Render.com as a Node.js web service, with the built frontend included in the backend's `public` directory.

---

## FEATURES

### AI Agent Chatbot
- Conversational assistant that can:
  - Accept recipes, dish ideas, or ingredient requests
  - Search online and in the database (using the search index and message history for context/memory)
  - Suggest recipes and required products
  - Add, remove, or review products in your cart
  - Mimic payment (credit card, PayPal) using stored payment methods (no real payment processing)
  - Create orders and transactions, send order confirmation/status emails
  - Mimic delivery status updates (can be triggered by cron/scheduled jobs)

### System Constraints
- Only one live conversation per user for simplicity
- All POST, PUT, DELETE endpoints are protected (system/admin/role-based access)
- Selected GET endpoints are public for API/LLM/dev consumption

### Admin & Data Management
- Admin interface for managing products, SKUs, users, orders, etc. (similar to Django admin, built in React/TS)
- CSV upload/import for bulk adding SKUs/products (no new table needed; process and insert via script/API)
- Script to populate tables with dummy grocery store data (run manually)

### Analytics & BI
- Analytics section with endpoints for data retrieval (GET only)
- Real-time graphics and live SQL editor for admins to run read-only queries
- Tableau/Power BI compatibility via read-only DB user/connection (SELECT queries only)
- Role-based access for analytics features (admin or custom analytics role)
- AI assistant for analytics: can answer questions, generate reports, and build queries based on DB schema

### LLM/AI Agent Support
- LLM.txt file with plain text API usage examples for easy querying by AI agents/LLMs/RAG systems
- Schema and endpoint documentation optimized for both human and AI consumption

### Recommendations
- Add indexes to frequently queried columns (e.g., email, type/ref_id, product name/category) for performance
- Use composite unique constraints where needed (e.g., one review per user per product)
- For analytics/BI, create dedicated read-only DB users and restrict access to necessary tables/views
- Always validate and sanitize inputs for live SQL editor features
- Consider audit/log tables if compliance or change tracking is needed

---

This project is designed for extensibility, security, and AI/LLM integration. All features and constraints are documented for easy onboarding and future development.
