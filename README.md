# E-commerce Server API

[![Node.js](https://img.shields.io/badge/Node.js-20+-339933?style=flat-square&logo=node.js&logoColor=white)](https://nodejs.org)
[![Express](https://img.shields.io/badge/Express-5-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com)
[![MongoDB](https://img.shields.io/badge/MongoDB-6-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongodb.com)
[![Mongoose](https://img.shields.io/badge/Mongoose-ODM-880000?style=flat-square&logo=mongoose&logoColor=white)](https://mongoosejs.com)
[![JWT](https://img.shields.io/badge/JWT-Secure-black?style=flat-square&logo=jsonwebtokens&logoColor=white)](https://jwt.io)
[![ESLint](https://img.shields.io/badge/ESLint-9-4B32C3?style=flat-square&logo=eslint&logoColor=white)](https://eslint.org)
[![Prettier](https://img.shields.io/badge/Prettier-3-F7B93E?style=flat-square&logo=prettier&logoColor=black)](https://prettier.io)
[![MIT License](https://img.shields.io/badge/License-MIT-22c55e?style=flat-square)](./LICENSE)

This document provides a comprehensive overview of the E-commerce Server API, its architecture, and its core functionalities. The server is engineered with a focus on scalability, modularity, and maintainability, following industry best practices for Node.js applications.

## Table of Contents

- [1. Philosophy and Design](#1-philosophy-and-design)
- [2. High-Level Architecture](#2-high-level-architecture)
- [3. Project Structure](#3-project-structure)
- [4. Request Lifecycle: A Deep Dive](#4-request-lifecycle-a-deep-dive)
- [5. Core Features](#5-core-features)
- [6. Getting Started](#6-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Running the Server](#running-the-server)
- [7. Environment Variables](#7-environment-variables)
- [8. API Documentation](#8-api-documentation)
- [9. Operations](#9-operations)
  - [Linting and Formatting](#linting-and-formatting)
  - [Testing](#testing)
  - [Logging](#logging)
- [10. Error Handling Strategy](#10-error-handling-strategy)
- [11. Security](#11-security)
- [12. Deployment](#12-deployment)
- [13. Contributing](#13-contributing)
- [14. License](#14-license)

---

## 1. Philosophy and Design

This project is built upon the principle of **Separation of Concerns**. The architecture is intentionally modular and layered to ensure that each part of the application has a single responsibility. This design choice leads to a codebase that is easier to understand, test, debug, and scale. We avoid monolithic structures in favor of decoupled modules that communicate through clear, defined interfaces (services and controllers).

## 2. High-Level Architecture

The application employs a layered architecture that can be visualized as follows:

```
+-----------------------------------------------------------------+
|                        HTTP Request (Client)                      |
+-----------------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------------+
|                       Entry Point (server.js)                     |
+-----------------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------------+
|                 Middleware Pipeline (app.js)                      |
| (CORS, JSON Parser, Logger, Helmet, Rate Limiter, etc.)           |
+-----------------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------------+
|                        Routing Layer                              |
| (Maps URL to a specific controller)                               |
+-----------------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------------+
|                      Controller Layer                             |
| (Parses request, validates input, orchestrates response)          |
+-----------------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------------+
|                        Service Layer                              |
| (Contains core business logic, transactions, 3rd party calls)   |
+-----------------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------------+
|                          Data Access Layer (Model)                |
| (Interacts with the database via Mongoose models)                 |
+-----------------------------------------------------------------+
                             |
                             v
+-----------------------------------------------------------------+
|                          Database (MongoDB)                       |
+-----------------------------------------------------------------+
```

## 3. Project Structure

The folder structure is organized by feature modules, promoting code locality and encapsulation.

```
.
├── src
│   ├── app.js              # Central application configuration and middleware pipeline.
│   ├── server.js           # The application's entry point. Initializes the server.
│   │
│   ├── common/             # Shared code, reusable across different modules.
│   │   ├── dto/            # Data Transfer Objects used for request/response shaping.
│   │   └── schemas/        # Common Joi validation schemas.
│   │
│   ├── config/             # Configuration files.
│   │   ├── db.js           # Database connection logic.
│   │   └── env.js          # Environment variable validation (Zod/Joi).
│   │
│   ├── constants/          # Application-wide constant values (e.g., role names).
│   │
│   ├── middleware/         # Custom Express middleware.
│   │   ├── error.middleware.js # Global error handler.
│   │   └── validate.middleware.js # Request validation middleware.
│   │
│   ├── modules/            # The core of the application, organized by feature.
│   │   └── auth/           # Example: Authentication module.
│   │       ├── auth.controller.js  # Handles HTTP request/response.
│   │       ├── auth.service.js     # Contains business logic.
│   │       ├── auth.model.js       # Mongoose data model.
│   │       ├── auth.routes.js      # Defines API routes for this module.
│   │       ├── auth.schema.js      # Joi schemas for request validation.
│   │       └── dto/                # DTOs specific to the auth module.
│   │
│   └── utils/              # Reusable utility functions and classes.
│       ├── apiError.js     # Standardized error class.
│       ├── apiResponse.js  # Standardized success response class.
│       ├── jwt.utils.js    # JWT generation and verification helpers.
│       └── logger.js       # Winston logger configuration.
│
└── ... (config files, etc.)
```

## 4. Request Lifecycle: A Deep Dive

To understand how the pieces fit together, let's trace a `POST /api/v1/auth/register` request.

1.  **Entry Point (`server.js`)**: The HTTP request first hits the Node.js server created in `server.js`. This file is responsible for connecting to the database and starting the Express application on a specified port.

2.  **Middleware Pipeline (`app.js`)**: The request is passed to the Express app instance. In `app.js`, it flows through a series of global middlewares:
    *   `cors()`: Enforces Cross-Origin Resource Sharing policy.
    *   `express.json()`: Parses the incoming `application/json` request body into `req.body`.
    *   `morgan()`: Logs the incoming request details to the console for debugging.
    *   The app then directs the request to the main router.

3.  **Routing (`app.js` -> `auth.routes.js`)**: The main router in `app.js` directs any request starting with `/api/v1/auth` to the router defined in `src/modules/auth/auth.routes.js`. This file maps the `POST /register` path to a specific handler chain.

    *_auth.routes.js_*:
    ```javascript
    router.post('/register', validate(registerSchema), authController.register);
    ```

4.  **Validation (`validate.middleware.js`)**: Before the controller logic is executed, the `validate` middleware is triggered. It uses the `registerSchema` (a Joi schema from `auth.schema.js`) to validate the contents of `req.body`. If validation fails, it throws an `ApiError`, which is caught by the global error handler, and the request is terminated with a `400 Bad Request` response.

5.  **Controller (`auth.controller.js`)**: If validation succeeds, the `authController.register` function is invoked. The controller's responsibility is purely orchestration:
    *   It extracts the validated data from `req.body`.
    *   It calls the appropriate service method (`auth.service.js`) to perform the business logic.
    *   It awaits the result from the service.
    *   It formats a successful response using the `ApiResponse` utility and sends it back to the client with a `201 Created` status code.

6.  **Service (`auth.service.js`)**: This is where the core business logic resides. The `register` service function performs the following actions:
    *   Checks if a user with the given email or username already exists by querying the database via the model. If so, it throws an `ApiError` (`409 Conflict`).
    *   Hashes the user's password using `bcrypt`.
    *   Saves the new user document to the database using the `User` model.
    *   Generates JWT access and refresh tokens.
    *   Returns the created user data and tokens to the controller.

7.  **Model (`auth.model.js`)**: The service interacts with the database through the Mongoose `User` model. This file defines the schema for the `users` collection, including field types, validation, and pre-save hooks (e.g., for password hashing).

8.  **Response/Error Handling**:
    *   **Success Path**: The controller receives data from the service, wraps it in a `ApiResponse` object, and sends it to the client.
    *   **Error Path**: If at any point (validation, controller, service) an error is thrown (typically an `ApiError`), it is automatically caught by the global `error.middleware.js`. This middleware formats a consistent JSON error response and sends it to the client with the appropriate HTTP status code.

## 5. Core Features

- User authentication (JWT-based) and authorization.
- Role-Based Access Control (RBAC).
- Comprehensive user and profile management.
- Health check endpoint for monitoring.
- Scalable module system for adding new features.

## 6. Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [Bun](https://bun.sh/)
- [MongoDB](https://www.mongodb.com/) (local or Atlas)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/mr-deepansh/E-commerce_server_project.git
cd e-commerce-server

# 2. Install dependencies
bun install
```

### Running the Server

```bash
# 1. Create a .env file from the example
cp .env.example .env

# 2. Populate .env with your configuration (see below)

# 3. Start the server in development mode with hot-reloading
bun run dev
```

The server will be available at `http://localhost:PORT`.

## 7. Environment Variables

Create a `.env` file in the project root.

| Variable               | Description                               | Default |
| ---------------------- | ----------------------------------------- | ------- |
| `PORT`                 | The port the server will run on.          | `3000`  |
| `MONGO_URI`            | MongoDB connection string.                |         |
| `JWT_SECRET`           | Secret key for signing JWTs.              |         |
| `JWT_EXPIRATION`       | Expiration time for access tokens (e.g., `1d`). | `1d`    |
| `CORS_ORIGIN`          | Allowed origin for CORS (`*` for all).      | `*`     |
| `LOG_LEVEL`            | Log level (`info`, `debug`, `warn`, `error`).| `info`  |

## 8. API Documentation

API documentation is available via Swagger/OpenAPI once the server is running. Navigate to `/api-docs` to view the interactive documentation.

## 9. Operations

### Linting and Formatting

```bash
# Run ESLint to find issues
bun run lint

# Automatically fix linting issues
bun run lint:fix

# Format code with Prettier
bun run format
```

### Testing

```bash
# Run all tests
bun test
```

### Logging

The application uses **Winston** for structured, level-based logging. Logs are printed to the console and also saved to files in the `logs/` directory.

## 10. Error Handling Strategy

We use a centralized error handling mechanism.
- **`ApiError` (`src/utils/apiError.js`)**: A custom error class used throughout the app to create errors with specific status codes and messages.
- **`error.middleware.js`**: A global middleware that catches all thrown errors. It checks if the error is an instance of `ApiError`; if not, it treats it as a generic `500 Internal Server Error`, logging the details for investigation without exposing stack traces to the client.

## 11. Security

- **Authentication**: JWTs are used for stateless API authentication.
- **Input Validation**: All incoming request data is validated against strict schemas.
- **Password Hashing**: User passwords are never stored in plain text. They are hashed using the `bcrypt` algorithm.
- **CORS**: Configured to prevent unauthorized cross-origin requests.
- **Rate Limiting**: (Recommended) Implement `express-rate-limit` in `app.js` to prevent brute-force attacks.
- **Helmet**: (Recommended) Use the `helmet` middleware in `app.js` to set various security-related HTTP headers.

## 12. Deployment

For production, ensure you are running the built version of the code.

```bash
# 1. Build the project
bun run build

# 2. Start the server using a process manager like PM2
pm2 start dist/server.js --name "ecommerce-api"
```

## 13. Contributing

Contributions are welcome. Please open an issue to discuss your ideas before submitting a pull request.

## 14. License

This project is licensed under the MIT License.
