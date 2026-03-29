# E-commerce Backend Server

This is the backend server for an E-commerce application, built with Node.js and Express. It provides RESTful APIs for handling users, authentication, and other e-commerce functionalities.

## Features

*   **Authentication:** Secure user registration and login with JWT (JSON Web Tokens).
*   **User Management:** Create, read, update, and delete user profiles.
*   **Role-Based Access Control:** Differentiated roles for users (e.g., admin, customer).
*   **Health Check:** An endpoint to monitor the status of the application.
*   **Error Handling:** Centralized error handling middleware.
*   **Validation:** Request data validation using Zod.
*   **Logging:** Detailed logging using Winston and Morgan.

## Tech Stack

*   **Backend:** Node.js, Express.js
*   **Database:** MongoDB with Mongoose
*   **Authentication:** JWT (jsonwebtoken), bcrypt for password hashing
*   **Validation:** Zod
*   **Package Manager:** Bun
*   **Linting & Formatting:** ESLint, Prettier

## Prerequisites

Before you begin, ensure you have the following installed:

*   [Bun](https://bun.sh/) (v1.3.8 or higher)
*   [Node.js](https://nodejs.org/en/) (v18.x or higher)
*   [MongoDB](https://www.mongodb.com/try/download/community)

## Installation

1.  Clone the repository:

    ```bash
    git clone https://github.com/your-username/e-commerce_server.git
    cd e-commerce_server
    ```

2.  Install the dependencies:

    ```bash
    bun install
    ```

## Configuration

1.  Create a `.env` file in the root directory by copying the example file:

    ```bash
    cp .env.example .env
    ```

2.  Update the `.env` file with your configuration. Below are the required environment variables:

    ```
    # APP
    PORT=
    NODE_ENV=
    SERVICE_NAME=
    API_VERSION=
    ALLOWED_ORIGINS=

    # CLIENT
    CLIENT_URL=

    # DATABASE
    MONGODB_URI=
    DB_MAX_POOL_SIZE=
    DB_MIN_POOL_SIZE=
    DB_SOCKET_TIMEOUT_MS=
    DB_SERVER_SELECTION_TIMEOUT_MS=
    DB_HEARTBEAT_FREQUENCY_MS=
    DB_MAX_RETRIES=
    DB_RETRY_DELAY_MS=

    # SERVER
    GRACEFUL_SHUTDOWN_TIMEOUT_MS=
    REQUEST_TIMEOUT_MS=
    BODY_LIMIT=

    # JWT
    JWT_ACCESS_SECRET=
    JWT_REFRESH_SECRET=
    JWT_ACCESS_EXPIRY=
    JWT_REFRESH_EXPIRY=

    # Legacy JWT (used in auth.model.js)
    ACCESS_TOKEN_SECRET=
    JWT_EXPIRES_IN=

    # BCRYPT
    BCRYPT_SALT_ROUNDS=
    MIN_BCRYPT_ROUNDS=
    MAX_BCRYPT_ROUNDS=

    # RATE LIMITING
    RATE_LIMIT_WINDOW_MS=
    RATE_LIMIT_MAX_REQUESTS=
    AUTH_RATE_LIMIT_WINDOW_MS=
    AUTH_RATE_LIMIT_MAX_REQUESTS=

    # ACCOUNT LOCKOUT
    MAX_LOGIN_ATTEMPTS=
    MIN_LOGIN_ATTEMPTS=
    MAX_LOGIN_ATTEMPTS_LIMIT=
    LOCK_DURATION_MS=
    MIN_LOCK_DURATION_MS=

    # EMAIL (SMTP)
    SMTP_HOST=
    SMTP_PORT=
    SMTP_SECURE=
    SMTP_USER=
    SMTP_PASS=
    EMAIL_FROM=
    EMAIL_FROM_NAME=

    # TOKEN EXPIRY
    EMAIL_VERIFICATION_EXPIRY_MS=
    PASSWORD_RESET_EXPIRY_MS=
    MIN_PASSWORD_RESET_EXPIRY_MS=
    MAX_PASSWORD_RESET_EXPIRY_MS=

    # COOKIE
    COOKIE_SECRET=
    COOKIE_SECURE=
    COOKIE_SAME_SITE=

    # LOGGING
    LOG_LEVEL=
    LOG_FORMAT=
    ```

## Running the Application

### Development

To run the server in development mode with live reloading:

```bash
bun run dev
```

### Production

To build and run the server in production mode:

```bash
bun run build
bun start
```

## Available Scripts

*   `dev`: Starts the development server with Nodemon.
*   `build`: Transpiles the code (if using TypeScript, currently configured for JS).
*   `start`: Starts the production server.
*   `lint`: Lints the source code using ESLint.
*   `lint:fix`: Lints and fixes the source code using ESLint.
*   `format`: Formats the code using Prettier.
*   `format:check`: Checks the formatting of the code.
*   `check`: Runs both `format:check` and `lint`.
*   `fix`: Runs both `format` and `lint:fix`.

## Project Structure

The project follows a modular structure:

```
src/
├── app.js               # Express app configuration
├── server.js            # Server entry point
├── common/              # Common utilities and schemas
├── config/              # Configuration files (DB, env)
├── constants/           # Application constants
├── middleware/          # Custom Express middleware
├── modules/             # Core feature modules (auth, users)
└── utils/               # Utility functions
```

## API Documentation

API documentation is not yet available. It can be generated using tools like Swagger or Postman.

## Contributing

Contributions are welcome! Please feel free to open an issue or submit a pull request.
