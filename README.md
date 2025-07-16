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
docker compose up --build --abort-on-container-exit --exit-code-from test
```

- If any test fails, all services will stop and the command will exit with an error code and test output.
- If all tests pass, all services will stop and the command will exit successfully.

## Deployment

- Deploy only the `backend` folder to Render.com as a Node.js web service, with the built frontend included in the backend's `public` directory.
